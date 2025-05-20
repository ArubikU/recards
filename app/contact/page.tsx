import Link from "next/link"

export default function ContactPage() {
  return (
    <div className="container mx-auto px-4 py-12">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-4xl font-bold mb-8 text-center">¿Tienes preguntas?</h1>
        <p className="text-xl text-gray-600 text-center mb-12">
          Estamos aquí para ayudarte. Ya sea una duda técnica, una sugerencia o simplemente quieres decir hola, no dudes en escribirnos.
        </p>

        <form
          action="https://formspree.io/f/mqaqnwbe"
          method="POST"
          className="bg-white p-8 rounded-lg shadow-lg space-y-6"
        >
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
              Nombre
            </label>
            <input
              type="text"
              name="name"
              id="name"
              required
              className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#FF7A00]"
            />
          </div>

          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
              Correo Electrónico
            </label>
            <input
              type="email"
              name="email"
              id="email"
              required
              className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#FF7A00]"
            />
          </div>

          <div>
            <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-1">
              Mensaje
            </label>
            <textarea
              name="message"
              id="message"
              rows={5}
              required
              className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#FF7A00]"
            ></textarea>
          </div>

          <button
            type="submit"
            className="bg-[#FF7A00] hover:bg-orange-600 transition-colors text-white px-6 py-3 rounded-lg text-lg font-semibold w-full"
          >
            Enviar Mensaje
          </button>
        </form>
        {/**
         * 
        <div className="mt-12 text-center text-gray-600">
          También puedes escribirnos directamente a{" "}
          <a href="mailto:contacto@recards.ai" className="text-[#FF7A00] font-medium hover:underline">
            contacto@recards.ai
          </a>
        </div>

         */}
        <div className="mt-8 text-center">
          <Link href="/" className="text-[#FF7A00] font-semibold hover:underline">
            Volver al inicio
          </Link>
        </div>
      </div>
    </div>
  )
}
