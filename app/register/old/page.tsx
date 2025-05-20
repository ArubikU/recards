"use client"

import { SignUp } from "@clerk/nextjs"
import { dark } from "@clerk/themes"
import { useTheme } from "next-themes"

const RegisterPage = () => {
  const { theme } = useTheme()
  const isDarkTheme = theme === "dark"

  return (
    <div className="container mx-auto flex min-h-screen flex-col items-center justify-center px-4 py-8">
          <SignUp
            appearance={{
              baseTheme: isDarkTheme ? dark : undefined,
              elements: {
                formButtonPrimary: "bg-primary hover:bg-primary/90 text-primary",
                card: "shadow-none",
                footerAction: "text-primary",
                formButtonSecondary: "bg-secondary hover:bg-secondary/90 text-secondary",

              },
            }}
          />
    </div>
  )
}

export default RegisterPage
