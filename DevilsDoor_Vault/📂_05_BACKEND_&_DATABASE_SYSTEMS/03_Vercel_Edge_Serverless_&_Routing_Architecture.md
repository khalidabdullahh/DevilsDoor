# 🌐 Vercel Edge Serverless & Routing Architecture

> **Vault Hub**: [[⛩️_00_MASTER_INDEX]]  
> **Related**: [[02_Telemetry_&_Analytics_Database_Schema]], [[04_Global_Leaderboard_&_Cloud_Sync_Database_Spec]]

---

## ⚡ Edge Network Topology

Devil's Door utilizes **Vercel Edge Network (Anycast Global CDN)** with edge caching, custom security headers, cross-origin resource sharing (CORS), and sub-millisecond route rewrites.

```mermaid
graph TD
    Client[🌍 Global Web Player / Publisher Iframe] --> Anycast[📡 Vercel Anycast Global Edge Network]
    
    subgraph Edge CDN Layer
        Anycast --> Route1[🔀 Static Asset Route /assets/* -> Edge Cache Max-Age 1 Year]
        Anycast --> Route2[🔀 Direct Game Route /game -> src/index.html]
        Anycast --> Route3[🔀 Landing Portal / -> website/index.html]
        Anycast --> Route4[⚡ Edge API Functions /api/*]
    end
    
    subgraph Serverless Edge APIs
        Route4 --> TelemetryAPI[/api/telemetry -> Edge Ingestion Worker]
        Route4 --> LeaderboardAPI[/api/leaderboard -> Redis Edge Read/Write]
    end
```

---

## 📄 Configuration Specification (`vercel.json`)

```json
{
  "version": 2,
  "cleanUrls": true,
  "trailingSlash": false,
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        { "key": "X-Frame-Options", "value": "ALLOWALL" },
        { "key": "Access-Control-Allow-Origin", "value": "*" },
        { "key": "Access-Control-Allow-Methods", "value": "GET, POST, OPTIONS" },
        { "key": "Access-Control-Allow-Headers", "value": "Content-Type, Authorization" },
        { "key": "X-Content-Type-Options", "value": "nosniff" },
        { "key": "Referrer-Policy", "value": "strict-origin-when-cross-origin" }
      ]
    },
    {
      "source": "/assets/(.*)",
      "headers": [
        { "key": "Cache-Control", "value": "public, max-age=31536000, immutable" }
      ]
    },
    {
      "source": "/src/js/(.*)",
      "headers": [
        { "key": "Cache-Control", "value": "public, max-age=86400, stale-while-revalidate=604800" }
      ]
    }
  ],
  "rewrites": [
    { "source": "/game", "destination": "/src/index.html" },
    { "source": "/play", "destination": "/src/index.html" }
  ]
}
```

---

## 💻 Edge Ingestion Function Example (`api/telemetry.js`)

```javascript
export const config = {
  runtime: 'edge', // Runs on Vercel Edge Runtime (V8 isolates, <5ms cold start)
};

export default async function handler(request) {
  if (request.method === 'OPTIONS') {
    return new Response(null, {
      status: 204,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type'
      }
    });
  }

  if (request.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), { status: 405 });
  }

  try {
    const payload = await request.json();
    
    // Validate schema
    if (!payload.event || !payload.playerId) {
      return new Response(JSON.stringify({ error: 'Invalid telemetry schema' }), { status: 400 });
    }

    // Forward to Database / Queue (e.g. Upstash Kafka / Redis / PostgreSQL)
    console.log(`[Edge Telemetry Ingest] Event: ${payload.event} for Player: ${payload.playerId}`);

    return new Response(JSON.stringify({ status: 'queued', timestamp: Date.now() }), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      }
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: 'Malformed JSON payload' }), { status: 400 });
  }
}
```

---
*Related: [[⛩️_00_MASTER_INDEX]], [[02_Telemetry_&_Analytics_Database_Schema]], [[04_Global_Leaderboard_&_Cloud_Sync_Database_Spec]]*
