export function extraerMonto(datosImportados: unknown): number {
  const valor = (datosImportados as Record<string, unknown> | null)?.[
    "Costo de diligencia"
  ];
  const numero = typeof valor === "number" ? valor : Number(valor);
  return Number.isFinite(numero) ? numero : 0;
}
