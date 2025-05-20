"use client"
import { getTierObject } from "@/lib/getLimits";
import { onUpdateSettings } from "@/lib/updateUnsafe";
import { useUser } from "@clerk/nextjs";
import Link from "next/link";
import { useEffect, useState } from "react";
import CustomUserButton from "./custom-user-button";
import { getPlanById } from "./pricing/billingLabels";

const SettingsIcon = () => {
    return (
        <svg viewBox="0 0 1024 1024" fill="currentColor" version="1.1" xmlns="http://www.w3.org/2000/svg"><path d="M825.6 647.2l-6.4 12.8 8 12 78.4 116 3.2-31.2-139.2 135.2 29.6-3.2-127.2-76-10.4-6.4-11.2 4.8c-8 3.2-16 6.4-24.8 9.6l-13.6 4.8-3.2 13.6-28 131.2 24-19.2H408l24 18.4-34.4-137.6-3.2-12-12-4.8c-7.2-3.2-14.4-5.6-21.6-9.6l-12-5.6-11.2 7.2-120 76.8 30.4 3.2-139.2-136 4 30.4 77.6-124 7.2-11.2-5.6-12c-4-8-7.2-16.8-9.6-24.8l-4.8-12.8-13.6-2.4-134.4-28 19.2 24v-192l-18.4 24 141.6-33.6 12-3.2 4.8-12c3.2-8 7.2-16.8 11.2-24.8l6.4-12.8-8-12-73.6-110.4-3.2 31.2 138.4-136.8-30.4 4L352 186.4l10.4 6.4 11.2-4.8c6.4-2.4 13.6-5.6 20-8l12.8-4 3.2-12.8 32.8-132.8-24 18.4H616l-24-19.2 28.8 136 2.4 12.8 12.8 4.8c10.4 4 20 8 29.6 12.8l12 5.6 11.2-7.2 113.6-71.2-28.8-3.2 140 134.4-4-30.4-76 120-7.2 11.2 5.6 12c3.2 8 7.2 16.8 9.6 24.8l4 12.8 12.8 3.2 134.4 32-18.4-24v192l19.2-24-141.6 28.8-12.8 2.4-4.8 12c-2.4 6.4-5.6 13.6-8.8 20z m32-11.2l4.8 24 141.6-28.8 19.2-4V396l-18.4-4.8-134.4-32-5.6 24 23.2-8c-3.2-9.6-7.2-19.2-11.2-28.8l-22.4 9.6 20.8 12.8 76-120 10.4-16.8-14.4-13.6-140-134.4L793.6 72l-16 10.4L664 153.6l12.8 20.8L688 152c-11.2-5.6-22.4-10.4-34.4-14.4L644.8 160l24-4.8-28.8-136-4-19.2H400.8l-4.8 18.4-32.8 132.8 24 5.6-8-23.2c-8 2.4-15.2 5.6-23.2 8.8l9.6 22.4 12.8-20.8-123.2-73.6-16-9.6-13.6 13.6-138.4 136.8-14.4 14.4 11.2 16.8L157.6 352l20-13.6-21.6-10.4c-4.8 9.6-8.8 18.4-12.8 28l22.4 9.6-5.6-24-141.6 33.6-18.4 4v231.2l19.2 4 135.2 27.2 4.8-24-23.2 8c3.2 9.6 7.2 19.2 11.2 28.8l22.4-9.6-20.8-12.8-77.6 124-10.4 16.8 14.4 13.6 139.2 135.2 13.6 13.6 16-10.4 120-76.8-12.8-20.8-10.4 22.4c8 4 16.8 7.2 24.8 10.4l8.8-22.4-24 5.6 34.4 137.6 4.8 18.4H624.8l4-19.2 28-131.2-24-4.8 8 23.2c9.6-3.2 18.4-6.4 28-10.4l-9.6-22.4-12.8 20.8 127.2 76 16 9.6 13.6-12.8 139.2-136 14.4-14.4-11.2-16.8-78.4-116-20 13.6 21.6 11.2c4-8 8-16 11.2-24l-22.4-9.6z" fill="" /><path d="M512 681.6c-100 0-181.6-81.6-181.6-181.6S412 318.4 512 318.4 693.6 400 693.6 500 612 681.6 512 681.6z m0-315.2c-73.6 0-133.6 60-133.6 133.6S438.4 633.6 512 633.6s133.6-60 133.6-133.6S585.6 366.4 512 366.4z" fill="" /></svg>
    );
};
const BillingIcon = () => {
    return (<svg version="1.1" baseProfile="tiny" id="Layer_1" xmlns="http://www.w3.org/2000/svg" 
        viewBox="0 0 24 24" overflow="visible">
        <g >
            <rect y="0" fill="none" width="24" height="24" />
            <g transform="translate(0.000000, 5.000000)">
                <path fill-rule="evenodd" fill="#85A4E6" d="M22.5,15.2h-21c-0.8,0-1.5-0.7-1.5-1.5V0.2c0-0.8,0.7-1.5,1.5-1.5h21
			c0.8,0,1.5,0.7,1.5,1.5v13.5C24,14.6,23.3,15.2,22.5,15.2L22.5,15.2z"/>
                <path fill-rule="evenodd" fill="#5C85DE" d="M22.5,15.2H12V-1.2h10.5c0.8,0,1.5,0.7,1.5,1.5v13.5C24,14.6,23.3,15.2,22.5,15.2
			L22.5,15.2z"/>
                <rect y="1" fill-rule="evenodd" fill="#5C85DE" width="24" height="3" />
                <rect id="Rectangle-path_00000135674211772856346760000002730362558129152162_" x="12" y="1" fill-rule="evenodd" fill="#3367D6" width="12" height="3" />
                <rect id="Rectangle-path_00000127732411686421387230000005866310280904328323_" x="2.2" y="5.5" fill-rule="evenodd" fill="#FFFFFF" width="19.5" height="2.2" />
                <rect id="Rectangle-path_00000144336547962367256270000004601864478366739619_" x="2.2" y="10" fill-rule="evenodd" fill="#5C85DE" width="4.5" height="3" />
                <rect id="Rectangle-path_00000167372342969776731770000010922900929549315211_" x="13.5" y="10.8" fill-rule="evenodd" fill="#FFFFFF" width="1.5" height="1.5" />
                <rect id="Rectangle-path_00000026865061745408398040000018034195747439422142_" x="16.5" y="10.8" fill-rule="evenodd" fill="#FFFFFF" width="1.5" height="1.5" />
                <rect id="Rectangle-path_00000169543108220145060960000001220724486439157930_" x="19.5" y="10.8" fill-rule="evenodd" fill="#FFFFFF" width="1.5" height="1.5" />
            </g>
        </g>
    </svg>);
}

