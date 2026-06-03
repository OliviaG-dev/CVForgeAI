import { GoogleGenerativeAI } from '@google/generative-ai';

let genAI: GoogleGenerativeAI | null = null;

function getClient(): GoogleGenerativeAI {
  if (!genAI) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error('GEMINI_API_KEY manquante. Ajoutez-la dans server/.env');
    }
    genAI = new GoogleGenerativeAI(apiKey);
  }
  return genAI;
}

interface CVInput {
  experience: string;
  skills: string;
  education: string;
  language?: string;
}

export async function generateCV(input: CVInput): Promise<string> {
  const lang = input.language || 'français';

  const model = getClient().getGenerativeModel({
    model: 'gemini-2.5-flash',
    generationConfig: { temperature: 0.7 },
  });

  const prompt = `Tu es un expert en rédaction de CV professionnels. Génère un CV structuré, optimisé pour les systèmes ATS, en ${lang}. Retourne le résultat en JSON avec les sections : summary, experience, skills, education.

Voici mes informations :

Expérience : ${input.experience}

Compétences : ${input.skills}

Formation : ${input.education}`;

  const result = await model.generateContent(prompt);
  const response = result.response;
  return response.text() || '';
}

export async function improveDescription(
  description: string,
  options?: { senior?: boolean },
): Promise<string> {
  const model = getClient().getGenerativeModel({
    model: 'gemini-2.5-flash',
    generationConfig: { temperature: 0.7 },
  });

  const seniorBlock = options?.senior
    ? `
MISE EN FORME SENIOR (obligatoire) :
- Une puce par ligne, préfixée par le caractère ● (exemple : ● Titre (contexte) : description).
- Chaque puce : « Titre court » ou « Titre (entreprise/projet) » suivi de « : » puis 1 à 3 phrases avec verbes d'action et résultats concrets.
- 4 à 7 puces maximum, sans paragraphe libre ni liste à tirets.
- Conserver les faits, technologies et chiffres fournis ; ne pas inventer.`
    : `
MISE EN FORME : Utilise des retours à la ligne pour aérer le texte et structurer les idées. Sépare les paragraphes par une ligne vide pour une lecture fluide. Maximum 3-4 lignes par paragraphe.`;

  const prompt = `Tu es un expert en rédaction de CV. Reformule et améliore la description suivante.

STYLE : Texte commercial et professionnel, percutant, optimisé pour les systèmes ATS. Ton valorisant et engageant.
${seniorBlock}

RÈGLE : Retourne UNIQUEMENT le texte amélioré, rien d'autre. Pas d'options multiples, pas d'explications, pas de markdown (###, ---).

Description à améliorer :
${description}`;

  const result = await model.generateContent(prompt);
  const response = result.response;
  return response.text() || '';
}
