import SummaryChat from "@/components/chat/summary-chat";
import { getSummaryById, getUserByClerkId } from "@/lib/db";
import { getTierObject } from "@/lib/getLimits";
import { auth, clerkClient } from "@clerk/nextjs/server";
import { MathJax } from "better-react-mathjax";
import "highlight.js/styles/github.css"; // Estilo para el código (puedes cambiar el tema)
import { redirect } from "next/navigation";
import ReactMarkdown from "react-markdown";
import rehypeHighlight from "rehype-highlight";

export default async function Summary({ params }: { params: { id: string } }) {
  const authObj = await auth();
  const { userId: clerkId } = authObj;

  if (!clerkId) redirect("/login");

  const user = await getUserByClerkId(clerkId);


    const { id } = await params
    const sum: string = await getSummaryById(id)
  const client = await clerkClient();
  const userData = await client.users.getUser(clerkId);
  const currentPlan = getTierObject(userData?.publicMetadata?.plan as string | undefined || "free");

    if (!sum) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 dark:bg-gray-900 text-ink dark:text-gray-200">
                <p className="text-lg font-medium mb-4">Resumen no encontrado.</p>
                <a 
                    href="/dashboard" 
                    className="px-4 py-2 bg-iris hover:bg-irisdark text-white rounded-lg transition-colors"
                >
                    Volver al Dashboard
                </a>
            </div>
        )
    }    return (
        <div className="min-h-screen bg-gradient-to-b from-white to-gray-50 dark:from-gray-900 dark:to-gray-800 px-4 py-10">
            <div className="max-w-3xl mx-auto bg-ivory dark:bg-gray-900 rounded-2xl shadow-xl p-6 md:p-10 border border-gray-200 dark:border-gray-700">

                    <MathJax dynamic hideUntilTypeset="every">
                        <ReactMarkdown
                            rehypePlugins={[rehypeHighlight]}
                        >
                            {sum}
                        </ReactMarkdown>
                    </MathJax>
            </div>
            
            {/* Chat Component */}
            {(currentPlan.isUltra || currentPlan.isUltimate) && (<SummaryChat documentId={id} />)}
        </div>
    )
}
