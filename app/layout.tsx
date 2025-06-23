
import Navbar from "@/components/ui/navbar"
import { CustomAlertProvider } from "@/hooks/use-custom-alerts"
import { ClerkProvider } from "@clerk/nextjs"
import { MathJaxContext } from "better-react-mathjax"
import { Inter } from "next/font/google"
import type React from "react"
import "./globals.css"

const inter = Inter({ subsets: ["latin"] })
export const metadata = {
  title: "Nootiq - Transforma documentos en material de estudio",
  description: "Plataforma educativa que utiliza IA para convertir documentos en material de estudio",
  icons: {
    icon: "/logo.png",
    apple: "/apple-touch-icon.png",
    shortcut: "/logo.png",
  },
  openGraph: {
    title: "Nootiq - Transforma documentos en material de estudio",
    description: "Plataforma educativa que utiliza IA para convertir documentos en material de estudio",
    url: "https://Nootiq.vercel.app",
    images: [
      {
        url: "/logo.png",
        width: 1200,
        height: 630,
        alt: "Nootiq Logo",
      },
    ],
  },
  twitter: {
    title: "Nootiq - Transforma documentos en material de estudio",
    description: "Plataforma educativa que utiliza IA para convertir documentos en material de estudio",
    card: "summary_large_image",
    images: ["/logo.png"],
  },
  appleWebApp: {
    capable: true,
    title: "Nootiq - Transforma documentos en material de estudio",
    statusBarStyle: "default",
  },
  manifest: "/site.webmanifest",
}


export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <ClerkProvider>

      <html lang="es">
        <head>
          <title>Nootiq - Transforma documentos en material de estudio</title>
          <meta name="description" content="Plataforma educativa que utiliza IA para convertir documentos en material de estudio" />
          <link rel="icon" href="/logo.png" />
          <meta name="viewport" content="width=device-width, initial-scale=1" />
          <meta name="theme-color" content="#ffffff" />
          <meta property="og:title" content="Nootiq - Transforma documentos en material de estudio" />
          <meta property="og:description" content="Plataforma educativa que utiliza IA para convertir documentos en material de estudio" />
          <meta property="og:image" content="/logo.png" />
          <meta property="og:url" content="https://Nootiq.vercel.app" />
          <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
          <link rel="icon" type="image/png" href="/logo.png" />
          <link rel="manifest" href="/site.webmanifest" />
        </head>
        <body className={inter.className}>
          <div className="min-h-screen flex flex-col">
            <Navbar />
            <CustomAlertProvider>
              <MathJaxContext> <main className="flex-grow">{children}</main></MathJaxContext>
           
            </CustomAlertProvider>
            <footer className="bg-ivory border-t py-4">
              <div className="container mx-auto px-4 text-center text-ink">
                &copy; {new Date().getFullYear()} Nootiq. Todos los derechos reservados.
              </div>
            </footer>
          </div>
        </body>
      </html>
    </ClerkProvider>
  )
}
