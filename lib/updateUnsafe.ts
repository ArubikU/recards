export const onUpdateSettings = (updates: { [key: string]: any }, user: any) => {


        user?.update({
            unsafeMetadata: { ...(user?.unsafeMetadata || {}), ...updates }
        }).then(() => {
            console.log("Settings updated:", updates)
        }).catch((error: any) => {
            console.error("Error updating settings:", error)
        })
    }