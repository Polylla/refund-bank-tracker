# Spec 05 — Matching de documentos

## Objetivo
Permitir subir documentos de respaldo (PDF, JPG, PNG, etc.) y asociarlos automáticamente al caso de reembolso correspondiente, alertando inconsistencias.

## Alcance
- Subida de archivos a Vercel Blob Storage.
- Matching por folio en el nombre del archivo (decisión #1 en [00-decisiones.md](00-decisiones.md)):
  - Se extrae el folio del nombre del archivo (ej. regex que busque el patrón de folio definido en spec 02/03).
  - Si el folio extraído coincide con un `CasoReembolso` existente → se crea un `Documento` con `casoId` asociado y `estadoMatching: matcheado`.
  - Si no se encuentra folio reconocible, o el folio no corresponde a ningún caso → se crea el `Documento` con `casoId: null` y `estadoMatching: sin_match`, y se genera una alerta visible.
- Alerta inversa: casos importados que no tienen ningún documento asociado (registro incompleto) — se calcula comparando `CasoReembolso` sin `Documento` relacionado.
- Vista/listado de alertas: documentos sin match + casos sin documento.
- Nota: no incluye selección manual como fallback en el MVP (queda como abierto en [00-decisiones.md](00-decisiones.md); si se agrega después, será una extensión de esta spec).

## Fuera de alcance
- OCR de contenido del documento.
- Selección manual del caso al subir (a menos que se decida agregar como fallback más adelante).
- Reportería agregada de completitud — spec 06 puede consumir estos datos para dashboards.

## Criterios de aceptación
- Subir un archivo con nombre `12345.pdf` donde existe un caso con folio `12345` crea el `Documento` matcheado a ese caso.
- Subir un archivo con nombre sin folio reconocible, o con un folio que no existe, crea el `Documento` sin match y genera una alerta.
- El listado de "casos sin documento" muestra correctamente los casos que no tienen ningún `Documento` asociado.
- Subir múltiples documentos para el mismo caso (ej. varios PDFs de respaldo) es válido — no hay restricción de 1 documento por caso.

## Dependencias
- Spec 01 (modelo `Documento`, Blob Storage configurado).
- Spec 02 (deben existir casos con folio para poder matchear).

## Notas de TDD (obligatorio — lógica crítica)
Escribir tests **antes** de implementar para:
- Extracción de folio desde distintos formatos de nombre de archivo (folio solo, folio con prefijo/sufijo, sin folio, folio con caracteres no numéricos si aplica).
- Matching contra folio existente vs inexistente.
- Cálculo del listado de "casos sin documento" (casos con 0, 1, N documentos).
