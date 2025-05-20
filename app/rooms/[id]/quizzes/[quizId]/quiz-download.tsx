"use client";

import { Button } from "@/components/ui/button";
import { Quiz } from "@/lib/types";
import { jsPDF } from "jspdf";
import { useState } from "react";

interface QuizDownloadProps {
  quiz: Quiz;
}

export default function QuizDownload({ quiz }: QuizDownloadProps) {

  const [selectedFormat, setSelectedFormat] = useState("markdown");

  const downloadAsMarkdown = () => {
    let content = `# ${quiz.title}\n\n`;
    content += `**Descripción:** ${quiz.description}\n\n`;
    content += `**Fuente:** ${quiz.source}\n\n`;
    content += `**Dificultad:** ${quiz.difficulty}\n\n`;
    content += `**Tags:** ${quiz.tags.join(", ")}\n\n`;

    quiz.questions.forEach((q, index) => {
      content += `## Pregunta ${index + 1}\n\n`;
      content += `**Texto:** ${q.question_text}\n\n`;
      Object.entries(q.options).forEach(([key, value]) => {
        content += `- (${key}) ${value}\n`;
      });
      content += `**Correcta:** ${q.correct_option}\n\n`;
      content += `**Dificultad:** ${q.difficulty}\n\n`;
      content += `---\n\n`;
    });

    const blob = new Blob([content], { type: "text/markdown" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${quiz.title.replace(/\s+/g, "_").toLowerCase()}.md`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const downloadAsCSV = () => {
    const header = "Pregunta,Dificultad,Opción A,Opción B,Opción C,Opción D,Correcta\n";
    const rows = quiz.questions.map((q) => {
      const opts = ["A", "B", "C", "D"].map((key) => `"${(q.options[key] || "").replace(/"/g, '""')}"`);
      return `"${q.question_text.replace(/"/g, '""')}",${q.difficulty},${opts.join(",")},"${q.correct_option}"`;
    });

    const blob = new Blob([header + rows.join("\n")], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.setAttribute("download", `${quiz.title.replace(/\s+/g, "_").toLowerCase()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(link.href);
  };

const downloadAsPDF = () => {
  const doc = new jsPDF();
  let y = 20;

  doc.setFontSize(16);
  doc.text(`${quiz.title} - Examen`, 105, y, { align: "center" });
  y += 10;

  doc.setFontSize(12);
  doc.text(`Fuente: ${quiz.source}`, 20, y); y += 6;
  doc.text(`Descripción: ${quiz.description}`, 20, y); y += 6;
  doc.text(`Dificultad: ${quiz.difficulty}`, 20, y); y += 10;

  const answers: string[] = [];

  quiz.questions.forEach((q, index) => {
    if (y > 250) { doc.addPage(); y = 20; }

    doc.setFont("helvetica", "bold");
    doc.text(`${index + 1}. ${q.question_text}`, 20, y); y += 8;
    doc.setFont("helvetica", "normal");

    const opts = Object.entries(q.options);
    opts.forEach(([key, value]) => {
      doc.text(`(${key}) ${value}`, 25, y);
      y += 6;
    });

    answers.push(`${index + 1}. ${q.correct_option}`);
    y += 10;
  });

  // Nueva página para las claves
  doc.addPage();
  doc.setFontSize(14);
  doc.setFont("helvetica", "bold");
  doc.text("CLAVES DEL EXAMEN", 105, 20, { align: "center" });

  doc.setFontSize(12);
  doc.setFont("helvetica", "normal");

  let yKey = 30;
  answers.forEach((ans, i) => {
    doc.text(ans, 20, yKey);
    yKey += 8;
    if (yKey > 280 && i < answers.length - 1) {
      doc.addPage();
      yKey = 20;
    }
  });

  doc.save(`${quiz.title.replace(/\s+/g, "_").toLowerCase()}_examen.pdf`);
};


  return (
    <div className="mb-6 flex flex-col sm:flex-row gap-4 items-stretch sm:items-center">
      <select
        className="border rounded px-3 py-2 text-sm focus:outline-none focus:ring w-full sm:w-auto"
        value={selectedFormat}
        onChange={(e) => setSelectedFormat(e.target.value)}
      >
        <option value="markdown">Markdown</option>
        <option value="csv">CSV</option>
        <option value="pdf">PDF</option>
      </select>
      <Button
        className="w-full sm:w-auto"
        onClick={() => {
          if (selectedFormat === "markdown") downloadAsMarkdown();
          else if (selectedFormat === "csv") downloadAsCSV();
          else if (selectedFormat === "pdf") downloadAsPDF();
        }}
      >
        Descargar
      </Button>
    </div>
  );
}
