"use client"

import { SignInButton, SignUpButton, useUser } from "@clerk/nextjs"
import { AnimatePresence, motion } from "framer-motion"
import { Menu, X } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { useState } from "react"
import CustomUser from "../custom-user"

export default function Navbar() {
  const { isSignedIn } = useUser()
  const pathname = usePathname()
  const [mobileOpen, setMobileOpen] = useState(false)

  const closeMenu = () => setMobileOpen(false)

  const NavLinks = ({ onClick }: { onClick?: () => void }) => (
    <>
      <Link
        href="/about"
        onClick={onClick}
        className={`block text-gray-700 hover:text-[#FF7A00] px-3 py-2 rounded-md text-sm font-medium ${
          pathname === "/about" ? "text-[#FF7A00]" : ""
        }`}
      >
        Acerca de
      </Link>
          <Link
            href="/privacy"
            onClick={onClick}
            className={`block text-gray-700 hover:text-[#FF7A00] px-3 py-2 rounded-md text-sm font-medium ${
              pathname === "/privacy" ? "text-[#FF7A00]" : ""
            }`}
          >
            Privacidad
          </Link>
      <Link
        href="/pricing"
        onClick={onClick}
        className={`block text-gray-700 hover:text-[#FF7A00] px-3 py-2 rounded-md text-sm font-medium ${
          pathname === "/pricing" ? "text-[#FF7A00]" : ""
        }`}
      >
        Planes
      </Link>
      {isSignedIn && (
        <>
          <Link
            href="/dashboard"
            onClick={onClick}
            className={`block text-gray-700 hover:text-[#FF7A00] px-3 py-2 rounded-md text-sm font-medium ${
              pathname === "/dashboard" ? "text-[#FF7A00]" : ""
            }`}
          >
            Dashboard
          </Link>
        </>
      )}
    </>
  )

  return (
    <nav className="bg-white border-b z-50 relative">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <Link href="/" className="flex items-center">
              <Image src="/logo.png" alt="Logo" width={50} height={50} />
              <span className="ml-2 text-xl font-bold text-gray-700">ReCards</span>
            </Link>
          </div>

          {/* Desktop nav */}
          <div className="hidden md:flex items-center space-x-4">
            <NavLinks />
            {isSignedIn ? (
              <CustomUser  />
            ) : (
              <>
                <SignInButton mode="redirect">
                  <button className="text-gray-700 hover:text-[#FF7A00] px-3 py-2 rounded-md text-sm font-medium">
                    Iniciar Sesión
                  </button>
                </SignInButton>
                <SignUpButton mode="redirect">
                  <button className="btn-primary">Registrarse</button>
                </SignUpButton>
              </>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="text-gray-700 hover:text-[#FF7A00] focus:outline-none"
            >
              {mobileOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>

        {/* Mobile nav with animation */}
        <AnimatePresence>
          {mobileOpen && (
            <motion.div
              key="mobile-menu"
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3, ease: "easeInOut" }}
              className="md:hidden overflow-hidden"
            >
              <div className="mt-2 space-y-1 pb-4 border-t">
                <NavLinks onClick={closeMenu} />
                <div className="px-3">
                  {isSignedIn ? (
                    <CustomUser  showName />
                  ) : (
                    <div className="space-y-2">
                      <SignInButton mode="redirect">
                        <button
                          onClick={closeMenu}
                          className="w-full text-left text-gray-700 hover:text-[#FF7A00] px-3 py-2 rounded-md text-sm font-medium"
                        >
                          Iniciar Sesión
                        </button>
                      </SignInButton>
                      <SignUpButton mode="redirect">
                        <button onClick={closeMenu} className="w-full btn-primary">
                          Registrarse
                        </button>
                      </SignUpButton>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </nav>
  )
}
