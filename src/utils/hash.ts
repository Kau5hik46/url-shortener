import * as crypto from 'crypto';

function generateShortCodeFromUrl(url: string): string {
    // Create a md5 hash of the URL and take hex encoded value
    const hash = crypto.createHash('md5').update(url).digest('hex');

    // Return the first 6 characters as the short code
    return hash.substring(0, 6); // Take the first 6 characters of the URL-safe base64 hash
}

console.log(generateShortCodeFromUrl('http://localhost/crypt')); // Example usage

export { generateShortCodeFromUrl };