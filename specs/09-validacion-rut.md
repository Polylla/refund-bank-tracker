# Spec 09 — Validación de RUT

## Objetivo
Validar formato y dígito verificador del RUT chileno durante la importación de Excel/CSV, para detectar errores de digitación en el archivo de origen antes de que entren al sistema.

## Alcance
- Se valida la columna `RUT` (`ColumnDef.key: "rut"`) en `lib/importacion/parser.ts`, agregando un nuevo `type: "rut"` a `ColumnDef` (junto a los existentes `string`/`integer`/`number`/`date`).
- Acepta los formatos comunes de entrada: con puntos y guión (`12.345.678-5`), sin puntos (`12345678-5`), sin guión (`123456785`), con `k`/`K` como dígito verificador, y con o sin espacios alrededor.
- Valida el dígito verificador con el algoritmo módulo 11 estándar.
- **Fila con RUT inválido (formato irreconocible o dígito verificador incorrecto): se rechaza**, igual que cualquier otro error de validación existente — se agrega a `errores` con mensaje `"RUT" tiene un dígito verificador inválido` (o "formato inválido" si no matchea el patrón), y la fila no se importa.
- **Normalización al guardar:** el RUT válido se guarda en `datosImportados.RUT` y en el objeto `CasoImportado` en formato `12345678-5` (sin puntos, con guión, dígito verificador en minúscula si es `k`), independientemente de cómo venga escrito en el Excel original.
- Chequeo de solo lectura sobre los 15 casos reales ya existentes en producción, para reportar si alguno tiene un RUT mal formado (sin modificar datos — cualquier corrección a datos reales requeriría una decisión aparte del usuario, como ya ocurrió con la corrección de estado inicial en spec 04).

## Fuera de alcance
- No se agrega un campo `rut` de primera clase en `CasoReembolso` (sigue viviendo dentro de `datosImportados`, igual que hoy) — no hay ningún flujo que lo necesite fuera del JSON importado.
- No hay formulario de creación manual de casos en la app (los casos solo se crean vía importación), por lo que no se necesita validación de RUT en ningún formulario de UI.
- No se corrigen automáticamente los RUT existentes en producción si el chequeo de solo lectura encuentra alguno inválido — se reporta al usuario para que decida.

## Criterios de aceptación
- Un RUT válido en cualquiera de los formatos de entrada soportados se acepta y se normaliza a `NNNNNNNN-D` en `datosImportados` y en el `CasoImportado` resultante.
- Un RUT con dígito verificador incorrecto (ej. `12.345.678-9` cuando el correcto es `-5`) rechaza la fila con un error claro.
- Un RUT con formato irreconocible (letras sueltas, vacío ya cubierto por `required`, longitud imposible) rechaza la fila.
- El chequeo de solo lectura sobre datos reales no modifica ninguna fila; solo reporta.

## Dependencias
- Spec 02 (pipeline de parseo e importación — `lib/importacion/parser.ts`, `columns.ts`).

## Notas
- Requiere TDD (es lógica de parseo/validación, mandatorio según la metodología del proyecto): tests primero para el validador de dígito verificador (casos válidos, inválidos, con `k`, con distintos formatos de entrada) y para su integración en `parseSheet`.
- El algoritmo de dígito verificador (módulo 11) es standard y no requiere servicio externo ni dependencia nueva.
