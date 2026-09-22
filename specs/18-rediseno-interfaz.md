# Spec 18 — Rediseño de interfaz (menú lateral, paleta naranjo/negro, estadísticas)

## Objetivo
Modernizar la interfaz tomando como referencia el mockup compartido (app de BancoEstado de gestión legal), adaptado a una paleta naranjo/negro estilo RUTPay/BancoEstado, manteniendo la estructura de datos y funcionalidades ya existentes.

## Alcance
- **Paleta de diseño:** sidebar negro/carbón (`#1a1a1a`) con naranjo (`#f26522`, ya en uso) como único acento de marca; fondo de página gris muy claro (no blanco puro) para que las tarjetas blancas resalten con su sombra; colores semánticos de estado distintos del naranjo de marca (verde=Pagado, ámbar=Pendiente, azul=Enviado a pago, rojo=Rechazado).
- **Menú lateral:** reemplaza el header horizontal actual por un sidebar fijo (logo/nombre arriba, links con icono, "Administración"/rol visible, cerrar sesión abajo), como en el mockup.
- **Dashboard:** tarjetas de resumen con icono circular coloreado (estilo mockup) en vez de los recuadros simples actuales.
- **Badges de estado:** componente reutilizable de "pill" coloreada para el estado de un caso (reemplaza el texto/selector plano en las tablas), aplicado en `/casos`, `/casos/pagos-pendientes`, `/revision`, `/casos/[id]`.
- **Buscador/filtros:** estilo más "app" (icono de lupa, inputs redondeados) en `/casos`.
- **Ficha de caso:** se reorganiza en pestañas (Información / Historial / Documentos) en vez de todo apilado en una sola columna.
- **Documentos:** iconos por tipo de archivo (PDF, imagen) en las listas.
- **Nueva página `/estadisticas`:** gráfico de torta (casos por estado) y de barras (casos creados por mes, últimos 6 meses), usando Recharts (nueva dependencia).

## Fuera de alcance
- No se cambia el modelo de datos ni la lógica de negocio — es un rediseño visual y de navegación sobre lo que ya existe.
- No se replica el mockup 1:1 (es de otro rubro/sistema) — se toma la estructura (sidebar, tarjetas, pestañas, gráficos) y se adapta a los datos y flujos reales de esta app.
- No se agrega un editor de "Notas" libres por caso (la pestaña "Notas" del mockup no tiene equivalente en el modelo actual).
- No se hace responsive completo tipo app móvil en esta ronda (el sidebar puede colapsar en pantallas chicas, pero no es el foco).

## Criterios de aceptación
- El menú lateral reemplaza el header horizontal en todas las páginas autenticadas, con navegación funcional idéntica a la actual (mismos links, mismas reglas de visibilidad por rol).
- Los badges de estado muestran el color correcto según `estadoActual` en todas las vistas donde aparece.
- `/estadisticas` muestra el donut de casos por estado y las barras de casos por mes con datos reales, coherentes con el resto de la app (mismos conteos que `/dashboard`).
- Ninguna funcionalidad existente (filtros, paginación, exportar, cambiar estado, aprobar/descartar, eliminar, etc.) se pierde o rompe con el rediseño.

## Dependencias
- Todas las specs anteriores (es un rediseño visual sobre la funcionalidad ya construida).

## Notas
- Se trabaja tarea por tarea, con aprobación del usuario antes de avanzar a la siguiente (igual que el resto del proyecto).
- No requiere TDD (cambios visuales/de layout, sin lógica de negocio nueva salvo la agregación para el gráfico de evolución mensual, que sí se testea).
