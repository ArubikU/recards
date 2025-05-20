"use client"

import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { useClerk, useUser } from "@clerk/nextjs"
import { LogOut, Menu, Settings, Shield, User } from 'lucide-react'
import Image from "next/image"
import React, { createContext, Fragment, useContext, useEffect, useState, type ReactNode } from "react"
import ProfileTab from "./clerk/profile-tab"
import ProtectedByClerkFooter from "./clerk/protected-by"
import SecurityTab from "./clerk/security-tab"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "./ui/dropdown-menu"
// Tipos
type UserProfilePageProps = {
    label: string
    url: string
    labelIcon?: ReactNode
    children: ReactNode
}

// Contexto para compartir el estado del diálogo
type UserButtonContextType = {
    activeDialog: string | null
    setActiveDialog: (dialog: string | null) => void
    user: any
    signOut: () => Promise<void>
    requirePassword: <T>(callback: (password: string) => Promise<T>) => Promise<T | null>
}

// Contexto para compartir el estado del diálogo
const UserButtonContext = createContext<UserButtonContextType>({
    activeDialog: null,
    setActiveDialog: () => { },
    user: null,
    signOut: async () => { },
    requirePassword: async () => null,
})

// Hook para usar el contexto
export const useUserButton = () => useContext(UserButtonContext)

// Tipo para dispositivos
type DeviceType = {
    id: string
    type: string
    browser: string
    ip: string
    location: string
    lastActive: string
    isCurrentDevice: boolean
}

