import http from 'k6/http';
import { check } from 'k6';
import { BASE_URL, discoverSlugs, randomItem, thinkTime, defaultParams } from '../config.js';

// ────────────────────────────────────────────────────────
// PUBLIC BROWSING SCENARIO
// ────────────────────────────────────────────────────────
// Models a realistic public visitor flow:
//
//   1. Visit homepage (gallery listing)
//   2. Think-time (1–3s)
//   3. Click a random project
//   4. ~30% chance: submit a rating (POST evaluation)
//   5. Think-time (2–4s)
//   6. Return to homepage
//   7. Think-time (1–2s)
//   8. Click a different project
//   9. Think-time (2–4s)
//
// This represents ~4–5 page views per iteration, which
// is typical for a gallery/portfolio browsing session.
// The evaluation step exercises the primary write path
// (cache invalidation, DB writes, observer aggregates).
// ────────────────────────────────────────────────────────

export function setup() {
    // 0. Discover real slugs from the homepage before starting VUs
    const slugs = discoverSlugs();
    return { slugs };
}

/**
 * Extract the XSRF-TOKEN from the Set-Cookie header of a response.
 * Returns the decoded token string, or null if not found.
 */
function extractXsrfToken(res) {
    const setCookies = res.headers['Set-Cookie'];
    if (!setCookies) return null;

    const cookies = Array.isArray(setCookies) ? setCookies : [setCookies];
    for (const c of cookies) {
        const match = c.match(/XSRF-TOKEN=([^;]+)/);
        if (match) return decodeURIComponent(match[1]);
    }
    return null;
}

/**
 * Attempt to submit a rating for a project.
 * Each k6 VU iteration gets a fresh cookie jar, so the visitor_token
 * cookie is unique per iteration — POSTs will succeed (no duplicates).
 */
function maybeEvaluate(slug, xsrfToken) {
    // Only ~30% of project views result in a rating (realistic)
    if (Math.random() > 0.3) return;

    const rating = Math.floor(Math.random() * 5) + 1; // 1–5

    const headers = {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Accept': 'text/html,application/xhtml+xml',
        'User-Agent': 'k6-load-test/1.0',
    };

    if (xsrfToken) {
        headers['X-XSRF-TOKEN'] = xsrfToken;
    }

    const res = http.post(
        `${BASE_URL}/p/${slug}/evaluate`,
        { rating: rating },
        { headers, redirects: 5 }
    );

    check(res, {
        'evaluate: status 200 or 302': (r) => r.status === 200 || r.status === 302,
    });
}

export function browsingScenario(data) {
    const params = defaultParams();
    const slugs = data && data.slugs && data.slugs.length > 0 ? data.slugs : ['fallback'];

    // 1. Homepage
    const homeRes = http.get(`${BASE_URL}/`, params);
    check(homeRes, {
        'home: status 200': (r) => r.status === 200,
    });

    // Capture XSRF token for POST requests
    const xsrfToken = extractXsrfToken(homeRes);

    thinkTime(1, 3);

    // 2. Random project detail
    const slug1 = randomItem(slugs);
    const proj1Res = http.get(`${BASE_URL}/p/${slug1}`, params);
    check(proj1Res, {
        'project 1: status 200': (r) => r.status === 200,
    });

    // 3. Maybe submit a rating (~30% of views)
    maybeEvaluate(slug1, xsrfToken);

    thinkTime(2, 4);

    // 4. Back to homepage
    const homeRes2 = http.get(`${BASE_URL}/`, params);
    check(homeRes2, {
        'home return: status 200': (r) => r.status === 200,
    });

    thinkTime(1, 2);

    // 5. Different project
    let slug2 = randomItem(slugs);
    // Try to pick a different project
    if (slug2 === slug1 && slugs.length > 1) {
        slug2 = slugs[(slugs.indexOf(slug1) + 1) % slugs.length];
    }
    const proj2Res = http.get(`${BASE_URL}/p/${slug2}`, params);
    check(proj2Res, {
        'project 2: status 200': (r) => r.status === 200,
    });

    thinkTime(2, 4);
}

// Allow running this scenario directly for debugging: `k6 run tests/load/scenarios/browsing.js`
export default function (data) {
    browsingScenario(data);
}

