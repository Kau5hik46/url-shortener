import { Sequelize } from 'sequelize';
import * as dotenv from 'dotenv';

dotenv.config(); // Load environment variables from .env file

const sequelize = new Sequelize({
    dialect: 'postgres',
    host: process.env.DATABASE_HOST || 'localhost',
    port: Number(process.env.DATABASE_PORT) || 5432,
    username: process.env.DATABASE_USER || 'your-db-user',
    password: process.env.DATABASE_PASSWORD || 'your-db-password',
    database: process.env.DATABASE_NAME || 'your-db-name',
    logging: false,
});

export { sequelize };
