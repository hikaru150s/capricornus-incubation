import { appendFileSync, existsSync, mkdirSync } from 'fs';
import { EOL } from 'os';
import { join } from 'path';
import { GenericError } from '../errors';

export function errorLogger(logDir: string, error: Error | GenericError) {
  const now = new Date();
  existsSync(logDir) || mkdirSync(logDir);
  const targetFileName = `error-${now.getFullYear()}-${now.getMonth() + 1}-${now.getDate()}.log`;
  const dump = JSON.stringify(error, ['message', 'arguments', 'type', 'name', 'stack']) + EOL;
  appendFileSync(join(logDir, targetFileName), dump);
}
