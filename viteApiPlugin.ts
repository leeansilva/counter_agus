import type { Plugin } from 'vite';
import fs from 'fs';
import path from 'path';

const DB_FILE = path.resolve(process.cwd(), 'database.json');

// Initialize database if it doesn't exist
if (!fs.existsSync(DB_FILE)) {
    fs.writeFileSync(DB_FILE, JSON.stringify({}));
}

const readDb = () => {
    try {
        const data = fs.readFileSync(DB_FILE, 'utf-8');
        return JSON.parse(data);
    } catch (e) {
        return {};
    }
};

const writeDb = (data: any) => {
    fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2));
};

export const localApiPlugin = (): Plugin => ({
    name: 'configure-server',
    configureServer(server) {
        server.middlewares.use('/api', (req, res, next) => {
            // Setup CORS headers
            res.setHeader('Access-Control-Allow-Origin', '*');
            res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');

            if (req.method === 'OPTIONS') {
                res.statusCode = 204;
                res.end();
                return;
            }

            const url = new URL(req.url || '/', `http://${req.headers.host}`);
            const pathname = url.pathname;

            // GET /api/count/:key
            if (req.method === 'GET' && !pathname.endsWith('/up')) {
                const key = pathname.replace('/', '');
                if (!key) return next();

                const db = readDb();
                res.setHeader('Content-Type', 'application/json');
                res.end(JSON.stringify({ count: db[key] || 0 }));
                return;
            }

            // GET /api/count/:key/up (or POST)
            if (pathname.endsWith('/up')) {
                const key = pathname.replace('/up', '').replace('/', '');
                const db = readDb();
                db[key] = (db[key] || 0) + 1;
                writeDb(db);

                res.setHeader('Content-Type', 'application/json');
                res.end(JSON.stringify({ count: db[key] }));
                return;
            }

            next();
        });
    }
});
