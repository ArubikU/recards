import { getTierObject } from "@/lib/getLimits"
import { auth } from "@clerk/nextjs/server"
import Link from "next/link"
import { redirect } from "next/navigation"

export default async function PaymentSuccessPage({
  searchParams,
}: {
  searchParams: { plan: string }
}) {
  const { userId } = await auth()
  const { plan } = searchParams

  if (!userId) {
    redirect("/login")
  }

  if (!plan) {
    redirect("/dashboard")
  } 

  const tierObject = getTierObject(plan)

  const planName = tierObject.formattedName

  return (
    <div className="container mx-auto px-4 py-16">
      <div className="max-w-md mx-auto text-center">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <svg
            className="w-8 h-8 text-green-600"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
          </svg>
        </div>
        <h1 className="text-3xl font-bold mb-4">¡Pago Exitoso!</h1>
        <p className="text-gray-600 mb-8">
          Tu pago ha sido procesado correctamente. Tu cuenta ha sido actualizada al plan {planName}.
        </p>
        <div className="space-y-4">
          <Link
            href="/dashboard"
            className="block w-full py-2 px-4 bg-[#FF7A00] text-white font-medium rounded-md text-center hover:bg-[#E56E00]"
          >
            Ir al Dashboard
          </Link>
        </div>
      </div>
    </div>
  )
}
