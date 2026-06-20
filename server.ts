import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";
import dotenv from "dotenv";
import { MongoClient, ObjectId } from "mongodb";
import crypto from "crypto";
import fs from "fs";

dotenv.config();

// Startup validation — fail fast with a clear message if the key is missing
if (!process.env.GEMINI_API_KEY) {
  console.warn(
    "[carbon-compass] WARNING: GEMINI_API_KEY is not set. " +
    "Gemini AI endpoints (/api/gemini/*) will return errors. " +
    "Set the key in your .env file or deployment environment."
  );
}

// MongoDB Connection client
const mongoUri = process.env.MONGODB_URI;
let mongoClient: MongoClient | null = null;
let dbInstance: any = null;
let isMockDb = false;

// Mock collection that replicates MongoDB collections in local JSON files
class MockCollection {
  name: string;
  filePath: string;

  constructor(name: string) {
    this.name = name;
    this.filePath = path.join(process.cwd(), `mock_db_${name}.json`);
  }

  private readData(): any[] {
    try {
      if (fs.existsSync(this.filePath)) {
        return JSON.parse(fs.readFileSync(this.filePath, "utf-8"));
      }
    } catch (e) {
      console.error("Error reading mock DB:", e);
    }
    return [];
  }

  private writeData(data: any[]) {
    try {
      fs.writeFileSync(this.filePath, JSON.stringify(data, null, 2), "utf-8");
    } catch (e) {
      console.error("Error writing mock DB:", e);
    }
  }

  async findOne(query: any) {
    const data = this.readData();
    return data.find(item => {
      for (const key in query) {
        if (key === "uid" && item.uid === query.uid) continue;
        if (key === "email" && item.email === query.email) continue;
        if (key === "_id") {
          const itemVal = item._id ? item._id.toString() : "";
          const queryVal = query._id ? query._id.toString() : "";
          if (itemVal === queryVal) continue;
        }
        if (item[key] !== query[key]) return false;
      }
      return true;
    }) || null;
  }

  async updateOne(query: any, update: any, options?: any) {
    const data = this.readData();
    let index = data.findIndex(item => {
      for (const key in query) {
        if (item[key] !== query[key]) return false;
      }
      return true;
    });

    const setFields = update.$set || {};
    const incFields = update.$inc || {};

    if (index === -1) {
      if (options?.upsert) {
        const newItem = { ...query, ...setFields };
        for (const key in incFields) {
          newItem[key] = incFields[key];
        }
        if (!newItem._id) {
          newItem._id = new ObjectId().toString();
        }
        data.push(newItem);
      }
    } else {
      data[index] = { ...data[index], ...setFields };
      for (const key in incFields) {
        data[index][key] = (data[index][key] || 0) + incFields[key];
      }
    }
    this.writeData(data);
    return { modifiedCount: 1, upsertedCount: index === -1 ? 1 : 0 };
  }

  async insertOne(doc: any) {
    const data = this.readData();
    const newDoc = { ...doc };
    if (!newDoc._id) {
      newDoc._id = new ObjectId().toString();
    }
    data.push(newDoc);
    this.writeData(data);
    return { insertedId: newDoc._id };
  }

  find(query: any = {}) {
    const data = this.readData();
    const filtered = data.filter(item => {
      for (const key in query) {
        if (item[key] !== query[key]) return false;
      }
      return true;
    });

    return {
      sort: (sortQuery: any) => {
        const sortKey = Object.keys(sortQuery)[0];
        const sortOrder = sortQuery[sortKey]; // 1 for asc, -1 for desc
        filtered.sort((a, b) => {
          if (a[sortKey] < b[sortKey]) return -1 * sortOrder;
          if (a[sortKey] > b[sortKey]) return 1 * sortOrder;
          return 0;
        });
        return {
          toArray: async () => filtered
        };
      },
      toArray: async () => filtered
    };
  }
}

