"use client"

import { Button } from "@/components/ui/button"
import { useUser } from "@clerk/nextjs"
import Image from "next/image"
import { useState } from "react"

function ProfileCard() {
    const { user, isLoaded } = useUser()

    const [updatingProfile, setUpdatingProfile] = useState(false)

    const [firstName, setFirstName] = useState(user?.firstName || "")
    const [lastName, setLastName] = useState(user?.lastName || "")
    const [userProfileImage, setUserProfileImage] = useState(user?.imageUrl || "")
    const [userProfileImageFile, setUserProfileImageFile] = useState<Blob | null>(null)

    if (!isLoaded || !user) return null

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (!file) return

        setUserProfileImageFile(file)

        try {
            const reader = new FileReader()
            reader.onload = (event) => {
                if (event.target?.result) {
                    setUserProfileImage(event.target.result as string)
                }
            }
            reader.readAsDataURL(file)
        } catch (error) {
            console.error("Error loading file:", error)
        }
    }

    if (updatingProfile) {
        return (
            <div className="border rounded-xl p-6 shadow-sm bg-ivory">
                <h3 className="text-sm font-medium mb-4 text-gray-900">Update profile</h3>
                <div className="flex flex-col sm:flex-row items-center gap-4 mb-4">
                    <Image
                        src={userProfileImage || "/placeholder.svg?height=64&width=64"}
                        alt={user.fullName || "User"}
                        width={64}
                        height={64}
                        className="h-16 w-16 rounded-full"
                    />
                    <div className="flex flex-col items-start gap-2 w-full">
                        <input
                            type="file"
                            accept="image/*"
                            id="profile-image-upload"
                            className="hidden"
                            onChange={handleFileChange}
                        />
                        <label htmlFor="profile-image-upload" className="w-full">
                            <Button
                                type="button"
                                className="bg-ivory rounded-xl border-4 border-gray-300/80 hover:bg-gray-100 w-full sm:w-auto"
                                asChild
                            >
                                <span>Upload</span>
                            </Button>
                        </label>
                        <p className="text-sm text-ink">Recommended size 1:1, up to 10MB.</p>
                    </div>
                </div>
                <div className="flex flex-col sm:flex-row gap-4 mb-6">
                    <input
                        type="text"
                        placeholder="First name"
                        value={firstName}
                        onChange={(e) => setFirstName(e.target.value)}
                        className="border rounded-xl px-4 py-2 w-full"
                    />
                    <input
                        type="text"
                        placeholder="Last name"
                        value={lastName}
                        onChange={(e) => setLastName(e.target.value)}
                        className="border rounded-xl px-4 py-2 w-full"
                    />
                </div>
                <div className="flex flex-col sm:flex-row justify-end gap-4">
                    <Button
                        variant="ghost"
                        className="hover:bg-gray-100 rounded-xl"
                        onClick={() => setUpdatingProfile(false)}
                    >
                        Cancel
                    </Button>
                    <Button
                        className="bg-gray-800 rounded-xl text-white hover:bg-ink"
                        disabled={
                            firstName === (user.firstName || "") &&
                            lastName === (user.lastName || "") &&
                            userProfileImage === (user.imageUrl || "")
                        }
                        onClick={async () => {
                            if (userProfileImageFile) {
                                await user.setProfileImage({ file: userProfileImageFile })
                            }
                            await user.update({
                                firstName: firstName,
                                lastName: lastName,
                            })
                            setUserProfileImage(user.imageUrl || "")
                            setUserProfileImageFile(null)
                            setUpdatingProfile(false)
                        }}
                    >
                        Save
                    </Button>
                </div>
            </div>
        )
    }

    return (
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 w-full">
            <div className="flex-grow flex items-center gap-4">
                <Image
                    src={user.imageUrl || "/placeholder.svg?height=64&width=64"}
                    alt={user.fullName || "User"}
                    width={64}
                    height={64}
                    className="h-16 w-16 rounded-full"
                />
                <div className="flex flex-col">
                    <h3 className="text-md font-medium">{user.username}</h3>
                </div>
            </div>
            <div className="self-start sm:self-auto">
                <Button className="bg-gray-100 rounded-xl hover:bg-gray-300" onClick={() => setUpdatingProfile(true)}>Update profile</Button>
            </div>
        </div>
    )
}

export default function ProfileSection() {
    return (
        <div className="flex flex-col sm:flex-row items-start py-4 border-b gap-4">
            <p className="text-sm font-medium w-32 shrink-0 mt-2">Profile</p>
            <div className="flex-grow">
                <ProfileCard />
            </div>
        </div>
    )
}
