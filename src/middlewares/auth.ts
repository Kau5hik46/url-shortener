import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'your_secret_key'; // Use a secure secret from .env

// Generate JWT Token
export function generateToken(userId: string): string {
    const payload = { id: userId };
    const options = { expiresIn: '1h' }; // Token validity: 1 hour
    return jwt.sign(payload, JWT_SECRET, options);
}

// Middleware to Authenticate JWT Token
export function authenticateToken(req: Request, res: Response, next: NextFunction): void | Response {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ error: 'Unauthorized' });
    }

    const token = authHeader.split(' ')[1];
    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        (req as any).user = decoded; // Attach user info to the request
        next();
    } catch (err) {
        return res.status(403).json({ error: 'Forbidden' });
    }
}