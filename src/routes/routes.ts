import { Router } from 'express';
import { signupUser, loginUser } from '../controllers/authController';
import { shortenUrl, getOriginalUrl, bulkCreateShortUrl } from '../controllers/urlController';
import {
    getUrlAnalytics,
    generateWeeklyReport,
} from '../controllers/analyticsController';
import { authenticateToken } from '../middlewares/auth';
import { rateLimit } from '../middlewares/ratelimit';

const router = Router();

// Route to sign up users
router.post('/signup', signupUser);

// Route to login users
router.post('/login', loginUser);

// Route to get URL analytics
router.get('/analytics', authenticateToken, getUrlAnalytics);

// Route to get the weekly report
router.get('/weekly-report', authenticateToken, generateWeeklyReport);

// Route to shorten a URL
router.post('/shorten', authenticateToken, rateLimit, shortenUrl);

// Route to get the original URL from a shortened URL
router.get('/:shortCode', authenticateToken, getOriginalUrl);

// Route to create short urls in bulk
router.post('/bulk-short-urls', rateLimit, bulkCreateShortUrl);

export default router;
