
export const plans = [
  {
    id: "free",
    name: "Free",
    description: "Para uso personal básico",
    recommended: false,
    prices: {
      monthly: 0,
      quarterly: 0,
      yearly: 0,
    },
    features: [
      "Hasta 5 Rooms",
      "3 generaciones de AI por Room",
      "7 generaciones de AI mensuales",
      "1 Archivo por room",
      "Exportación básica de flashcards",
    ],
    unavailable: ["Soporte prioritario"],
  },
  {
    id: "premium",
    name: "Premium",
    description: "Para estudiantes y profesionales",
    recommended: true,
    prices: {
      monthly: 9.99,
      quarterly: 8.99,
      yearly: 7.99,
    },
    features: [
      "Hasta 15 Rooms",
      "10 generaciones de AI por Room",
      "20 generaciones de AI mensuales",
      "3 Archivos por room",
      "Exportación avanzada (CSV)",
      "Documentos especiales (CSV)"
    ],
    unavailable: ["Soporte prioritario"],
  },
  {
    id: "ultimate",
    name: "Ultimate",
    description: "Para uso intensivo",
    recommended: false,
    prices: {
      monthly: 19.99,
      quarterly: 17.99,
      yearly: 15.99,
    },
    features: [
      "Rooms ilimitados",
      "Generaciones de AI ilimitadas",
      "Exportación ultimate (CSV, Anki)",
      "Soporte prioritario",
      "Documentos especiales (CSV, IMG)",
    ],
    unavailable: [],
  }
];

export const getPlanById = (id: string) => {

  if (id === "ultra") id = "ultimate";
  return plans.find((plan) => plan.id === id);
}

export const billingLabels: Record<string, string> = {
  monthly: "Mensual",
  quarterly: "Cuatrismestral (-10%)",
  yearly: "Anual (-20%)",
};
