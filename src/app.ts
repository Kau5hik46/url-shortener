import express from 'express';
import cors from 'cors';
import { errorHandler } from './middlewares/errorHandling';
import routes from './routes/routes';

const app = express();
app.use(cors());
app.use(express.json());

// Base Routes
app.use('/', routes);

// Error Handling middleware
app.use(errorHandler);

export default app;