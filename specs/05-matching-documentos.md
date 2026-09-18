# Spec 05 — Matching de documentos

## Objetivo
Permitir subir documentos de respaldo (PDF, JPG, PNG, etc.) y asociarlos automáticamente al caso de reembolso correspondiente, alertando inconsistencias.

## Clave de matching (revisado — ver decisión #1 en [00-decisiones.md](00-decisiones.md))
**No es el folio (OT).** Los PDFs vienen nombrados por **`N° BOLETA`** (ej. `740.pdf`, `299.pdf`), confirmado con archivos reales (`Rendición receptores BECH`, 48 casos con boleta, 45 PDFs).

- Extracción del nombre de archivo: los dígitos **al inicio** del nombre (antes de la extensión), ignorando cualquier sufijo. Ej. `38(1).pdf` → `38` (el sufijo `(1)` es típico de una descarga duplicada del navegador, no cambia la boleta).
- Se busca `CasoReembolso` cuyo campo `nBoleta` coincida exactamente (como string) con el número extraído.

## Cambio de modelo de datos respecto a Spec 01
**`N° BOLETA` no es único por caso** (una misma boleta puede cubrir más de una diligencia — 3 de los 45 boletas reales cubren 2 casos cada una). Por lo tanto:
- `Documento` pasa de relación 1-a-muchos (`casoId` único) a **muchos-a-muchos** con `CasoReembolso`: un documento puede quedar vinculado a **todos** los casos que comparten esa boleta (decisión confirmada con el usuario).
- Se agrega `Documento.nBoletaExtraido: String?` para guardar qué número se extrajo del nombre de archivo, incluso si no matcheó con ningún caso (para mostrarlo en la alerta de "sin match").

## Alcance
- Subida de archivos a Vercel Blob Storage (vía OIDC, ya configurado en spec 01).
- Matching automático al subir:
  - Se extrae el número de boleta del nombre del archivo.
  - Se buscan **todos** los `CasoReembolso` con ese `nBoleta`.
  - Si hay uno o más → se crea `Documento` vinculado a todos ellos, `estadoMatching: MATCHEADO`.
  - Si no se encuentra número reconocible en el nombre, o ningún caso tiene esa boleta → `Documento` sin ningún caso vinculado, `estadoMatching: SIN_MATCH`, y se genera una alerta visible.
- **Alerta inversa — "casos sin documento":** `CasoReembolso` que **sí tienen `nBoleta`** (o sea, se espera un documento) pero no tienen ningún `Documento` vinculado todavía. Los casos sin `nBoleta` en absoluto (formato de Excel viejo, sin esa columna) **no** entran en esta alerta — no hay nada que matchear para ellos.
- Vista/listado de alertas: documentos sin match (con el número que se intentó extraer) + casos con boleta pendiente de documento.

## Selección manual (fallback) — agregado 2026-09-17
Para un `Documento` con `estadoMatching: SIN_MATCH`, el usuario (`importador` o `revisor`) puede buscar y vincular manualmente uno o más `CasoReembolso` desde `/documentos`:
- Búsqueda simple por `OT` (folio) o `N° BOLETA` (contiene, no exact match), limitada a un número razonable de resultados (20).
- Selección múltiple (checkboxes) — igual que el matching automático, un documento puede terminar vinculado a más de un caso.
- Al vincular: se conecta el/los `CasoReembolso` seleccionados al `Documento` y `estadoMatching` pasa a `MATCHEADO`. `nBoletaExtraido` no se modifica (sigue mostrando qué se intentó extraer originalmente, para trazabilidad).
- Solo aplica a documentos `SIN_MATCH`; no se permite "reasignar" un documento ya matcheado automáticamente (fuera de alcance, evita ambigüedad sobre cuál vínculo es el "correcto").

## Fuera de alcance
- OCR de contenido del documento.
- Reasignación manual de un documento ya matcheado automáticamente.
- Reportería agregada de completitud — spec 06 puede consumir estos datos para dashboards.

## Criterios de aceptación
- Subir `740.pdf` cuando existe un `CasoReembolso` con `nBoleta: "740"` crea el `Documento` matcheado a ese caso.
- Subir `38(1).pdf` matchea igual que `38.pdf` (extrae `38` ignorando el sufijo).
- Subir un archivo cuyo número no corresponde a ningún caso (o sin número reconocible) crea el `Documento` sin match y genera una alerta, guardando igual el número que se intentó extraer.
- Subir el PDF de una boleta que cubre 2 `CasoReembolso` distintos vincula el documento a **ambos** casos; ninguno de los dos aparece después en "casos sin documento".
- El listado de "casos sin documento" solo incluye casos con `nBoleta` no nulo y sin ningún `Documento` vinculado.
- Subir múltiples documentos para el mismo caso es válido — no hay restricción de 1 documento por caso.
- Buscar por OT/boleta en la selección manual devuelve los casos que contienen ese texto; vincular uno o más pasa el documento a `MATCHEADO` y lo saca de la alerta "sin match", y saca a esos casos de "casos sin documento".
- Un documento ya `MATCHEADO` automáticamente no aparece con la opción de selección manual.

## Dependencias
- Spec 01 (Blob Storage configurado).
- Spec 02 (deben existir casos con `nBoleta` para poder matchear — columna agregada en spec 02 tras revisar el archivo real de rendición).

## Notas de TDD (obligatorio — lógica crítica)
Escribir tests **antes** de implementar para:
- Extracción de número de boleta desde distintos nombres de archivo: número solo (`740.pdf`), con sufijo de duplicado (`38(1).pdf`), sin número reconocible, con letras antes del número.
- Matching contra `nBoleta` existente (uno o varios casos) vs inexistente.
- Vínculo muchos-a-muchos: un documento que matchea 2 casos queda vinculado a ambos.
- Cálculo del listado de "casos sin documento" (excluye casos con `nBoleta: null`).
