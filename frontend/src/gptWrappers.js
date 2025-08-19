// import OpenAI from "openai";

// const openai = new OpenAI({ apiKey: process.env.REACT_APP_OPENAI_API_KEY });

// export async function getGPTResponse(prompt) {
//   try {
//     const response = await openai.chat.completions.create({
//       model: "gpt-4o-mini",
//       messages: [
//         { role: "system", content: "You are a helpful AI assistant for VaultStamp." },
//         { role: "user", content: prompt },
//       ],
//     });
//     return response.choices[0].message.content;
//   } catch (error) {
//     console.error("GPT API error:", error);
//     return "Sorry, something went wrong with the AI.";
//   }
// }