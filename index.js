// === Import & Setup ===
import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import axios from "axios";

// === Load .env ===
dotenv.config();
console.log("API Key dari ENV:", process.env.OPENROUTER_API_KEY);
const app = express();
const PORT = process.env.PORT || 3500;

// === Middleware ===
app.use(cors());
app.use(express.json());
app.get("/", (req, res) => {
  res.send("✅ Server AI Surat aktif!");
});


// === Endpoint AI Surat ===
app.post("/api/generate", async (req, res) => {
  const { jenisSurat, kualitas, data } = req.body;

  if (!jenisSurat || !kualitas || !data) {
    return res.status(400).json({ error: "Data tidak lengkap" });
  }

  // === Prompt Dinamis ke GPT ===
  const prompt = `
Buatkan surat resmi dalam Bahasa Indonesia berdasarkan detail berikut:
Jenis surat: ${jenisSurat}
Kualitas surat: ${kualitas}
Data pengguna: ${JSON.stringify(data, null, 2)}

Tulis surat formal yang rapi, langsung tampilkan suratnya tanpa penjelasan tambahan.
  `.trim();

  try {
    const response = await axios.post(
      "https://openrouter.ai/api/v1/chat/completions",
      {
        model: "openai/gpt-3.5-turbo",
        messages: [{ role: "user", content: prompt }],
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
          "Content-Type": "application/json",
        },
      },
    );

    const hasil = response.data.choices[0].message.content;
    res.json({ hasil });
  } catch (error) {
    console.error("🛑 Error GPT:", error.response?.data || error.message);
    res.status(500).json({ error: "Gagal menghasilkan surat dari AI" });
  }
});

// === Start Server ===
app.listen(PORT, () => {
  console.log(`🚀 Server AI Surat berjalan di http://localhost:${PORT}`);
});
