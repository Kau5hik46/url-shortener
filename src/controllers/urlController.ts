import { Request, Response } from 'express';
import { generateShortCodeFromUrl } from '../utils/hash';
import { bulkInsert, createUrl, getUrlByShortCode } from '../db/urlRepository';
import { getCache, setCache } from '../utils/cache';
import { HOST, PORT } from '../config';


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

export const bulkCreateShortUrl = async (req: Request, res: Response): Promise<void> => {
    try {
        const { urls } = req.body;

        if (!Array.isArray(urls) || urls.length === 0) {
            res.status(400).json({ error: 'URLs should be a non-empty array.' });
            return;
        }

        const result = [];
        const bulkInsertData = [];

        for (const originalUrl of urls) {
            if (!originalUrl) continue;

            // Check cache for an existing short code
            const cachedShortCode = await getCache(originalUrl);
            if (cachedShortCode) {
                result.push({ originalUrl, shortUrl: `http://${HOST}:${PORT}/${cachedShortCode}` });
                continue;
            }

            // Generate short code
            const shortCode = generateShortCodeFromUrl(originalUrl);

            // Add to bulk insert data
            bulkInsertData.push({
                originalUrl,
                shortCode,
                createdAt: new Date(),
                clickCount: 0,
            });

            // Cache the result
            await setCache(originalUrl, shortCode, 3600); // Cache for 1 hour

            result.push({ originalUrl, shortUrl: `http://${HOST}:${PORT}/${shortCode}` });
        }

        // Bulk insert into the database
        if (bulkInsertData.length > 0) {
            await bulkInsert(bulkInsertData) // Sequelize bulk insert
        }

        res.status(201).json({ data: result });
    } catch (error) {
        console.error('Error in bulkCreateShortUrl:', error);
        res.status(500).json({ error: 'Failed to process the request.' });
    }
};