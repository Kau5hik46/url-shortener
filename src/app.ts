import express from 'express';
import routes from './routes/routes';
import { sequelize } from './db/sequelize'; // Assuming sequelize instance is imported from here
import { errorHandler } from './middlewares/errorHandling';
import { authenticateToken } from './middlewares/auth';
import { identifyUser } from './middlewares/uuid';

const app = express();

app.use(express.json());
app.use('/', routes);
app.use(errorHandler);

// Sync sequelize with the database
sequelize.sync().then(() => {
    console.log('Database synced');
}).catch((error) => {
    console.error('Error syncing the database:', error);
});

export default app