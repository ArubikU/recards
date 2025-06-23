"use client"

import { useCustomAlerts } from "@/hooks/use-custom-alerts";
import { useRouter } from "next/navigation";
import { useState } from "react";



function GenerateQuizButton({ roomId }: { roomId: string }) {
    const [loading, setLoading] = useState(false);
    const { alert } = useCustomAlerts();
    const router = useRouter();

    const handleClick = async () => {
        setLoading(true);
        try {
            const res = await fetch("/api/ai/process/quizs", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ roomId }),
            });
            if (!res.ok) {
                throw new Error("Error generating quiza");
            }
            alert("Quiza generated successfully", "success");
            router.refresh();
        } catch (error) {
            // Optionally, handle error here
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="">
        <button
            onClick={handleClick}
            disabled={loading}
            className="text-xs bg-iris text-white px-2 py-1 rounded hover:bg-irisdark disabled:opacity-50"
        >
            {loading ? "Generando..." : "Generar"}
        </button>
        </div>
    );
}

export default GenerateQuizButton;