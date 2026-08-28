import http from 'k6/http';
import { sleep } from 'k6';

// ────────────────────────────────────────────────────────
// Shared configuration for all k6 load tests
// ────────────────────────────────────────────────────────

// Base URL — override via env: K6_BASE_URL=https://gallery.test k6 run ...
export const BASE_URL = __ENV.BASE_URL || 'https://gallery.test';

// Test account credentials — never hardcoded in repo
export const TEST_EMAIL = __ENV.TEST_EMAIL || 'loadtest@example.com';
export const TEST_PASSWORD = __ENV.TEST_PASSWORD || 'loadtest-password';

// A sample of published project slugs for realistic browsing scenarios.
// These are seeded by LoadTestSeeder. If slugs change, update this list.
// Fallback slugs — used only if dynamic extraction from homepage fails.
// These are regenerated each time LoadTestSeeder runs, so update if needed.
export let PROJECT_SLUGS = [
    'quis-quaerat-animi-quis-ab-dolor-sit-omnis-voluptatem',
    'autem-debitis-voluptatem-harum-aliquid-qui',
    'minus-porro-architecto-debitis-qui-adipisci-non-velit-veritatis',
    'corrupti-maxime-consequatur-in-atque-placeat-dicta',
    'repudiandae-ut-qui-in-cupiditate-sed-est',
    'facilis-et-dolorem-sapiente-et-corporis-totam-molestiae',
];

/**
 * Dynamically extract project slugs from the homepage HTML.
 * Call this in setup() to populate PROJECT_SLUGS from real data.
 */
export function discoverSlugs() {
    const res = http.get(`${BASE_URL}/`, {
        headers: { 'Accept': 'text/html' },
        redirects: 5,
    });
    if (res.status === 200 && res.body) {
        // Inertia embeds page data as JSON; extract slugs from "slug":"..."
        const matches = res.body.match(/"slug":"([^"]+)"/g);
        if (matches && matches.length > 0) {
            const slugs = [...new Set(matches.map(m => m.replace(/"slug":"|"/g, '')))];
            if (slugs.length > 0) {
                return slugs;
            }
        }
    }
    return PROJECT_SLUGS;
}

/**
 * Pick a random element from an array.
 */
export function randomItem(arr) {
    return arr[Math.floor(Math.random() * arr.length)];
}

/**
 * Simulate realistic user think-time between actions.
 * @param {number} minSeconds
 * @param {number} maxSeconds
 */
export function thinkTime(minSeconds = 1, maxSeconds = 3) {
    sleep(minSeconds + Math.random() * (maxSeconds - minSeconds));
}

/**
 * Standard request parameters for Inertia/Laravel apps.
 * Sets headers that Laravel expects and follows redirects.
 */
export function defaultParams() {
    return {
        headers: {
            'Accept': 'text/html,application/xhtml+xml',
            'User-Agent': 'k6-load-test/1.0',
        },
        redirects: 5,
    };
}

/**
 * Login and return the authenticated cookie jar.
 * The caller can then use jar in subsequent requests.
 */
export function login(jar) {
    // Get the login page to obtain the CSRF token / session cookie
    const loginPage = http.get(`${BASE_URL}/login`, {
        jar,
        headers: defaultParams().headers,
        redirects: 5,
    });

    // Extract CSRF token from the page (Laravel Inertia embeds it)
    const csrfMatch = loginPage.body.match(/name="_token"\s+(?:type="hidden"\s+)?value="([^"]+)"/);
    // Also try the cookie-based approach (XSRF-TOKEN)
    const xsrfCookie = jar.cookiesForURL(`${BASE_URL}/login`)['XSRF-TOKEN'];

    const payload = {
        email: TEST_EMAIL,
        password: TEST_PASSWORD,
    };

    if (csrfMatch) {
        payload['_token'] = csrfMatch[1];
    }

    const headers = {
        ...defaultParams().headers,
        'Content-Type': 'application/x-www-form-urlencoded',
    };

    if (xsrfCookie && xsrfCookie.length > 0) {
        headers['X-XSRF-TOKEN'] = decodeURIComponent(xsrfCookie[0]);
    }

    const loginResp = http.post(`${BASE_URL}/login`, payload, {
        jar,
        headers,
        redirects: 5,
    });

    return loginResp;
}

/**
 * Common threshold definitions.
 *
 * Rationale:
 * - http_req_failed < 1%: Standard reliability floor. Any higher means real issues.
 * - p(95) < 500ms: For a local dev server with Inertia SSR and PostgreSQL,
 *   500ms is generous but appropriate. These are full HTML responses, not API JSON.
 * - p(99) < 1500ms: Tail latency allowance for occasional DB connection spikes
 *   or GC pauses in PHP.
 *
 * These are benchmark targets for local dev, NOT production SLAs.
 */
export const DEFAULT_THRESHOLDS = {
    http_req_failed: ['rate<0.01'],
    http_req_duration: ['p(95)<500', 'p(99)<1500'],
};
