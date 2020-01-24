export const DEVMODE: boolean = process.env.DEVMODE === 'true';
export const PEPPER: string = process.env.PEPPER || 'M)}F4D1E]m|(+9ac';
export const JWT_SECRET: string = process.env.JWT_SECRET || '>D#FtQ$i=fieQ7*#3K~AKO.q:<JlGbS7';
export const FORCE_DB: boolean = process.env.FORCE_DB ? process.env.FORCE_DB === 'true' : true;
