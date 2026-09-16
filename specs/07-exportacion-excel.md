# Spec 07 — Exportación a Excel

## Objetivo
Exportar el listado de casos de reembolso a un archivo Excel, con soporte de filtros.

## Alcance
- Acción de exportación desde el listado general de casos (spec 06).
- Filtros soportados (decisión #8 en [00-decisiones.md](00-decisiones.md)): **todos los campos importados del Excel original** deben poder usarse como filtro, no solo un subconjunto fijo. Además:
  - Estado actual.
  - Rango de fechas (creación y/o última actualización).
- La exportación respeta los filtros aplicados en el momento de exportar (no exporta siempre todo el universo de casos).
- El archivo exportado incluye, como mínimo: todos los campos importados + estado actual + fecha de creación + fecha de última actualización.
- Formato de salida: `.xlsx`.

## Fuera de alcance
- Exportación de historial completo o documentos adjuntos (solo el listado de casos, salvo que el usuario pida ampliar esto después).
- Programación de exportaciones automáticas/recurrentes.

## Criterios de aceptación
- Exportar sin filtros genera un Excel con todos los casos existentes.
- Exportar con un filtro de estado genera un Excel solo con los casos de ese estado.
- Exportar con un filtro de rango de fechas genera un Excel solo con los casos dentro de ese rango.
- Exportar con un filtro por un campo arbitrario importado del Excel (ej. RUT) funciona igual que con los campos fijos.
- El archivo generado abre correctamente en Excel/Google Sheets sin errores de formato.

## Dependencias
- Spec 01 (modelo de datos).
- Spec 02 (deben existir campos importados dinámicos para poder filtrar por "todos los campos del Excel").
- Spec 06 (reutiliza la UI/lógica de filtros del listado general, si ya existe).

## Notas de TDD
Se recomienda TDD para la función de generación del archivo Excel a partir de un set de filtros (dado un conjunto de filtros y un dataset de prueba, verificar que el archivo generado contiene exactamente las filas esperadas con las columnas esperadas). No es lógica tan crítica como parseo/duplicados/matching, pero es fácil de romper silenciosamente.
