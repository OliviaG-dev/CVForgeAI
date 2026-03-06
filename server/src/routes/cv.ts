import { Router } from 'express';
import { generateCV, improveDescription } from '../services/openai.js';

export const cvRouter = Router();

cvRouter.post('/generate', async (req, res) => {
  try {
    const { experience, skills, education, language } = req.body;
    const cv = await generateCV({ experience, skills, education, language });
    res.json({ cv });
  } catch (error) {
    console.error('Error generating CV:', error);
    res.status(500).json({ error: 'Erreur lors de la génération du CV' });
  }
});

cvRouter.post('/improve', async (req, res) => {
  try {
    const { description } = req.body;
    const improved = await improveDescription(description);
    res.json({ improved });
  } catch (error) {
    console.error('Error improving description:', error);
    res.status(500).json({ error: 'Erreur lors de l\'amélioration de la description' });
  }
});
