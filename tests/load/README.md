# k6 Load Testing Suite

Performance and load testing for the Project Gallery application.

## Prerequisites

- **k6** installed: `winget install GrafanaLabs.k6`
- Application running at `https://gallery.test` (via Laravel Herd)
- Database seeded with load test data: `php artisan db:seed --class=LoadTestSeeder`

## Environment Variables

| Variable | Default | Description |
|---|---|---|
| `BASE_URL` | `https://gallery.test` | Application URL |
| `TEST_EMAIL` | `loadtest@example.com` | Test admin email |
| `TEST_PASSWORD` | `loadtest-password` | Test admin password |

Override via command line:

```powershell
$env:BASE_URL = "https://gallery.test"
& "C:\Program Files\k6\k6.exe" run tests/load/smoke.js
```

## Test Structure

```
tests/load/
├── config.js            # Shared config, helpers, thresholds
├── smoke.js             # 2 VUs, 15s — connectivity check
├── load.js              # Progressive ramp: 10 → 200 VUs
├── stress.js            # Push to 500 VUs — find breaking point
├── scenarios/
│   ├── browsing.js      # Public user flow: home → projects
│   └── authenticated.js # Admin flow: login → dashboard → projects
└── README.md            # This file
```

## Running Tests

### 1. Smoke Test (run first)

Verifies basic connectivity and functionality:

```powershell
& "C:\Program Files\k6\k6.exe" run tests/load/smoke.js
```

Expected: All checks pass, p95 < 500ms, 0% errors.

### 2. Load Test (progressive ramp)

Determines where performance starts degrading:

```powershell
& "C:\Program Files\k6\k6.exe" run tests/load/load.js
```

Ramps from 10 to 200 VUs over ~2m 45s. Runs both public browsing (85%) and authenticated admin (15%) scenarios.

### 3. Stress Test (find breaking point)

Pushes to 500 VUs to find the capacity ceiling:

```powershell
& "C:\Program Files\k6\k6.exe" run tests/load/stress.js
```

**Warning**: This test will likely saturate the local dev machine. That is expected — the goal is to find the knee.

## Threshold Rationale

| Threshold | Smoke | Load | Stress | Why |
|---|---|---|---|---|
| `http_req_failed` | < 1% | < 5% | < 20% | Progressively relaxed as we push harder |
| `p(95)` | < 500ms | < 800ms | < 3000ms | Inertia SSR + full HTML response time budget |
| `p(99)` | < 1000ms | < 2000ms | – | Tail latency for DB connection pool spikes |

These are **local dev benchmarks**, not production SLAs.

## TLS Note

All tests use `insecureSkipTLSVerify: true` because Laravel Herd generates a self-signed certificate for `gallery.test`. This is safe for local testing — the cert is trusted by the browser via Herd's CA, but k6 doesn't use the Windows certificate store by default.

## Important Caveats

- **k6 VUs ≠ real users.** A VU makes requests as fast as the think-time allows. Real users are slower.
- **Local machine is both load generator AND server.** CPU/RAM are shared. If the machine saturates, the bottleneck may be the test rig, not the application.
- **Do not claim production capacity from local benchmarks.** These results only indicate relative performance characteristics.
