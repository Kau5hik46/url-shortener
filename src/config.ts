import dotenv from 'dotenv';

dotenv.config(); // Loads environment variables from .env file

const config = {
    JWT_SECRET_KEY: process.env.JWT_SECRET || 'default-secret', // Default value for JWT_SECRET if not set
    PORT: process.env.PORT || 3000,
    HOST: process.env.HOST || 'localhost',
    // Add other environment variables you need here
};

export default config;
