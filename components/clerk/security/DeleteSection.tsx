"use client"

import { Button } from "@/components/ui/button"
import { useReverification, useUser } from "@clerk/nextjs"
import { useState } from "react"

export const DeleteSection = () => {
  const { user }    = useUser()
  const [isDeleting, setIsDeleting] = useState(false)
  const [showConfirmation, setShowConfirmation] = useState(false)

  const handleDeleteAccount = useReverification(async () => {
      setIsDeleting(true)
      await user?.delete()
        setIsDeleting(false)
  });


  return (
    <div className="space-y-4 border-t pt-4">
      <h3 className="text-sm font-medium">Eliminar cuenta</h3>
      <p className="text-sm text-muted-foreground">
        Una vez que elimines tu cuenta, todos tus datos serán permanentemente eliminados.
        Esta acción no se puede deshacer.
      </p>
      
      {!showConfirmation ? (
        <Button
          variant="destructive"
          className="bg-red-500 hover:bg-red-600 text-white rounded-xl"
          onClick={() => setShowConfirmation(true)}
        >
          Eliminar cuenta
        </Button>
      ) : (
        <div className="space-y-4">
          <p className="text-sm font-medium text-destructive">
            ¿Estás seguro de que quieres eliminar permanentemente tu cuenta?
          </p>
          <div className="flex space-x-2">
            <Button
              variant="outline"
              onClick={() => setShowConfirmation(false)}
            >
              Cancelar
            </Button>
            <Button
              variant="destructive"
              onClick={handleDeleteAccount}
              disabled={isDeleting}
            >
              {isDeleting ? "Eliminando..." : "Confirmar eliminación"}
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}

export default DeleteSection;