const getMongoDb = async () => {
  if (dbInstance) return dbInstance;
  if (isMockDb) {
    return {
      collection: (name: string) => new MockCollection(name)
    };
  }

  if (!mongoUri) {
    console.warn("[carbon-compass] MONGODB_URI is not set. Falling back to local file-based mock database.");
    isMockDb = true;
    return {
      collection: (name: string) => new MockCollection(name)
    };
  }

  try {
    mongoClient = new MongoClient(mongoUri, { serverSelectionTimeoutMS: 2000 });
    await mongoClient.connect();
    dbInstance = mongoClient.db();
    console.log("[carbon-compass] Connected to MongoDB database successfully!");
    return dbInstance;
  } catch (err) {
    console.warn("[carbon-compass] MongoDB connection failed (DNS/Network). Falling back to local file-based database. Error:", err instanceof Error ? err.message : err);
    isMockDb = true;
    return {
      collection: (name: string) => new MockCollection(name)
    };
  }
};

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
        systemInstruction: "You are an expert climate educator with a brilliant, witty internet sense of humor. Create clean, extremely funny, meme captions and scenarios that highlight climate ironies, paired with a solid real-world science fact that teaches the audience how to solve it. Choose a templateType ('bus', 'beach', 'soldiers', 'drake', 'two-panel', 'distracted', 'classic', 'modern-card') and populate the corresponding text properties of that template structure perfectly. Respond strictly in valid JSON format matching the schema. Detailed instructions for custom types:\n- 'bus': compares a gloomy/ignorant option ('topCaption' overlaying the left window, e.g. 'LIFE WITH PLASTIC WASTE') with a happy/active green outcome ('bottomCaption' overlaying the right window, e.g. 'LIFE AFTER RECYCLING PLASTIC').\n- 'beach': compares an excuse ('topCaption' for the top littered panel, e.g. 'ITS NOT MY GARBAGE') with an active personal responsibility cleanup ('bottomCaption' for the bottom panel, e.g. 'BUT ITS MY PLANET').\n- 'soldiers': compares the overall clean/functioning society ('topCaption' overlaying the grass on top, e.g. 'SOCIETY') with the silent everyday green heroes whose micro-actions support it ('bottomCaption' overlaying the soldiers at the bottom, e.g. 'PEOPLE WHO PUT TRASH IN THEIR POCKETS').\nPlease prioritize using these three custom templates ('bus', 'beach', 'soldiers') when it fits the topic.",
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            title: { type: Type.STRING, description: "Witty name of this meme theme (e.g. 'The Active Transit Illusion')" },
            themeTopic: { type: Type.STRING, description: "Category subtopic (e.g. 'Fast Fashion', 'Meat Diet', 'A/C Overuse')" },
            templateType: { type: Type.STRING, description: "Must be exactly one of: 'bus', 'beach', 'soldiers', 'drake', 'two-panel', 'distracted', 'classic', 'modern-card'" },
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

// Hashing utilities for custom credentials authentication
const hashPassword = (password: string) => {
  const salt = crypto.randomBytes(16).toString("hex");
  const hash = crypto.pbkdf2Sync(password, salt, 1000, 64, "sha512").toString("hex");
  return `${salt}:${hash}`;
};

const verifyPassword = (password: string, storedValue: string) => {
  if (!storedValue || !storedValue.includes(":")) return false;
  const [salt, originalHash] = storedValue.split(":");
  const hash = crypto.pbkdf2Sync(password, salt, 1000, 64, "sha512").toString("hex");
  return hash === originalHash;
};

// Custom credentials auth: Signup
app.post("/api/auth/signup", async (req, res) => {
  try {
    const { email, password, name } = req.body;
    if (!email || !password || !name) {
      return res.status(400).json({ error: "Missing email, password, or name" });
    }

    const database = await getMongoDb();
    const credentialsCollection = database.collection("credentials");

    // Check if email already registered
    const existing = await credentialsCollection.findOne({ email: email.toLowerCase().trim() });
    if (existing) {
      return res.status(400).json({ error: "Email already in use" });
    }

    const uid = crypto.randomBytes(16).toString("hex");
    const passwordHash = hashPassword(password);

    await credentialsCollection.insertOne({
      uid,
      email: email.toLowerCase().trim(),
      passwordHash,
      name: name.trim(),
      createdAt: new Date().toISOString()
    });

    res.json({
      uid,
      email: email.toLowerCase().trim(),
      displayName: name.trim()
    });
  } catch (error: unknown) {
    console.error("Signup error:", error);
    const errMsg = error instanceof Error ? error.message : "Failed to sign up";
    res.status(500).json({ error: errMsg });
  }
});

// Custom credentials auth: Signin
app.post("/api/auth/signin", async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: "Missing email or password" });
    }

    const database = await getMongoDb();
    const credentialsCollection = database.collection("credentials");

    const userRecord = await credentialsCollection.findOne({ email: email.toLowerCase().trim() });
    if (!userRecord || !verifyPassword(password, userRecord.passwordHash)) {
      return res.status(400).json({ error: "Invalid email or password" });
    }

    res.json({
      uid: userRecord.uid,
      email: userRecord.email,
      displayName: userRecord.name
    });
  } catch (error: unknown) {
    console.error("Signin error:", error);
    const errMsg = error instanceof Error ? error.message : "Failed to sign in";
    res.status(500).json({ error: errMsg });
  }
});

