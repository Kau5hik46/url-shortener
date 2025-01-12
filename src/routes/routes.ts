import { Router } from 'express';
import { shortenUrl, getOriginalUrl, getUrlAnalytics } from '../controllers/urlController';

const router = Router();

// Route to get URL analytics
router.get('/analytics', async (req, res) => {
    try {
        await getUrlAnalytics(req, res);
    } catch (error) {
        res.status(500).json({ error: 'An error occurred while fetching URL analytics' });
    }
});

// Route to shorten a URL
router.post('/shorten', async (req, res) => {
    try {
        await shortenUrl(req, res);
    } catch (error) {
        res.status(500).json({ error: 'An error occurred while shortening the URL' });
    }
});

// Route to get the original URL from a shortened URL
router.get('/:shortCode', async (req, res) => {
    try {
        await getOriginalUrl(req, res);
    } catch (error) {
        res.status(500).json({ error: 'An error occurred while fetching the original URL' });
    }
});

export default router;