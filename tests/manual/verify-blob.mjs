// Script manual de verificación para Task 1.5 (Vercel Blob Storage).
// Uso: node --env-file=.env.local tests/manual/verify-blob.mjs
import { put, head } from "@vercel/blob";

const pathname = `test/verify-blob-${Date.now()}.txt`;
const content = `test upload at ${new Date().toISOString()}`;

const uploaded = await put(pathname, content, {
  access: "public",
  addRandomSuffix: true,
});
console.log("Subido:", uploaded.url);

const info = await head(uploaded.pathname);
console.log("Recuperado via head():", info.url);

if (info.url !== uploaded.url) {
  throw new Error("La URL recuperada no coincide con la URL subida");
}
console.log("OK: upload + recuperación funcionan correctamente.");
