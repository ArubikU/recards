import { BookOpenCheck, BrainCog, Lightbulb, UploadCloud } from "lucide-react"; // Puedes reemplazar si no usas lucide
import Link from "next/link";

export default function AboutPage() {
  return (
    <div className="bg-ivory text-ink">
      <div className="container mx-auto px-6 py-16 max-w-5xl">
        <h1 className="text-5xl font-extrabold text-center text-iris mb-8">Descubre Nootiq</h1>
        <p className="text-center text-lg text-ink mb-12">
          Nootiq convierte documentos en material de estudio con inteligencia artificial. Estudiar nunca fue tan fácil.
        </p>

        {/* Sección: Misión */}
        <section className="mb-16">
          <div className="flex items-center gap-3 mb-4">
            <Lightbulb className="text-iris" />
            <h2 className="text-2xl font-bold">Nuestra Misión</h2>
          </div>
          <p className="text-ink leading-relaxed">
            En Nootiq, el objetivo es simplificar el aprendizaje. Convertir materiales densos en experiencias memorables,
            personalizadas y accesibles, para estudiantes, autodidactas y profesionales que valoran su tiempo.
          </p>
        </section>

        {/* Sección: Cómo funciona */}
        <section className="mb-16">
          <div className="flex items-center gap-3 mb-4">
            <BrainCog className="text-iris" />
            <h2 className="text-2xl font-bold">¿Cómo Funciona?</h2>
          </div>
          <div className="grid md:grid-cols-3 gap-6 mt-6">
            {[
              {
                icon: <UploadCloud className="w-8 h-8" />,
                title: "1. Sube tu Documento",
                text: "Carga un PDF o pega un link. Nootiq se encarga del resto."
              },
              {
                icon: <BrainCog className="w-8 h-8" />,
                title: "2. Procesamiento Inteligente",
                text: "La IA analiza y genera material de estudio automáticamente."
              },
              {
                icon: <BookOpenCheck className="w-8 h-8" />,
                title: "3. Estudia con Estilo",
                text: "Refuerza conocimientos con métodos interactivos y eficaces."
              }
            ].map(({ icon, title, text }, idx) => (
              <div key={idx} className="bg-ivory shadow-lg rounded-xl p-6 transition hover:scale-[1.02] duration-300">
                <div className="mb-4 text-iris">{icon}</div>
                <h3 className="font-semibold text-lg mb-2">{title}</h3>
                <p className="text-ink">{text}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Sección: Tecnología */}
        <section className="mb-16">
          <h2 className="text-2xl font-bold mb-4">Tecnología que Impulsa Nootiq</h2>
          <p className="text-ink mb-4">
            Todo el sistema está construido sobre una base sólida de tecnología moderna:
          </p>
          <ul className="list-disc pl-6 text-ink space-y-2">
            <li><strong>Cohere AI</strong> – Generación de contenido educativo con procesamiento de lenguaje natural.</li>
            <li><strong>Next.js</strong> – Navegación ultrarrápida y experiencia fluida.</li>
            <li><strong>Neon PostgreSQL</strong> – Almacenamiento seguro y escalable.</li>
            <li><strong>Vercel Blob</strong> – Manejo de documentos eficiente y confiable.</li>
          </ul>
        </section>

        {/* Sección: Equipo */}
        <section className="mb-20">
          <h2 className="text-2xl font-bold mb-4">Quién está detrás</h2>
          <p className="text-ink leading-relaxed">
            Nootiq nace de la mente de <strong>arubik</strong>, una persona apasionada por la educación, la eficiencia
            y el potencial de la inteligencia artificial. La plataforma busca empoderar a quienes desean aprender
            mejor y más rápido, con una herramienta intuitiva y poderosa.
          </p>
        </section>

        {/* CTA Final */}
        <div className="text-center">
          <Link href="/register" legacyBehavior>
            <a className="bg-iris hover:bg-irisdark text-white px-10 py-4 rounded-full text-lg font-semibold transition">
              Comienza a usar Nootiq hoy
            </a>
          </Link>
        </div>
      </div>
    </div>
  )
}
