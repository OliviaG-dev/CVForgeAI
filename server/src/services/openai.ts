import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

interface CVInput {
  experience: string;
  skills: string;
  education: string;
  language?: string;
}

export async function generateCV(input: CVInput): Promise<string> {
  const lang = input.language || 'français';

  const response = await openai.chat.completions.create({
    model: 'gpt-4o-mini',
    messages: [
      {
        role: 'system',
        content: `Tu es un expert en rédaction de CV professionnels. Génère un CV structuré, optimisé pour les systèmes ATS, en ${lang}. Retourne le résultat en JSON avec les sections : summary, experience, skills, education.`,
      },
      {
        role: 'user',
        content: `Voici mes informations :\n\nExpérience : ${input.experience}\n\nCompétences : ${input.skills}\n\nFormation : ${input.education}`,
      },
    ],
    temperature: 0.7,
  });

  return response.choices[0].message.content || '';
}

export async function improveDescription(description: string): Promise<string> {
  const response = await openai.chat.completions.create({
    model: 'gpt-4o-mini',
    messages: [
      {
        role: 'system',
        content:
          'Tu es un expert en rédaction de CV. Reformule et améliore la description suivante pour la rendre plus percutante, professionnelle et optimisée pour les systèmes ATS. Garde le même sens mais améliore la formulation.',
      },
      {
        role: 'user',
        content: description,
      },
    ],
    temperature: 0.7,
  });

  return response.choices[0].message.content || '';
}
