# Spec 17 — Mejoras al listado de casos (buscador, paginación, total, pagos pendientes)

## Objetivo
Tomar ideas de una pantalla de referencia ("Pagos pendientes" de otro sistema) para mejorar `/casos`: buscador único, paginación, total sumado, y una vista dedicada de pagos pendientes.

## Alcance
- **Buscador único:** un solo campo de texto en `/casos` que busca por OT (`folio`), Estudio/Abogado, Nombre cliente, RUT, Nombre receptor y Tribunal (coincidencia parcial), reemplazando la combinación actual de "Campo" + "Valor contiene" (spec 07). Se puede combinar con los filtros de estado/fechas que ya existen.
- **Total sumado:** al pie de la tabla de `/casos`, se muestra la suma de "Costo de diligencia" de todos los casos que cumplen los filtros actuales (no solo los de la página visible).
- **Paginación:** `/casos` pagina de a 20 filas (parámro `pagina` en la URL), con navegación anterior/siguiente e indicador "X–Y de Z". No se pagina la exportación a Excel/ZIP (siguen exportando todo lo filtrado).
- **Vista "Pagos pendientes":** nueva pestaña `/casos/pagos-pendientes` — igual tabla que `/casos` (mismo buscador, filtros, paginación, total), pre-filtrada a casos con estado `Pendiente` o `Enviado a pago` (excluye `Pagado` y `Rechazado`).
- Se extrae un componente de tabla compartido para no duplicar la tabla entre `/casos` y `/casos/pagos-pendientes`.

## Fuera de alcance
- No se agregan iconos de acción rápida por fila (email, enviar, etc.) de la imagen de referencia — no aplican a este sistema.
- No se resalta ni marca automáticamente casos "vencidos" por fecha (no hay un concepto de fecha de vencimiento definido en el modelo actual).
- La búsqueda única no reemplaza el filtro genérico "Campo"/"Valor" de exportación (`/api/exportar`, `/api/exportar/documentos`) — esos siguen funcionando igual vía query params, solo cambia la UI de `/casos`.
- No se pagina `/reportes/estudios` ni ninguna otra vista — solo `/casos` y la nueva `/casos/pagos-pendientes`.

## Criterios de aceptación
- Buscar "Pérez" en el buscador único encuentra casos donde ese texto aparece en cualquiera de los campos indicados.
- El total mostrado refleja la suma de TODOS los casos filtrados, no solo los de la página actual.
- Cambiar de página mantiene los filtros/búsqueda aplicados.
- `/casos/pagos-pendientes` nunca muestra casos `Pagado` ni `Rechazado`, y respeta los demás filtros/búsqueda/paginación igual que `/casos`.
- Exportar a Excel/ZIP desde cualquiera de las dos vistas sigue trayendo todos los casos filtrados, no solo la página visible.

## Dependencias
- Spec 07 (filtros de exportación existentes, que se extienden), Spec 12/13 (patrones de filtro por campo ya usados).

## Notas
- Tests para la construcción del filtro de búsqueda única y para `calcularMontoTotal` (dado un set de casos conocido, verificar el total exacto independientemente de la paginación).
