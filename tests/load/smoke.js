import http from 'k6/http';
import { check, sleep } from 'k6';
import { BASE_URL, discoverSlugs, defaultParams } from './config.js';

// ────────────────────────────────────────────────────────
// SMOKE TEST
// ────────────────────────────────────────────────────────
// Purpose: Verify that k6, the application, and network
// connectivity are all working before running heavier tests.
//
// Profile: 1–2 VUs for 15 seconds — minimal load.
// ────────────────────────────────────────────────────────

export const options = {
    vus: 2,
    duration: '15s',
    insecureSkipTLSVerify: true, // Herd self-signed cert

    thresholds: {
        // Smoke test should be rock-solid: zero failures
        http_req_failed: ['rate<0.01'],
        // With 150 projects + Inertia full HTML, baseline latency is ~500ms median.
        // p95 ~1.2s is normal for the gallery index (serializes all projects).
        http_req_duration: ['p(95)<1500', 'p(99)<2500'],
    },
};

// Discover project slugs before VUs start
export function setup() {
    const slugs = discoverSlugs();
    return { slugs };
}

export default function (data) {
    const params = defaultParams();
    const slug = data.slugs[0] || 'test-project';

    // 1. Homepage — public gallery listing (main entry point)
    const homeRes = http.get(`${BASE_URL}/`, params);
    check(homeRes, {
        'GET / returns 200': (r) => r.status === 200,
        'GET / has content': (r) => r.body && r.body.length > 0,
        'GET / contains gallery content': (r) => r.body.includes('project') || r.body.includes('مشروع'),
    });

    sleep(1);

    // 2. Project detail page — using a dynamically discovered slug
    const projectRes = http.get(`${BASE_URL}/p/${slug}`, params);
    check(projectRes, {
        'GET /p/{slug} returns 200': (r) => r.status === 200,
        'GET /p/{slug} has content': (r) => r.body && r.body.length > 0,
    });

    sleep(1);

    // 3. Login page — verify auth routes are accessible
    const loginRes = http.get(`${BASE_URL}/login`, params);
    check(loginRes, {
        'GET /login returns 200': (r) => r.status === 200,
    });

    sleep(1);
}

