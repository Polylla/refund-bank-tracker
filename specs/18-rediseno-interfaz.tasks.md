# Tasks — Spec 18: Rediseño de interfaz

## Task 18.0 — Paleta de diseño (tokens) ✅ completada, verificada en producción
- `app/globals.css`: variables de sidebar (`--sidebar-bg`, `--sidebar-foreground`, `--sidebar-active`), fondo de página gris claro (`--background: #f4f5f7` en vez de blanco puro), colores semánticos de estado (`--color-success`, `--color-warning`, `--color-info`, `--color-danger`).
- **Verificación:** captura de pantalla del cambio de fondo antes de seguir (bajo impacto, no toca layout todavía).

## Task 18.1 — Menú lateral ✅ completada, verificada en producción
- Reemplazar el header horizontal de `app/layout.tsx` por un sidebar fijo a la izquierda (logo/nombre, links de `NavLinks` con iconos, indicador de rol, `UserButton`/cerrar sesión abajo). El contenido de cada página pasa a ocupar el resto del ancho.
- **Verificación:** manual — misma navegación funcional que hoy, con el nuevo layout.

## Task 18.2 — Tarjetas de dashboard con iconos ✅ completada, verificada en producción
- `/dashboard`: las tarjetas de "Casos por estado" y "Alertas pendientes" pasan a tener un icono circular coloreado (estilo mockup) en vez de solo el número.
- **Verificación:** manual.

## Task 18.3 — Badge de estado reutilizable ✅ completada, verificada en producción
(No se aplicó en `/revision`: `FilaRevisionCard` no muestra `estadoActual` en ningún lado — solo compara campos importados del Excel, "Estado reembolso" incluido, que es un dato distinto al estado real del caso. No había nada que reemplazar ahí.)
- `app/casos/EstadoBadge.tsx`: pill coloreada según estado (verde/ámbar/azul/rojo).
- Aplicar en `/casos`, `/casos/pagos-pendientes` (dentro de `CasosTable`), `/revision`, `/casos/[id]` — junto al `EstadoSelector` cuando corresponda editar, o solo el badge en modo lectura.
- **Verificación:** manual — el color coincide con el estado real en cada vista.

## Task 18.4 — Estilo de buscador/filtros en `/casos` ✅ completada, verificada en producción
(De paso se corrigió que el sidebar no ocupaba toda la altura en páginas con contenido más largo que el viewport — pasó a `sticky top-0 h-screen`.)
- `CasosFiltros`: input de búsqueda con icono de lupa, bordes más redondeados, estilo más "app".
- **Verificación:** manual.

## Task 18.5 — Ficha de caso con pestañas ✅ implementada (verificación manual pendiente)
- `/casos/[id]`: reorganizar en pestañas "Información" (datos + estado), "Historial", "Documentos", en vez de todo apilado.
- **Verificación:** manual — mismos datos, misma funcionalidad, navegación por pestañas.

## Task 18.6 — Iconos por tipo de archivo en Documentos
- `/documentos` y "Documentos asociados" en `/casos/[id]`: icono según extensión (PDF, imagen) junto al nombre del archivo.
- **Verificación:** manual.

## Task 18.7 — Página `/estadisticas` con gráficos (TDD en la agregación)
- Agregar dependencia `recharts`.
- `lib/reporteria/evolucionMensual.ts`: `casosCreadosPorMes(meses: number)` — cantidad de casos creados por mes, últimos N meses.
- `/estadisticas`: donut de casos por estado (reutiliza `casosPorEstado`) + barras de `casosCreadosPorMes`.
- Enlace "Estadísticas" en el sidebar.
- **Tests primero (para `casosCreadosPorMes`):** con casos de prueba creados en meses conocidos, el conteo por mes es exacto.
- **Verificación:** manual — los números coinciden con `/dashboard`.

## Task 18.8 — Verificación end-to-end y pulido general
- Recorrer todas las páginas en producción confirmando que nada se rompió (filtros, paginación, exportar, acciones, roles/soloLectura).

---
**Orden de ejecución:** 18.0 → 18.1 → 18.2 → 18.3 → 18.4 → 18.5 → 18.6 → 18.7 → 18.8. Cada tarea se aprueba antes de pasar a la siguiente.
