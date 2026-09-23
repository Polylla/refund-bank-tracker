import { FileText, FileImage, File } from "lucide-react";

export function FileIcon({ tipoArchivo }: { tipoArchivo: string }) {
  if (tipoArchivo === "application/pdf") {
    return <FileText size={18} className="shrink-0 text-danger" />;
  }
  if (tipoArchivo.startsWith("image/")) {
    return <FileImage size={18} className="shrink-0 text-info" />;
  }
  return <File size={18} className="shrink-0 text-gray-400" />;
}
