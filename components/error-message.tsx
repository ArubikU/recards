import Link from 'next/link'
export default function ErrorMessage({
  title,
  message,
  backLink = false,
  backLinkText = "Volver a mis Rooms",
  backLinkHref = "/rooms"
}: {
  title: string,
  message: string,
  backLink?: boolean,
  backLinkText?: string,
  backLinkHref?: string
}) {
  return (
    <div className="max-w-2xl mx-auto px-6 py-12 text-center">
      <h1 className="text-3xl font-bold text-orange-600 mb-2">{title}</h1>
      <p className="text-gray-600 mb-4">{message}</p>
      {backLink && (
        <Link href={backLinkHref} className="text-orange-500 hover:underline">
          {backLinkText}
        </Link>
      )}
    </div>
  )
}