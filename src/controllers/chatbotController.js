import { GoogleGenerativeAI } from "@google/generative-ai";

// Accede a tu clave de API como una variable de entorno
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

export const generateDynamic = async (req, res) => {
  const { topic, type, difficulty } = req.body;

  if (!topic || !type || !difficulty) {
    return res
      .status(400)
      .json({ message: "Faltan parámetros en la solicitud" });
  }

  try {
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-pro" });

    const prompt = `Generar una dinámica de clase sobre "${topic}" para un nivel de dificultad "${difficulty}". El tipo de dinámica es "${type}".`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    // Aquí puedes agregar lógica para generar un gráfico si es necesario
    // Por ahora, solo devolvemos el texto generado
    res.json({ dynamic: text, chart: null });
  } catch (error) {
    console.error("Error al generar contenido dinámico:", error);
    res.status(500).json({ message: "Error al generar contenido dinámico" });
  }
};