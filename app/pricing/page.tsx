
import PricingTable from "@/components/pricing/pricing-table"
import Link from "next/link"

export default function PricingPage() {
  return (
    <div className="bg-gray-50 py-16">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h1 className="text-4xl font-bold mb-4">Planes y Precios</h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Elige el plan que mejor se adapte a tus necesidades de estudio. Todos los planes incluyen acceso a nuestra
            tecnología de IA para generar material de estudio.
          </p>
        </div>

        <PricingTable />
        <div className="mt-12 flex flex-col items-center">
          <h2 className="text-xl font-semibold mb-4">¿Tienes un código promocional?</h2>
          <Link
            href="/promo"
            className="inline-flex items-center justify-center px-6 py-3 bg-gradient-to-r from-[#FF7A00] to-[#FFB347] text-white font-semibold rounded-xl shadow-lg transition-all duration-300 hover:scale-105 hover:shadow-xl focus:outline-none focus:ring-2 focus:ring-[#FF7A00] focus:ring-offset-2"
          >
            <span className="mr-2">🎁</span>
            Reclamar
          </Link>
        </div>

        <div className="mt-16 text-center">
          <h2 className="text-2xl font-bold mb-4">¿Tienes preguntas?</h2>
          <p className="text-gray-600 mb-6">
            Contáctanos para obtener más información sobre nuestros planes y cómo podemos ayudarte.
          </p>
          <Link href="/contact" className="text-[#FF7A00] hover:underline font-medium">
            Contactar al equipo de soporte
          </Link>
        </div>
      </div>
    </div>
  )
}
