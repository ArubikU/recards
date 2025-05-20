"use client"
import Navbar from "@/components/ui/navbar"
import { CustomAlertProvider } from "@/hooks/use-custom-alerts"
import { ClerkProvider } from "@clerk/nextjs"
import 'katex/dist/katex.min.css'
import { Inter } from "next/font/google"
import type React from "react"
import "./globals.css"

const inter = Inter({ subsets: ["latin"] })


export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <ClerkProvider>

      <html lang="es">
        <head>
          <title>ReCards - Transforma documentos en material de estudio</title>
          <meta name="description" content="Plataforma educativa que utiliza IA para convertir documentos en flashcards y quizzes" />
          <link rel="icon" href="/logo.svg" />
          <meta name="viewport" content="width=device-width, initial-scale=1" />
          <meta name="theme-color" content="#ffffff" />
          <meta property="og:title" content="ReCards - Transforma documentos en material de estudio" />
          <meta property="og:description" content="Plataforma educativa que utiliza IA para convertir documentos en flashcards y quizzes" />
          <meta property="og:image" content="/logo.svg" />
          <meta property="og:url" content="https://recards.vercel.app" />
          <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
          <link rel="icon" type="image/png" href="/logo.png" />
          <link rel="icon" type="image/svg" href="/logo.svg" />
          <link rel="manifest" href="/site.webmanifest" />
        </head>
        <body className={inter.className}>
          <div className="min-h-screen flex flex-col">
            <Navbar />
            <CustomAlertProvider>
            <main className="flex-grow">{children}</main>
            </CustomAlertProvider>
            <footer className="bg-white border-t py-4">
              <div className="container mx-auto px-4 text-center text-gray-500">
                &copy; {new Date().getFullYear()} ReCards. Todos los derechos reservados.
              </div>
            </footer>
          </div>
        </body>
      </html>
    </ClerkProvider>
  )
}
