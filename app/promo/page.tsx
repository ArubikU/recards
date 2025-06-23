import { whenPlanExpires } from "@/lib/db";
import { getTierObject } from "@/lib/getLimits";
import { auth, clerkClient } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import PromoClientPage from "./promo-client";

export default async function PromoPage() {
    const authObject = await auth();
  const { userId } = authObject;

  if (!userId) {
    redirect("/login");
  }

    const client = await clerkClient()
    const userData = await client.users.getUser(userId)
    const currentPlan = userData?.publicMetadata?.plan as string | undefined || "free"
  const tierInfo = getTierObject(currentPlan);
  
  // Obtener fecha de expiración
  const expDate = await whenPlanExpires(userId);
  
  return (
    <div className="container mx-auto py-10">
    <div className="text-center mb-10">
      <h1 className="text-4xl font-bold mb-4">Reclamar Código Promocional</h1>
      <p className="text-xl text-ink max-w-2xl mx-auto">
        Ingresa tu código promocional para obtener acceso a beneficios exclusivos en tu plan de estudio.
      </p>
    </div>
      <PromoClientPage 
        currentPlan={tierInfo.formattedName} 
        planId={tierInfo.id}
        expirationDate={expDate ? expDate.toLocaleDateString('es-ES') : 'No disponible'} 
      />
    </div>
  );
}
