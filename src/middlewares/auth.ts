import { Request, Response, NextFunction, RequestHandler } from 'express';
import jwt, { JwtPayload } from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'your_secret_key'; // Use a secure secret from .env

// Generate JWT Token
export function generateToken(userId: string): string {
    const payload = { id: userId };
    const options = { expiresIn: '1h' }; // Token validity: 1 hour
    return jwt.sign(payload, JWT_SECRET, options);
}

// Define an extended Request type to include `user`
interface AuthenticatedRequest extends Request {
    user?: string | JwtPayload;
}

// Middleware to Authenticate JWT Token
export const authenticateToken: RequestHandler = (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        res.status(401).json({ error: 'No token provided' });
        return; // Ensure the function exits after sending the response
    }

    jwt.verify(token, process.env.JWT_SECRET || 'default-secret', (err: jwt.VerifyErrors | null, user: string | JwtPayload | undefined) => {
        if (err) {
            res.status(403).json({ error: 'Invalid token' });
            return;
        }
        req.user = user; // Populate req.user with decoded token payload
        next();
    });
}