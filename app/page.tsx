"use client"
import { MotionCard } from "@/components/ui/motion-card"
import { useAuth } from "@clerk/nextjs"
import { motion } from "framer-motion"
import Link from "next/link"

export default function Home() {
  const { userId } = useAuth()

  return (
    <main className="bg-gray-50 scroll-smooth">
      {/* HERO */}
      <section className="py-24 bg-ivory">
        <div className="container mx-auto px-4 text-center max-w-5xl">
          <motion.h1 
            className="text-4xl md:text-6xl font-extrabold mb-6 leading-tight"
            initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}
          >
            Transforma tus documentos en <span className="text-iris">material de estudio</span> con Nootiq
          </motion.h1>
          <p className="text-lg md:text-xl text-ink mb-8">
            IA que convierte PDFs y enlaces en material de estudio interactivos para aprender mejor.
          </p>
          <div className="flex justify-center gap-4 flex-wrap">
            <Link href={userId ? "/dashboard" : "/register"} legacyBehavior>
              <a className="bg-iris hover:bg-irisdark text-white font-semibold py-3 px-6 rounded-xl shadow-md transition-all text-lg">
                {userId ? "Ir al Dashboard" : "Comenzar Gratis"}
              </a>
            </Link>
            <a href="#como-funciona" className="border border-iris text-iris font-semibold py-3 px-6 rounded-xl hover:bg-irisforeground transition text-lg">
              Cómo Funciona
            </a>
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section id="como-funciona" className="py-20 bg-gray-100">
        <div className="container mx-auto px-4 max-w-6xl">
          <h2 className="text-3xl font-bold text-center mb-16">Cómo Funciona</h2>
          <div className="grid md:grid-cols-3 gap-10">
            {[
              { title: "Sube tu documento", desc: "PDFs o links a artículos, ¡lo que necesites!" },
              { title: "Procesamiento IA", desc: "Nootiq analiza y genera contenido automáticamente." },
              { title: "Estudia y Aprende", desc: "Usa material de estudio listos para repasar." },
            ].map((step, i) => (
              <motion.div 
                key={i}
                className="bg-ivory p-8 rounded-2xl shadow-md text-center hover:shadow-lg transition"
                whileHover={{ scale: 1.03 }}
              >
                <div className="w-14 h-14 mx-auto mb-4 flex items-center justify-center text-white bg-iris rounded-full text-xl font-bold">
                  {i + 1}
                </div>
                <h3 className="text-xl font-semibold mb-2">{step.title}</h3>
                <p className="text-ink">{step.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* FEATURES */}
      <section className="py-20 bg-ivory">
        <div className="container mx-auto px-4 max-w-6xl">
          <h2 className="text-3xl font-bold text-center mb-16">Características</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              ["Flashcards Interactivas", "Creadas automáticamente a partir de tus documentos."],
              ["Quizzes Personalizados", "Preguntas generadas con IA para reforzar tus conocimientos."],
              ["Organización por Rooms", "Agrupa tu estudio por temas o asignaturas."],
              ["Exportación de Material", "Descarga en PDF o CSV para estudiar offline."],
              ["Seguimiento de Progreso", "Mide tu avance y enfócate en lo necesario."],
              ["Personalización Manual", "Edita fácilmente las tarjetas y preguntas generadas."],
            ].map(([title, desc], i) => (
              <MotionCard title={title} description={desc} key={i} variant="tertiary"
              className="py-4 px-4 pb-2"></MotionCard>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-iris relative overflow-hidden">
        <div className="container mx-auto px-4 text-center max-w-4xl">
          <motion.h2 
            className="text-3xl md:text-4xl font-bold text-white mb-6"
            initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} transition={{ duration: 0.5 }}
          >
            Comienza a transformar tu forma de estudiar
          </motion.h2>
          <p className="text-lg text-white/90 mb-8">
            Súmate a Nootiq y crea materiales de estudio en segundos.
          </p>
          <Link href={userId ? "/dashboard" : "/register"} legacyBehavior>
            <a className="bg-ivory text-iris font-semibold py-3 px-8 rounded-xl text-lg hover:bg-gray-100 transition shadow">
              {userId ? "Ir al Dashboard" : "Registrarse Gratis"}
            </a>
          </Link>
        </div>
      </section>
    </main>
  )
}
