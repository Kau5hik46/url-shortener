import { Request, Response } from 'express';
import { generateShortCodeFromUrl } from '../utils/hash';
import { createUrl, getUrlByShortCode } from '../db/urlRepository';

import dotenv from 'dotenv';
import { getCache, setCache } from '../utils/cache';

dotenv.config();

const PORT = process.env.PORT;
const HOST = process.env.HOSTNAME;

// Shorten a given URL and return the shortened version
export const shortenUrl = async (
    req: Request,
    res: Response,
): Promise<void> => {
    try {
        const { originalUrl } = req.body;

        if (!originalUrl) {
            res.status(400).json({ error: 'Original URL is required' });
            return;
        }

        // Check if the URL is already shortened (cached)
        const cachedShortCode = await getCache(originalUrl);
        if (cachedShortCode) {
            res.status(200).json({
                shortUrl: `http://${HOST}:${PORT}/${cachedShortCode}`,
            });
            return;
        }

        // Generate short code and store in database
        const shortCode = generateShortCodeFromUrl(originalUrl);
        const newUrl = createUrl(originalUrl, shortCode);

        await setCache(originalUrl, shortCode, 3600);

        res.status(201).json({
            shortUrl: `http://${HOST}:${PORT}/${shortCode}`,
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to shorten URL' });
    }
};

// Get the original URL using the short code
export const getOriginalUrl = async (
    req: Request,
    res: Response,
): Promise<void> => {
    try {
        const { shortCode } = req.params;

        // Check if the original URL is cached
        const cachedUrl = await getCache(shortCode);
        if (cachedUrl) {
            // Increment the click count in the database and cache
            const url = await getUrlByShortCode(shortCode);
            if (url) {
                url.clickCount += 1;
                await url.save();
            }

            // Redirect to the cached original URL
            res.redirect(cachedUrl);
            return;
        }

        // Find the URL based on the short code
        const url = await getUrlByShortCode(shortCode);

        if (!url) {
            res.status(404).json({ error: 'Shortened URL not found' });
            return;
        }

        // Cache the original URL with the short code as the key
        await setCache(shortCode, url.originalUrl, 3600); // Expires in 1 hour

        // Increment the click count
        url.clickCount += 1;
        await url.save();

        // Redirect to the original URL
        res.redirect(url.originalUrl);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to retrieve original URL' });
    }
};
