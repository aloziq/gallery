import { browsingScenario } from './scenarios/browsing.js';
import { authenticatedScenario } from './scenarios/authenticated.js';

// ────────────────────────────────────────────────────────
// LOAD TEST — Progressive Ramp
// ────────────────────────────────────────────────────────
// Determines where the application begins to degrade
// by progressively increasing concurrent virtual users.
//
// Ramp profile:
//   0  →  10 VUs  (30s)  — warm up
//  10  →  25 VUs  (30s)  — light load
//  25  →  50 VUs  (30s)  — moderate
//  50  → 100 VUs  (30s)  — high
// 100  → 200 VUs  (30s)  — heavy
// 200  →   0 VUs  (15s)  — cool down
//
// Total: ~2m 45s
// ────────────────────────────────────────────────────────

export const options = {
    insecureSkipTLSVerify: true,

    scenarios: {
        // 85% of traffic: public browsing (the primary use case)
        browsing: {
            executor: 'ramping-vus',
            exec: 'browsing',
            stages: [
                { duration: '30s', target: 9 },   // warm up
                { duration: '30s', target: 21 },   // light
                { duration: '30s', target: 43 },   // moderate
                { duration: '30s', target: 85 },   // high
                { duration: '30s', target: 170 },   // heavy
                { duration: '15s', target: 0 },     // cool down
            ],
        },

        // 15% of traffic: authenticated admin usage
        authenticated: {
            executor: 'ramping-vus',
            exec: 'authenticated',
            stages: [
                { duration: '30s', target: 1 },
                { duration: '30s', target: 4 },
                { duration: '30s', target: 7 },
                { duration: '30s', target: 15 },
                { duration: '30s', target: 30 },
                { duration: '15s', target: 0 },
            ],
        },
    },

    thresholds: {
        // Overall thresholds
        http_req_failed: ['rate<0.05'],  // Relaxed for load test: <5% failures
        http_req_duration: ['p(95)<3000', 'p(99)<5000'],

        // Per-scenario thresholds
        'http_req_duration{scenario:browsing}': ['p(95)<2500'],
        'http_req_duration{scenario:authenticated}': ['p(95)<3000'],
    },
};

// Exported functions that k6 scenarios reference via `exec`
export { browsingScenario as browsing };
export { authenticatedScenario as authenticated };
export { setup } from './scenarios/browsing.js';
