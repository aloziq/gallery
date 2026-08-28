import { browsingScenario } from './scenarios/browsing.js';

// ────────────────────────────────────────────────────────
// STRESS TEST — Find the Breaking Point
// ────────────────────────────────────────────────────────
// Pushes beyond normal capacity to find where the
// application degrades or fails.
//
// This test uses only the public browsing scenario
// to avoid compounding auth issues with capacity issues.
//
// Ramp profile:
//    0  →  50 VUs  (30s)
//   50  → 100 VUs  (30s)
//  100  → 200 VUs  (30s)
//  200  → 500 VUs  (60s)  ← sustained peak
//  500  →   0 VUs  (15s)  ← cool down
//
// Total: ~2m 45s
//
// WARNING: This test will likely saturate the local dev
// machine. That is expected — the goal is to find the knee.
// ────────────────────────────────────────────────────────

export const options = {
    insecureSkipTLSVerify: true,

    stages: [
        { duration: '30s', target: 50 },
        { duration: '30s', target: 100 },
        { duration: '30s', target: 200 },
        { duration: '60s', target: 500 },
        { duration: '15s', target: 0 },
    ],

    thresholds: {
        // Relaxed thresholds — we EXPECT failures at high load
        // The point is to measure, not to pass
        http_req_failed: ['rate<0.20'],  // Up to 20% failures acceptable in stress
        http_req_duration: ['p(95)<3000'],
    },
};

export default browsingScenario;
