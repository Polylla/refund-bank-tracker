import { put, head, type PutBlobResult } from "@vercel/blob";

export async function uploadFile(
  pathname: string,
  file: File | Blob | Buffer | string,
  access: "public" | "private" = "private"
): Promise<PutBlobResult> {
  return put(pathname, file, { access, addRandomSuffix: true });
}

export async function getFileUrl(pathname: string): Promise<string> {
  const blob = await head(pathname);
  return blob.url;
}
