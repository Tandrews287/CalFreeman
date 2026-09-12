import http from 'http';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const PORT = process.env.PORT || 8080;

import subscribeHandler from './api/subscribe.js';
import requestViewingHandler from './api/request-viewing.js';
import resolveRequestHandler from './api/resolve-request.js';

const MIME_TYPES = {
    '.html': 'text/html; charset=utf-8',
    '.css': 'text/css; charset=utf-8',
    '.js': 'text/javascript; charset=utf-8',
    '.mjs': 'text/javascript; charset=utf-8',
    '.json': 'application/json; charset=utf-8',
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.gif': 'image/gif',
    '.svg': 'image/svg+xml',
    '.ico': 'image/x-icon',
    '.otf': 'font/otf',
    '.ttf': 'font/ttf',
    '.woff': 'font/woff',
    '.woff2': 'font/woff2',
    '.mp4': 'video/mp4'
};

const server = http.createServer(async (req, res) => {
    const parsedUrl = new URL(req.url, `http://${req.headers.host || 'localhost'}`);
    let pathname = parsedUrl.pathname;

    const enhanceResponse = (r) => {
        r.status = (code) => {
            r.statusCode = code;
            return r;
        };
        r.json = (data) => {
            r.setHeader('Content-Type', 'application/json; charset=utf-8');
            r.end(JSON.stringify(data));
            return r;
        };
        r.send = (data) => {
            if (typeof data === 'object') {
                return r.json(data);
            }
            if (!r.getHeader('Content-Type')) {
                r.setHeader('Content-Type', 'text/html; charset=utf-8');
            }
            r.end(data);
            return r;
        };
        return r;
    };

    const parseBody = () => new Promise((resolve) => {
        let body = '';
        req.on('data', chunk => { body += chunk; });
        req.on('end', () => {
            try {
                resolve(body ? JSON.parse(body) : {});
            } catch {
                resolve({});
            }
        });
    });

    enhanceResponse(res);

    // API Handlers
    if (pathname === '/api/subscribe') {
        req.body = await parseBody();
        req.query = Object.fromEntries(parsedUrl.searchParams);
        return subscribeHandler(req, res);
    }
    if (pathname === '/api/request-viewing') {
        req.body = await parseBody();
        req.query = Object.fromEntries(parsedUrl.searchParams);
        return requestViewingHandler(req, res);
    }
    if (pathname === '/api/resolve-request') {
        req.body = await parseBody();
        req.query = Object.fromEntries(parsedUrl.searchParams);
        return resolveRequestHandler(req, res);
    }

    // Static files
    if (pathname === '/') pathname = '/index.html';
    const filePath = path.join(__dirname, decodeURIComponent(pathname));

    if (!filePath.startsWith(__dirname)) {
        res.status(403).send('Forbidden');
        return;
    }

    fs.stat(filePath, (err, stats) => {
        if (err || !stats.isFile()) {
            res.status(404).send('Not Found');
            return;
        }

        const ext = path.extname(filePath).toLowerCase();
        const contentType = MIME_TYPES[ext] || 'application/octet-stream';
        res.setHeader('Content-Type', contentType);
        fs.createReadStream(filePath).pipe(res);
    });
});

server.listen(PORT, () => {
    console.log(`Server listening at http://localhost:${PORT}`);
});
