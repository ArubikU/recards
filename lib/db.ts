import { AuthObject, ClerkClient } from "@clerk/backend"
import { clerkClient } from "@clerk/nextjs/server"
import { neon } from "@neondatabase/serverless"
import { extractTextFromUrl, summarizeDocument } from "./cohere"
import { getLimits, getTierObject, importTypes, TierObject } from "./getLimits"
import { Quiz, Room } from "./types"

// Initialize the SQL client with the database URL
const sql = neon(process.env.DATABASE_URL!)

export { sql }

// Helper function to generate unique IDs
export function generateId(): string {
  return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15)
}

// User related database functions
export async function createUser(clerkId: string, email: string) {
  const id = generateId()
  await sql`
    INSERT INTO users (id, clerk_id, email)
    VALUES (${id}, ${clerkId}, ${email})
  `
  return id
}

// Room related database functions
export async function createRoom(userId: string, title: string, description?: string, tags?: string[]) {
  const id = generateId()
  await sql`
    INSERT INTO rooms (id, user_id, title, description, tags)
    VALUES (${id}, ${userId}, ${title}, ${description || null}, ${tags || []})
  `
  return id
}

export async function getRoomsByUserId(userId: string) {
  const rooms = await sql`
    SELECT * FROM rooms WHERE user_id = ${userId} ORDER BY created_at DESC
  `
  return rooms as Room[]
}

export async function getRoomById(id: string, userId?: string): Promise<Room | null> {
  if (userId) {
    const rooms = await sql`
      SELECT * FROM rooms WHERE id = ${id} AND user_id = ${userId}
    `
    return rooms[0] as Room || null
  }
  const rooms = await sql`
    SELECT * FROM rooms WHERE id = ${id}
  ` 
  return rooms[0] as Room|| null
}

export async function thisRoomIsLimited(roomId: string, userId: string, plan: TierObject) {
  const rooms = await sql`
    SELECT id, created_at FROM rooms WHERE user_id = ${userId} order by created_at DESC
  ` as Room[]
  if (rooms.length >= plan.limits.rooms) {
    //check if its newer, because the older are the ones that will still have the limit
    const idx = rooms.findIndex((room) => room.id === roomId)
    if (idx > plan.limits.rooms) {
      return true
    }
  }
  return false
}

// Document related database functions
export async function createDocument(roomId: string, url: string, type: importTypes) {
  const id = generateId()
  await sql`
    INSERT INTO documents (id, room_id, url, type)
    VALUES (${id}, ${roomId}, ${url}, ${type})
  `
  return id
}

export async function getDocumentsByRoomId(roomId: string) {
  return sql`
    SELECT * FROM documents WHERE room_id = ${roomId}
  `
}

// Quiz related database functions
export async function createQuiz(
  roomId: string,
  title: string,
  description: string,
  source?: string,
  difficulty?: number,
  tags?: string[],
) {
  const id = generateId()
  await sql`
    INSERT INTO quizzes (id, room_id, title, description, source, difficulty, tags)
    VALUES (${id}, ${roomId}, ${title}, ${description}, ${source || null}, ${difficulty || null}, ${tags || []})
  `
  return id
}

export async function createQuizQuestion(
  quizId: string,
  questionText: string,
  options: Record<string, string>,
  correctOption: string,
  difficulty?: number,
) {
  const id = generateId()
  await sql`
    INSERT INTO quiz_questions (id, quiz_id, question_text, options, correct_option, difficulty)
    VALUES (${id}, ${quizId}, ${questionText}, ${JSON.stringify(options)}, ${correctOption}, ${difficulty || null})
  `
  return id
}

export async function getQuizzesByRoomId(roomId: string) {
  const quizzes = await sql`
    SELECT * FROM quizzes WHERE room_id = ${roomId}
  `
  return quizzes as Quiz[]
}

export async function userOwnRoom(userId: string, roomId: string) {
  const rooms = await sql`
    SELECT * FROM rooms WHERE user_id = ${userId} AND id = ${roomId}
  `
  return rooms.length > 0
}

