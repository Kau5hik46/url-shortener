import { Request, Response } from 'express';
import { generateShortCodeFromUrl } from '../utils/hash';
import { Url } from '../models/Url';
import redis from '../redisClient';
import { hostname } from 'os';

import dotenv from 'dotenv';

dotenv.config();

const PORT = process.env.PORT;
const HOST = process.env.HOSTNAME;

// Shorten a given URL and return the shortened version
export const shortenUrl = async (req: Request, res: Response): Promise<void> => {
    try {
        const { originalUrl } = req.body;

        if (!originalUrl) {
            res.status(400).json({ error: 'Original URL is required' });
            return;
        }

        // Check if the URL is already shortened (cached)
        const cachedShortCode = await redis.get(originalUrl);
        if (cachedShortCode) {
            res.status(200).json({ shortUrl: `http://${HOST}:${PORT}/${cachedShortCode}` });
            return;
        }

        // Generate short code
        const shortCode = generateShortCodeFromUrl(originalUrl);

        // Store the URL in the database
        const newUrl = await Url.upsert({
            originalUrl,
            shortCode,
            createdAt: new Date(),
            clickCount: 0
        });

        // Cache the short code with the original URL as the key
        await redis.set(originalUrl, shortCode, 'EX', 3600); // Expires in 1 hour

        res.status(201).json({ shortUrl: `http://${HOST}:${PORT}/${shortCode}` });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to shorten URL' });
    }
};

// Get the original URL using the short code
export const getOriginalUrl = async (req: Request, res: Response): Promise<void> => {
    try {
        const { shortCode } = req.params;

        // Check if the original URL is cached
        const cachedUrl = await redis.get(shortCode);
        if (cachedUrl) {
            // Increment the click count in the database and cache
            const url = await Url.findOne({ where: { shortCode } });
            if (url) {
                url.clickCount += 1;
                await url.save();
            }

            // Redirect to the cached original URL
            res.redirect(cachedUrl);
            return;
        }

        // Find the URL based on the short code
        const url = await Url.findOne({ where: { shortCode } });

        if (!url) {
            res.status(404).json({ error: 'Shortened URL not found' });
            return;
        }

        // Cache the original URL with the short code as the key
        await redis.set(shortCode, url.originalUrl, 'EX', 3600); // Expires in 1 hour

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

// Get analytics for all URLs
export const getUrlAnalytics = async (req: Request, res: Response): Promise<void> => {
    try {
        // Check if analytics data is cached
        const cachedAnalytics = await redis.get('analytics');
        if (cachedAnalytics) {
            res.status(200).json(JSON.parse(cachedAnalytics));
            return;
        }

        // Get total number of shortened URLs
        const totalUrls = await Url.count();

        // Find most accessed and least accessed URLs
        const mostAccessed = await Url.findOne({ order: [['clickCount', 'DESC']] });
        const leastAccessed = await Url.findOne({ order: [['clickCount', 'ASC']] });

        const analyticsData = {
            totalUrls,
            mostAccessed,
            leastAccessed
        };

        // Cache analytics data for 10 minutes
        await redis.set('analytics', JSON.stringify(analyticsData), 'EX', 600);

        res.status(200).json(analyticsData);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to fetch analytics' });
    }
};