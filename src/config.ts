import dotenv from 'dotenv';

dotenv.config(); // Loads environment variables from .env file

export const JWT_SECRET_KEY = process.env.JWT_SECRET || 'default-secret';  // Named export for JWT_SECRET_KEY
export const PORT = process.env.PORT || 3000;
export const HOST = process.env.HOST || 'localhost';