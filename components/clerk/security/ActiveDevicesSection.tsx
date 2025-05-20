"use client"

import { Badge } from "@/components/ui/badge";
import { useSession, useUser } from "@clerk/nextjs";
import { ActClaim, ActiveSessionResource, ClerkResource, SessionActivity } from "@clerk/types";
import { useEffect, useState } from "react";

interface SessionWithActivitiesResource extends ClerkResource {
    id: string;
    status: string;
    expireAt: Date;
    abandonAt: Date;
    lastActiveAt: Date;
    latestActivity: SessionActivity;
    actor: ActClaim | null;
    revoke: () => Promise<SessionWithActivitiesResource>;
}const MobileDevice = () => {
    return (
        <svg
            className="h-6 w-4"
            viewBox="0 0 24 48"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
        >
            <rect x="2" y="2" width="20" height="44" rx="3" fill="#1F2937" />
            <circle cx="12" cy="43" r="1.5" fill="#D1D5DB" /> {/* Botón inferior */}
        </svg>
    );
};

const DesktopDevice = () => {
    return (
        <svg
            className="h-6 w-6"
            viewBox="0 0 48 48"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
        >
            {/* Pantalla */}
            <rect x="4" y="4" width="40" height="28" rx="2" fill="#1F2937" />
            {/* Base */}
            <rect x="18" y="34" width="12" height="4" fill="#1F2937" />
            {/* Soporte */}
            <rect x="22" y="32" width="4" height="2" fill="#1F2937" />
        </svg>
    );
};

const DeviceInfo = (props: { session: SessionWithActivitiesResource, current: ActiveSessionResource }): Device => {

    const isCurrentlyImpersonating = !!props.current?.actor;
    const isImpersonationSession = !!props.session.actor;
    const { city, country, browserName, browserVersion, deviceType, ipAddress, isMobile } = props.session.latestActivity;
    const title = deviceType ? deviceType : isMobile ? 'Mobile device' : 'Desktop device';
    const browser = `${browserName || ''} ${browserVersion || ''}`.trim() || 'Web browser';
    const location = [city || '', country || ''].filter(Boolean).join(', ').trim() || null;
    const isCurrent = props.session.id === props.current?.id;
    return {
        id: props.session.id,
        title,
        type: deviceType || (isMobile ? 'Mobile' : 'Desktop'),
        browser,
        ip: ipAddress || '',
        location: location || "",
        lastActive: props.session.lastActiveAt,
        isCurrentDevice: isCurrent,
        isImpersonationSession,
        isCurrentlyImpersonating,
        isCurrent: isCurrent,
    };
};


// Tipo para los dispositivos activos
interface Device {
    id: string
    type: string
    title: string
    browser: string
    ip: string
    location: string
    lastActive: Date
    isCurrentDevice: boolean
    isImpersonationSession?: boolean
    isCurrentlyImpersonating?: boolean
    isCurrent?: boolean
}
const getDeviceIcon = (deviceType: string) => {
    switch (deviceType) {
        case 'Mobile':
            return <MobileDevice />;
        case 'Desktop':
            return <DesktopDevice />;
        default:
            return <DesktopDevice />;
    }
}
export const formatDate = (date: Date): string => {
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffSec = Math.floor(diffMs / 1000);
    const diffMin = Math.floor(diffSec / 60);
    const diffHours = Math.floor(diffMin / 60);
    const diffDays = Math.floor(diffHours / 24);

    const timeString = date.toLocaleTimeString('es-PE', {
        hour: '2-digit',
        minute: '2-digit',
    });

    if (diffDays === 0) {
        return `Hoy a las ${timeString}`;
    } else if (diffDays === 1) {
        return `Ayer a las ${timeString}`;
    } else if (diffDays < 7) {
        return `Hace ${diffDays} días`;
    } else if (diffDays < 30) {
        const weeks = Math.floor(diffDays / 7);
        return `Hace ${weeks} semana${weeks > 1 ? 's' : ''}`;
    } else if (diffDays < 60) {
        return `Hace más de 1 mes`;
    } else {
        // Para fechas lejanas, mostrar en formato yyyy-mm-dd HH:mm
        const formatted = date.toLocaleString('sv-SE', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
        }).replace(' ', ' ');
        return formatted;
    }
};




export const ActiveDevicesCard = () => {
    // Datos de muestra para dispositivos

    const { user } = useUser()
    const { session } = useSession()
    const [devices, setDevices] = useState<Device[]>([])
    useEffect(() => {
        if (user && session) {
            user.getSessions().then((sessions) => {
                const activeDevices = sessions.map((se) => {
                    const deviceInfo = DeviceInfo({ session: se, current: session as ActiveSessionResource });
                    return deviceInfo;
                });
                //sort by lastActive
                activeDevices.sort((a, b) => {
                    return new Date(b.lastActive).getTime() - new Date(a.lastActive).getTime();
                });
                //

                setDevices(activeDevices);
            });
        }
    }, [user, session]);



    return (<div className="space-y-4">
        {
            devices.map((device) => (
                <div key={device.id} className="flex items-center">
                    <span className="mr-3">{getDeviceIcon(device.type)}</span>
                    <div className="flex items-center justify-between">
                        <div>
                            <div className="flex items-center gap-2">
                                <div className="font-medium">{device.title}</div>
                                {device.isCurrent && <Badge className="text-xs bg-gray-300">Actual</Badge>}
                            </div>
                            <div className="text-sm text-gray-500">
                                <div>{device.browser}</div>
                                <div>{device.ip} ({device.location})</div>
                                <div>{formatDate(device.lastActive)}</div>
                            </div>
                        </div>
                    </div>
                </div>
            ))
        }

    </div>
    )
}

function ActiveDevicesSection() {

    return (
        <div className="flex items-start border-t pt-4">
            <p className="text-sm font-medium w-32 shrink-0 mr-4 mt-2">Dispositivos activos</p>
            <div className="flex-grow">
                <ActiveDevicesCard />
            </div>
        </div>
    )
}
export default ActiveDevicesSection;
