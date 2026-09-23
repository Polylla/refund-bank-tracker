# Spec 19 — Ingreso manual de casos

## Objetivo
Permitir crear un caso de reembolso a mano, sin depender de un Excel, para cuando el origen del dato no es una planilla.

## Alcance
- Nueva página `/casos/nuevo` con un formulario con los mismos campos obligatorios que exige hoy una fila de Excel: OT, Nombre cliente, RUT, Tribunal, N° de Rol, Año Rol, Nombre receptor, Concepto de gasto, Monto, Estudio/Abogado. Campos opcionales: N° BOLETA, Fecha pago, Fecha envío a pago, Estado reembolso.
- El formulario aplica las mismas validaciones que la importación de Excel (spec 02/09): RUT con dígito verificador válido, y detección de duplicado por OT+Concepto (spec 03) — si ya existe un caso con esa clave, la fila queda en la cola de revisión en vez de crear un caso nuevo directo.
- **Implementación:** se arma una fila de CSV en memoria (una cabecera + una fila de datos) con los valores del formulario, y se reutiliza `procesarImportacion` (la misma función que procesa un Excel/CSV subido) para crearla — así se garantiza exactamente el mismo comportamiento (validación, normalización de RUT, duplicados, notificaciones, historial) sin duplicar lógica. La `ImportacionExcel` resultante queda con `nombreArchivoOriginal: "Ingreso manual - <fecha>"` para diferenciarla en `/importaciones`.
- Botón "Nuevo caso" en `/casos`, junto a los botones de exportar.
- Mismo permiso que importar (`importador`/`revisor`).

## Fuera de alcance
- No se agrega edición de un caso ya existente fuera de lo que ya permite la cola de revisión (spec 14) — esta spec es solo para crear casos nuevos.
- No se cambia el modelo de datos ni `procesarImportacion` — se reutiliza tal cual.
- No se permite cargar varios casos manuales a la vez (para eso ya existe la importación de Excel/CSV).

## Criterios de aceptación
- Crear un caso manual con todos los campos obligatorios completos y un RUT válido lo crea correctamente, visible en `/casos`.
- Crear un caso manual con un RUT inválido lo rechaza con el mismo mensaje que rechazaría un Excel.
- Crear un caso manual con una OT+Concepto que ya existe no crea un caso duplicado — la fila queda en la cola de revisión (`/revision`).
- La importación generada por el ingreso manual aparece en `/importaciones` identificada como tal, y se puede eliminar igual que cualquier otra (spec 16).

## Dependencias
- Spec 02 (`procesarImportacion`, parser), Spec 03 (duplicados), Spec 09 (RUT), Spec 16 (eliminar importaciones).

## Notas
- No requiere TDD nuevo en `procesarImportacion` (ya está testeado) — sí conviene un test de que el CSV armado desde el formulario efectivamente crea el caso esperado (test de integración liviano).
