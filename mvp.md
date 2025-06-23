## 🧠 Roadmap Técnico Detallado - MVP Nootiq

### 🧩 Etapa 1: Configuración Inicial

**Tecnologías:** Next.js + React, Clerk, Neon, TailwindCSS, Vercel Blob Storage

**Tareas:**

* Inicializar proyecto Next.js con soporte para SSR/ISR.
* Instalar Clerk e integrar en `_app.tsx` y rutas protegidas.
* Configurar Neon (PostgreSQL) y conectar mediante Prisma.

**Esquema de Base de Datos (inicio):**

```prisma
model User {
  id        String   @id @default(cuid())
  clerkId   String   @unique
  email     String
  rooms     Room[]
  createdAt DateTime @default(now())
}

model Room {
  id          String   @id @default(cuid())
  userId      String
  title       String
  description String?
  source      String?
  difficulty  Int?
  tags        String[]
  createdAt   DateTime @default(now())
  quizzes     Quiz[]
  flashcards  Flashcard[]
  documents   Document[]
  User        User     @relation(fields: [userId], references: [id])
}
```

---

### 📂 Etapa 2: Subida de Documentos

**Tareas:**

* Crear componente de subida de PDF o enlace con validación.
* Subir archivos al blob de Vercel (`@vercel/blob` o `fetch` directo con URL presignada).
* Guardar enlace al archivo en la base de datos.

**Esquema:**

```prisma
model Document {
  id        String   @id @default(cuid())
  roomId    String
  url       String
  type      String   // 'pdf' | 'link'
  createdAt DateTime @default(now())
  Room      Room     @relation(fields: [roomId], references: [id])
}
```

---

### 🧠 Etapa 3: Procesamiento de IA (Cohere)

**Tareas:**

* Extraer texto del PDF/link.
* Enviar contenido a Cohere para:

  * Resumen
  * Temas clave
  * Preguntas para quiz
  * Flashcards

**Resultado:**

```json
{
  "summary": "...",
  "topics": ["Tema A", "Tema B"],
  "quiz": { /* ver estructura abajo */ },
  "flashcards": [ { "front": "...", "back": "..." } ]
}
```

---

### 🏠 Etapa 4: Visualización de Room

**Tareas:**

* UI para ver Room con resumen, quizzes y flashcards.
* Descarga de flashcards en PDF/CSV.

---

### ❓ Etapa 5: Generación de Quizzes (Formato Componente + JSON)

**Formato JSON para almacenamiento y renderizado:**

```json
{
  "title": "Fundamentos de Sistemas Operativos",
  "description": "Quiz sobre conceptos básicos, historia y tipos de sistemas operativos",
  "source": "Curso de Sistemas Operativos",
  "difficulty": 3,
  "tags": ["computing", "linux", "operating-systems", "software", "virtualization"],
  "questions": [
    {
      "question_text": "¿Qué es un Sistema Operativo?",
      "options": {
        "A": "Un programa para navegar por internet",
        "B": "El software maestro que controla y coordina el hardware y proporciona servicios a las aplicaciones",
        "C": "Una aplicación para editar documentos",
        "D": "Un componente físico de la computadora"
      },
      "correct_option": "B",
      "difficulty": 1
    }
  ]
}
```

**Esquema para base de datos (componente modular):**

```prisma
model Quiz {
  id          String   @id @default(cuid())
  roomId      String
  title       String
  description String
  source      String?
  difficulty  Int?
  tags        String[]
  questions   QuizQuestion[]
  createdAt   DateTime @default(now())
  Room        Room     @relation(fields: [roomId], references: [id])
}

model QuizQuestion {
  id            String   @id @default(cuid())
  quizId        String
  questionText  String
  options       Json     // A, B, C, D...
  correctOption String
  difficulty    Int?
  Quiz          Quiz     @relation(fields: [quizId], references: [id])
}
```

**React Component:**

```tsx
<QuizQuestionCard
  question="¿Qué es un Sistema Operativo?"
  options={{ A: "...", B: "..." }}
  correctOption="B"
  difficulty={1}
/>
```

---

### 📇 Etapa 6: Flashcards Descargables y Renderizables

**Datos:**

```prisma
model Flashcard {
  id        String   @id @default(cuid())
  roomId    String
  front     String
  back      String
  createdAt DateTime @default(now())
  Room      Room     @relation(fields: [roomId], references: [id])
}
```

**Componentes y funciones:**

* `<FlashcardCard front="..." back="..." />`
* Botón "Descargar flashcards" como `.csv` o `.pdf`

---

### 🎨 Etapa 7: Branding y UI

* Blanco + naranja (#FF7A00).
* Diseño limpio, con foco en experiencia educativa.
* Cards y bloques visuales claros.

---

### 📈 Etapa 8: Progreso

**Tracking de quizzes y flashcards:**

```prisma
model FlashcardProgress {
  id           String   @id @default(cuid())
  userId       String
  flashcardId  String
  status       String
  lastReviewed DateTime?
}
```

---

### ✍️ Etapa 9: Personalización Manual

* Edición manual de preguntas y flashcards.
* Tags y comentarios personales por usuario.

---

### 🚀 Etapa 10: Beta cerrada

* Rooms de prueba.
* Feedback embebido.
* Validación de componentes interactivos.