export async function getQuizQuestionsById(quizId: string) {
  return sql`
    SELECT * FROM quiz_questions WHERE quiz_id = ${quizId}
  `
}

export async function getQuizById(quizId: string): Promise<Quiz | null> {
  const quizzes = await sql`
    SELECT * FROM quizzes WHERE id = ${quizId}
  `

  if (quizzes.length === 0) {
    return null
  }

  const quiz = quizzes[0]
  const questionsRaw = await getQuizQuestionsById(quizId)
  const questions = questionsRaw.map((q: any) => ({
    question_text: q.question_text,
    options: typeof q.options === "string" ? JSON.parse(q.options) : q.options,
    correct_option: q.correct_option,
    difficulty: q.difficulty
  }))

  return {
    id: quiz.id,
    title: quiz.title,
    description: quiz.description,
    tags: quiz.tags || [],
    difficulty: quiz.difficulty,
    source: quiz.source,
    questions: questions
  }
}

// Flashcard related database functions
export async function createFlashcard(roomId: string, front: string, back: string, keywords?: string) {
  // Check if a flashcard with the same keywords already exists in the room
  if (keywords) {
    const existing = await sql`
      SELECT * FROM flashcards WHERE room_id = ${roomId} AND keywords = ${keywords}
    `
    if (existing.length > 0) {
      return existing[0].id // or throw an error, or return null, depending on your use case
    }
  }
  const id = generateId()
  await sql`
    INSERT INTO flashcards (id, room_id, front, back, keywords)
    VALUES (${id}, ${roomId}, ${front}, ${back}, ${keywords || null})
  `
  return id
}

export async function getFlashcardsByRoomId(roomId: string) {
  return sql`
    SELECT * FROM flashcards WHERE room_id = ${roomId}
  `
}

export async function updateFlashcardProgress(userId: string, flashcardId: string, status: string) {
  const id = generateId()
  await sql`
    INSERT INTO flashcard_progress (id, user_id, flashcard_id, status, last_reviewed)
    VALUES (${id}, ${userId}, ${flashcardId}, ${status}, NOW())
    ON CONFLICT (id) DO UPDATE
    SET status = ${status}, last_reviewed = NOW()
  `
  return id
}

//table limits
//id: varchar(255) NOT NULL,
//referred_id: varchar(255) NOT NULL,
//type: varchar(255) NOT NULL,
//created_at: timestamp NOT NULL DEFAULT NOW(),
//count: int NOT NULL DEFAULT 0,

//tiers info
//free: 3 ai generations per room, 3 rooms
//ultimate: 6 ai generations per room, 6 rooms
//ultimate: unlimited ai generations per room, unlimited rooms

export async function getAiCurrentLimits(referred_id: string, type: string) {
  const id = referred_id + "_" + type
  const limits = await sql`
    SELECT * FROM limits WHERE id = ${id}
  `
  return limits[0] || null
}
export async function createAiCurrentLimits(referred_id: string, type: string, count: number = 0) {
  if (count === Number.POSITIVE_INFINITY) {
    count = 999999
  }

  const id = referred_id + "_" + type
  await sql`
    INSERT INTO limits (id, referred_id, type, count)
    VALUES (${id}, ${referred_id}, ${type}, ${count})
    ON CONFLICT (id) DO UPDATE SET count = ${count}
  `
  return id
}

export async function getLeftRoomsCount(user: AuthObject) {
  const limit = await getAiCurrentLimits(user.userId!, "rooms")

  const client = await clerkClient()
  const userData = await client.users.getUser(user.userId!)
  const currentPlan = userData?.publicMetadata?.plan as string | undefined || "free"
  const tier = getTierObject(currentPlan)
  if (!limit) {
    if (tier.isUltimate) {
      await createAiCurrentLimits(user.userId!, "rooms", Number.POSITIVE_INFINITY)
      return Number.POSITIVE_INFINITY
    } else {
      await createAiCurrentLimits(user.userId!, "rooms", tier.limits.rooms)
      return tier.limits.rooms
    }
  }
  return limit.count
}

