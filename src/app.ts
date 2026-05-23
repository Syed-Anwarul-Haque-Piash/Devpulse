import express, { type Request, type Response } from 'express';
import cors from 'cors';
import CookieParser from 'cookie-parser';
import { logger } from './middleware/logger';
import { globalErrorHandler } from './middleware/globalErrorHandler';
import authRoutes from './api/routes/authRoutes';
import issueRoutes from './api/routes/issueroutes';

const app = express();

app.use(logger);
app.use(CookieParser());
app.use(express.json());
app.use(cors());

app.get('/', (req: Request, res: Response) => {
  res.send('Hello World!');
});

app.use('/api/auth', authRoutes);
app.use('/api/issues', issueRoutes);
app.use(globalErrorHandler);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

export default app;