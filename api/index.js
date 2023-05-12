const express = require("express");
const cors = require("cors");
const axios = require("axios");
const { Configuration, OpenAIApi } = require("openai");
const cheerio = require("cheerio");
const dotenv = require("dotenv");

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

const get_page_text = async (url) => {
  const response = await axios.get(url);
  const $ = cheerio.load(response.data);
  const main_content = $("p");
  const page_text = main_content
    .map((_, p) => $(p).text())
    .get()
    .join(" ");
  const clean_text = page_text.replace(/\s+/g, " ");
  return clean_text;
};

const split_text_into_segments = (text, max_tokens = 3500) => {
  const words = text.split(" ");
  const segments = [];
  let current_segment = [];

  for (const word of words) {
    if (current_segment.join(" ").length + word.length < max_tokens) {
      current_segment.push(word);
    } else {
      segments.push(current_segment.join(" "));
      current_segment = [word];
    }
  }

  if (current_segment.length > 0) {
    segments.push(current_segment.join(" "));
  }

  return segments;
};

async function generate_summary(text_segments) {
  const summaries = [];

  const configuration = new Configuration({
    apiKey: process.env.API_KEY,
  });

  const openai = new OpenAIApi(configuration);

  for (const text of text_segments) {
    try {
      const response = await openai.createChatCompletion({
        model: "gpt-3.5-turbo",
        messages: [
          {
            role: "user",
            content: `Resumir el siguiente texto y devolver el resultado siempre traducido al español:\n\n${text}\n\nResumen:`,
          },
        ],
        max_tokens: 150,
      });

      const summary = response.data.choices[0].message.content.trim();
      summaries.push(summary);
    } catch (error) {
      console.error("Error en la generación del resumen:", error);
    }
  }
  return summaries.join(" ");
}
//Contexto del chat
let chat = [
  {
    role: "system",
    content: `Te haré una serie de preguntas y serás una inteligencia artificial, precisa, certera, me darás respuestas de fuentes confiables y sin recomendaciones.`,
  },
];

const chatCompletion = async (msn) => {
  chat.push({
    role: "user",
    content: `${msn}`,
  });

  const configuration = new Configuration({
    apiKey: process.env.API_KEY,
  });

  const openai = new OpenAIApi(configuration);
  try {
    const response = await openai.createChatCompletion({
      model: "gpt-3.5-turbo",
      messages: chat,
      max_tokens: 3000,
    });

    const summary = response.data.choices[0].message.content.replace(
      /(?:\r\n|\r|\n)/g,
      "<br>"
    );
    chat.push({
      role: "assistant",
      content: `${summary}`,
    });
    //Esta linea hace que el chat tenga contexto
    if (chat.length >= 10) {
      const newChatarray = chat.filter((_, i) => {
        return i != 2 && i != 3;
      });
      chat = newChatarray;
    }
    return summary;
  } catch (error) {
    console.error("Error en la generación del resumen:", error);
  }
};

app.post("/summarize", async (req, res) => {
  const { url } = req.body;
  console.log(`Peticion desde la pagina: ${url}`);

  try {
    const text = await get_page_text(url);
    const text_segments = split_text_into_segments(text);
    const summary = await generate_summary(text_segments);
    res.json({ summary, status_code: 200 });
  } catch (error) {
    res.json({ error: error.message, status_code: 500 });
  }
});

app.post("/chat", async (req, res) => {
  const { url } = req.body;
  console.log(`Peticion desde la pagina: ${url}`);

  try {
    const summary = await chatCompletion(url);
    res.json({ summary, status_code: 200 });
  } catch (error) {
    res.json({ error: error.message, status_code: 500 });
  }
});

const port = process.env.PORT || 5000;
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