export async function updateRoomCount(user: AuthObject) {
  //verify rooms that user has
  const userId = await sql`
    SELECT * FROM users WHERE clerk_id = ${user.userId!}
  `
  if (!userId) {
    throw new Error("User not found")
  }

  const rooms = await sql`
    SELECT * FROM rooms WHERE user_id = ${userId[0].id}
  `
  const roomCount = rooms.length
  const client = await clerkClient()
  const userData = await client.users.getUser(user.userId!)
  const currentPlan = userData?.publicMetadata?.plan as string | undefined || "free"
  const limits = getLimits(currentPlan)
  if (roomCount > limits.rooms) {
    throw new Error("Room limit exceeded")
  }
  const newCurrentLeft = limits.rooms - roomCount
  //if is infinity, just return
  if (newCurrentLeft !== Number.POSITIVE_INFINITY) {
    await sql`
      UPDATE limits SET count = ${newCurrentLeft} WHERE referred_id = ${user.userId!} AND type = 'rooms'
    `
  }
  return newCurrentLeft
}
export async function canGenerateAi(user: AuthObject, roomId: string, limits: { rooms: number, filesPerRoom: number, aiGenerations: number, aiPerMonth: number }) {

  // Check per-room AI limit
  let roomLimit = await getAiCurrentLimits(roomId, "ai")
  if (!roomLimit) {
    await createAiCurrentLimits(roomId, "ai", limits.aiGenerations)
    roomLimit = { count: limits.aiGenerations }
  }
  // Check per-user monthly AI limit
  let userMonthLimit = await getAiCurrentLimits(user.userId!, "aiPerMonth")
  const now = new Date()
  const currentMonth = now.getMonth()
  const currentYear = now.getFullYear()

  if (!userMonthLimit) {
    await createAiCurrentLimits(user.userId!, "aiPerMonth", limits.aiPerMonth)
    userMonthLimit = { count: limits.aiPerMonth, created_at: now }
  } else if (userMonthLimit.created_at) {
    const createdAt = new Date(userMonthLimit.created_at)
    if (
      createdAt.getMonth() !== currentMonth ||
      createdAt.getFullYear() !== currentYear
    ) {
      let newCount = limits.aiPerMonth;
      if (limits.aiPerMonth === Number.POSITIVE_INFINITY) {
        newCount = 999999; // Use a large number to represent infinity
      }
      // Reset monthly limit
      await sql`
        UPDATE limits SET count = ${newCount}, created_at = NOW()
        WHERE referred_id = ${user.userId!} AND type = 'aiPerMonth'
      `
      userMonthLimit.count = newCount
      userMonthLimit.created_at = now
    }
  }
  return { roomAiLimit: roomLimit.count, userAiMonthLimit: userMonthLimit.count }
}

export async function consumeGenerations(user: AuthObject, roomId: string): Promise<boolean> {
  // Decrement per-room AI limit if possible
  const roomLimit = await getAiCurrentLimits(roomId, "ai")
  const userMonthLimit = await getAiCurrentLimits(user.userId!, "aiPerMonth")

  if (!roomLimit || !userMonthLimit || roomLimit.count <= 0 || userMonthLimit.count <= 0) {
    return false
  }

  await sql`
    UPDATE limits SET count = count - 1 WHERE referred_id = ${roomId} AND type = 'ai'
  `
  await sql`
    UPDATE limits SET count = count - 1 WHERE referred_id = ${user.userId!} AND type = 'aiPerMonth'
  `
  return true
}

export async function updateRoom(id: string, title: string, description?: string, tags?: string[]) {
  await sql`
    UPDATE rooms
    SET title = ${title}, description = ${description || null}, tags = ${tags || []}
    WHERE id = ${id}
  `
}
//** 
// table: Uploads
// id: varchar(255) NOT NULL,
// hash: varchar
// url: varchar
//  */

