# Cómo trabajar en este repositorio

## Metodología: Spec-Driven Development (SDD) + TDD

Toda funcionalidad nueva se desarrolla siguiendo Spec-Driven Development:

1. Antes de escribir código, se redacta una spec en `/specs` (`NN-nombre.md`) describiendo objetivo, alcance, fuera de alcance, criterios de aceptación y dependencias, junto con su desglose de tareas (`NN-nombre.tasks.md`).
2. La spec y el plan de tareas se aprueban explícitamente antes de implementar nada.
3. Se implementa tarea por tarea, en el orden definido. Cada tarea se verifica (tests + build + revisión manual en producción cuando aplica) antes de pasar a la siguiente.
4. TDD es obligatorio en lógica crítica: parseo de Excel/CSV, detección de duplicados, matching de documentos, validación de RUT.

Ver [`specs/README.md`](specs/README.md) para el índice completo de specs y su estado, y [`specs/00-decisiones.md`](specs/00-decisiones.md) para las decisiones de producto ya cerradas.

## Flujo de git: Trunk-Based Development

Este proyecto usa trunk-based development. Antes de cualquier cambio:

1. **Actualizar `main`:** `git pull origin main` (o `fetch` + revisar) para traer los cambios de otros colaboradores antes de empezar.
2. **Crear una rama** para el cambio, con un nombre descriptivo:
   ```bash
   git checkout -b <tipo>/<descripcion-corta>
   ```
   (ej. `feat/motivo-rechazo`, `fix/badge-estado`, `docs/workflow-trunk-based`).
3. **Commitear los cambios** en esa rama (nunca directo en `main`).
4. **Abrir un Pull Request** de la rama hacia `main`.
5. **Mergear** el PR a `main` si no hay conflictos. Si los hay, resolverlos en la rama antes de mergear.

No se commitea ni pushea directo a `main`. Toda modificación pasa por rama + PR.

## Verificación antes de mergear

Antes de abrir o mergear un PR:
- `npx tsc --noEmit` sin errores.
- `npm run build` exitoso.
- `npm test` — toda la suite debe pasar (los tests corren contra la base de datos real compartida; ver notas en `vitest.config.ts` sobre `fileParallelism`).
- Si el cambio es visible en producción, verificarlo manualmente después del deploy.
