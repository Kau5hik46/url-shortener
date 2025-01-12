import { Pool } from 'pg';

// Creating a client pool for lazy loading resources
const pool = new Pool({
    user: 'kaushik',
    host: 'localhost',
    database: 'url_shortener',
    password: 'postgres',
    port: 5432,
});

export default pool;