export async function createUpload(hash: string, url: string) {
  const id = generateId()
  await sql`
    INSERT INTO uploads (id, hash, url)
    VALUES (${id}, ${hash}, ${url})
  `
  return id
}
export async function getUploadByHash(hash: string) {
  const uploads = await sql`
    SELECT * FROM uploads WHERE hash = ${hash}
  `
  return uploads[0] || null
}
export async function deleteUpload(hash: string) {
  await sql`
    DELETE FROM uploads WHERE hash = ${hash}
  `
}
export async function getHash(file: File) {
  const arrayBuffer = await file.arrayBuffer()
  const hashBuffer = await crypto.subtle.digest("SHA-256", arrayBuffer)
  const hashArray = Array.from(new Uint8Array(hashBuffer))
  const hashHex = hashArray.map(b => b.toString(16).padStart(2, "0")).join("")
  return hashHex
}
export async function uploadSummary(url: string, summary: string) {
  // Find the upload by url and update its summary
  await sql`
    UPDATE uploads SET summary = ${summary} WHERE url = ${url}
  `
  return summary
}

export async function getSummariesByRoomId(roomId: string) {
  // Get all documents for the room
  const documents = await sql`
    SELECT * FROM documents WHERE room_id = ${roomId}
  `
  if (documents.length > 0) {
    // For each document, get the summary from the uploads table
    const summaries = await Promise.all(documents.map(async (doc) => {
      const uploads = await sql`
        SELECT * FROM uploads WHERE url = ${doc.url}
      `
      if (uploads.length > 0 && uploads[0].summary && uploads[0].summary !== "NONE") {
        return uploads[0].summary
      }
      const text = await extractTextFromUrl(doc.url, doc.type as importTypes)
      sql`
        UPDATE uploads SET text = ${text} WHERE url = ${doc.url}
      `
      const summary = await summarizeDocument(text)
      await uploadSummary(doc.url, summary)
      return summary
    }))
    return summaries
  }
  return []
}

export async function extractTextFromDocument(documentId: string) {

  const documents = await sql`
    SELECT * FROM documents WHERE id = ${documentId}
  `
  if (documents.length === 0) {
    throw new Error("Document not found")
  }
  const document = documents[0]
  const uploads = await sql`
    SELECT * FROM uploads WHERE url = ${document.url}
  `
  if (uploads.length > 0) {
    return {
      title: document.url.split("/").pop() || "Document",
      text: uploads[0].text || ""
    }
  }
  // If no text is found in uploads, extract it from the URL
  const text = await extractTextFromUrl(document.url, document.type as importTypes)
  if (!text) {
    throw new Error("No text found in document")
  }
  // Store the extracted text in the uploads table
  await sql`
    UPDATE uploads SET text = ${text} WHERE url = ${document.url}
  `
  return {
    title: document.url.split("/").pop() || "Document",
    text: text
  }
}

export async function isTheirRoom(clerkId: string, roomId: string) {
  const user = await getUserByClerkId(clerkId)
  if (!user) {
    return false

  }
  const room = await getRoomById(roomId)
  if (!room) {
    return false
  }
  if (room.user_id !== user.id) {
    return false
  }
  return true

}

export async function updateMetadata(clerkId: string, client: ClerkClient, metadata: { key: string, value: string }[]) {
  const user = await client.users.getUser(clerkId)
  if (!user) {
    throw new Error("User not found")
  }
  for (const data of metadata) {
    await client.users.updateUserMetadata(clerkId, {
      publicMetadata: {
        ...user.publicMetadata,
        [data.key]: data.value
      }
    })
  }
  return true
}

