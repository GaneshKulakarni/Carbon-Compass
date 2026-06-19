import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

// Startup validation — fail fast with a clear message if the key is missing
if (!process.env.GEMINI_API_KEY) {
  console.warn(
    "[carbon-compass] WARNING: GEMINI_API_KEY is not set. " +
    "Gemini AI endpoints (/api/gemini/*) will return errors. " +
    "Set the key in your .env file or deployment environment."
  );
}

const app = express();
const PORT = 3000;

// Maximum payload size for handling base64 uploaded image files
app.use(express.json({ limit: '10mb' }));

// Basic security headers
app.use((_req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  next();
});

// Helper to get Gemini client dynamically to avoid needing a server restart if .env changes
const getGenAIClient = () => {
  dotenv.config();
  return new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY ?? '',
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      }
    }
  });
};

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

    const response = await getGenAIClient().models.generateContent({
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
  } catch (error: unknown) {
    console.error("Gemini analysis error:", error);
    const errMsg = error instanceof Error ? error.message : "Failed to analyze ecological scar";
    res.status(500).json({ error: errMsg });
  }
});

// Generate Custom Eco-Sustainability Meme using Gemini 3.5 Flash server-side
app.post("/api/gemini/generate-meme", async (req, res) => {
  try {
    const { topic } = req.body;
    // Sanitize input: strip non-printable/special chars, enforce max length
    // to prevent prompt injection attacks
    const rawTopic = typeof topic === 'string' ? topic : '';
    const sanitizedTopic = rawTopic
      .replace(/[<>{}\[\]\\"';]/g, '') // strip injection-prone chars
      .trim()
      .slice(0, 200); // hard cap at 200 chars
    const requestedTopic = sanitizedTopic || "general plastic pollution or energy waste";

    const response = await getGenAIClient().models.generateContent({
      model: "gemini-3.5-flash",
      contents: `Generate a funny, viral eco-sustainability meme about "${requestedTopic}". The meme must highlight human hypocrisy or carbon ironies in a funny, lighthearted but deeply educational way, and then provide a powerful teaching paragraph. Use one of the classic meme templates specified in the templateType schema. Build corresponding values for that template type.`,
      config: {
        systemInstruction: "You are an expert climate educator with a brilliant, witty internet sense of humor. Create clean, extremely funny, meme captions and scenarios that highlight climate ironies, paired with a solid real-world science fact that teaches the audience how to solve it. Choose a templateType ('drake', 'two-panel', 'distracted', 'classic', 'modern-card') and populate the corresponding text properties of that template structure perfectly. Respond strictly in valid JSON format matching the schema.",
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            title: { type: Type.STRING, description: "Witty name of this meme theme (e.g. 'The Active Transit Illusion')" },
            themeTopic: { type: Type.STRING, description: "Category subtopic (e.g. 'Fast Fashion', 'Meat Diet', 'A/C Overuse')" },
            templateType: { type: Type.STRING, description: "Must be exactly one of: 'drake', 'two-panel', 'distracted', 'classic', 'modern-card'" },
            imageUrlOrDescription: { type: Type.STRING, description: "A detailed caricature description of what the animation/cartoon in the meme look like (e.g. 'A cat turning on a diesel generator to charge an electric toothbrush')" },
            emojiSetup: { type: Type.STRING, description: "A string of 3-4 funny emojis matching the meme (e.g. '⚡🚨🌳🔌')" },
            
            // Text for classic and modern cards
            topCaption: { type: Type.STRING, description: "Classic meme format - upper text (e.g. 'Buys reusable canvas grocery bag to protect turtle oceans')" },
            bottomCaption: { type: Type.STRING, description: "Classic meme format - lower text (e.g. 'Uses plastic trash bags anyway')" },
            
            // Drake-style preference
            drakeRejectText: { type: Type.STRING, description: "The bad choice that Drake rejects with hand up (e.g., 'Utilizing old backpacks and simple paper grocery bags')" },
            drakeAcceptText: { type: Type.STRING, description: "The flashy, ironic eco choice Drake smiles at (e.g., 'Spending $150 on premium designer organic custom embroidered tote bags')" },
            
            // Distracted boyfriend
            boyfriendLooksAt: { type: Type.STRING, description: "The shiny hypocritical choice (e.g., 'Buying a heavy EV hummer')" },
            boyfriendIgnores: { type: Type.STRING, description: "The simple low-carbon solution being ignored (e.g., 'Riding electric town transit')" },
            boyfriendLabel: { type: Type.STRING, description: "Label for the boyfriend character (e.g., 'Typical modern consumer')" },
            
            // Two panel Expectation vs Reality
            panelLeftTitle: { type: Type.STRING, description: "Name of panel 1 (e.g., 'My expectations')" },
            panelLeftText: { type: Type.STRING, description: "Text inside panel 1 (e.g., 'Riding a bicycle in pleasant sunset breeze')" },
            panelRightTitle: { type: Type.STRING, description: "Name of panel 2 (e.g., 'The actual transition')" },
            panelRightText: { type: Type.STRING, description: "Text inside panel 2 (e.g., 'Coughing behind an older diesel tractor in pouring rain')" },
            
            // Modern tweeter/social card
            socialText: { type: Type.STRING, description: "Sarcastic eco-tweet content" },
            
            funnyPunchline: { type: Type.STRING, description: "A quick hilarious zinger summary" },
            educationalFact: { type: Type.STRING, description: "The core sustainability educational science lesson: the raw truth about what we should do instead, backed up by realistic numbers." },
            solutionTip: { type: Type.STRING, description: "One simple high-impact action the user can log or do to avoid this hypocrisy (e.g. 'Use your existing plastic bags or old backpack instead of buying custom novelty eco-totes')." }
          },
          required: [
            "title", 
            "themeTopic", 
            "templateType", 
            "imageUrlOrDescription", 
            "emojiSetup", 
            "topCaption", 
            "bottomCaption", 
            "funnyPunchline", 
            "educationalFact", 
            "solutionTip"
          ]
        }
      }
    });

    const resultText = response.text;
    if (!resultText) {
      throw new Error("Empty response from Gemini.");
    }

    res.json(JSON.parse(resultText.trim()));
  } catch (error: unknown) {
    console.error("Gemini Meme generation error:", error);
    const errMsg = error instanceof Error ? error.message : "Failed to generate eco meme";
    res.status(500).json({ error: errMsg });
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
