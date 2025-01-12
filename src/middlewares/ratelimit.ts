import { Request, Response, NextFunction } from 'express';
import { getCache, setCache } from '../utils/cache'; // Assuming getCache and setCache are imported
import jwt from 'jsonwebtoken';
import {JWT_SECRET_KEY} from '../config';

const RATE_LIMIT = 10; // Max requests per minute
const RATE_LIMIT_WINDOW = 60; // Time window in seconds (1 minute)

// Rate limit middleware
export const rateLimit = async (
    req: Request,
    res: Response,
    next: NextFunction,
): Promise<void> => {
    try {
        // Extract the JWT token from the Authorization header
        const authHeader = req.headers.authorization;
        const token = authHeader && authHeader.split(' ')[1];
        if (!token) {
            res.status(401).json({ error: 'Missing or invalid token' });
            return;
        }
        // Decode the token to extract the username (userID or email could also be used)
        const decoded: any = jwt.verify(token, JWT_SECRET_KEY); // Assuming the token contains 'username'
        const email = decoded.email;

        // Check if the username exists
        if (!email) {
            res.status(401).json({ error: 'Token does not correspond to any user' });
            return;
        }

        // Check if the user has exceeded the rate limit
        const requestCountKey = `rate-limit:${email}`;
        const requestCount = await getCache(requestCountKey);

        if (requestCount && parseInt(requestCount) >= RATE_LIMIT) {
            // Exceeded rate limit
            res.status(429).json({
                error: 'Too many requests. Please try again later.',
            });
            return;
        }

        // Increment the request count for this user
        const currentCount = requestCount ? parseInt(requestCount) : 0;
        await setCache(
            requestCountKey,
            String(currentCount + 1),
            RATE_LIMIT_WINDOW,
        ); // Set cache with expiration time

        // Proceed to the next middleware/route handler
        next();
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Rate limit check failed' });
    }
};
