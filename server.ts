import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = 3000;

// Maximum payload size for handling base64 uploaded image files
app.use(express.json({ limit: '10mb' }));

// Init Google GenAI client (User-Agent header required for telemetry)
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    }
  }
});

// Real-time analysis of uploaded ecological scars using multimodal Gemini 3.5 Flash
app.post("/api/gemini/analyze-scar", async (req, res) => {
  try {
    const { imageBase64, mimeType } = req.body;
    
    if (!imageBase64 || !mimeType) {
      return res.status(400).json({ error: "Missing imageBase64 or mimeType" });
    }

    // Clean base64 header if sent from canvas/file reader
    const cleanBase64 = imageBase64.replace(/^data:image\/\w+;base64,/, "");

    const imagePart = {
      inlineData: {
        data: cleanBase64,
        mimeType: mimeType
      }
    };

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: { 
        parts: [
          imagePart, 
          { 
            text: "Examine this uploaded environmental scar and write a structured description. Make it deeply emotional, raw, inspiringly cautionary, and poetic. Calculate a realistic environmental or climate metrics block related to the scene. Be concise." 
          }
        ] 
      },
      config: {
        systemInstruction: "You are a master environmental curator. Generate a deeply human-centric climate museum card for this uploaded tragedy. Respond exclusively in valid JSON matching the schema.",
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            title: { type: Type.STRING, description: "A deeply poignant, short title of the tragedy." },
            subtitle: { type: Type.STRING, description: "Detailed, informative, artistic subtitle of the context." },
            description: { type: Type.STRING, description: "A rich, literary, emotional narrative describing what is in this physical photo." },
            significance: { type: Type.STRING, description: "The broader scientific/ecological impact of this tragedy on the biosphere." },
            quote: { type: Type.STRING, description: "A high-impact motivational or warning quote reflecting this view (be wise, brief)." },
            author: { type: Type.STRING, description: "Author/institution for the quote (e.g. WWF, IPCC, Earthday Network, or UNEP)." },
            stat: { type: Type.STRING, description: "A realistic environmental statistic representing this global danger (e.g. '420 ppm', '150 sq km')." },
            statLabel: { type: Type.STRING, description: "Short descriptive label for what the statistic represents." }
          },
          required: ["title", "subtitle", "description", "significance", "quote", "author", "stat", "statLabel"]
        }
      }
    });

    const resultText = response.text;
    if (!resultText) {
      throw new Error("Empty response from Gemini API model.");
    }

    const cleanedText = resultText.trim();
    const data = JSON.parse(cleanedText);

    res.json(data);
  } catch (error: any) {
    console.error("Gemini analysis error:", error);
    res.status(500).json({ error: error.message || "Failed to analyze ecological scar" });
  }
});

// Vite server fallback & express listener binding to 0.0.0.0
async function setupServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server boots, live on http://localhost:${PORT}`);
  });
}

setupServer();
