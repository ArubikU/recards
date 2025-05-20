import csvToMarkdown from 'csv-to-markdown-table'
import { ocrSpace } from 'ocr-space-api-wrapper'
import PDFParser from "pdf2json"
import { readFile } from "./blob"
import { importTypes } from "./getLimits"

const apiKeys = [ "******"
]

export function getRandomApiKey() {
  const randomIndex = Math.floor(Math.random() * apiKeys.length)
  return apiKeys[randomIndex]
}

export async function extractPdfText(buffer: Buffer): Promise<string> {
  return new Promise((resolve, reject) => {
    const pdfParser = new PDFParser()

    pdfParser.on("pdfParser_dataError", errData => reject(errData.parserError))
    pdfParser.on("pdfParser_dataReady", pdfData => {
      const text = pdfData.Pages
        .flatMap(page =>
          page.Texts.map(t =>
            decodeURIComponent(t.R.map(r => r.T).join(""))
          )
        )
        .join(" ")
      resolve(text)
    })

    pdfParser.parseBuffer(buffer)
  })
}

export async function extractTextFromUrl(pdfUrl: string, type: importTypes): Promise<string> {
  const file = await readFile(pdfUrl)
  const arrayBuffer = await file.arrayBuffer()
  const buffer = Buffer.from(arrayBuffer)
  if (type === "pdf-link" || type === "pdf") {
    return await extractPdfText(buffer)
  }
  if (type === "csv") {
    return await extractCsvText(buffer)
  }
  if (type === "img") {
    return await extractImageText(pdfUrl)
  }
  return buffer.toString("utf-8")
}

export async function extractCsvText(buffer: Buffer): Promise<string> {
  return csvToMarkdown(buffer.toString('utf-8'))
}

export async function extractImageText(url: string): Promise<string> {
  const response = await ocrSpace(url, { apiKey: "*****" })
  return response.ParsedResults[0].ParsedText
}

function smartSplitText(text: string, maxChunks = 3): string[] {
  const length = text.length
  if (length <= 2000) return [text]

  const chunkSize = Math.ceil(length / maxChunks)
  const chunks: string[] = []
  let start = 0

  while (start < length && chunks.length < maxChunks) {
    chunks.push(text.slice(start, start + chunkSize))
    start += chunkSize
  }

  return chunks
}

// Summarize
export async function summarizeDocument(text: string, proMode = false) {
  const promptBase = `Sumariza el siguiente texto considerando la lógica, ciencia y autores mencionados, usa el idioma del texto:
{texto}
Recuerda debe ser un resumen completo y con toda la informacion posible.
No uses emojis ni simbolos unicode con el formato \\uXXXX.
Si te falta datos o informacion usa tu criterio para completarlo. No alucines`


  if (!proMode) {
    return await cohereChattyV2({
      prompt: promptBase.replace("{texto}", text),
      max_tokens: 8000,
    })
  }

  const chunks = smartSplitText(text, 3)
  const summaries = await Promise.all(
    chunks.map(chunk =>
      cohereChattyV2({
        prompt: promptBase.replace("{texto}", chunk),
        max_tokens: 3000,
      })
    )
  )

  return summaries.join("\n\n")
}
export async function generateQuizSkeleton(text: string, userInstructions = "") {
  const prompt = `A partir del siguiente texto, crea el esquema de un quiz educativo con 20 preguntas.

Texto:
${text}

${userInstructions ? `Instrucciones: ${userInstructions}` : ""}

Especificaciones:
- Define un título general y una descripción.
- Asigna una dificultad general de 1 a 5.
- Extrae una lista de 20 ideas para preguntas, cada una breve y representando un concepto a evaluar.

Formato JSON:
{
  "title": "...",
  "description": "...",
  "difficulty": 1,
  "tags": ["tag1", "tag2", ...],
  "source": "...",
  "question_ideas": [
    "Idea de pregunta 1",
    "Idea de pregunta 2",
    ...
  ]
}
No incluyas explicaciones, solo el JSON.`

  return await cohereGenerate({
    prompt,
    max_tokens: 2048 * 2,
  });
}

export async function generateQuestionsFromIdeas(ideas: string[], contextText = "") {
  const promptTemplate = (idea: string) => `
A partir de la siguiente idea de pregunta basada en el texto original, genera una pregunta de quiz educativa.

Texto original (opcional):
${contextText}

Idea de pregunta:
"${idea}"

Formato JSON:
{
  "question_text": "...",
  "options": { "A": "...", "B": "...", "C": "...", "D": "..." },
  "correct_option": "A",
  "difficulty": 1
}
Usa LaTeX cuando sea necesario (doble escape: \\\\).
No escribas explicaciones. Solo el JSON.`;

  const results = await Promise.all(
    ideas.map(idea =>
      cohereGenerate({
        prompt: promptTemplate(idea),
        max_tokens: 2048,
      })
    )
  );

  return results;
}

