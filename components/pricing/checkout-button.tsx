"use client";

import { createPayPalOrder } from "@/lib/paypal";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { CURRENCY } from "./billingLabels";

interface CheckoutButtonProps {
  planId: string;
  isCurrentPlan: boolean;
  billingPeriod?: string;
  disabled?: boolean;
  currency?: CURRENCY;
}

export default function CheckoutButton({ planId, isCurrentPlan, billingPeriod, disabled, currency }: CheckoutButtonProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (disabled) {
    return (
      <button
        className="w-full py-2 px-4 bg-gray-300 text-ink font-medium rounded-md cursor-not-allowed"
        disabled
      >
        Ya estas en un plan superior
      </button>
    );
  }

  // Free plan doesn't need checkout
  if (planId === "free") {
    return (
      <button
        className="w-full py-2 px-4 bg-gray-800 text-white font-medium rounded-md hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
        disabled={isCurrentPlan}
        onClick={() => router.push("/api/downgrade-to-free")}
      >
        {isCurrentPlan ? "Plan Actual" : "Forzar a Plan Gratuito"}
      </button>
    );
  }

  const handleCheckout = async () => {
    try {
      setIsLoading(true);
      setError(null);

      
      // Create PayPal order
      const order = await createPayPalOrder(
        planId,
        (billingPeriod || "monthly")
      );

      // Find the approval URL
      const approvalLink = order.links.find(
        (link: any) => link.rel === "approve"
      );

      if (approvalLink) {
        window.location.href = approvalLink.href;
      } else {
        throw new Error("No approval link found in PayPal response");
      }
    } catch (err) {
      console.error("Checkout error:", err);
      setError("Error al procesar el pago. Por favor, intenta de nuevo.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div>
      <button
        className="w-full py-2 px-4 bg-iris text-white font-medium rounded-md hover:bg-irisdark disabled:opacity-50 disabled:cursor-not-allowed"
        onClick={handleCheckout}
        disabled={isLoading || isCurrentPlan}
      >
        {isLoading
          ? "Procesando..."
          : isCurrentPlan
          ? "Plan Actual"
          : `Actualizar a ${planId === "ultimate" ? "Ultimate" : "Premium"}`}
      </button>
      {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
    </div>
  );
}