export default function CustomUser({showName = false}: { showName?: boolean }) {

    const { user, isLoaded } = useUser()
    const [settings, setSettings] = useState({
        emailNotifications: false,
        productUpdates: false,
        language: "es"
    })

    useEffect(() => {
        if (isLoaded) {
            setSettings({
                emailNotifications: Boolean(user?.unsafeMetadata.emailNotifications) || false,
                productUpdates: Boolean(user?.unsafeMetadata.productUpdates) || false,
                language: typeof user?.unsafeMetadata.language === "string" ? user.unsafeMetadata.language : "es"
            })
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isLoaded])


    if (!isLoaded) return (<CustomUserButton afterSignOutUrl="/" />)

    // Get user plan from metadata
    const userTier = getTierObject((user?.publicMetadata?.plan as string) || "free")


    const userPlan = getPlanById(userTier.id)

    return (<header>
        <CustomUserButton afterSignOutUrl="/" showName={showName}>
            {/* You can pass the content as a component */}
            <CustomUserButton.UserProfilePage label="Settings" url="custom" labelIcon={<SettingsIcon />}>
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
                                        className="rounded text-[#FF7A00] focus:ring-[#FF7A00] h-4 w-4 mr-2"
                                        checked={!!settings.emailNotifications}
                                        onChange={e => setSettings(prev => ({ ...prev, emailNotifications: e.target.checked }))}
                                    />
                                    <span>Recibir notificaciones por email</span>
                                </label>
                                <label className="flex items-center">
                                    <input
                                        type="checkbox"
                                        className="rounded text-[#FF7A00] focus:ring-[#FF7A00] h-4 w-4 mr-2"
                                        checked={!!settings.productUpdates}
                                        onChange={e => setSettings(prev => ({ ...prev, productUpdates: e.target.checked }))}
                                    />
                                    <span>Recibir actualizaciones de producto</span>
                                </label>
                            </div>
                        </div>
                    </div>

                    {/* Guardar cambios */}
                    <div className="mt-8">
                        <button
                            className="bg-[#FF7A00] text-white px-6 py-2 rounded font-medium hover:bg-[#e66a00] transition"
                            onClick={() => {
                                onUpdateSettings(settings, user)
                            }}
                        >
                            Guardar cambios
                        </button>
                    </div>
                </div>
            </CustomUserButton.UserProfilePage>
            <CustomUserButton.UserProfilePage label="Plan" url="billing" labelIcon={<BillingIcon />}>
                <div>
                    <div className="flex  items-center mb-6">
                        <h3 className="text-xl font-semibold">Plan Actual</h3>
                    </div>

                    <div className="bg-gray-50 rounded-lg p-4 mb-6">
                        <div className="flex justify-between items-center">
                            <div>
                                <h4 className={`${userTier.isUltimate ? "text-gradient-orange-metallic" : ""} font-semibold text-lg `}>{userTier.formattedName}</h4>
                            </div>
                            <div>
                                
                            <span className="bg-green-100 text-green-800 text-xs font-medium px-2.5 py-0.5 rounded">Activo</span>
                        <Link href="/pricing" className="px-4 text-[#FF7A00] hover:underline text-sm font-medium">
                            Cambiar Plan
                        </Link>
                            </div>
                        </div>
                    </div>

                    <h3 className="text-lg font-semibold mb-4">Características del Plan</h3>
                    <div className="space-y-3">
                        {userPlan?.features?.map((feature, index) => (
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
            </CustomUserButton.UserProfilePage>
        </CustomUserButton>
    </header>)
}