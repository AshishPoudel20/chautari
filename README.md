# Chautari

**Community Q&A for the Nepali diaspora in Australia**

Chautari is a mobile-first platform where newcomers and long-term residents ask practical questions — visas, tax, healthcare, renting, careers — and get answers from the community and **verified local experts** (migration agents, accountants, GPs, mortgage brokers, and more).

> *A chautari is the shaded resting place under a tree where villagers gather to talk — the spirit of the product.*

---

## Problem

Settling in Australia involves hundreds of small, high-stakes decisions spread across fragmented forums, Facebook groups, and word-of-mouth. Information is noisy, outdated, or hard to trust. Chautari concentrates that knowledge in one place, with clear signals for who is a verified professional versus a helpful neighbour sharing lived experience.

**Target launch:** 2027 (Greater Melbourne first, Australia-wide later)

**Current status:** In active development. This repository contains a **high-fidelity interactive prototype** with fully mocked data and auth — suitable for UX validation, architecture exploration, and portfolio demonstration. Production backend integration is planned but not yet wired in this branch.

---

## Tech stack

| Layer | Technology |
|-------|------------|
| Mobile app | React Native, Expo SDK 54 |
| Navigation | React Navigation (native stack + bottom tabs) |
| State (prototype) | React Context + reducer, persisted via AsyncStorage |
| Theming | Semantic design tokens, light + dark mode |
| Planned production | Supabase (PostgreSQL, Auth, Row Level Security, Realtime) |

The prototype deliberately has **no network calls, API keys, or third-party auth** — everything runs locally so the app can be cloned and run without credentials.

---

## Key features (built in this prototype)

- **Onboarding** — phone OTP flow (mocked), profile setup, newcomer opt-in for arrival checklist
- **Feeds** — For You with **Hot/New** toggle, **80/20 joined/discovery** composition ([FEED_COMPOSITION.md](./FEED_COMPOSITION.md)), and permanent membership in the 8 official circles; Following tab; live activity signals. Ranking: [FEED_RANKING.md](./FEED_RANKING.md).
- **Circles** — official topic communities + user-created circles; join/leave, create, edit, pin
- **Q&A** — ask/answer/reply, anonymous posting, photo placeholders, bookmarks, upvotes with karma
- **Verified experts** — directory with filters, expert profiles, pinned expert answers, daily post cap
- **Notifications** — grouped activity feed, digest scheduling (local `expo-notifications`)
- **Arrival checklist** — first-60-days newcomer tasks with deep-links to community threads
- **Trust & safety surfaces** — report flows, account deletion, legal/help screens

---

## Architecture overview

```
App.js
├── ThemeProvider          # light/dark semantic tokens
├── DataProvider           # mock store (store.js) ↔ AsyncStorage
└── RootNavigator
    ├── Auth stack         # splash → welcome → OTP → profile setup
    └── Signed-in stack
        ├── MainTabs       # Home · Circles · Experts · Profile
        ├── Modals         # Ask, Answer, Report, Image viewer
        └── Push screens   # Question detail, Search, Activity, Settings, …
```

**Data layer (prototype):** `src/data/store.js` is the single mock backend — questions, users, circles, notifications, and user actions all flow through a reducer with selectors. Seed data in `src/data/seed.js` refreshes relative timestamps on each launch so the feed feels alive.

**Theming:** `src/theme/palettes.js` defines semantic colour tokens consumed via `useTheme()` — no hardcoded colours in screens.

**Circles accent system:** palette keys resolve to theme-aware light/dark hex values with contrast clamping (`src/data/circles.js`, `src/utils/color.js`).

**For You ranking:** constants in `src/feed/rankingConfig.js` (`DISCOVERY_RATIO`, `DISCOVERY_MIN_SCORE`, Hot score weights); snapshot-per-session Hot sort in `src/feed/feedRanking.js`; 80/20 composition in `src/feed/feedComposition.js` + `src/hooks/useForYouFeed.js`. Specs: [FEED_RANKING.md](./FEED_RANKING.md), [FEED_COMPOSITION.md](./FEED_COMPOSITION.md).

**Official circles:** all 8 topic circles are permanent membership (every user is always joined; no leave control).

---

## Screenshots

<!-- Add images before publishing — suggested paths: -->
<!-- ![Home feed — For You](docs/screenshots/home-foryou.png) -->
<!-- ![Circle hub](docs/screenshots/circle-detail.png) -->
<!-- ![Expert directory](docs/screenshots/experts.png) -->
<!-- ![Dark mode](docs/screenshots/dark-mode.png) -->

*Screenshots coming soon.*

---

## Getting started

**Requirements:** Node 18+, npm, [Expo Go](https://expo.dev/go) on a device or simulator.

```bash
git clone <your-repo-url>
cd chautari-test
npm install
npx expo start
```

Press `i` (iOS simulator), `a` (Android emulator), or scan the QR code in Expo Go.

State persists between launches via AsyncStorage. To reset: **Settings → Delete account**, or clear app storage.

Verify a clean bundle:

```bash
npx expo export --platform ios
```

---

## Roadmap

| Phase | Focus |
|-------|--------|
| **Now** | Prototype polish, UX validation, architecture hardening |
| **2025–26** | Supabase backend — auth (real OTP), PostgreSQL schema, RLS policies, file storage |
| **2026** | Beta with verified expert onboarding pipeline, moderation tools |
| **2027** | Public launch — Greater Melbourne, then national expansion |

---

## Repository notes

- `FEED_COMPOSITION.md` — For You 80/20 joined/discovery blend (quality gate, official permanent membership)
- `FEED_RANKING.md` — For You Hot/New ranking spec (constants, snapshot approach)
- `PRD.md` and `BUILD_BRIEF.md` — original product and design briefs used during prototype development
- `BUGS.md` — navigation audit log from polish passes
- No `.env` or secrets required to run this prototype

---

## Author

**Ashish Poudel** — product & engineering

---

Copyright © 2026 Ashish Poudel. All rights reserved.
