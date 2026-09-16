import { defineConfig } from "vitest/config";
import { loadEnv } from "vite";
import path from "node:path";

export default defineConfig(({ mode }) => {
  Object.assign(process.env, loadEnv(mode, process.cwd(), ""));

  return {
    test: {
      environment: "node",
      // Los tests de integracion (lib/importacion) pegan contra la base
      // Neon real de desarrollo (no hay DB de test separada, ver
      // specs/03-deteccion-duplicados.md). Correr los archivos de test en
      // serie evita que corridas concurrentes se pisen sobre las mismas
      // filas.
      fileParallelism: false,
    },
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "."),
      },
    },
  };
});
