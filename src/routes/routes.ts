import express from 'express';

const router = express.Router();

// Shorten a URL
router.post('/shorten', authenticateToken, rateLimiter, shortenUrlHandler);

// Redirect to the original URL
router.get('/:shortCode', getOriginalUrlHandler);

// Get analytics
router.get('/analytics', authenticateToken, getAnalyticsHandler);

export default router;