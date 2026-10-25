# Chautari

**Community Q&A for the Nepali diaspora in Australia**

Chautari is a mobile-first platform where newcomers and long-term residents ask practical questions â€” visas, tax, healthcare, renting, careers â€” and get answers from the community and **verified local experts** (migration agents, accountants, GPs, mortgage brokers, and more).

> *A chautari is the shaded resting place under a tree where villagers gather to talk â€” the spirit of the product.*

---

## Problem

Settling in Australia involves hundreds of small, high-stakes decisions spread across fragmented forums, Facebook groups, and word-of-mouth. Information is noisy, outdated, or hard to trust. Chautari concentrates that knowledge in one place, with clear signals for who is a verified professional versus a helpful neighbour sharing lived experience.

**Target launch:** 2027 (Greater Melbourne first, Australia-wide later)

**Current status:** In active development. Hybrid model: mock seed feed + **Supabase** for auth, profiles, user-generated Q&A sync, and **photo storage** when `.env` is configured.

---

## Photo upload (Supabase Storage)

Real image pick â†’ compress (HEICâ†’JPEG) â†’ upload â†’ public URL â†’ render everywhere.

| Target | Limit | Config |
|--------|-------|--------|
| Question photos | Up to 5, ~5 MB each, JPEG/PNG/HEIC | Always on |
| Profile avatar | Single image; native 1:1 crop + circular preview confirm | Always on |
| Circle banner | Single image (create/edit) | Always on; accent fallback when none |
| Answer / reply photos | Single each | `ENABLE_REPLY_PHOTOS` in `src/constants/media.js` (PRD excludes these; prototype flag) |

**Bucket:** public `media` â€” see [`supabase/migrations/006_storage_media.sql`](supabase/migrations/006_storage_media.sql) and [`supabase/README.md`](supabase/README.md).

**Client:** `expo-image-picker` + `expo-image-manipulator`; all uploads go through `uploadImageAsset()` in `src/services/mediaStorage.js` (stage blob/crop URIs â†’ `file://` JPEG â†’ expo-file-system base64 â†’ ArrayBuffer â†’ Supabase Storage). Never `fetch(blob:)`. Requires signed-in Supabase user.

**Profile photo flow:** chooser â†’ native square crop (`allowsEditing` + `aspect: [1, 1]`) â†’ `ProfilePhotoPreview` screen (circular `Avatar` at 88pt) â†’ upload on confirm. Question/circle/answer flows skip preview/crop.

**iOS gallery in Expo Go:** The shared picker requests `requestMediaLibraryPermissionsAsync()` then opens the library after the source sheet dismisses (iOS blocks the picker if it opens while a modal is closing). Fully quit and reopen Expo Go after changing `app.json` permission strings; those keys apply to dev builds, not Expo Goâ€™s own Info.plist â€” if the library still never prompts, use a development build so `photosPermission` is embedded.

---

## Tech stack

| Layer | Technology |
|-------|------------|
| Mobile app | React Native, Expo SDK 54 |
| Navigation | React Navigation (native stack + bottom tabs) |
| State (prototype) | React Context + reducer, persisted via AsyncStorage |
| Theming | Semantic design tokens, light + dark mode |
| Planned production | Supabase (PostgreSQL, Auth, Row Level Security, Realtime, Storage) |

The prototype runs **offline-capable mock feed** from `seed.js` while **auth, profiles, user posts, and photos** sync to Supabase when `EXPO_PUBLIC_SUPABASE_URL` and `EXPO_PUBLIC_SUPABASE_ANON_KEY` are set in `.env` (see `.env.example`).

---

## Key features (built in this prototype)

