"use client"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { useState } from "react"

export const MfaSection = () => {
  // Estado para MFA
  const [mfaMethods, setMfaMethods] = useState([
    { id: "totp", name: "Autenticador", enabled: true },
    { id: "sms", name: "SMS", enabled: false },
    { id: "backup_code", name: "Códigos de respaldo", enabled: true }
  ])
  
  const [showQRCode, setShowQRCode] = useState(false)
  const [activeMfaMethod, setActiveMfaMethod] = useState<string | null>(null)

  const handleToggleMfa = (methodId: string) => {
    setMfaMethods(methods => methods.map(method => 
      method.id === methodId 
        ? { ...method, enabled: !method.enabled } 
        : method
    ))
  }

  const handleSetupMfa = (methodId: string) => {
    setActiveMfaMethod(methodId)
    if (methodId === "totp") {
      setShowQRCode(true)
    } else {
      // Mostrar configuración para el método específico
      console.log(`Configurando método MFA: ${methodId}`)
    }
  }

  return (
    <div className="space-y-4 border-t pt-4">
      <h3 className="text-sm font-medium">Autenticación de dos factores</h3>
      <p className="text-sm text-muted-foreground">
        Aumenta la seguridad de tu cuenta añadiendo métodos adicionales de autenticación.
      </p>
      
      <div className="space-y-4">
        {mfaMethods.map((method) => (
          <div key={method.id} className="flex items-center justify-between">
            <div>
              <div className="font-medium">{method.name}</div>
              <div className="text-sm text-muted-foreground">
                {method.id === "totp" && "Usa una aplicación de autenticación como Google Authenticator"}
                {method.id === "sms" && "Recibe un código por mensaje de texto"}
                {method.id === "backup_code" && "Códigos de un solo uso para emergencias"}
              </div>
            </div>
            <div className="flex items-center gap-2">
              {method.enabled && <Badge>Activado</Badge>}
              <Button 
                variant={method.enabled ? "outline" : "default"}
                onClick={() => method.enabled 
                  ? handleToggleMfa(method.id) 
                  : handleSetupMfa(method.id)
                }
              >
                {method.enabled ? "Desactivar" : "Configurar"}
              </Button>
            </div>
          </div>
        ))}
      </div>
      
      {/* Diálogo para configurar TOTP */}
      {showQRCode && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white p-6 rounded-lg shadow-lg max-w-md w-full">
            <h2 className="text-xl font-bold mb-4">Configurar autenticador</h2>
            <div className="space-y-4">
              <p className="text-sm">Escanea este código QR con tu aplicación de autenticación:</p>
              {/* Aquí iría la imagen del código QR */}
              <div className="bg-gray-200 h-40 w-40 mx-auto flex items-center justify-center">
                <p className="text-sm text-gray-500">Código QR de ejemplo</p>
              </div>
              <p className="text-sm">O ingresa este código manualmente:</p>
              <div className="bg-gray-100 p-2 rounded text-center font-mono">
                ABCD-EFGH-IJKL-MNOP
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Código de verificación</label>
                <input
                  type="text"
                  className="w-full border rounded-md p-2"
                  placeholder="Ingresa el código de 6 dígitos"
                />
              </div>
              <div className="flex justify-end space-x-2 pt-4">
                <Button variant="outline" onClick={() => setShowQRCode(false)}>
                  Cancelar
                </Button>
                <Button onClick={() => {
                  // Aquí verificarías el código ingresado
                  // y activarías TOTP si es correcto
                  handleToggleMfa("totp");
                  setShowQRCode(false);
                }}>
                  Verificar
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default MfaSection;
