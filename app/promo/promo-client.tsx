"use client";

import { getPlanById } from "@/components/pricing/billingLabels";
import {
  Alert,
  AlertDescription,
  AlertTitle,
} from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useCustomAlerts } from "@/hooks/use-custom-alerts";
import { motion } from "framer-motion";
import { BadgeCheck } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";

interface PromoClientPageProps {
  currentPlan: string;
  planId: string;
  expirationDate: string;
}

export default function PromoClientPage({

  currentPlan,
  planId,
  expirationDate,
}: PromoClientPageProps) {
  const { alert } = useCustomAlerts();
  const router = useRouter();

  const [promoCode, setPromoCode] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [claimedPlan, setClaimedPlan] = useState<string | null>(null);
  const [claimedDuration, setClaimedDuration] = useState<number | null>(null);
const didLoadPromoCode = useRef(false);

useEffect(() => {
  if (didLoadPromoCode.current) return;
  didLoadPromoCode.current = true;

  const params = new URLSearchParams(window.location.search);
  const code = params.get("promoCode");
  if (code) setPromoCode(code);
}, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!promoCode.trim()) {
      setError("Por favor, introduce un código promocional");
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      const res = await fetch("/api/promo/claim", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ promoCode }),
      });

      const data = await res.json();
      if (!res.ok || data.success === false) {
        const message = data.message || "Error al reclamar el código promocional";
        setError(message);
        alert(message, "error");
        return;
      }

      setSuccess(true);
      setClaimedPlan(data.planName);
      setClaimedDuration(data.duration);

      setTimeout(() => router.refresh(), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error inesperado");
    } finally {
      setIsLoading(false);
    }
  };

  const PromoInfoCard = () => (
    <Card className="shadow-md">
      <CardHeader>
        <CardTitle className="text-orange-600">Tu Plan Actual</CardTitle>
        <CardDescription>Detalles de tu suscripción activa</CardDescription>
      </CardHeader>
      <CardContent className="grid gap-3 text-sm">
        <div className="flex justify-between">
          <span className="font-medium text-muted-foreground">Plan:</span>
          <span className="font-semibold text-orange-600">{currentPlan}</span>
        </div>
        {expirationDate !== "No disponible" && planId !== "free" && (
          <div className="flex justify-between">
            <span className="font-medium text-muted-foreground">Expira el:</span>
            <span>{expirationDate}</span>
          </div>
        )}
      </CardContent>
    </Card>
  );

  const SuccessCard = () => (
    <motion.div
      initial={{ y: 30, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ type: "spring", stiffness: 120 }}
    >
      <Card className="bg-green-50 border border-green-200">
        <CardHeader>
          <CardTitle className="text-green-700">
            ¡Código Promocional Activado!
          </CardTitle>
        </CardHeader>
        <CardContent className="grid gap-3 text-sm">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Plan Activado:</span>
            <span className="font-bold text-orange-600">{claimedPlan}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Duración:</span>
            <span>{claimedDuration} días</span>
          </div>
          <div className="mt-4 border-t pt-4">
            <h4 className="font-semibold mb-2">Beneficios del plan:</h4>
            <ul className="space-y-2">
              {getPlanById(claimedPlan!.toLowerCase())?.features.map((feature, index) => (
                <li key={index} className="flex items-start text-sm">
                  <BadgeCheck className="h-5 w-5 text-green-600 mr-2 mt-0.5" />
                  {feature}
                </li>
              ))}
            </ul>
          </div>
        </CardContent>
        <CardFooter>
          <Button
            className="w-full bg-orange-500 hover:bg-orange-600"
            onClick={() => router.push("/dashboard")}
            disabled={isLoading}
          >
            Ir al Dashboard
          </Button>
        </CardFooter>
      </Card>
    </motion.div>
  );

  const PromoInput = () => (
            <div className="grid gap-2">
              <label htmlFor="promoCode" className="text-sm font-medium">
                Código Promocional
              </label>
              <Input
                id="promoCode"
                placeholder="ej. ORANGE2025"
                value={promoCode}
                onChange={(e) => setPromoCode(e.target.value)}
                autoFocus
              />
            </div>
          );

  const PromoForm = () => (
    <form onSubmit={handleSubmit}>
      <motion.div
        initial={{ y: 30, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ type: "spring", stiffness: 120 }}
      >
        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle className="text-orange-600">Canjea tu Código</CardTitle>
            <CardDescription>
              Introduce tu código promocional para mejorar tu plan
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4">
            <PromoInput />
            {error && (
              <Alert variant="destructive">
                <AlertTitle>Error</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
          </CardContent>
          <CardFooter>
            <Button
              type="submit"
              className="w-full bg-orange-500 hover:bg-orange-600"
              disabled={isLoading}
            >
              {isLoading ? "Reclamando..." : "Reclamar Código"}
            </Button>
          </CardFooter>
        </Card>
      </motion.div>
    </form>
  );

  return (
    <motion.div
      className="flex flex-col gap-6 w-full max-w-2xl mx-auto"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      <PromoInfoCard />
      {success ? <SuccessCard /> : <PromoForm />}
    </motion.div>
  );
}