- **Onboarding** â€” phone OTP flow (mocked), profile setup, newcomer opt-in for arrival checklist
- **Feeds** â€” For You with **Hot/New** toggle, **80/20 joined/discovery** composition ([FEED_COMPOSITION.md](./docs/FEED_COMPOSITION.md)), and permanent membership in the 8 official circles; Following tab; live activity signals. Ranking: [FEED_RANKING.md](./docs/FEED_RANKING.md).
- **Circles** â€” official topic communities + user-created circles; join/leave, create, edit, pin
- **Q&A** â€” ask/answer/reply, anonymous posting, **real photo upload**, bookmarks, upvotes with karma
- **Verified experts** â€” directory with filters, expert profiles, pinned expert answers, daily post cap
- **Notifications** â€” grouped activity feed, digest scheduling (local `expo-notifications`)
- **Arrival checklist** â€” first-60-days newcomer tasks with deep-links to community threads
- **Trust & safety surfaces** â€” report flows, account deletion, legal/help screens

---

## Architecture overview

```
App.js
â”œâ”€â”€ ThemeProvider          # light/dark semantic tokens
â”œâ”€â”€ DataProvider           # mock store (store.js) â†” AsyncStorage
â””â”€â”€ RootNavigator
    â”œâ”€â”€ Auth stack         # splash â†’ welcome â†’ OTP â†’ profile setup
    â””â”€â”€ Signed-in stack
        â”œâ”€â”€ MainTabs       # Home Â· Circles Â· Experts Â· Profile
        â”œâ”€â”€ Modals         # Ask, Answer, Report, Image viewer
        â””â”€â”€ Push screens   # Question detail, Search, Activity, Settings, â€¦
```

**Data layer (prototype):** `src/data/store.js` is the single mock backend â€” questions, users, circles, notifications, and user actions all flow through a reducer with selectors. Seed data in `src/data/seed.js` refreshes relative timestamps on each launch so the feed feels alive.

**Theming:** `src/theme/palettes.js` defines semantic colour tokens consumed via `useTheme()` â€” no hardcoded colours in screens.

**Circles accent system:** palette keys resolve to theme-aware light/dark hex values with contrast clamping (`src/data/circles.js`, `src/utils/color.js`).

**For You ranking:** constants in `src/feed/rankingConfig.js` (`DISCOVERY_RATIO`, `DISCOVERY_MIN_SCORE`, Hot score weights); snapshot-per-session Hot sort in `src/feed/feedRanking.js`; 80/20 composition in `src/feed/feedComposition.js` + `src/hooks/useForYouFeed.js`. Specs: [FEED_RANKING.md](./docs/FEED_RANKING.md), [FEED_COMPOSITION.md](./docs/FEED_COMPOSITION.md).

**Official circles:** all 8 topic circles are permanent membership (every user is always joined; no leave control).

---

## Screenshots

<!-- Add images before publishing â€” suggested paths: -->
<!-- ![Home feed â€” For You](docs/screenshots/home-foryou.png) -->
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

State persists between launches via AsyncStorage. To reset: **Settings â†’ Delete account**, or clear app storage.

Verify a clean bundle:

```bash
npx expo export --platform ios
```

---

## Roadmap

| Phase | Focus |
|-------|--------|
| **Now** | Prototype polish, UX validation, architecture hardening |
| **2025â€“26** | Supabase backend â€” auth (real OTP), PostgreSQL schema, RLS policies, file storage |
| **2026** | Beta with verified expert onboarding pipeline, moderation tools |
| **2027** | Public launch â€” Greater Melbourne, then national expansion |

---

## Repository notes

- `docs/FEED_COMPOSITION.md` â€” For You 80/20 joined/discovery blend (quality gate, official permanent membership)
- `docs/FEED_RANKING.md` â€” For You Hot/New ranking spec (constants, snapshot approach)
- `docs/PRD.md` and `docs/BUILD_BRIEF.md` â€” original product and design briefs used during prototype development
- `docs/BUGS.md` â€” navigation audit log from polish passes
- `src/constants/media.js` â€” upload limits + `ENABLE_REPLY_PHOTOS` flag
- Copy `.env.example` â†’ `.env` for Supabase (gitignored; never commit secrets)

---

## Author

**Ashish Poudel** â€” product & engineering

---

Copyright Â© 2026 Ashish Poudel. All rights reserved.
