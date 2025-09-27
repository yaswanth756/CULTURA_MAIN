// utils/requestTimer.js
import fs from 'fs';
import path from 'path';

const ensureLogDir = (dir) => {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
};

const formatDate = (d = new Date()) => {
  const pad = (n) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
};

export const requestTimer = (options = {}) => {
  const logDir = options.dir || path.join(process.cwd(), 'logs');
  ensureLogDir(logDir);

  return (req, res, next) => {
    const start = process.hrtime.bigint();
    const startedAt = new Date().toISOString();

    // Capture response size
    let bytesWritten = 0;
    const origWrite = res.write;
    const origEnd = res.end;

    res.write = function (chunk, ...args) {
      if (chunk) bytesWritten += Buffer.byteLength(chunk);
      return origWrite.call(this, chunk, ...args);
    };

    res.end = function (chunk, ...args) {
      if (chunk) bytesWritten += Buffer.byteLength(chunk);
      const diffNs = Number(process.hrtime.bigint() - start); // ns
      const ms = (diffNs / 1e6).toFixed(1);

      const logLine = JSON.stringify({
        ts: startedAt,
        method: req.method,
        path: req.originalUrl || req.url,
        status: res.statusCode,
        ms: Number(ms),
        size: bytesWritten, // bytes
        ip: req.ip,
        ua: req.headers['user-agent'],
      }) + '\n';

      try {
        const file = path.join(logDir, `api-${formatDate()}.log`);
        fs.appendFile(file, logLine, (err) => {
          if (err) console.error('log write error:', err.message);
        });
      } catch (e) {
        console.error('log error:', e.message);
      }

      return origEnd.call(this, chunk, ...args);
    };

    next();
  };
};
