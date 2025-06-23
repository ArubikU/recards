"use client"

import { getTierObject } from "@/lib/getLimits"
import { onUpdateSettings } from "@/lib/updateUnsafe"
import { useUser } from "@clerk/nextjs"
import Link from "next/link"
import { useEffect, useState } from "react"
import { getPlanById } from "../pricing/billingLabels"

interface UserProfileProps {
    publicMetadata: {
        plan?: string
        emailNotifications?: boolean
        productUpdates?: boolean
        language?: string
    },
}

export default function UserProfile({ publicMetadata }: UserProfileProps) {
    const [activeTab, setActiveTab] = useState<"subscription" | "settings">("subscription")
    const {user,isLoaded} = useUser()
    const [settings, setSettings] = useState({
        emailNotifications: false,
        productUpdates: false,
        language: "es"
    })
    // Ensure settings are initialized from publicMetadata only once
    useEffect(() => {
        if(isLoaded){
            setSettings({
                emailNotifications: user?.unsafeMetadata.emailNotifications as any || false,
                productUpdates: user?.unsafeMetadata.productUpdates as any || false,
                language: user?.unsafeMetadata.language as any || "es"
            })
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isLoaded])
    if(!isLoaded) return null
    // Get user plan from metadata
    const userPlan =  getTierObject((publicMetadata?.plan as string) || "free")


    const planFeatures = getPlanById(userPlan.id)?.features

    return (
        <div className="bg-ivory rounded-lg shadow-md overflow-hidden">
            <div className="border-b">
                <div className="flex">
                    <button
                        className={`px-6 py-3 font-medium ${activeTab === "subscription" ? "border-b-2 border-iris text-iris" : "text-ink"
                            }`}
                        onClick={() => setActiveTab("subscription")}
                    >
                        Suscripción
                    </button>
                    <button
                        className={`px-6 py-3 font-medium ${activeTab === "settings" ? "border-b-2 border-iris text-iris" : "text-ink"
                            }`}
                        onClick={() => setActiveTab("settings")}
                    >
                        Configuración
                    </button>
                </div>
            </div>

            <div className="p-6">
                {activeTab === "subscription" ? (
                    <div>
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-xl font-semibold">Plan Actual</h3>
                            <Link href="/pricing" className="text-iris hover:underline text-sm font-medium">
                                Cambiar Plan
                            </Link>
                        </div>

                        <div className="bg-gray-50 rounded-lg p-4 mb-6">
                            <div className="flex justify-between items-center">
                                <div>
                                    <h4 className="font-semibold text-lg">{userPlan.formattedName}</h4>
                                    <p className="text-ink text-sm">
                                        {userPlan.isFree ? "Plan gratuito" : userPlan.isPremium ? "S/ 49.99/mes" : "S/ 99.99/mes"}
                                    </p>
                                </div>
                                <span className="bg-green-100 text-green-800 text-xs font-medium px-2.5 py-0.5 rounded">Activo</span>
                            </div>
                        </div>

                        <h3 className="text-lg font-semibold mb-4">Características del Plan</h3>
                        <div className="space-y-3">
                            {planFeatures?.map((feature, index) => (
                                <div key={index} className="flex items-start">
                                    <svg
                                        className="h-5 w-5 text-green-600 mr-2 mt-0.5"
                                        xmlns="http://www.w3.org/2000/svg"
                                        viewBox="0 0 20 20"
                                        fill="currentColor"
                                    >
                                        <path d="M7.293 9.293a1 1 0 011.414 0L10 10.586l1.293-1.293a1 1 0 111.414 1.414l-2 2a1 1 0 01-1.414 0l-2-2a1 1 0 010-1.414z" />
                                    </svg>
                                    <span>{feature}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                ) : (
                    <div>
                        <h3 className="text-xl font-semibold mb-6">Configuración de la Cuenta</h3>

                        <div className="space-y-6">
                            {/* Idioma */}
                            <div>
                                <h4 className="font-medium mb-2">Idioma</h4>
                                <select
                                    className="input"
                                    value={settings.language}
                                    onChange={e => setSettings(prev => ({ ...prev, language: e.target.value }))}
                                >
                                    <option value="es">Español</option>
                                    <option value="en">English</option>
                                </select>
                            </div>

                            {/* Notificaciones */}
                            <div>
                                <h4 className="font-medium mb-2">Notificaciones</h4>
                                <div className="space-y-2">
                                    <label className="flex items-center">
                                        <input
                                            type="checkbox"
                                            className="rounded text-iris focus:ring-iris h-4 w-4 mr-2"
                                            checked={!!settings.emailNotifications}
                                            onChange={e => setSettings(prev => ({ ...prev, emailNotifications: e.target.checked }))}
                                        />
                                        <span>Recibir notificaciones por email</span>
                                    </label>
                                    <label className="flex items-center">
                                        <input
                                            type="checkbox"
                                            className="rounded text-iris focus:ring-iris h-4 w-4 mr-2"
                                            checked={!!settings.productUpdates}
                                            onChange={e => setSettings(prev => ({ ...prev, productUpdates: e.target.checked }))}
                                        />
                                        <span>Recibir actualizaciones de producto</span>
                                    </label>
                                </div>
                            </div>

                            {/* Eliminar cuenta 
                            <div>
                                <h4 className="font-medium mb-2">Eliminar Cuenta</h4>
                                <p className="text-ink text-sm mb-2">
                                    Esta acción eliminará permanentemente tu cuenta y todos tus datos.
                                </p>
                                <button className="text-red-600 hover:text-red-800 text-sm font-medium">Eliminar mi cuenta</button>
                            </div>*/}
                        </div>

                        {/* Guardar cambios */}
                        <div className="mt-8">
                            <button
                                className="bg-iris text-white px-6 py-2 rounded font-medium hover:bg-irisdark transition"
                                onClick={() => {
                                    onUpdateSettings(settings,user)
                                }}
                            >
                                Guardar cambios
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}
