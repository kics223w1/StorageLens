
export interface CookieRecord {
    name: string;
    value: string;
    domain: string;
    path: string;
    expires: string | number;
    size: number;
    httpOnly: boolean;
    secure: boolean;
    sameSite: string;
}

export async function scanCookies(): Promise<CookieRecord[]> {
    if (typeof document === 'undefined') return [];
    
    // Use cookieStore API if available for more details
    // @ts-ignore - cookieStore is not yet in all TS libs
    if (window.cookieStore && window.cookieStore.getAll) {
        try {
            // @ts-ignore
            const cookies = await window.cookieStore.getAll();
            return cookies.map((c: any) => ({
                name: c.name,
                value: c.value,
                domain: c.domain || window.location.hostname,
                path: c.path || '/',
                expires: c.expires || 'Session',
                size: c.name.length + c.value.length, // Approximate
                httpOnly: false, // JS cannot see HttpOnly cookies
                secure: c.secure || false,
                sameSite: c.sameSite || 'Lax'
            }));
        } catch (e) {
            console.error("Failed to use cookieStore", e);
        }
    }

    if (!document.cookie) return [];

    return document.cookie.split(';').map(c => {
        const [name, ...v] = c.split('=');
        const key = name?.trim() || '';
        const val = v.join('=').trim();
        return {
            name: key,
            value: val,
            domain: window.location.hostname, // Fallback
            path: '/', // Fallback
            expires: 'Session', // Unknown
            size: key.length + val.length,
            httpOnly: false,
            secure: false,
            sameSite: '' 
        };
    }).filter(c => c.name);
}
