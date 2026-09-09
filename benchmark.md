# Architecture Benchmark & Comparison: Laravel vs. Node.js/Next.js

This document provides a comparative analysis and theoretical benchmark between the current architecture (Laravel + React + 1-Second Polling) and a potential refactored architecture using Node.js + Next.js with WebSockets.

---

## 1. Current Implementation (Laravel + Inertia + React)
**Approach:** HTTP Polling (1 request per second, per client)

### How it works
The client runs a `setInterval` that sends an AJAX request to the Laravel backend every 1000ms. The backend queries PostgreSQL (aggregating evaluations, grouping by time buckets, and sorting the top 10), and returns the JSON payload.

### Pros
*   **Development Speed:** Extremely fast to build. Uses standard HTTP controllers.
*   **Stateless:** No persistent connections. Easy to load balance across multiple PHP-FPM workers.
*   **Simplicity:** No need for a separate WebSocket server, Redis pub/sub, or complex event broadcasting setup.

### Cons & Bottlenecks
*   **High Network Overhead:** 1,000 active users = 1,000 HTTP requests per second. Each request carries HTTP headers, session cookies, and requires framework bootstrapping.
*   **Database Load:** Without aggressive caching (like Redis), the database performs heavy aggregate queries (`COUNT`, `AVG`, `GROUP BY`) every single second for every client, even if no new votes were cast.
*   **Latency:** The data is always up to 1 second stale.

### Theoretical Benchmark (Local PC - HP ZBook 15 G5, Core i7 8th Gen, 32GB RAM)
*   **Max Concurrent Connections:** ~1,500 - 3,000 active users.
*   **Limiting Factor:** The 6-core/12-thread CPU will eventually max out due to the sheer volume of framework bootstrapping (1,500+ PHP requests per second) and aggregate database queries occurring every single second.

---

## 2. Potential Implementation (Node.js + Next.js + WebSockets)
**Approach:** Persistent WebSocket / Server-Sent Events (SSE) (Push-based)

### How it works
Clients establish a persistent WebSocket connection to a Node.js server. When a new evaluation is submitted, the server updates an in-memory leaderboard (or Redis cache) and actively *pushes* the new payload only to connected clients. 

### Pros
*   **Zero Polling Overhead:** Clients do not ask for data. The server pushes data *only* when an update occurs.
*   **Extremely Low Latency:** Updates appear in milliseconds, rather than waiting for the next polling cycle.
*   **Database Efficiency:** The database is only queried when a vote occurs, or the leaderboard is maintained entirely in Redis (O(log(n)) complexity for sorted sets).
*   **Massive Concurrency:** Node.js's event-driven, non-blocking I/O is specifically designed for holding thousands of idle persistent connections.

### Cons & Bottlenecks
*   **Infrastructure Complexity:** Requires managing a persistent WebSocket server (like Socket.io).
*   **Stateful Scaling:** If you scale to multiple Node.js instances, you must implement Redis Pub/Sub so instances can share real-time events.
*   **Mental Model:** Handling connection drops, reconnections, and stale state recovery is more complex than simple HTTP fetching.

### Theoretical Benchmark (Local PC - HP ZBook 15 G5, Core i7 8th Gen, 32GB RAM)
*   **Max Concurrent Connections:** 150,000 - 300,000+ active users.
*   **Limiting Factor:** With 32GB of RAM, memory is not an issue (each WebSocket takes ~30KB, 100k users = ~3GB RAM). The limit will be OS-level TCP ephemeral port exhaustion (usually capping around ~65,000 ports per IP address without network tuning) and the Node.js event loop capacity.

---

## 3. Direct Comparison Matrix

| Metric | Laravel (1s Polling) | Node.js (WebSockets) | Winner |
| :--- | :--- | :--- | :--- |
| **Data Latency** | ~1000ms | ~20 - 50ms | **Node.js** |
| **HTTP Requests / Minute** | 60 per user | 1 per user (Upgrade) | **Node.js** |
| **Bandwidth Usage** | High (Continuous headers) | Very Low (Raw binary/text frames) | **Node.js** |
| **Server CPU Load** | High (Framework boot loop) | Low (Event loop idling) | **Node.js** |
| **Dev / Setup Time** | Hours | Days | **Laravel** |
| **Operational Complexity**| Low (Stateless) | High (Stateful, Pub/Sub) | **Laravel** |

---

## 4. Conclusion & Recommendations

The current **Laravel Polling** implementation is highly effective for internal dashboards, hackathons, or environments with less than a few hundred concurrent viewers. It allowed us to build a visually stunning, real-time-feeling dashboard in record time.

However, if this project scales to **thousands of simultaneous public viewers** (e.g., a massive live event or TV broadcast), the 1-second polling model will quickly exhaust server resources. 

**Should you rewrite in Node.js/Next.js?**
Not necessarily. You can achieve Node.js-level concurrency while keeping your Laravel application by integrating **Laravel Reverb** (Laravel's native WebSocket server) or a managed service like **Pusher**. This would allow you to broadcast `EvaluationCreated` events over WebSockets, giving you the extreme performance and low latency of the Node.js approach without leaving the Laravel ecosystem.
