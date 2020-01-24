import { existsSync, mkdirSync } from 'fs';
import * as morgan from 'morgan';
import rfs from 'rotating-file-stream';

export function morganLogRotator(logDir: string) {
  existsSync(logDir) || mkdirSync(logDir);
  const accessLogStream = rfs('access.log', {
    'interval': '1d',
    'path': logDir,
  });
  return morgan.token('remote-addr', (req, _res) => req.headers['x-real-ip'] as string || req.ip)('common', {
    'stream': accessLogStream,
  });
}