export async function storePayment(
  userId: string,
  planId: string,
  paymentId: string,
  paymentAmount: number,
  paymentCurrency: string,
  paymentStatus: string,
  paymentDate: Date,
  duration: number = 31,
) {
  const id = generateId()
  await sql`
    INSERT INTO payments (id, user_id, plan_id, payment_id, payment_amount, payment_currency, payment_status, payment_date, duration)
    VALUES (${id}, ${userId}, ${planId}, ${paymentId}, ${paymentAmount}, ${paymentCurrency}, ${paymentStatus}, ${paymentDate}, ${duration})
  `
  return id
}
export async function updatePlanAndPayment(
  userId: string,
  planId: string,
  paymentId: string,
  paymentAmount: number,
  paymentCurrency: string,
  paymentStatus: string,
) {
  //will get the last payment, and add 1 day to the payment date, and use that date to create a new payment
  const plans = await sql`
    SELECT * FROM payments WHERE user_id = ${userId} ORDER BY payment_date DESC
  `
  if (plans.length > 0) {
    const lastPayment = plans[0]
    const newPaymentDate = new Date(lastPayment.payment_date)
    newPaymentDate.setDate(newPaymentDate.getDate() + 1)
    await storePayment(userId, planId, paymentId, paymentAmount, paymentCurrency, paymentStatus, newPaymentDate)
  }

}

export async function getLastestPayment(userId: string) : Promise<
{
  id: string
  user_id: string
  plan_id: string
  payment_id: string
  payment_amount: number
  payment_currency: string
  payment_status: string
  payment_date: Date
  duration: number
} | null> {
  const plans = await sql`
    SELECT * FROM payments WHERE user_id = ${userId} ORDER BY payment_date DESC LIMIT 1
  `
  if (plans.length > 0) {
    return plans[0] as any
  }
  return null
}

export async function checkPlan(userId: string) {
  const plans = await sql`
    SELECT * FROM payments WHERE user_id = ${userId} ORDER BY payment_date DESC
  `
  if (plans.length > 0) {
    const plan = plans[0]
    const now = new Date()
    const paymentDate = new Date(plan.payment_date)
    const planId = plan.plan_id
    const duration = plan.duration || 31 // fallback to 31 if not set
    const expirationDate = new Date(paymentDate)
    expirationDate.setDate(expirationDate.getDate() + duration)
    if (now > expirationDate) {
      const cl = await clerkClient()
      const user = await sql`
        SELECT * FROM users WHERE clerk_id = ${userId}
      `
      if (user.length > 0) {
        const clerkId = user[0].id
        await updateMetadata(clerkId, cl, [{ key: "plan", value: "free" }])
      }
      return true
    } else {
      const cl = await clerkClient()
      const user = await sql`
        SELECT * FROM users WHERE clerk_id = ${userId}
      `
      if (user.length > 0) {
        const clerkId = user[0].id
        await updateMetadata(clerkId, cl, [{ key: "plan", value: planId }])
      }
      return false
    }
  }
}

export async function whenPlanExpires(clerckId: string) {
  const user = await sql`
    SELECT * FROM users WHERE clerk_id = ${clerckId}
  `
  if (user.length === 0) {
    return null
  }
  const userId = user[0].id
  const plans = await sql`
    SELECT * FROM payments WHERE user_id = ${userId} ORDER BY payment_date DESC
  `
  if (plans.length > 0) {
    const plan = plans[0]
    const paymentDate = new Date(plan.payment_date)
    const duration = plan.duration || 31 // fallback to 31 if not set
    const expirationDate = new Date(paymentDate)
    expirationDate.setDate(expirationDate.getDate() + duration)
    return expirationDate
  }
  return null
}

export async function getUserByClerkId(clerkId: string) {
  const users = await sql`
    SELECT * FROM users WHERE clerk_id = ${clerkId}
  `

  return users[0] || null
}


//table promo_codes
// id: varchar(255) NOT NULL,
// plan_id: varchar(255) NOT NULL,
// uses_left: int NOT NULL DEFAULT 1,
// plan_duration: int NOT NULL DEFAULT 31,

