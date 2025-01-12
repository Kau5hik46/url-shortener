import { Request, Response } from 'express';
import { Url } from '../models/Url';
import redis from '../redisClient';

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