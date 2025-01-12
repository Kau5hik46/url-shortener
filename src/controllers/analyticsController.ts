import { Request, Response } from 'express';
import { Op } from 'sequelize';
import { Url } from '../models/Url';
import { getCache, setCache } from '../utils/cache';

// Get analytics for all URLs
export const getUrlAnalytics = async (
    req: Request,
    res: Response,
): Promise<void> => {
    try {
        // Check if analytics data is cached
        const cachedAnalytics = await getCache('analytics');
        if (cachedAnalytics) {
            res.status(200).json(JSON.parse(cachedAnalytics));
            return;
        }

        // Get total number of shortened URLs
        const totalUrls = await Url.count();

        // Find most accessed and least accessed URLs
        const mostAccessed = await Url.findOne({
            order: [['clickCount', 'DESC']],
        });
        const leastAccessed = await Url.findOne({
            order: [['clickCount', 'ASC']],
        });

        const analyticsData = {
            totalUrls,
            mostAccessed,
            leastAccessed,
        };

        // Cache analytics data for 10 minutes
        await setCache('analytics', JSON.stringify(analyticsData), 600);

        res.status(200).json(analyticsData);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to fetch analytics' });
    }
};

export const generateWeeklyReport = async (
    req: Request,
    res: Response,
): Promise<void> => {
    try {
        const oneWeekAgo = new Date();
        oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

        const totalUrls = await Url.count({
            where: { createdAt: { [Op.gte]: oneWeekAgo } },
        });

        const totalClicks = await Url.sum('clickCount', {
            where: { createdAt: { [Op.gte]: oneWeekAgo } },
        });

        res.status(200).json({
            totalUrlsCreated: totalUrls,
            totalClicks,
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to generate weekly report' });
    }
};
