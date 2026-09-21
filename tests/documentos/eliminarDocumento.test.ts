import { afterAll, beforeAll, describe, expect, it, vi } from "vitest";
import { prisma } from "@/lib/prisma";

const delMock = vi.fn();
vi.mock("@vercel/blob", () => ({
  del: (...args: unknown[]) => delMock(...args),
}));

const { eliminarDocumento } = await import("@/lib/documentos/eliminarDocumento");

describe("eliminarDocumento", () => {
  let documentoId: string;

  beforeAll(async () => {
    const documento = await prisma.documento.create({
      data: {
        nombreArchivo: "test-eliminar.pdf",
        tipoArchivo: "application/pdf",
        urlBlob: "https://blob.test/test-eliminar",
        estadoMatching: "SIN_MATCH",
        nBoletaExtraido: null,
      },
    });
    documentoId = documento.id;
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  it("retorna error si el documento no existe, sin llamar a del", async () => {
    const resultado = await eliminarDocumento("id-que-no-existe");
    expect(resultado.ok).toBe(false);
    expect(delMock).not.toHaveBeenCalled();
  });

  it("borra la fila y llama a del con la urlBlob correcta", async () => {
    delMock.mockResolvedValueOnce(undefined);

    const resultado = await eliminarDocumento(documentoId);
    expect(resultado.ok).toBe(true);
    expect(delMock).toHaveBeenCalledWith("https://blob.test/test-eliminar");

    const buscado = await prisma.documento.findUnique({ where: { id: documentoId } });
    expect(buscado).toBeNull();
  });

  it("no falla si el borrado del blob da error (best-effort)", async () => {
    const documento = await prisma.documento.create({
      data: {
        nombreArchivo: "test-eliminar-2.pdf",
        tipoArchivo: "application/pdf",
        urlBlob: "https://blob.test/test-eliminar-2",
        estadoMatching: "SIN_MATCH",
        nBoletaExtraido: null,
      },
    });
    delMock.mockRejectedValueOnce(new Error("blob no disponible"));

    const resultado = await eliminarDocumento(documento.id);
    expect(resultado.ok).toBe(true);

    const buscado = await prisma.documento.findUnique({ where: { id: documento.id } });
    expect(buscado).toBeNull();
  });
});
