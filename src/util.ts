import fs from 'fs/promises';

export async function file_exists(path: string): Promise<boolean> {
    try {
        await fs.access(path);
        return true;
    } catch (err) {
        return false;
    }
}

export const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

