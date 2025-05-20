import { claimPromoCode } from "@/lib/db";
import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json(
        { error: "No autorizado. Por favor, inicia sesión." },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { promoCode } = body;

    if (!promoCode) {
      return NextResponse.json(
        { error: "Se requiere un código promocional." },
        { status: 400 }
      );
    }

    // Reclamar el código promocional
    const result = await claimPromoCode(promoCode, userId);

    if (!result) {


      return NextResponse.json(
        { error: "Código promocional inválido o ya ha sido utilizado." },
        { status: 400 }
      );
    }
    
        if(result.error) {
            return NextResponse.json({
                success: false,
                message: result.error,
                
            }
            );
        }
    
    return NextResponse.json({
      success: true,
      message: "Código promocional reclamado con éxito.",
      planName: result.planName,
      duration: result.duration,
    });
  } catch (error) {
    console.error("Error al reclamar código promocional:", error);
    return NextResponse.json(
      { error: "Ha ocurrido un error al procesar la solicitud." },
      { status: 500 }
    );
  }
}