// Sync user footprint data to MongoDB
app.post("/api/user/sync", async (req, res) => {
  try {
    const { uid, user, footprint, activityLogs, goals } = req.body;
    if (!uid) {
      return res.status(400).json({ error: "Missing uid parameter" });
    }

    const database = await getMongoDb();
    const collection = database.collection("users");

    // Upsert user document
    await collection.updateOne(
      { uid },
      {
        $set: {
          uid,
          user,
          footprint,
          activityLogs,
          goals,
          updatedAt: new Date().toISOString()
        }
      },
      { upsert: true }
    );

    res.json({ success: true, message: "Data synced to MongoDB successfully!" });
  } catch (error: unknown) {
    console.error("MongoDB sync error:", error);
    const errMsg = error instanceof Error ? error.message : "Failed to sync data to MongoDB";
    res.status(500).json({ error: errMsg });
  }
});

// Load user footprint data from MongoDB
app.get("/api/user/data/:uid", async (req, res) => {
  try {
    const { uid } = req.params;
    if (!uid) {
      return res.status(400).json({ error: "Missing uid parameter" });
    }

    const database = await getMongoDb();
    const collection = database.collection("users");

    const document = await collection.findOne({ uid });
    if (!document) {
      return res.status(404).json({ error: "User document not found" });
    }

    // Return profile details
    res.json({
      user: document.user || null,
      footprint: document.footprint || null,
      activityLogs: document.activityLogs || [],
      goals: document.goals || []
    });
  } catch (error: unknown) {
    console.error("MongoDB fetch error:", error);
    const errMsg = error instanceof Error ? error.message : "Failed to fetch data from MongoDB";
    res.status(500).json({ error: errMsg });
  }
});

// Get all community posts from MongoDB
app.get("/api/posts", async (req, res) => {
  try {
    const database = await getMongoDb();
    const collection = database.collection("posts");
    const postsList = await collection.find({}).sort({ createdAt: -1 }).toArray();
    const formattedPosts = postsList.map(doc => ({
      id: doc._id.toString(),
      authorName: doc.authorName,
      authorEmail: doc.authorEmail,
      habitTitle: doc.habitTitle,
      category: doc.category,
      impactKg: doc.impactKg,
      content: doc.content,
      likes: doc.likes || 0,
      createdAt: doc.createdAt
    }));
    res.json(formattedPosts);
  } catch (error: unknown) {
    console.error("MongoDB posts fetch error:", error);
    const errMsg = error instanceof Error ? error.message : "Failed to fetch posts";
    res.status(500).json({ error: errMsg });
  }
});

// Create a new community post in MongoDB
app.post("/api/posts", async (req, res) => {
  try {
    const { authorName, authorEmail, habitTitle, category, impactKg, content, likes, createdAt } = req.body;
    if (!habitTitle || !content) {
      return res.status(400).json({ error: "Missing habitTitle or content" });
    }

    const database = await getMongoDb();
    const collection = database.collection("posts");
    
    const newPostData = {
      authorName,
      authorEmail,
      habitTitle,
      category,
      impactKg,
      content,
      likes: likes || 0,
      createdAt: createdAt || new Date().toISOString()
    };

    const result = await collection.insertOne(newPostData);
    res.json({
      id: result.insertedId.toString(),
      ...newPostData
    });
  } catch (error: unknown) {
    console.error("MongoDB post creation error:", error);
    const errMsg = error instanceof Error ? error.message : "Failed to create post";
    res.status(500).json({ error: errMsg });
  }
});

// Like a community post in MongoDB
app.post("/api/posts/:id/like", async (req, res) => {
  try {
    const { id } = req.params;
    if (!id) {
      return res.status(400).json({ error: "Missing id parameter" });
    }

    const database = await getMongoDb();
    const collection = database.collection("posts");

    const query = ObjectId.isValid(id) ? { _id: new ObjectId(id) } : { _id: id };
    await collection.updateOne(query, { $inc: { likes: 1 } });

    res.json({ success: true });
  } catch (error: unknown) {
    console.error("MongoDB post like error:", error);
    const errMsg = error instanceof Error ? error.message : "Failed to like post";
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
