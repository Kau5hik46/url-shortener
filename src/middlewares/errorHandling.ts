import { Request, Response, NextFunction } from 'express';

interface AppError extends Error {
    status?: number; // Optional status code for custom errors
}

// Centralized Error Handler
export function errorHandler(err: AppError, req: Request, res: Response, next: NextFunction): void {
    const isProduction = process.env.NODE_ENV === 'production';

    // Log the error stack in development for debugging
    if (!isProduction) {
        console.error(err.stack);
    }

    // Determine the status code
    const statusCode = err.status || 500;

    // Send different responses for development and production
    if (isProduction) {
        res.status(statusCode).json({
            error: 'Something went wrong! Please try again later.',
        });
    } else {
        res.status(statusCode).json({
            error: err.message || 'Internal Server Error',
            stack: err.stack,
        });
    }
}