// Componente principal
function CustomUserButton({
    children,
    afterSignOutUrl = "/",
    showName = false,
}: {
    children?: ReactNode
    afterSignOutUrl?: string
    showName?: boolean
}) {
    const { user, isLoaded, isSignedIn } = useUser()
    const { signOut: clerkSignOut } = useClerk()
    const [isOpen, setIsOpen] = useState(false)
    const [activeDialog, setActiveDialog] = useState<string | null>(null)
    const [activeTab, setActiveTab] = useState("profile")
    // Simulamos los dispositivos activos
    const [devices, setDevices] = useState<DeviceType[]>([])

    const [isCurrentPasswordModalOpen, setIsCurrentPasswordModalOpen] = useState(false)
    const [currentPassword, setCurrentPassword] = useState("")
    const [currentPasswordError, setCurrentPasswordError] = useState("")
    const [isVerifyingPassword, setIsVerifyingPassword] = useState(false)
    const [currentCallback, setCurrentCallback] = useState<((password: string) => Promise<any>) | null>(null)
    const [currentResolve, setCurrentResolve] = useState<((value: any | null) => void) | null>(null)
    const [currentReject, setCurrentReject] = useState<((reason?: any) => void) | null>(null)
    const isMobile = typeof window !== "undefined" && window.innerWidth < 768

    // Function that takes a callback and returns a promise
    const requirePassword = async <T,>(callback: (password: string) => Promise<T>): Promise<T | null> => {
        return new Promise<T | null>((resolve, reject) => {
            setCurrentCallback(() => callback)
            setCurrentResolve(() => resolve)
            setCurrentReject(() => reject)
            setCurrentPassword("")
            setCurrentPasswordError("")
            setIsCurrentPasswordModalOpen(true)
        })
    }

    const handlePasswordVerification = async () => {
        if (!currentPassword) {
            setCurrentPasswordError("Password is required")
            return
        }

        setIsVerifyingPassword(true)
        try {
            // Password is verified, execute the callback
            if (currentCallback) {
                try {
                    const result = await currentCallback(currentPassword)


                    setIsCurrentPasswordModalOpen(false)
                    if (currentResolve) {
                        currentResolve(result)
                    }
                } catch (error: any) {
                    // The callback threw an error
                    console.error("Error in password callback:", error)
                    setCurrentPasswordError(error.message || "An error occurred during the operation")
                    if (currentReject) {
                        currentReject(error)
                    }
                }
            }
        } catch (error) {
            // Password verification failed
            setCurrentPasswordError("Incorrect password")
        } finally {
            setIsVerifyingPassword(false)
        }
    }

    const handleCancelPasswordModal = () => {
        setIsCurrentPasswordModalOpen(false)
        if (currentResolve) {
            currentResolve(null)
        }
        // Clean up
        setCurrentCallback(null)
        setCurrentResolve(null)
        setCurrentReject(null)
    }


    useEffect(() => {
        if (user) {
            user.getSessions().then((sessions) => {
                const activeDevices = sessions.map((session: any) => ({
                    id: session.id,
                    type: session.device?.type || "Unknown",
                    browser: session.browser,
                    ip: session.ipAddress,
                    location: session.location,
                    lastActive: new Date(session.lastActiveAt).toLocaleString(),
                    isCurrentDevice: session.isCurrentSession,
                }))
                setDevices(activeDevices)
            })
        }
    }, [user])

    // Función para cerrar sesión
    const handleSignOut = async () => {
        try {
            await clerkSignOut()
            window.location.href = afterSignOutUrl
        } catch (error) {
            console.error("Error al cerrar sesión:", error)
        }
    }

    // Si el usuario no está cargado, mostramos un estado de carga
    if (!isLoaded) {
        return (
            <div className="flex items-center">
                <div className="h-8 w-8 rounded-full bg-gray-200 animate-pulse"></div>
                {showName && <div className="ml-2 h-4 w-20 bg-gray-200 animate-pulse rounded"></div>}
            </div>
        )
    }

    // Si no hay usuario, no mostramos nada
    if (!isSignedIn || !user) return null


    // Extraer las páginas personalizadas de los children
    const customPages = React.Children.toArray(children).filter(
        (child) => React.isValidElement(child) && child.type === UserProfilePage,
    ) as React.ReactElement<UserProfilePageProps>[]
    const customPagesPortals = React.Children.toArray(children).filter(
        (child) => React.isValidElement(child) && child.type === UserProfileLink,
    ) as React.ReactElement<UserProfilePageProps>[]
    return (
        <UserButtonContext.Provider
            value={{
                activeDialog,
                setActiveDialog,
                user,
                signOut: handleSignOut,
                requirePassword,
            }}
        >
            <header>
                {/* Dropdown del usuario */}
                <Popover open={isOpen} onOpenChange={setIsOpen}>
                    <PopoverTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 rounded-full p-0">
                            <div className="flex items-center">
                                <Image
                                    src={user.imageUrl || "/placeholder.svg?height=32&width=32"}
                                    alt={user.fullName || "User"}
                                    width={32}
                                    height={32}
                                    className="h-8 w-8 rounded-full"
                                />
                                {showName && <span className="ml-2 text-sm font-medium">{user.fullName}</span>}
                            </div>
                        </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-80 max-w-xs p-0 bg-white rounded-xl" align="end">
                        <div className="p-2 border-b">
                            <div className="flex items-center gap-2 p-2">
                                <Image
                                    src={user.imageUrl || "/placeholder.svg?height=40&width=40"}
                                    alt={user.fullName || "User"}
                                    width={40}
                                    height={40}
                                    className="h-10 w-10 rounded-full"
                                />
                                <div className="flex flex-col">
                                    <span className="font-medium">{user.fullName}</span>
                                    <span className="text-xs text-muted-foreground">{user.primaryEmailAddress?.emailAddress}</span>
                                </div>
                            </div>
                        </div>
                        <div className="p-1 space-y-2">
                            <Button
                                variant="ghost"
                                className="w-full justify-start gap-2 px-5 py-3 text-sm text-gray-700 h-12"
                                onClick={() => setActiveDialog("manage")}
                            >
                                <span className="mr-2">
                                    <Settings className="h-4 w-4" />
                                </span>
                                Manage account
                            </Button>
                            {customPagesPortals.map((page, index) => (
                                <React.Fragment key={index}>
                                    <div className="border-b" />
                                    <Button
                                        variant="ghost"
                                        className="w-full justify-start gap-2 px-5 py-3 text-sm text-gray-700 h-12"
                                        onClick={() => setActiveDialog(page.props.url)}
                                    >
                                        <span className="mr-2">{page.props.labelIcon}</span>
                                        {page.props.label}
                                    </Button>
                                </React.Fragment>
                            ))}
                            <div className="border-b" />
                            <Button
                                variant="ghost"
                                className="w-full justify-start gap-2 px-5 py-3 text-sm text-gray-700 h-12"
                                onClick={handleSignOut}
                            >
                                <span className="mr-2">
                                    <LogOut className="h-4 w-4" />
                                </span>
                                Sign out
                            </Button>
                        </div>
                    </PopoverContent>
                </Popover>

                {/* Diálogo de gestión de cuenta predeterminado */}
                <Dialog open={activeDialog === "manage"} onOpenChange={(open) => !open && setActiveDialog(null)}>

                    <DialogContent className="rounded-xl max-w-4xl p-0 h-[80vh] flex overflow-hidden bg-gray-50">
                        {/* Sidebar */}
                        <DialogTitle className="hidden" />
                        {isMobile ? (
                            <div className="absolute bottom-4 right-4 z-10">
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <Button
                                            variant="secondary"
                                            size="icon"
                                            className="p-2 bg-gray-800 text-white hover:bg-gray-700 shadow-lg border-2 border-gray-900"
                                        >
                                            <Menu className="h-6 w-6" />
                                        </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent className="w-48 bg-white rounded-xl shadow-lg">
                                        <DropdownMenuItem onClick={() => setActiveTab("profile")}>
                                            <User className="h-4 w-4 mr-2" />
                                            Profile
                                        </DropdownMenuItem>
                                        <DropdownMenuItem onClick={() => setActiveTab("security")}>
                                            <Shield className="h-4 w-4 mr-2" />
                                            Security
                                        </DropdownMenuItem>
                                        {customPages.map((page, index) => (
                                            <DropdownMenuItem key={index} onClick={() => setActiveTab(page.props.url)}>
                                                <span className="mr-2">{page.props.labelIcon}</span>
                                                {page.props.label}
                                            </DropdownMenuItem>
                                        ))}
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            </div>
                        ) : (
                            <div className="w-64 border-r h-full bg-gray-200 flex flex-col">
                                <div className="p-6">
                                    <h2 className="text-xl font-semibold">Account</h2>
                                    <p className="text-gray-500 text-sm">Manage your account info.</p>
                                </div>
                                <div className="space-y-1 px-2 flex-1">
                                    <Button
                                        variant={activeTab === "profile" ? "secondary" : "ghost"}
                                        className="w-full justify-start gap-2 px-2 py-1.5 text-sm"
                                        onClick={() => setActiveTab("profile")}
                                    >
                                        <User className="h-4 w-4" />
                                        Profile
                                    </Button>
                                    <Button
                                        variant={activeTab === "security" ? "secondary" : "ghost"}
                                        className="w-full justify-start gap-2 px-2 py-1.5 text-sm"
                                        onClick={() => setActiveTab("security")}
                                    >
                                        <Shield className="h-4 w-4" />
                                        Security
                                    </Button>
                                    {customPages.map((page, index) => (
                                        <Button
                                            key={index}
                                            variant={activeTab === page.props.url ? "secondary" : "ghost"}
                                            className="w-full justify-start gap-2 px-2 py-1.5 text-sm"
                                            onClick={() => setActiveTab(page.props.url)}
                                        >
                                            {page.props.labelIcon}
                                            {page.props.label}
                                        </Button>
                                    ))}
                                </div>
                                <div className="mt-auto">
                                    <ProtectedByClerkFooter />
                                </div>
                            </div>
                        )}


                        {/* Contenido principal */}
                        <div className="flex-1 overflow-auto rounded-xl">
                            {/* Contenido de perfil */}
                            {activeTab === "profile" && (
                                <ProfileTab></ProfileTab>
                            )}

                            {/* Contenido de seguridad */}
                            {activeTab === "security" && (
                                <SecurityTab></SecurityTab>
                            )}
                            {activeTab !== "profile" && activeTab !== "security" && (
                                <div className="p-6 space-y-8">
                                    {customPages.find((page) => page.props.url === activeTab)?.props.children}
                                </div>
                            )}
                        </div>
                    </DialogContent>
                </Dialog>
                {/* Current Password Modal */}
                <Dialog
                    open={isCurrentPasswordModalOpen}
                    onOpenChange={(open) => {
                        if (!open) {
                            handleCancelPasswordModal();
                        }
                        setIsCurrentPasswordModalOpen(open)
                    }}
                >
                    <DialogContent className="rounded-xl max-w-md p-6 bg-white">
                        <DialogTitle>Confirm your password</DialogTitle>
                        <div className="space-y-4 py-4">
                            <p className="text-sm text-gray-600">
                                For your security, please confirm your current password to continue.
                            </p>
                            <div className="space-y-2">
                                <label htmlFor="current-password" className="text-sm font-medium">
                                    Current Password
                                </label>
                                <input
                                    id="current-password"
                                    type="password"
                                    value={currentPassword}
                                    onChange={(e) => {
                                        setCurrentPassword(e.target.value)
                                        setCurrentPasswordError("")
                                    }}
                                    className={`border rounded-xl px-4 py-2 w-full ${currentPasswordError ? "border-red-500" : ""}`}
                                    placeholder="Enter your current password"
                                    onKeyDown={(e) => {
                                        if (e.key === "Enter") {
                                            handlePasswordVerification()
                                        }
                                    }}
                                />
                                {currentPasswordError && <p className="text-sm text-red-500">{currentPasswordError}</p>}
                            </div>
                        </div>
                        <div className="flex justify-end gap-4">
                            <Button variant="ghost" className="hover:bg-gray-100 rounded-xl" onClick={handleCancelPasswordModal}
                            >
                                Cancel
                            </Button>
                            <Button
                                className="bg-gray-800 rounded-xl text-white hover:bg-gray-600"
                                disabled={isVerifyingPassword || currentPassword.trim() === ""}
                                onClick={handlePasswordVerification}
                            >
                                {isVerifyingPassword ? "Verifying..." : "Confirm"}
                            </Button>
                        </div>
                    </DialogContent>
                </Dialog>
                {/* Update Password Dialog */}
                <Dialog open={activeDialog === "updatePassword"} onOpenChange={(open) => !open && setActiveDialog(null)}>
                    <DialogContent className="rounded-xl max-w-md p-6 bg-white">
                        <DialogHeader>
                            <DialogTitle>Update your password</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4 py-4">
                            <div className="space-y-2">
                                <label htmlFor="new-password" className="text-sm font-medium">
                                    New Password
                                </label>
                                <input
                                    id="new-password"
                                    type="password"
                                    className="border rounded-xl px-4 py-2 w-full"
                                    placeholder="Enter new password"
                                />
                            </div>
                            <div className="space-y-2">
                                <label htmlFor="confirm-password" className="text-sm font-medium">
                                    Confirm New Password
                                </label>
                                <input
                                    id="confirm-password"
                                    type="password"
                                    className="border rounded-xl px-4 py-2 w-full"
                                    placeholder="Confirm new password"
                                />
                            </div>
                        </div>
                        <div className="flex justify-end gap-4">
                            <Button variant="ghost" className="hover:bg-gray-100 rounded-xl" onClick={() => setActiveDialog(null)}>
                                Cancel
                            </Button>
                            <Button className="bg-gray-800 rounded-xl text-white hover:bg-gray-600">Update Password</Button>
                        </div>
                    </DialogContent>
                </Dialog>
            </header>
        </UserButtonContext.Provider>
    )
}

// Componente para páginas de perfil personalizadas
function UserProfilePage({ label, url, labelIcon, children }: UserProfilePageProps) {
    const { setActiveDialog } = useUserButton()

    return (
        <Fragment>
            <DialogHeader className="sticky top-0 z-10 bg-white border-b p-4 flex flex-row items-center justify-between">
                <DialogTitle>{label}</DialogTitle>
            </DialogHeader>
            <div className="p-6 overflow-auto">{children}</div>
        </Fragment>
    )
}
function UserProfileLink({ label, url, labelIcon }: UserProfilePageProps) {
    const { setActiveDialog } = useUserButton()

    return (
        <Button
            variant="ghost"
            className="w-full justify-start gap-2 px-2 py-1.5 text-sm"
            onClick={() => setActiveDialog(url)}
        >
            {labelIcon}
            {label}
        </Button>
    )
}

// Asignar el componente UserProfilePage como propiedad de CustomUserButton
CustomUserButton.UserProfilePage = UserProfilePage
CustomUserButton.UserProfileLink = UserProfileLink
export default CustomUserButton
