import express, { type Request, type Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { cvRouter } from './routes/cv.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3001;

const clientDist = path.resolve(__dirname, '../../client/dist');

app.use(cors({
  origin: (origin, cb) => {
    const allowed = ['http://localhost:5173', 'http://localhost:5174', 'http://localhost:5175'];
    if (!origin || allowed.includes(origin) || /^https:\/\/.*\.vercel\.app$/.test(origin)) {
      cb(null, true);
    } else {
      cb(null, false);
    }
  },
}));
app.use(express.json());

app.use('/api/cv', cvRouter);

app.get('/api/health', (_req: Request, res: Response) => {
  res.json({ status: 'ok' });
});

if (fs.existsSync(clientDist)) {
  app.use(express.static(clientDist));
  app.get('*', (req: Request, res: Response, next) => {
    if (req.path.startsWith('/api')) {
      next();
      return;
    }
    res.sendFile(path.join(clientDist, 'index.html'));
  });
}

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
