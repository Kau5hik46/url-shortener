import express from 'express';
import routes from './routes/routes';
import { sequelize } from './db/sequelize'; // Assuming sequelize instance is imported from here
import { errorHandler } from './middlewares/errorHandling';

const app = express();

app.use(express.json()); // For parsing JSON bodies
app.use('/', routes); // Apply the routes to the '/api' prefix
app.use(errorHandler);

// Sync sequelize with the database
sequelize.sync().then(() => {
    console.log('Database synced');
}).catch((error) => {
    console.error('Error syncing the database:', error);
});

export default app