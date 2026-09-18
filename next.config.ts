import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    serverActions: {
      // Los documentos se suben de a uno (ver app/documentos/UploadForm.tsx),
      // pero un PDF escaneado individual puede superar el 1MB por defecto.
      bodySizeLimit: "10mb",
    },
  },
};

export default nextConfig;
