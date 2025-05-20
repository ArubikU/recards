"use client"

import { SignIn } from "@clerk/nextjs"
import { dark } from "@clerk/themes"
import { useTheme } from "next-themes"

const LoginPage = () => {
  const { theme } = useTheme()
  const isDarkTheme = theme === "dark"

  return (
    <div className="container mx-auto flex min-h-screen flex-col items-center justify-center px-4 py-8">
          <SignIn
            appearance={{
              baseTheme: isDarkTheme ? dark : undefined,
              elements: {
                formButtonPrimary: "bg-primary hover:bg-primary/90 text-primary",
                card: "shadow-none",
                footerAction: "text-primary",
                formButtonSecondary: "bg-secondary hover:bg-secondary/90 text-secondary",

              },
              captcha: {
                theme: "auto"
              },
            }}
            redirectUrl="/dashboard"
          />
    </div>
  )
}

export default LoginPage
