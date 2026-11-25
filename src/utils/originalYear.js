// Ermittelt das ursprüngliche Release-Jahr eines Spotify-Tracks über MusicBrainz.
// Spotify liefert nur das Album-Datum (bei Remastern/Best-ofs also oft ein zu spätes Jahr).

const MB_BASE = 'https://musicbrainz.org/ws/2';
const WD_ENDPOINT = 'https://query.wikidata.org/sparql';
const CACHE_PREFIX = 'origYear_v3_';
const MB_DELAY_MS = 1100; // MusicBrainz erlaubt ca. 1 Anfrage pro Sekunde
const RETRY_DELAY_MS = 2000;

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

// ---- Request-Queue: alle MusicBrainz-Anfragen nacheinander, mit Mindestabstand ----
let queue = Promise.resolve();

const fetchOnce = async (url) => {
    const res = await fetch(url, { headers: { Accept: 'application/json' } });
    if (!res.ok) {
        const err = new Error(`MusicBrainz ${res.status}`);
        err.status = res.status;
        throw err;
    }
    return res.json();
};

const mbFetch = (url) => {
    const task = queue.then(async () => {
        try {
            try {
                return await fetchOnce(url);
            } catch (err) {
                if (err.status !== 503) throw err;
                await sleep(RETRY_DELAY_MS); // Rate-Limit: einmal wiederholen
                return await fetchOnce(url);
            }
        } finally {
            await sleep(MB_DELAY_MS);
        }
    });
    queue = task.catch(() => {}); // Queue läuft auch nach Fehlern weiter
    return task;
};

// ---- Hilfsfunktionen ----
// Entfernt Zusätze wie "- Remastered 2011", "(2009 Remaster)", "- Single Version"
const EXTRAS = /(remaster|version|edit|mono|stereo|mix|deluxe|anniversary|live|bonus)/i;
const cleanTitle = (title) => {
    const t = title
        .replace(/\s*[([][^)\]]*[)\]]/g, (m) => (EXTRAS.test(m) ? '' : m))
        .replace(/\s+[-–]\s+.*$/, (m) => (EXTRAS.test(m) ? '' : m));
    return t.trim() || title;
};

const lucene = (s) => s.replace(/["\\]/g, '');

const earliestYear = (items, minScore = 0) => {
    let min = null;
    for (const item of items || []) {
        if ((item.score ?? 100) < minScore) continue;
        const year = parseInt((item['first-release-date'] || '').slice(0, 4), 10);
        if (year && (min === null || year < min)) min = year;
    }
    return min;
};

// Interpretennamen vergleichbar machen: "Danny & the Juniors" ~ "Danny and the Juniors"
const normalizeArtist = (name) =>
    (name || '')
        .toLowerCase()
        .replace(/&/g, ' and ')
        .replace(/^\s*the\s+/, '')
        .replace(/[^a-z0-9]/g, '');

const sameArtist = (a, b) => {
    const x = normalizeArtist(a);
    const y = normalizeArtist(b);
    return !!x && !!y && (x.includes(y) || y.includes(x));
};

// Wikidata: Veröffentlichungsdatum (P577) von Songs/Singles mit passendem Interpreten (P175)
const wikidataYear = async (title, artist) => {
    const query = `
        SELECT ?date ?perfLabel WHERE {
          SERVICE wikibase:mwapi {
            bd:serviceParam wikibase:endpoint "www.wikidata.org";
                            wikibase:api "EntitySearch";
                            mwapi:search "${title}";
                            mwapi:language "en".
            ?item wikibase:apiOutputItem mwapi:item.
          }
          ?item wdt:P577 ?date;
                wdt:P175 ?perf.
          ?perf rdfs:label ?perfLabel.
          FILTER(LANG(?perfLabel) = "en")
        } LIMIT 50`;
    const url = `${WD_ENDPOINT}?format=json&query=${encodeURIComponent(query)}`;
    const res = await fetch(url);
    if (!res.ok) throw new Error(`Wikidata ${res.status}`);
    const data = await res.json();

    let min = null;
    for (const row of data.results?.bindings || []) {
        if (!sameArtist(row.perfLabel?.value, artist)) continue;
        const year = parseInt((row.date?.value || '').slice(0, 4), 10);
        if (year && (min === null || year < min)) min = year;
    }
    return min;
};

// Eine einzelne Abfrage; Fehler werden geschluckt (null), damit die anderen Quellen weiterlaufen
const safeLookup = async (fn) => {
    try {
        return { ok: true, year: await fn() };
    } catch (err) {
        console.warn('[Jahr] MusicBrainz-Abfrage fehlgeschlagen:', err.message);
        return { ok: false, year: null };
    }
};

// ---- Hauptfunktion ----
const inFlight = {};

export function getOriginalYear(track) {
    const cached = readCache(track.id);
    if (cached) return Promise.resolve(cached);

    // Dieselbe Anfrage nicht doppelt starten (z. B. React StrictMode)
    if (!inFlight[track.id]) {
        inFlight[track.id] = lookup(track).finally(() => {
            delete inFlight[track.id];
        });
    }
    return inFlight[track.id];
}

async function lookup(track) {
    const spotifyYear = parseInt(track.album.release_date.slice(0, 4), 10);
    const title = lucene(cleanTitle(track.name));
    const artist = lucene(track.artists?.[0]?.name || '');
    const isrc = track.external_ids?.isrc;

    // Wikidata läuft parallel zur MusicBrainz-Queue (anderer Dienst, eigenes Rate-Limit)
    const wikidataPromise = safeLookup(() => wikidataYear(title, artist));

    // a) ISRC-Lookup
    const byIsrc = isrc
        ? await safeLookup(async () => {
              const data = await mbFetch(`${MB_BASE}/isrc/${encodeURIComponent(isrc)}?fmt=json`);
              return earliestYear(data.recordings);
          })
        : { ok: false, year: null };

    // b) Single-Suche (bei Hits meist das Originaljahr)
    const bySingle = await safeLookup(async () => {
        const q = encodeURIComponent(
            `releasegroup:"${title}" AND artist:"${artist}" AND primarytype:single`
        );
        const data = await mbFetch(`${MB_BASE}/release-group?query=${q}&fmt=json&limit=25`);
        return earliestYear(data['release-groups'], 90);
    });

    // c) Recording-Suche, nur Aufnahmen vor dem Spotify-Jahr (blendet Compilation-Duplikate aus)
    const byRecording = await safeLookup(async () => {
        const q = encodeURIComponent(
            `recording:"${title}" AND artist:"${artist}" AND firstreleasedate:[* TO ${spotifyYear - 1}]`
        );
        const data = await mbFetch(`${MB_BASE}/recording?query=${q}&fmt=json&limit=100`);
        return earliestYear(data.recordings, 90);
    });

    const byWikidata = await wikidataPromise;

    const candidates = [
        spotifyYear,
        byIsrc.year,
        bySingle.year,
        byRecording.year,
        byWikidata.year,
    ].filter((y) => y !== null);
    const result = String(Math.min(...candidates));

    console.info('[Jahr]', track.name, {
        spotify: spotifyYear,
        isrc: byIsrc.year,
        single: bySingle.year,
        recording: byRecording.year,
        wikidata: byWikidata.year,
        result,
    });

    // Nur cachen, wenn mindestens eine Abfrage erfolgreich war
    if (byIsrc.ok || bySingle.ok || byRecording.ok || byWikidata.ok) {
        writeCache(track.id, result);
    }
    return result;
}
