/**
 * Forgiving listing search (Postel's law: be liberal in what you accept).
 *
 * - Ignores case, accents, punctuation and extra spaces ("  Ballantyne, " finds Ballantyne).
 * - Every word typed must match somewhere, in any order ("tutoring stem" works).
 * - Small typos are allowed on longer words: 1 for 4–7 letters, 2 for 8+ ("tutring", "ballantine").
 *   Words of 1–3 letters must match exactly as a prefix, so "AP" or "AI" don't match everything.
 * - Results are ranked: name matches first, then exact matches, then typo matches.
 *
 * No library: the hub has well under a few hundred listings, so a plain scan is instant.
 */

export function normalize(text: string): string {
    return text
        .normalize("NFD")
        .replace(/[̀-ͯ]/g, "")
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, " ")
        .trim();
}

/** Optimal-string-alignment edit distance (insert, delete, substitute, swap two neighbours), capped at `max`. */
function editDistance(a: string, b: string, max: number): number {
    if (Math.abs(a.length - b.length) > max) return max + 1;
    const rows: number[][] = [];
    for (let i = 0; i <= a.length; i++) {
        rows.push(new Array(b.length + 1).fill(0));
        rows[i][0] = i;
    }
    for (let j = 0; j <= b.length; j++) rows[0][j] = j;
    for (let i = 1; i <= a.length; i++) {
        let rowMin = Infinity;
        for (let j = 1; j <= b.length; j++) {
            const cost = a[i - 1] === b[j - 1] ? 0 : 1;
            let d = Math.min(rows[i - 1][j] + 1, rows[i][j - 1] + 1, rows[i - 1][j - 1] + cost);
            if (i > 1 && j > 1 && a[i - 1] === b[j - 2] && a[i - 2] === b[j - 1]) d = Math.min(d, rows[i - 2][j - 2] + 1);
            rows[i][j] = d;
            rowMin = Math.min(rowMin, d);
        }
        if (rowMin > max) return max + 1;
    }
    return rows[a.length][b.length];
}

const allowedTypos = (token: string) => (token.length >= 8 ? 2 : token.length >= 4 ? 1 : 0);

/** 3 = exact substring, 1 = typo match (word or word-prefix), 0 = no match. */
function tokenScore(token: string, text: string, words: string[]): number {
    if (text.includes(token)) return 3;
    const max = allowedTypos(token);
    if (max === 0) return 0;
    for (const word of words) {
        if (editDistance(token, word, max) <= max) return 1;
        // typo inside a longer word the user hasn't finished typing ("tutr" -> "tutoring")
        if (word.length > token.length && editDistance(token, word.slice(0, token.length), max) <= max) return 1;
    }
    return 0;
}

export type SearchField = { text: string | undefined | null; weight?: number };

/**
 * Scores one listing against a query. 0 means "doesn't match"; higher is a better match.
 * An empty query matches everything with score 1.
 */
export function matchScore(query: string, fields: SearchField[]): number {
    const tokens = normalize(query).split(" ").filter(Boolean);
    if (tokens.length === 0) return 1;
    const prepared = fields
        .filter((f) => f.text)
        .map((f) => {
            const text = normalize(f.text as string);
            return { text, words: text.split(" "), weight: f.weight ?? 1 };
        });

    let total = 0;
    for (const token of tokens) {
        let best = 0;
        for (const f of prepared) best = Math.max(best, tokenScore(token, f.text, f.words) * f.weight);
        if (best === 0) return 0; // every word typed has to match somewhere
        total += best;
    }
    return total;
}
