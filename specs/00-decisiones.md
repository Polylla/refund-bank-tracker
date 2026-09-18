# Decisiones cerradas (Sección 6 de la especificación inicial)

Registro de las decisiones tomadas antes de escribir el plan de specs. Cualquier spec que dependa de una de estas decisiones debe citarla en vez de redefinirla.

## 1. Matching documento ↔ caso
**Decisión revisada (2026-09-16, tras revisar archivo real "Rendición receptores BECH"):** NO es por folio (OT). Los PDFs vienen nombrados por **`N° BOLETA`** (ej. `740.pdf`, `299.pdf`), una columna nueva que aparece en la planilla de rendición del receptor — no toda fila tiene boleta asociada (se completa cuando el receptor rinde/cobra ese gasto). El matching de spec 05 usa `CasoReembolso.nBoleta`.
- No se implementa OCR en el MVP.
- Selección manual agregada como fallback (2026-09-17): para documentos `SIN_MATCH`, el usuario busca y vincula manualmente el/los caso(s) por OT o boleta. Ver [05-matching-documentos.md](05-matching-documentos.md).
- Nota: algunos PDFs traen sufijo `(1)` en el nombre (ej. `38(1).pdf`), típico de descargas duplicadas — el parser de nombre de archivo debe tolerar esto y extraer igual el número de boleta.

## 2. Criterio de duplicidad
**Decisión revisada (2026-09-16, tras feedback del usuario sobre datos reales):** `OT` **NO es un identificador único por caso**. Una misma OT (orden de trabajo) puede tener múltiples diligencias distintas asociadas (ej. la misma OT con "notificación de demanda" y, por separado, "notificación de sentencia") — cada una es un caso de reembolso legítimo y distinto.

**Clave de identidad de un caso = `OT` + `Conceptos gasto de receptor`.** Dos filas con esa combinación exacta igual sí son consideradas el mismo caso (duplicado real). `OT` solo, repetido con distinto concepto, no es duplicado.

Consecuencia en el modelo de datos: `CasoReembolso.folio` deja de ser `@unique` en Prisma (ver [01-fundacion-arquitectura.md](01-fundacion-arquitectura.md) y [03-deteccion-duplicados.md](03-deteccion-duplicados.md)). Se agrega `conceptoGasto` como columna de primera clase (antes solo vivía dentro de `datosImportados`).

## 3. Comportamiento ante duplicado (dentro de una misma importación)
**Decisión:** se importa igual, marcada como "posible duplicado" para revisión posterior. No bloquea la importación.

## 4. Reimportación (folio ya existente en el sistema, en una importación posterior)
**Decisión:** NO se hace upsert automático. Las filas con folio ya existente quedan en una cola de revisión manual; un usuario decide si actualizar el caso o descartar la fila.
- Nota: esto es distinto de la decisión #3 (duplicado dentro del mismo archivo). Ambos casos conviven en la spec 03.

## 5. Multi-tenant / usuarios / autenticación
**Decisión:** multi-usuario con roles y autenticación (ej. roles "importador" y "revisor"). Se evaluará Auth.js o Clerk en la spec de fundación (01).

## 6. Estados del reembolso
**Decisión:** lista básica de estados (ej. Pendiente, En Revisión, Aprobado, Rechazado, Pagado — a confirmar nombres exactos) con transiciones libres (cualquier estado puede pasar a cualquier otro) en el MVP. No se modela una máquina de estados restrictiva por ahora.

## 7. Columnas del Excel/CSV de origen
**Decisión (actualizada 2026-09-16 con un segundo archivo real, "Rendición receptores BECH"):** los nombres de columna **varían levemente entre archivos** — el formato evoluciona. El parser tolera alias por columna (ver [02-ingesta-excel.md](02-ingesta-excel.md)):
- `Conceptos gasto de receptor` (plural, archivo original) = `Concepto gasto de receptor` (singular, archivo nuevo) → mismo campo interno `conceptoGasto`.
- `Fecha pago` (original) = `Fecha pago diligencia receptor` (nuevo) → mismo campo interno `fechaPago`.
- Columna nueva **`N° BOLETA`** (opcional, no toda fila la trae): se agrega como campo permanente `nBoleta` en `CasoReembolso`, usado para matching de documentos (spec 05, ver decisión #1 revisada).
- El resto de columnas (`OT`, `Nombre cliente`, `RUT`, `Tribunal`, `N° de Rol`, `Año Rol`, `Nombre receptor`, `Costo de diligencia`, `Estudio/Abogado`, `Fecha envío a pago`, `Estado reembolso`) se mantienen igual.
- El archivo puede traer una fila en blanco al final (con o sin la palabra "TOTAL") que se descarta igual (fila sin `OT`).

## 8. Filtros de exportación
**Decisión:** todos los campos importados del Excel deben poder usarse como filtro al exportar (no solo un subconjunto fijo).

## 9. Validación de RUT (2026-09-18)
**Decisión:** un RUT con formato o dígito verificador inválido rechaza la fila completa durante la importación (igual que cualquier otro error de validación) — no se importa marcado ni se corrige automáticamente. El RUT válido se normaliza al guardar a `NNNNNNNN-D` (sin puntos, con guión), independientemente del formato de entrada en el Excel. Ver [09-validacion-rut.md](09-validacion-rut.md).

## 10. Roles más granulares (2026-09-18)
**Decisión:** se agregan `admin` (incluye automáticamente todos los permisos de `importador`+`revisor`, y gestiona roles de otros usuarios desde `/admin/usuarios`) y `visor` (solo lectura en todas las páginas, sin ningún control de escritura visible). El primer `admin` se asigna una vez vía CLI; de ahí en adelante se gestiona desde la app. Ver [10-roles-granulares.md](10-roles-granulares.md).

## Abiertos / a revisar más adelante
(ninguno pendiente por ahora)
