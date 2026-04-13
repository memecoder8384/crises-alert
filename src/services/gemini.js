const API_KEY = import.meta.env.VITE_GEMINI_API_KEY;

const ENDPOINT = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${API_KEY}`;

/**
 * Sends a generic prompt to the Gemini AI and extracts the response.
 * @param {string} prompt - User defined text
 */
export async function generateResponse(prompt) {
  try {
    const tacticalPrompt = `System: You are an emergency assistant. Give short, life-saving instructions (max 3-4 points).\n\nUser: ${prompt}`;

    const res = await fetch(ENDPOINT, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [{ text: tacticalPrompt }]
          }
        ]
      })
    });

    const data = await res.json();
    if (data?.error) {
      throw new Error(data.error.message);
    }
    return data?.candidates?.[0]?.content?.parts?.[0]?.text || "No valid response generated.";
  } catch (err) {
    throw err;
  }
}

/**
 * Prompts Gemini to translate text into a specific target language.
 * @param {string} text - The input text to be translated
 * @param {string} targetLanguage - The language to translate into
 */
export async function translateText(text, targetLanguage) {
  try {
    const translationPrompt = `Translate this emergency alert into simple ${targetLanguage} in one sentence: ${text}`;

    const res = await fetch(ENDPOINT, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [{ text: translationPrompt }]
          }
        ]
      })
    });

    const data = await res.json();

    if (data?.error) {
      throw new Error(data.error.message);
    }

    return data?.candidates?.[0]?.content?.parts?.[0]?.text || "Translation failed to return text.";
  } catch (err) {
    throw err;
  }
}