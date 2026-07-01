<wizard-report>
# PostHog post-wizard report

The wizard has completed a deep integration of PostHog into Applyr. Here is a summary of what was set up:

- **Client-side initialization** — created `instrumentation-client.ts` (Next.js 15.3+ recommended approach) with reverse-proxy routing (`/ingest`), exception capture, and debug mode in development. Removed the old `useEffect`-based init from `PostHogProvider.tsx`.
- **Reverse proxy** — added PostHog rewrites to `next.config.ts` so all events and assets route through `/ingest` instead of hitting PostHog directly, improving ad-blocker resilience.
- **Server-side client** — refactored `lib/posthog-server.ts` to a singleton `getPostHogClient()` that is safe to call from multiple API routes.
- **User identification** — `Navbar.tsx` calls `posthog.identify()` (with `id` and `email`) each time auth state is confirmed, keeping PostHog identity in sync across page navigations. `app/api/auth/callback/route.ts` also calls server-side `identify` on successful OAuth so server and client events share the same `distinct_id`.
- **Event tracking** — 7 events added across 5 files (see table below).
- **Error tracking** — `posthog.captureException()` added to the sign-out error path in `Navbar.tsx`.
- **Environment variables** — `NEXT_PUBLIC_POSTHOG_KEY` and `NEXT_PUBLIC_POSTHOG_HOST` written to `.env.local`.

| Event name | Description | File |
|---|---|---|
| `login_provider_selected` | User clicks a social OAuth provider button (Google or GitHub) | `app/(auth)/login/page.tsx` |
| `user_signed_out` | User clicks the Sign Out button in the navigation bar | `components/layout/Navbar.tsx` |
| `navbar_get_started_clicked` | Unauthenticated user clicks the Get Started button in the navbar | `components/layout/Navbar.tsx` |
| `hero_cta_clicked` | User clicks a call-to-action button in the homepage hero section | `components/homepage/Hero.tsx` |
| `bottom_cta_clicked` | User clicks a call-to-action button in the bottom CTA section | `components/homepage/BottomCTA.tsx` |
| `oauth_login_completed` | Server-side event: OAuth code exchange succeeded, user is authenticated | `app/api/auth/callback/route.ts` |
| `oauth_login_failed` | Server-side event: OAuth flow failed at any stage | `app/api/auth/callback/route.ts` |

## Next steps

We've built some insights and a dashboard for you to keep an eye on user behavior, based on the events we just instrumented:

- **Dashboard — Analytics basics (wizard):** https://us.posthog.com/project/492786/dashboard/1782830
- **Login conversion funnel** (hero CTA → provider selected → OAuth completed): https://us.posthog.com/project/492786/insights/1FYUoOai
- **Auth events over time** (attempts, completions, failures): https://us.posthog.com/project/492786/insights/Ul8trLVN
- **CTA clicks by location** (hero vs bottom section): https://us.posthog.com/project/492786/insights/ucKiKFZw
- **OAuth failure rate** (churn signal): https://us.posthog.com/project/492786/insights/8Th1qDNw
- **User sign-outs over time** (early churn detection): https://us.posthog.com/project/492786/insights/lQMwctNv

## Verify before merging

- [ ] Run a full production build (`npm run build`) and fix any lint or type errors introduced by the generated code.
- [ ] Run the test suite — call sites that were rewritten or instrumented may need updated mocks or fixtures.
- [ ] Add `NEXT_PUBLIC_POSTHOG_KEY` and `NEXT_PUBLIC_POSTHOG_HOST` to `.env.example` and any monorepo/bootstrap scripts so collaborators know what to set.
- [ ] Wire source-map upload (`posthog-cli sourcemap` or your bundler's upload step) into CI so production stack traces de-minify.
- [ ] Confirm the returning-visitor path also calls `identify` — the Navbar calls it on every navigation but verify a user who lands directly on an authenticated page (not just `/`) is also identified before any events are fired.

### Agent skill

We've left an agent skill folder in your project. You can use this context for further agent development when using Claude Code. This will help ensure the model provides the most up-to-date approaches for integrating PostHog.

</wizard-report>
