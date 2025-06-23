"use client";

import { AlertTriangle, FileText, Mail, ShieldCheck, Users } from "lucide-react";

export default function PrivacyPage() {
  return (
    <div className="container mx-auto px-4 py-16 animate-fade-in">
      <div className="max-w-3xl mx-auto space-y-12">
        <header className="text-center">
          <h1 className="text-4xl font-extrabold text-gray-900 mb-2">Política de Privacidad</h1>
          <p className="text-sm text-ink">Última actualización: 14 de mayo de 2025</p>
        </header>

        <section className="space-y-4">
          <p className="text-ink leading-relaxed text-lg">
            En <strong>Nootiq</strong>, proteger tu privacidad es una prioridad. Esta política detalla qué datos
            recopilamos, cómo los usamos y tus derechos como usuario.
          </p>
        </section>

        <Section
          icon={<FileText className="text-iris w-6 h-6" />}
          title="Información que recopilamos"
          items={[
            {
              title: "Información de la cuenta",
              description:
                "Nombre, correo electrónico y contraseña al momento de registrarte.",
            },
            {
              title: "Contenido del usuario",
              description:
                "Documentos, flashcards, quizzes y todo el contenido que generes.",
            },
            {
              title: "Información de uso",
              description:
                "Interacciones, tiempo de uso, páginas visitadas y funciones utilizadas.",
            },
            {
              title: "Datos del dispositivo",
              description:
                "Tipo de dispositivo, navegador, sistema operativo y dirección IP.",
            },
          ]}
        />

        <Section
          icon={<ShieldCheck className="text-iris w-6 h-6" />}
          title="Cómo utilizamos tu información"
          items={[
            { title: "Mejorar la plataforma", description: "Optimizar funciones y rendimiento." },
            { title: "Generar tu material de estudio", description: "Procesar documentos y crear contenido útil." },
            { title: "Personalización", description: "Mostrarte contenido adaptado a ti." },
            { title: "Comunicación", description: "Enviarte novedades, actualizaciones y beneficios." },
            { title: "Seguridad", description: "Detectar y prevenir fraudes o actividades no autorizadas." },
            { title: "Cumplimiento legal", description: "Atender requerimientos legales si aplica." },
          ]}
        />

        <Section
          icon={<Users className="text-iris w-6 h-6" />}
          title="Con quién compartimos tu información"
          items={[
            {
              title: "Proveedores de servicios",
              description:
                "Aliados que nos ayudan a operar la plataforma (como almacenamiento o pagos).",
            },
            {
              title: "Socios",
              description:
                "Compartimos datos anónimos y agregados para mejorar la plataforma.",
            },
            {
              title: "Autoridades",
              description:
                "Solo si es estrictamente necesario y conforme a la ley.",
            },
          ]}
        />

        <Section
          icon={<AlertTriangle className="text-iris w-6 h-6" />}
          title="Seguridad de los datos"
          paragraph="Aplicamos medidas de seguridad físicas, técnicas y administrativas. Aunque trabajamos constantemente en proteger tu información, ningún sistema es 100% infalible."
        />

        <Section
          icon={<ShieldCheck className="text-iris w-6 h-6" />}
          title="Tus derechos"
          items={[
            { title: "Acceder", description: "Ver los datos que almacenamos sobre ti." },
            { title: "Corregir", description: "Actualizar información incorrecta o incompleta." },
            { title: "Eliminar", description: "Solicitar la eliminación de tus datos." },
            { title: "Oposición", description: "Restringir ciertos usos de tu información." },
            { title: "Portabilidad", description: "Exportar tus datos personales." },
          ]}
        />
        {/**
        <p className="text-ink leading-relaxed">
          Para ejercer estos derechos, contáctanos en{" "}
          <a href="mailto:privacy@Nootiq.com" className="text-iris hover:underline font-medium">
            privacy@Nootiq.com
          </a>
          .
        </p>
 */}
        <Section
          title="Actualizaciones"
          paragraph="Podemos actualizar esta política ocasionalmente. Te avisaremos aquí y, si es necesario, también por correo electrónico."
        />

                <Section
          icon={<Mail className="text-iris w-6 h-6" />}
          title="Contacto"
          paragraph={
            <>
              ¿Dudas o sugerencias?{" "}
              <a href="/contact" className="text-iris hover:underline font-medium">
                escribenos
              </a>
              .
            </>
          }
        /> 
      </div>
    </div>
  );
}

function Section({
  icon,
  title,
  items,
  paragraph,
}: {
  icon?: React.ReactNode;
  title: string;
  items?: { title: string; description: string }[];
  paragraph?: React.ReactNode;
}) {
  return (
    <section className="space-y-4 animate-fade-in">
      <div className="flex items-center gap-3">
        {icon && <div>{icon}</div>}
        <h2 className="text-2xl font-semibold text-gray-900">{title}</h2>
      </div>
      {paragraph && <p className="text-ink leading-relaxed">{paragraph}</p>}
      {items && (
        <ul className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
          {items.map((item, i) => (
            <li key={i} className="bg-gray-50 p-4 rounded-lg shadow-sm border hover:shadow-md transition">
              <h3 className="font-semibold text-ink">{item.title}</h3>
              <p className="text-ink text-sm mt-1">{item.description}</p>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
