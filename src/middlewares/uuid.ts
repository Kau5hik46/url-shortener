import { Request, Response, NextFunction } from 'express';
import { v4 as uuidv4 } from 'uuid';

export function identifyUser(
    req: Request,
    res: Response,
    next: NextFunction,
): void {
    // Check for existing user identifier in cookies
    const userId = req.cookies['userId'];

    if (!userId) {
        // Generate a new UUID and set it in cookies
        const newUserId = uuidv4();
        res.cookie('userId', newUserId, {
            httpOnly: true, // Prevent JavaScript access to cookies
            secure: process.env.NODE_ENV === 'production', // Use secure cookies in production
            maxAge: 30 * 24 * 60 * 60 * 1000, // Cookie valid for 30 days
        });
        req.userId = newUserId; // Attach the new user ID to the request
    } else {
        req.userId = userId; // Attach existing user ID to the request
    }

    next();
}
