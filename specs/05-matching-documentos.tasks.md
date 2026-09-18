# Tasks — Spec 05: Matching de documentos

## Task 5.0 — Migración: Documento muchos-a-muchos con CasoReembolso ✅ completada
- Prisma: reemplazar `Documento.casoId` (FK única nullable) por `casos CasoReembolso[]` (muchos-a-muchos implícito). Agregar `Documento.nBoletaExtraido: String?`.
- No hay datos existentes en `Documento` (tabla vacía hasta ahora) — sin necesidad de backfill.
- **Verificación:** migración aplica sin errores; `npx prisma studio` muestra la tabla puente generada.

## Task 5.1 — Extracción de N° de boleta desde nombre de archivo (TDD) ✅ completada
- `lib/documentos/extraerBoleta.ts`: `extraerNBoleta(nombreArchivo: string): string | null`.
- Regla: dígitos al inicio del nombre (antes de la extensión), ignorando sufijos tipo `(1)`.
- **Tests primero:** `"740.pdf"` → `"740"`; `"38(1).pdf"` → `"38"`; `"documento.pdf"` (sin número) → `null`; `"38.PDF"` (mayúsculas) → `"38"`; nombre vacío → `null`.

## Task 5.2 — Subida + matching (TDD) ✅ completada
- `lib/documentos/subirDocumento.ts`: recibe un archivo, lo sube a Blob (`lib/blob.ts`, ya existe), extrae la boleta, busca **todos** los `CasoReembolso` con ese `nBoleta`, crea el `Documento` vinculado a todos los que matcheen (o a ninguno si no hay match), con `estadoMatching` y `nBoletaExtraido` correctos.
- **Tests primero (integración contra la base real, con cleanup):** boleta que matchea 1 caso; boleta que matchea 2 casos (vínculo a ambos); boleta sin ningún caso (`SIN_MATCH`, pero `nBoletaExtraido` igual se guarda); nombre sin número reconocible.

## Task 5.3 — Alertas: documentos sin match + casos sin documento (TDD) ✅ completada
- `lib/documentos/alertas.ts`: `documentosSinMatch()` y `casosSinDocumento()` (solo casos con `nBoleta` no nulo y sin `Documento` vinculado).
- **Tests primero:** casos con 0/1/N documentos; caso sin `nBoleta` no debe aparecer en la alerta aunque no tenga documento.

## Task 5.4 — UI de subida y alertas ✅ implementada (verificación manual pendiente, ver Task 5.5)
- Página `/documentos` (protegida): formulario de subida (múltiples archivos), muestra el resultado del matching por archivo subido.
- Sección de alertas: documentos sin match (con el número extraído) y casos sin documento (folio + boleta esperada).
- **Verificación:** manual en navegador — subir un PDF real (ej. `740.pdf`) y confirmar que matchea, y subir uno con nombre sin número y confirmar que aparece en alertas.

## Task 5.5 — Verificación end-to-end ✅ completada
Confirmado por el usuario en producción con PDFs reales: matching correcto (incluyendo el par `38.pdf`/`38(1).pdf`, ambos matcheando a los mismos 2 casos de esa boleta compartida) y un archivo renombrado a propósito correctamente marcado "sin match".

**Bug encontrado y corregido en el camino:** subir varios archivos juntos en una sola request superaba el límite de 1MB de los Server Actions de Next.js, mostrando "This page couldn't load". Se corrigió subiendo los archivos de a uno desde el cliente (`app/documentos/UploadForm.tsx`, commit `ccfa51e`) y subiendo el límite de body a 10mb para PDFs escaneados grandes.
- En producción: subir los 45 PDFs reales (o una muestra representativa incluyendo el caso `38.pdf` + `38(1).pdf`), confirmar matching correcto y que las boletas compartidas vinculan ambos casos.

---
**Orden de ejecución:** 5.0 → 5.1 → 5.2 → 5.3 → 5.4 → 5.5.
