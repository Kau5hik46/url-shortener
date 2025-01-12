import { generateShortCodeFromUrl } from '../../src/utils/hash';

describe('generateShortCodeFromUrl', () => {
    it('should generate a valid short code for a given URL', () => {
        const url = 'http://localhost/crypt';
        const shortCode = generateShortCodeFromUrl(url);

        // Assert that the short code is a string with 6 characters
        expect(shortCode).toHaveLength(6);
        expect(typeof shortCode).toBe('string');
    });

    it('should generate the same short code for the same URL', () => {
        const url = 'http://localhost/crypt';
        const shortCode1 = generateShortCodeFromUrl(url);
        const shortCode2 = generateShortCodeFromUrl(url);

        // Assert that the short codes are identical for the same URL
        expect(shortCode1).toBe(shortCode2);
    });

    it('should generate different short codes for different URLs', () => {
        const url1 = 'http://localhost/crypt';
        const url2 = 'http://localhost/crypt2';
        const shortCode1 = generateShortCodeFromUrl(url1);
        const shortCode2 = generateShortCodeFromUrl(url2);

        // Assert that the short codes are different for different URLs
        expect(shortCode1).not.toBe(shortCode2);
    });
});