export async function createPromoCode(planId: string, usesLeft: number) {
  const id = generateId()
  await sql`
    INSERT INTO promo_codes (id, plan_id, uses_left)
    VALUES (${id}, ${planId}, ${usesLeft})
  `
  return id
}
export async function claimPromoCode(promoCode: string, clerckId: string) {
  const promoCodes = await sql`
    SELECT * FROM promo_codes WHERE id = ${promoCode}
  `
  if (promoCodes.length > 0) {
    const promoCode = promoCodes[0]
    if (promoCode.uses_left > 0) {
      const user = await getUserByClerkId(clerckId)
      if (!user) {
        throw new Error("User not found")
      }
      const client = await clerkClient()

      //check if user already have that plan 
      const userPlan = await sql`
        SELECT * FROM payments WHERE user_id = ${user.id} ORDER BY payment_date DESC
      `
      if (userPlan.length > 0) {
        const plan = userPlan[0]
        if (
          (plan.plan_id === "ultra" && promoCode.plan_id === "ultimate") ||
          (plan.plan_id === "ultimate" && promoCode.plan_id === "ultra") ||
          plan.plan_id === promoCode.plan_id
        ) {
          return { error: "You already have this plan" }
        }
      }
      await sql`
        UPDATE promo_codes SET uses_left = ${promoCode.uses_left - 1} WHERE id = ${promoCode.id}
      `
      await updateMetadata(user.clerk_id, client, [{ key: "plan", value: promoCode.plan_id }])
      //create a fake payment
      await storePayment(user.id, promoCode.plan_id, "promo_code_" + generateId(), 0, "PEN", "success", new Date(), promoCode.plan_duration)
      return {
        planId: promoCode.plan_id,
        duration: promoCode.plan_duration,
        planName: promoCode.plan_id === "ultimate" ? "Ultimate" : "Ultra"
      }
    }
  }
  return null
}



export async function deleteRoom(id: string) {
  // Delete dependent records first to avoid foreign key constraint errors
  await sql`
    DELETE FROM documents WHERE room_id = ${id}
  `
  await sql`
    DELETE FROM quiz_questions WHERE quiz_id IN (SELECT id FROM quizzes WHERE room_id = ${id})
  `
  await sql`
    DELETE FROM quizzes WHERE room_id = ${id}
  `
  await sql`
    DELETE FROM flashcard_progress WHERE flashcard_id IN (SELECT id FROM flashcards WHERE room_id = ${id})
  `
  await sql`
    DELETE FROM flashcards WHERE room_id = ${id}
  `
  await sql`
    DELETE FROM limits WHERE referred_id = ${id} OR referred_id = ${id + "_ai"} OR referred_id = ${id + "_aiPerMonth"}
  `
  await sql`
    DELETE FROM rooms WHERE id = ${id}
  `
}

export async function getSummaryById(id: string) {

  const roomDocuments = await sql`
    SELECT * FROM documents WHERE id = ${id}
  `
  if (roomDocuments.length === 0) {
    return null
  }

  const uploads = await sql`
    SELECT * FROM uploads WHERE url = ${roomDocuments[0].url}
  `
  if (uploads.length > 0) {
    return uploads[0].summary
  }
  return null
}

export async function getChatHistoryByDocumentId(documentId: string, clerkId: string) {
  const chatHistory = await sql`
    SELECT ch.* FROM chat_history ch
    JOIN users u ON ch.user_id = u.id
    WHERE ch.document_id = ${documentId} AND u.clerk_id = ${clerkId}
    ORDER BY ch.created_at DESC
  `
  return chatHistory
}
export async function createChatHistory(documentId: string, clerkId: string, message: string, response: string) {
  const id = generateId()
  
  const user = await getUserByClerkId(clerkId)
  if (!user) {
    throw new Error("User not found")
  }
  
  await sql`
    INSERT INTO chat_history (id, document_id, user_id, message, response, created_at)
    VALUES (${id}, ${documentId}, ${user.id}, ${message}, ${response}, NOW())
  `
  return id
}


export async function createChatHistoryTable() {
  await sql`
    CREATE TABLE IF NOT EXISTS chat_history (
      id VARCHAR(255) PRIMARY KEY,
      document_id VARCHAR(255) NOT NULL,
      user_id VARCHAR(255) NOT NULL,
      message TEXT NOT NULL,
      response TEXT NOT NULL,
      created_at TIMESTAMP NOT NULL DEFAULT NOW(),
      FOREIGN KEY (document_id) REFERENCES documents(id),
      FOREIGN KEY (user_id) REFERENCES users(id)
    )
  `
}