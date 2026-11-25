// Ermittelt das ursprüngliche Release-Jahr eines Spotify-Tracks über MusicBrainz.
// Spotify liefert nur das Album-Datum (bei Remastern/Best-ofs also oft ein zu spätes Jahr).

const MB_BASE = 'https://musicbrainz.org/ws/2';
const CACHE_PREFIX = 'origYear_';
const MB_DELAY_MS = 1100; // MusicBrainz erlaubt ca. 1 Anfrage pro Sekunde

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const readCache = (id) => {
    try {
        return localStorage.getItem(CACHE_PREFIX + id);
    } catch {
        return null;
    }
};

const writeCache = (id, year) => {
    try {
        localStorage.setItem(CACHE_PREFIX + id, year);
    } catch {
        // localStorage nicht verfügbar – ignorieren
    }
};

// Entfernt Zusätze wie "- Remastered 2011", "(2009 Remaster)", "- Single Version"
const EXTRAS = /(remaster|version|edit|mono|stereo|mix|deluxe|anniversary|live|bonus)/i;
const cleanTitle = (title) => {
    let t = title
        .replace(/\s*[([][^)\]]*[)\]]/g, (m) => (EXTRAS.test(m) ? '' : m))
        .replace(/\s+[-–]\s+.*$/, (m) => (EXTRAS.test(m) ? '' : m));
    return t.trim() || title;
};

const earliestYear = (recordings) => {
    let min = null;
    for (const rec of recordings || []) {
        const year = parseInt((rec['first-release-date'] || '').slice(0, 4), 10);
        if (year && (min === null || year < min)) min = year;
    }
    return min;
};

const mbFetch = async (url) => {
    const res = await fetch(url, { headers: { Accept: 'application/json' } });
    if (!res.ok) throw new Error(`MusicBrainz ${res.status}`);
    return res.json();
};

export async function getOriginalYear(track) {
    const spotifyYear = parseInt(track.album.release_date.slice(0, 4), 10);

    const cached = readCache(track.id);
    if (cached) return cached;

    try {
        let found = null;

        const isrc = track.external_ids?.isrc;
        if (isrc) {
            const data = await mbFetch(`${MB_BASE}/isrc/${encodeURIComponent(isrc)}?fmt=json`);
            found = earliestYear(data.recordings);
            await sleep(MB_DELAY_MS);
        }

        if (found === null) {
            const title = cleanTitle(track.name).replace(/"/g, '');
            const artist = (track.artists?.[0]?.name || '').replace(/"/g, '');
            const query = encodeURIComponent(`recording:"${title}" AND artist:"${artist}"`);
            const data = await mbFetch(`${MB_BASE}/recording?query=${query}&fmt=json&limit=15`);
            const good = (data.recordings || []).filter((r) => (r.score ?? 0) >= 90);
            found = earliestYear(good);
        }

        const result = String(found !== null ? Math.min(found, spotifyYear) : spotifyYear);
        writeCache(track.id, result);
        return result;
    } catch (err) {
        console.warn('Original-Jahr konnte nicht ermittelt werden:', err);
        return String(spotifyYear);
    }
}
