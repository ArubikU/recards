# ReCards 📚✨

**Transforma tus documentos en materiales de estudio inteligentes.**

ReCards es una plataforma potenciada con inteligencia artificial que convierte automáticamente PDFs y enlaces en flashcards interactivas y quizzes personalizados, ayudándote a estudiar de forma más efectiva y divertida.

---

## 🌐 Demo

👉 [Ir a la demo](https://recards.vercel.app)  
*(reemplaza con el enlace real si es diferente)*

---

## 📸 Capturas

### Hero
![Hero de la landing](https://i.imgur.com/ebtFy2k.png)

### Cómo funciona
![Cómo funciona](https://i.imgur.com/VYWP3gC.png)

### Características
![Características](https://i.imgur.com/7Qpko44.png)

*(Puedes usar GIFs en lugar de imágenes estáticas si quieres mostrar animaciones o flujos de uso)*

---

## 🛠️ ¿Cómo se ha utilizado Clerk?

ReCards utiliza [Clerk](https://clerk.dev) como proveedor de autenticación y gestión de usuarios. Clerk se encarga de:

- 📌 **Autenticación y Registro** de usuarios.
- 🧑‍💼 **Gestión de metadata de usuario**, como el rango, preferencias y configuración personal.
- 🔐 Seguridad en el acceso a funciones exclusivas (como el Dashboard o la edición de materiales).

### Ejemplo de uso de Clerk:
Se almacena metadata personalizada como:

```ts
{
  user_metadata: {
    rango: "gold",
    preferencias: {
      quizzes_auto: true,
      modo_dark: false
    }
  }
}
```
![Rango de usuario](https://i.imgur.com/oOn0GDr.png)

---

## 🚀 Características principales

* ✅ Generación automática de flashcards desde documentos.
* 🎯 Quizzes IA personalizados para reforzar tu estudio.
* 🗂️ Organización por **Rooms** (temas/asignaturas).
* 📤 Exportación a PDF o CSV.
* 📊 Seguimiento de progreso.
* ✏️ Personalización manual de contenido generado.

---

## 🧪 Tecnologías usadas

* **Next.js** + **React**
* **Tailwind CSS**
* **Framer Motion**
* **Clerk (auth & metadata)**
* **OpenAI** (IA para generar contenido)
* **Vercel** para el hosting

---

## ✨ Contribuciones

¿Tienes ideas para mejorar ReCards o quieres colaborar? ¡Eres bienvenida/o!
Puedes abrir un issue o un pull request con mejoras, feedback o nuevas features.

---

## 📩 Contacto

Desarrollado con 💻 y ☕ por [Arubik](https://github.com/arubiku)
Puedes escribirme si deseas colaborar o implementar ReCards en tu organización.
