import { defineConfig } from "vitest/config";
import { loadEnv } from "vite";
import path from "node:path";

export default defineConfig(({ mode }) => {
  Object.assign(process.env, loadEnv(mode, process.cwd(), ""));

  return {
    test: {
      environment: "node",
    },
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "."),
      },
    },
  };
});
