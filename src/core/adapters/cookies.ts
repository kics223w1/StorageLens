
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

    let cookies: CookieRecord[] = [];
    const seenNames = new Set<string>();

    // 1. Try cookieStore API
    // @ts-ignore
    if (window.cookieStore && window.cookieStore.getAll) {
        try {
            // @ts-ignore
            const csCookies = await window.cookieStore.getAll();
            const mapped = csCookies.map((c: any) => ({
                name: c.name,
                value: c.value,
                domain: c.domain || window.location.hostname,
                path: c.path || '/',
                expires: c.expires || 'Session',
                size: c.name.length + c.value.length,
                httpOnly: false,
                secure: c.secure || false,
                sameSite: c.sameSite || 'Lax'
            }));

            mapped.forEach((c: CookieRecord) => {
                cookies.push(c);
                seenNames.add(c.name);
            });
        } catch (e) {
            console.error("Failed to use cookieStore", e);
        }
    }

    // 2. Fallback/Supplement with document.cookie
    if (document.cookie) {
        const docCookies = document.cookie.split(';').map(c => {
            const [name, ...v] = c.split('=');
            const key = name?.trim() || '';
            const val = v.join('=').trim();
            return {
                name: key,
                value: val,
                domain: window.location.hostname,
                path: '/',
                expires: 'Session',
                size: key.length + val.length,
                httpOnly: false,
                secure: false,
                sameSite: ''
            };
        }).filter(c => c.name && !seenNames.has(c.name)); // Avoid duplicates if found by cookieStore

        cookies = [...cookies, ...docCookies];
    }

    console.log(`[StorageLens] Scanned ${cookies.length} cookies`, cookies);
    return cookies;
}
