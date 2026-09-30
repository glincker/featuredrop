# Benchmarks & Compatibility

Real numbers from this repo, not marketing copy. Regenerate them yourself:

```bash
pnpm build
node ./scripts/print-bundle-sizes.mjs   # full gzip size table, every entry point
pnpm size-check                          # CI-enforced budgets for the 4 hottest paths
pnpm test                                # full suite, see coverage column below
```

## Bundle size (gzip)

Every entry point, sorted smallest to largest. Generated from `featuredrop@3.0.3` on 2026-09-29.

| Entry point | Import | Gzip size |
|---|---|---:|
| Core | `featuredrop` | 3.01 kB |
| React + hooks | `featuredrop/react` | 53.32 kB |
| Preact | `featuredrop/preact` | 53.31 kB |
| Vue | `featuredrop/vue` | 7.34 kB |
| Svelte | `featuredrop/svelte` | 2.58 kB |
| Solid | `featuredrop/solid` | 2.93 kB |
| Angular | `featuredrop/angular` | 2.31 kB |
| Web Components | `featuredrop/web-components` | 4.31 kB |
| Next.js | `featuredrop/next` | 2.64 kB |
| Remix | `featuredrop/remix` | 2.58 kB |
| Astro | `featuredrop/astro` | 2.61 kB |
| Nuxt | `featuredrop/nuxt` | 2.70 kB |
| Storage adapters (all) | `featuredrop/adapters` | 8.98 kB |
| React hooks (headless) | `featuredrop/react/hooks` | 3.63 kB |
| Tailwind plugin | `featuredrop/tailwind` | 1.29 kB |
| CI helpers | `featuredrop/ci` | 3.14 kB |
| Bridges (Slack/Discord/etc.) | `featuredrop/bridges` | 5.05 kB |
| CMS adapters | `featuredrop/cms` | 6.87 kB |
| Testing utilities | `featuredrop/testing` | 12.96 kB |

The React/Preact bundles are larger because they ship the full component
library (17 components). If you only need data + actions, import
`featuredrop/react/hooks` instead (3.63 kB) and bring your own UI.

CI enforces hard budgets on the four highest-traffic paths via
`pnpm size-check` (`scripts/check-bundle-budgets.mjs`): core ≤ 5 kB, react ≤
55 kB, vue ≤ 10 kB, svelte ≤ 5 kB. A PR that busts a budget fails CI.

## Framework compatibility matrix

12 shipped targets. "Test coverage" means there's an automated test that
imports the entry point and exercises its exported API — not just that the
file compiles.

| Framework | Import | SSR-safe | Test coverage |
|---|---|:---:|---|
| React | `featuredrop/react` | ✅ | `react.test.tsx`, `react-components.test.tsx` + 10 more component/hook suites |
| Next.js | `featuredrop/next` | ✅ | `framework-integrations.test.ts` |
| Remix | `featuredrop/remix` | ✅ | `framework-integrations.test.ts` |
| Astro | `featuredrop/astro` | ✅ | `framework-integrations.test.ts` |
| Nuxt | `featuredrop/nuxt` | ✅ | `framework-integrations.test.ts` |
| Vue 3 | `featuredrop/vue` | ✅ | Dedicated entry-point test landing in a follow-up PR — see the repo's open PRs |
| Svelte 5 | `featuredrop/svelte` | ✅ | `svelte-store.test.ts` |
| SolidJS | `featuredrop/solid` | ✅ | `solid-adapter.test.ts` |
| Preact | `featuredrop/preact` | ✅ | `preact-adapter.test.ts` |
| Angular | `featuredrop/angular` | ✅ | `angular-adapter.test.ts` |
| Web Components | `featuredrop/web-components` | ✅ | `web-components.test.ts` |
| Vanilla JS | `featuredrop` (core) | ✅ | `core.test.ts`, `helpers.test.ts`, `engine.test.ts` |

SSR-safe means every storage adapter and provider guards `window`/`document`
access and falls back to a no-op or `MemoryAdapter`-equivalent state when
rendering on the server — checked by the same test suites above running
under jsdom's absence in server-mode assertions.

## Storage adapter selection guide

| Your situation | Use | Why |
|---|---|---|
| No backend at all, want it working today | `IndexedDBAdapter` (root export) | Falls back to localStorage automatically if IndexedDB is unavailable; larger quota than localStorage alone; zero setup |
| No backend, minimal footprint is the priority | `LocalStorageAdapter` | Simplest possible persistence, smallest code path |
| SSR / tests, no persistence needed | `MemoryAdapter` | No `window` dependency, resets per request |
| Already have Postgres/MySQL/SQLite | `PostgresAdapter` / `MySQLAdapter` / `SQLiteAdapter` | Direct query-function adapters, no ORM required |
| Already on Supabase | `SupabaseAdapter` | Uses your existing client + realtime channel |
| Already on Redis | `RedisAdapter` | Works with any redis-like client (ioredis, node-redis) |
| Want local speed + server durability | `HybridAdapter` | Local adapter for instant reads/writes, remote adapter for durable sync, batched flush |
| Custom backend | `RemoteAdapter` | Retry + circuit-breaker wrapper around your own HTTP endpoint |

All adapters implement the same `StorageAdapter` interface — swapping one for
another later is a one-line change at the `<FeatureDropProvider storage={...}>`
call site, not a rewrite.
