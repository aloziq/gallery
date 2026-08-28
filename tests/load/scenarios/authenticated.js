import http from 'k6/http';
import { check } from 'k6';
import { BASE_URL, TEST_EMAIL, TEST_PASSWORD, thinkTime, defaultParams } from '../config.js';

// ────────────────────────────────────────────────────────
// AUTHENTICATED ADMIN SCENARIO
// ────────────────────────────────────────────────────────
// Models an authenticated admin session:
//
//   1. GET /login (obtain session + CSRF)
//   2. POST /login (authenticate)
//   3. GET /dashboard (admin dashboard)
//   4. Think-time
//   5. GET /projects (admin project list)
//   6. Think-time
//
// Uses the dedicated load-test admin account:
//   Email:    loadtest@example.com
//   Password: loadtest-password
//
// These can be overridden via K6_TEST_EMAIL / K6_TEST_PASSWORD.
// ────────────────────────────────────────────────────────

export function authenticatedScenario() {
    const jar = http.cookieJar();
    const params = defaultParams();

    // 1. Get login page (establishes session, CSRF token)
    const loginPage = http.get(`${BASE_URL}/login`, {
        ...params,
        redirects: 5,
    });
    check(loginPage, {
        'login page: status 200': (r) => r.status === 200,
    });

    // Extract CSRF token from the response body
    let csrfToken = '';
    const csrfMatch = loginPage.body.match(/name="_token"\s+(?:type="hidden"\s+)?value="([^"]+)"/);
    if (csrfMatch) {
        csrfToken = csrfMatch[1];
    }

    // Also try value-first pattern
    if (!csrfToken) {
        const altMatch = loginPage.body.match(/value="([^"]+)"\s+name="_token"/);
        if (altMatch) {
            csrfToken = altMatch[1];
        }
    }

    thinkTime(1, 2);

    // 2. Submit login
    const loginHeaders = {
        ...params.headers,
        'Content-Type': 'application/x-www-form-urlencoded',
    };

    // Get XSRF-TOKEN from cookies for the X-XSRF-TOKEN header
    const cookies = jar.cookiesForURL(`${BASE_URL}/login`);
    if (cookies['XSRF-TOKEN'] && cookies['XSRF-TOKEN'].length > 0) {
        loginHeaders['X-XSRF-TOKEN'] = decodeURIComponent(cookies['XSRF-TOKEN'][0]);
    }

    const loginPayload = {
        email: TEST_EMAIL,
        password: TEST_PASSWORD,
    };

    if (csrfToken) {
        loginPayload['_token'] = csrfToken;
    }

    const loginRes = http.post(`${BASE_URL}/login`, loginPayload, {
        headers: loginHeaders,
        redirects: 5,
    });

    const loginSuccess = loginRes.status === 200 || loginRes.status === 302;
    check(loginRes, {
        'login: succeeded': () => loginSuccess,
    });

    // If login failed (e.g., rate limited), skip remaining steps
    if (!loginSuccess) {
        return;
    }

    thinkTime(1, 2);

    // 3. Dashboard
    const dashRes = http.get(`${BASE_URL}/dashboard`, {
        ...params,
        redirects: 5,
    });
    check(dashRes, {
        'dashboard: status 200': (r) => r.status === 200,
    });

    thinkTime(2, 4);

    // 4. Admin project list
    const projRes = http.get(`${BASE_URL}/projects`, {
        ...params,
        redirects: 5,
    });
    check(projRes, {
        'admin projects: status 200': (r) => r.status === 200,
    });

    thinkTime(2, 3);
}

// Allow running this scenario directly for debugging: `k6 run tests/load/scenarios/authenticated.js`
export default function () {
    authenticatedScenario();
}
