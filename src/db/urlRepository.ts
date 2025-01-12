import { Url } from '../models/Url'; // Import the Url model

// Insert a new URL into PostgreSQL
export async function createUrl(originalUrl: string, shortCode: string) {
    const newUrl = await Url.create({
        originalUrl,
        shortCode,
        clickCount: 0,
    });
    return newUrl;
}

// Fetch a URL by short code
export async function getUrlByShortCode(shortCode: string) {
    const url = await Url.findOne({ where: { shortCode } });
    return url;
}

// Update the click count for a given short code
export async function updateClickCount(
    shortCode: string,
    newClickCount: number,
) {
    const url = await Url.findOne({ where: { shortCode } });
    if (url) {
        url.clickCount = newClickCount;
        await url.save();
    }
}

export async function bulkInsert(bulkInsertData: Array<any>) {
    Url.bulkCreate(bulkInsertData, { ignoreDuplicates: true });
}