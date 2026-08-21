# FlickScope VOD Product Specification

## Product direction

FlickScope is a movie-and-series video-on-demand service. Live TV, broadcast playout, RTMP/RTSP/WebRTC ingest, stream monitoring, and channel creation are retired from the active product interface. Existing database and storage records are preserved until a deliberate migration is reviewed; old routes may redirect or be decommissioned without deleting production media.

## Access tiers

| Capability | Free account | Premium account | One-day trial |
|---|---|---|---|
| Standard catalog | Allowed for free titles | Allowed | Allowed |
| Premium titles | Locked unless a verified credit reward is available | Allowed | Allowed until trial expiry |
| Video quality | Standard/low-quality rendition | HD rendition when available | HD during trial |
| Watch history | Save and replay history | Save and replay history | Save and replay history |
| Download | Not available | Signed, expiring download URL | Allowed during trial only if trial policy permits |
| Release schedule | Hidden/locked | Allowed | Allowed until trial expiry |
| Ads | May be shown and may award credits | No reward ads by default | No reward ads by default |

## Credits and reward ads

Credits are ledger entries, not a client-side counter. Every credit claim is recorded server-side with user ID, UTC claim date, reward source, amount, and an idempotency key. A daily claim is accepted only once per account per UTC day and only after a trusted ad-provider completion signal. The server recomputes available balance and never trusts a submitted balance or client timestamp. Reward ads are capped by account, IP/device risk score, and daily policy limits.

## Subscription and trial

A trial is a server-created entitlement with an explicit start and end timestamp. The API treats a trial as active only while the current UTC time is inside the interval. Premium access is based on the server-side entitlement response, not on a browser flag. Existing subscription payment records remain compatible with the new policy.

## Playback and downloads

The catalog API does not expose unrestricted original media URLs for protected titles. A watch-authorize endpoint returns a short-lived signed rendition URL after checking entitlement, account status, credit redemption, and rate limits. Standard/free playback receives a lower-quality rendition where a separate rendition exists; premium playback receives HD. Premium downloads use short-lived signed URLs and a server-side download audit record. Browser controls cannot guarantee that a viewer will never capture a video, so protections are authorization, URL expiry, watermarking where supported, and rate limiting rather than a false promise of absolute DRM.

## Account and abuse controls

Only @gmail.com accounts remain eligible. Device identifiers are treated as risk signals rather than cryptographic proof because clients can spoof them. Store a keyed hash of a normalized device identifier and a privacy-preserving hash of the IP address, with retention and rotation policies. Enforce concurrent-session limits, account creation velocity limits, login and OTP rate limits, suspicious device changes, and VPN/proxy risk checks. VPN detection is best-effort; when the provider cannot classify an IP reliably, do not block legitimate users solely on a client-side guess. Raw IP addresses and raw device IDs are not stored in application tables.

## Profile fields

DOB and gender are removed from registration and profile UI. Existing nullable database columns are retained initially to avoid destructive data loss; they are not read by the new product flow. A later migration may remove them only after a data-retention review.

## Localization and design

English and Myanmar are supported for navigation, access states, forms, dialogs, and system messages. Movie titles and descriptions support the existing title fields and may be extended with localized fields in a backward-compatible migration. The visual baseline is near-black #121212, charcoal #1f1f1f/#2a2a2a, soft white text, muted gray secondary text, subtle borders, and restrained accent use. Desktop catalog grids use three cards per row at the primary desktop breakpoint, with responsive two- and one-column fallbacks.

## Advertising revenue

Displaying ads alone does not create revenue. Revenue requires approval and account configuration with a compliant ad provider, correct placement IDs, privacy/consent handling, and provider policy compliance. The application can implement an ad-slot abstraction and server-side reward ledger now, but production monetization requires the owner’s approved provider credentials and placement IDs. The system must never reward a user merely because an ad component rendered or because the client claimed completion.
