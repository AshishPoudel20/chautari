# For You feed composition

How the **For You** tab selects which posts enter the feed before Hot/New ordering ([FEED_RANKING.md](./FEED_RANKING.md)).

## Official circles (permanent membership)

The 8 official topic circles are **permanent membership** for every user. Users cannot leave them. This guarantees joined-circle content is always available — no cold-start branch.

## Blend model

| Pool | Source |
|------|--------|
| **Joined** (~80%) | Posts from circles the user has joined (8 official + any user circles they joined) |
| **Discovery** (~20%) | Posts from **non-joined public** circles that pass the quality gate |

Uniform for all users. No special-casing by account age or circle count.

## Discovery quality gate

Discovery posts must have **Hot score ≥ `DISCOVERY_MIN_SCORE`** (see `src/feed/rankingConfig.js`). The score uses the same formula as the Hot feed (upvotes + answers + expert-answer bonus). Expert status is **not** a separate gate.

Excluded from discovery:

- User's own posts
- Posts in joined circles (they appear via the joined pool)
- Future private circles (`isPrivate === true` — stubbed now; all circles are public)

## Blend algorithm

1. Build **JOINED POOL** and **DISCOVERY POOL** (deduped — a post is in one pool only).
2. Sort each pool with the active For You mode (Hot snapshot or New recency).
3. **Merge 4:1** — four joined posts, then one discovery post, repeat.
4. When discovery is exhausted, append remaining joined posts (backfill).
5. When joined is exhausted, **do not** append extra discovery (never exceed ~20%).

`DISCOVERY_RATIO = 0.20` is the design target (4:1 merge). Supply shortfall is normal: 0%, 5%, or 15% discovery is fine — the feed stays full from joined content.

## Pagination

The merged list is fixed per snapshot (same `referenceTime` for Hot). Keyset pagination slices this list — paging deeper does not recompute the ratio or reshuffle seen items.

Pull-to-refresh recomposes from scratch (new snapshot).

## Code map

| File | Role |
|------|------|
| `src/feed/rankingConfig.js` | `DISCOVERY_RATIO`, `DISCOVERY_MIN_SCORE` + Hot score |
| `src/feed/feedComposition.js` | Pool build, merge, `composeForYouFeed()` |
| `src/hooks/useForYouFeed.js` | Snapshot + pagination over composed feed |

## Future

- `isPrivate` circles excluded automatically when added to the data model.
- Server-side composition can reuse the same pools and merge rules.
