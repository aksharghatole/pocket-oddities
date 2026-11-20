# Online leaderboard backend decision

**Reviewed:** 20 November 2026  
**Status:** Recommendation only. No backend project is connected.

## Recommendation

Use **Supabase for a small leaderboard pilot**, once the project owner creates a project and approves the operating model. Pocket Oddities already needs relational ranking queries (daily, weekly, all-time, per game), and Supabase provides Postgres, anonymous sign-in, row-level security (RLS), and TypeScript Edge Functions in one service.

Keep all current progress and personal records local until a server verifier exists. A database, authentication token, or edge function alone cannot prove that a client-submitted time or score is honest.

## Current free-tier fit

| Need | Supabase Free | Firebase Spark |
| --- | --- | --- |
| No-cost start | Free plan; 500 MB database, 50,000 monthly active users, and 500,000 Edge Function invocations | No-cost plan; no billing account required |
| Anonymous identities | Anonymous sign-in is available | Anonymous Authentication is available |
| Server-side validation | Edge Functions are included; Free allows 150 seconds wall time and 2 seconds CPU per request | Cloud Functions require the Blaze pay-as-you-go plan, which links a billing account |
| Database access control | Postgres RLS can scope access by user and restrict direct writes | Firestore Security Rules can restrict client reads and writes |
| Main pilot limitation | Free projects pause after one week of inactivity; it is not an uptime commitment | Secure server-side validation requires enabling billing, even if usage may remain within no-cost quotas |

These quotas and plan rules can change. Recheck the official pricing and limits before deployment.

## Ranked-result security rules

1. Public clients may read approved leaderboard views only.
2. Clients must not insert or update ranked rows directly.
3. Submission goes through a server function with identity checks, request-size limits, rate limits, and challenge/date validation.
4. The server only accepts results for games that have a verifier. A submitted client time or score by itself is not proof.
5. Keep unverifiable results local or label them unverified; exclude them from verified rankings.
6. Keep service-role credentials only in server-side secrets. The browser may use a public client key only after RLS and grants are configured and tested.
7. Anonymous play remains available. If accounts are added later, provide a clear deletion path and a non-identifying display name.

## Verification design before launch

Daily Rush can be deterministic, but its present browser code reports completion and elapsed time from the client. A modified client can fabricate both. Before ranked play:

- Add a versioned challenge definition and server-owned challenge date.
- Record the player’s game actions with monotonic timestamps.
- Build a replay verifier for each eligible game and reject impossible action sequences, durations, or scores.
- Store the verifier version with each result so a future game update cannot silently change old results.
- Start with a small set of games whose state transitions can be replayed deterministically. Keep the rest casual.
- Add abuse limits and a manual takedown process for inappropriate names.

## Setup needed to implement the pilot

- Create a Supabase project under the account owner’s control.
- Decide whether guest identities are device-bound anonymous users or whether players can optionally link an account.
- Decide whether a paused free project is acceptable for the pilot. A production uptime requirement may require paid service; no paid plan is assumed here.
- Provide project URL and public anon key through deployment configuration, and a server-only secret for Edge Functions. Never commit these values to source.
- Approve the retention, display-name, deletion, and privacy policy before accepting public submissions.

## Official references

- [Supabase pricing and plan quotas](https://supabase.com/pricing)
- [Supabase Edge Function limits](https://supabase.com/docs/guides/functions/limits)
- [Supabase Row Level Security](https://supabase.com/docs/guides/database/postgres/row-level-security)
- [Supabase Edge Functions](https://supabase.com/docs/guides/functions)
- [Firebase pricing plans](https://firebase.google.com/docs/projects/billing/firebase-pricing-plans)
- [Firebase pricing](https://firebase.google.com/pricing)
- [Firebase Cloud Functions billing requirement](https://firebase.google.com/docs/functions/faq-and-troubleshooting)
