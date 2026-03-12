import express, { type Request, type Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { cvRouter } from './routes/cv.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

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

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
