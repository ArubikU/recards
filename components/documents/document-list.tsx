import { importTypes } from "@/lib/getLimits"

interface DocumentListProps {
  documents: {
    id: string
    type: importTypes
    url: string
  }[]
  roomId: string
}

export default function DocumentList({ documents, roomId }: DocumentListProps) {
  return (
    <div>
      {documents.length > 0 ? (
        <div className="space-y-4">
          {documents.map((document) => (
            <div key={document.id} className="border rounded-lg p-4">
                <p className="font-medium">
                {document.type === "pdf"
                  ? "PDF"
                  : document.type === "csv"
                  ? "CSV"
                  : document.type === "img"
                  ? "Imagen"
                  : document.type === "md"
                  ? "Markdown"
                  : document.type === "pdf-link"
                  ? "PDF (enlace)"
                  : document.type === "anki"
                  ? "Anki"
                  : "Otro"}
                </p>
              <a
                href={document.url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-[#FF7A00] hover:underline"
              >
                {(document.url.includes("blob.vercel") ? document.url.split("/").pop() : document.url)?.replaceAll("%20", " ")}
              </a>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-8">
          <p className="text-gray-500 mb-2">No hay documentos</p>
          <p className="text-sm">Sube un documento para comenzar</p>
        </div>
      )}
    </div>
  )
}