// Quiz generation
export async function generateQuizQuestions(text: string, proMode = false, userInstructions = "") {

  if (proMode) {
    const skeletonResult = await generateQuizSkeleton(text, userInstructions);
    const skeleton = JSON.parse(skeletonResult);

    const questionResults = await generateQuestionsFromIdeas(skeleton.question_ideas, text);
    const questions = questionResults.map(res => JSON.parse(res));

    return {
      ...skeleton,
      questions,
    };
  }

  const promptBase = `A partir del siguiente texto, genera preguntas de quiz educativas.

Texto:
{texto}

${userInstructions ? `Instrucciones: ${userInstructions}` : ""}

difficulty: 1 to 5
Generate {question_count} questions if possible, if not, generate as many as possible.
Si haces referencia a un caso o ejemplo, incluye un resumen o el contenido del caso.
Se puede usar latex para las preguntas y respuestas.
You should use \\uXXXX format for unicode characters.
Remember to correctly escape the \\ symbols. via \\\
When use latex remember to double escape the \\ symbols. via \\\\
Schema:
{
  "title": "...",
  "description": "...",
  "tags": ["tag1", "tag2", ...],
  "difficulty": 1,
  "source": "...",
  "questions": [
    {
      "question_text": "...",
      "options": { "A": "...", "B": "...", "C": "...", "D": "..." },
      "correct_option": "A",
      "difficulty": 1
    }
  ]
}
Do not output anything more than the raw JSON.`

  return await cohereGenerate({
    prompt: promptBase.replace("{texto}", text).replace("{question_count}", "17"),
    max_tokens: 2048 * 4,
  })
}

// Flashcard generation
export async function generateFlashcards(text: string, proMode = false, userInstructions = "") {
  const promptBase = `A partir del siguiente texto, genera flashcards educativas.

Texto:
{texto}

${userInstructions ? `Instrucciones: ${userInstructions}` : ""}

Cada flashcard debe tener un "front" (pregunta o concepto), un "back" (respuesta o explicación clara y concisa), y un campo "keywords" con palabras clave relevantes separadas por guiones en orden ascendete del alfabeto(solo 5 palabras). Usa el idioma original del texto. Devuelve el resultado en el siguiente formato JSON:


You should use \\uXXXX format for unicode characters.
Remember to correctly escape the \\ symbols. via \\\
Schema:
[{\"front\":\"...\",\"back\":\"...\",\"keywords\":\"palabra1-palabra2-...\"}, ...]
Do not output anything more than the JSON.`
  if (!proMode) {
    return await cohereGenerate({
      prompt: promptBase.replace("{texto}", text),
      max_tokens: 2048 * 2,
    })
  }

  const chunks = smartSplitText(text, 3)
  const results = await Promise.all(
    chunks.map(chunk =>
      cohereGenerate({
        prompt: promptBase.replace("{texto}", chunk),
        max_tokens: 2048 * 2,
      })
    )
  )

  return results.flat()
}

async function cohereGenerate({
  prompt,
  max_tokens,
}: {
  prompt: string
  max_tokens: number
}) {
  const response = await fetch("https://api.cohere.ai/v1/generate", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${getRandomApiKey()}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "command-r-plus-08-2024",
      prompt,
      max_tokens,
      response_format: "json_object",
      temperature: 0.65,
    }),
  })

  if (!response.ok) throw new Error(`Error from Cohere API: ${response.statusText}`)
  const data = await response.json()
  const text = data.generations[0].text
  try {
    return JSON.parse(text)
  } catch (e) {
    console.log("Error parsing JSON:", text)
    console.error("Failed to parse Cohere response:", e)
    return null
  }
}

async function cohereChattyV2({
  prompt,
  max_tokens,
}: {
  prompt: string
  max_tokens: number
}) {
  const response = await fetch("https://api.cohere.ai/v2/chat", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${getRandomApiKey()}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "command-a-03-2025",
      messages: [{ role: "user", content: prompt }],
      max_tokens,
      temperature: 0.7,
    }),
  })

  if (!response.ok) throw new Error(`Error from Cohere API: ${response.statusText}`)
  const data = await response.json()
  return data.message.content[0].text
}
