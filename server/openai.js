const OpenAI = require('openai');

async function answerQuestion(studyContent, question) {
  // Create the client only when a question is asked, so uploads work without a key.
  const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  const response = await client.chat.completions.create({
    model: 'gpt-4o-mini',
    temperature: 0.2,
    messages: [
      {
        role: 'system',
        content: 'You are a helpful study assistant. Answer primarily from the uploaded study material. If the answer is not in the material, say: "This information is not present in the uploaded study material." Do not invent facts.'
      },
      {
        role: 'user',
        content: `Uploaded study material:\n\n${studyContent}\n\nStudent question: ${question}`
      }
    ]
  });

  return response.choices[0].message.content.trim();
}

module.exports = { answerQuestion };