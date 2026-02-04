
export interface CookieRecord {
    name: string;
    value: string;
}

export function scanCookies(): CookieRecord[] {
    if (typeof document === 'undefined') return [];
    
    if (!document.cookie) return [];

    return document.cookie.split(';').map(c => {
        const [name, ...v] = c.split('=');
        return {
            name: name?.trim() || '',
            value: v.join('=').trim()
        };
    }).filter(c => c.name);
}
