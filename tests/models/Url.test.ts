import { Sequelize } from 'sequelize';
import { Url } from '../../src/models/Url';
import { sequelize } from '../../src/db/sequelize';

describe('Url Model Tests with PostgreSQL', () => {
    // Setup the test database before all tests
    beforeAll(async () => {
        await sequelize.authenticate(); // Test the connection to the database
        await sequelize.sync({ force: true }); // Re-create tables before each test
    });

    // Clean up the table after each test
    afterEach(async () => {
        await Url.truncate(); // Clean the Url table
    });

    // Close the connection after all tests
    afterAll(async () => {
        await sequelize.close();
    });

    test('should create a new URL entry', async () => {
        const originalUrl = 'http://example.com';
        const shortCode = 'abc123';

        const url = await Url.create({
            originalUrl,
            shortCode,
            clickCount: 0,
        });

        expect(url).toHaveProperty('id');
        expect(url.originalUrl).toBe(originalUrl);
        expect(url.shortCode).toBe(shortCode);
        expect(url.clickCount).toBe(0);
    });

    test('should fetch a URL by short code', async () => {
        const originalUrl = 'http://example.com';
        const shortCode = 'abc123';

        // Create the URL first
        await Url.create({
            originalUrl,
            shortCode,
            clickCount: 0,
        });

        const url = await Url.findOne({ where: { shortCode } });

        expect(url).toBeDefined();
        expect(url!.originalUrl).toBe(originalUrl);
        expect(url!.shortCode).toBe(shortCode);
    });

    test('should update the click count of a URL', async () => {
        const originalUrl = 'http://example.com';
        const shortCode = 'abc123';

        // Create the URL first
        const url = await Url.create({
            originalUrl,
            shortCode,
            clickCount: 0,
        });

        // Update the click count
        await url.update({ clickCount: 5 });

        const updatedUrl = await Url.findOne({ where: { shortCode } });

        expect(updatedUrl).toBeDefined();
        expect(updatedUrl!.clickCount).toBe(5);
    });

    test('should return null for non-existing URL by short code', async () => {
        const shortCode = 'nonexistent';

        const url = await Url.findOne({ where: { shortCode } });

        expect(url).toBeNull();
    });
});
