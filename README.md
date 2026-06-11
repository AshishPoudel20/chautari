# Chautari (Prototype)

A mobile-first community Q&A app for the Nepali diaspora in Australia (Greater Melbourne, v1). Users ask questions and get answers from community members and **verified local experts** — migration agents, accountants, GPs, mortgage brokers, and more.

Built with **React Native (Expo SDK 54)**. English only, **light + dark mode**. **Everything is mocked locally** — no backend, no Twilio/Supabase/Firebase, no API keys.

> *A "chautari" is the shaded resting place under a tree where villagers gather to talk — the spirit of the app.*

---

## How to run

```bash
cd chautari-test
npm install        # if node_modules isn't present
npx expo start     # then press i (iOS), a (Android), or scan the QR in Expo Go
```

The app launches to an animated splash, then the welcome/onboarding flow. State persists between launches via **AsyncStorage**. To reset to a fresh seeded state, use **Settings → Delete account** (hard delete) or clear the app's storage.

### Verified clean
- `npx expo export --platform ios` bundles the full module graph with **no errors** (1039 modules).
- `npx expo start` boots Metro and serves on `:8081`.

### Pass 8 — Navigation restructure
- **Home header** — wordmark left; top-right **search** then **bell** (rightmost). Bell pushes **Activity** (notifications) on the root stack with unread count badge; mark-read-on-view unchanged.
- **Tab bar** — **Home · Circles · Experts · Profile**. Alerts tab removed; Experts tab hosts `ExpertsStack` (directory → expert profile within tab). Verified-check tab icon.
- **Re-plumbing** — digest tap and in-app notification routes target `Main` → `Circles` or `Experts`; orphaned root `Circles` / `ExpertDirectory` screens removed.

### Pass 7 — Circle dark-mode accents, newcomer gate
- **Circle colors (dark mode)** — accents are palette keys resolved through one theme-aware map (`light` / `dark` hex per key + contrast clamp on dark surfaces). All icon, chip, banner, swatch, and recommendation surfaces use `resolveCircleAccent`. Root cause of near-black circles: dark variants were derived too dim from light hex and some surfaces applied low-opacity light fills on dark backgrounds.
- **Newcomer checklist gate** — onboarding toggle “I'm new to Australia” stores `newcomer` + timestamp. First-30-Days checklist (For You card, My Profile row, screen) shows only when newcomer is active and within `NEWCOMER_WINDOW_DAYS` (60). Demo user hydrates with newcomer on. Dismiss on the feed card still applies.

### Pass 5 — Arrival checklist, founding badge
- **First 30 Days checklist** — 10 newcomer tasks (TFN, bank, SIM, Myki, health cover, GP, renting, licence, job hunt, emergency numbers). Featured card on For You (dismissible, persists in AsyncStorage) + row on My Profile with progress when newcomer gate is active. Each item deep-links to a seeded community thread; back returns to the checklist. Completion triggers a saffron celebration moment.
- **Founding Member badge** — mock flag for the first 1,000 users (`isFoundingMember`). Current user + ~half of seed users. Quiet saffron chip on **profiles only** (after Verified badge); tap opens info sheet. Never shown on feed cards or answers.

**Checklist → thread mapping:** TFN `q_chk_tfn` · Bank `q_chk_bank` · SIM `q17` · Myki `q_chk_myki` · Health cover `q_chk_health` · GP `q3` · Renting `q_chk_rent` · Licence `q14` · Job hunt `q21` · Emergency `q_chk_emergency`

### Pass 4 — Circle polish (rich hub, creator tools, recommendations)
- **Circle hub** — each circle detail is one scroll surface: accent-gradient banner with Nepali motif overlay (richer on Official circles), **collapsing header** (Reanimated) into a compact nav bar, About (collapsible description, creator link, created date), **Experts Here** row (verified experts with ≥1 answer in the circle; hidden if none), **pinned question** (max one, accent edge + quiet marker), then the question feed. FAB pre-selects the circle in Ask.
- **Creator tools** — circle creators see ⚙ on their circle page (not on Official circles). **Edit circle**: name (uniqueness + similar suggestions), description, accent preset — changes propagate everywhere. **Pin / unpin** any question in their circle from the question ⋯ menu (one max; toast on change). Seed: mock user is creator of **First Home Buyers AU** with pinned PSA + sample questions.
- **Circles you might like** — horizontal recommendation row in **For You only**, inserted once after the ~5th question card. 3–5 non-joined circles, one-tap Join (optimistic; joined circles slide out). Ranked by size/activity with a boost for name/description overlap with joined circles. Hidden when no candidates remain.

### Pass 3 — Circles, Karma, Digest
- **Circles** replace categories as the bundling system. Eight **Official** circles (auto-joined on signup) plus user-created circles (seed includes Footscray Nepali Community, First Home Buyers AU, Monash students, Cricket Melbourne, and tiny Gundruk Recipe Club). **Circles** tab + directory: join/leave, create with similar-circle suggestions, circle detail feed, circle chip on every card. **For You** mixes joined-circle posts with popular posts from *all* circles (liquidity protection — never joined-only).
- **Karma** (derived, not stored): +10 per answer upvote received, +2 per question upvote, +1 per reply upvote, +25 when a verified expert upvotes your answer. Shown on profiles and subtly on answer rows in question detail. Expert-upvote notifications are elevated in Activity.
- **Digest** — local `expo-notifications` summary at 6pm (daily/weekly/off in Settings). Tap opens Circles tab; digest also appears in in-app notifications.

### Targeted pass (upvote, dark mode, profile, expert entry)
- **Upvote fix** — `QuestionCard` splits tap area from `UpvoteButton` (44×44 target); question upvotes persist in store; works on feeds, detail, answers, replies, and other users' profiles.
- **Dark mode** — semantic tokens in `src/theme/palettes.js`, `ThemeProvider` + `useTheme()`, persisted in AsyncStorage. Toggle in **Settings → Appearance**. Navigator backgrounds follow the active palette.
- **My Profile** — identity only + options list: **My Posts**, **Saved Posts** (bookmark on question detail 🔖). Saves persist in mock store.
- **Verified expert** — quiet row at bottom of profile options ("Are you a professional? Apply for verification"), not a primary CTA.
- **Expert post cap UI** — verified experts see a live **2 posts/day** quota on profile, My Posts, Ask composer, and home FAB (muted + hint when limit reached).

### Polish pass (navigation + motion)
See `BUGS.md` for the full audit. Highlights:
- **Circle browse** — Circles tab replaces the old category grid; each circle has a dedicated feed.
- **Navigation guard** — double-tap debounce on list cards and primary nav actions.
- **Transitions** — native-stack `slide_from_right` / modal `slide_from_bottom`; `enableScreens()` at entry.
- **Feed performance** — memoized `QuestionCard`, shared `QuestionFeedList`, FlatList windowing; home tab switch no longer remounts the whole list (fixes flicker).
- **Search** — fresh open from Home resets filters; returning from a question keeps your query.

> On a headless Linux box you may see a non-fatal `libnspr4.so` warning from Expo's optional React Native DevTools shell. It's environmental (a missing system lib), does not affect bundling or the running app, and does not appear on a normal macOS/Windows dev machine.

---

## The design goal: "this place is alive"

This is a polished build (Build Brief v2). Every decision serves one feeling: a first-time user should sense, within 30 seconds, that **people are actually here, answering right now**. That's primarily a *signals* problem, not decoration:

- **Relative time everywhere** — "just now", "11 min ago", "2 hr ago", never raw dates in the feed.
- **Expert-answered marker** — cards where a verified expert has replied get a saffron "Expert answered" badge and a subtly **elevated** treatment (accent bar + softer shadow), so credibility reads at a glance.
- **"Answered fast" cue** — if a question got its first answer quickly, the card shows "⚡ First answer in 18 min", reinforcing that asking here gets results.
- **A quiet live pill** — the For You tab shows "*N* new questions today" with a gently **pulsing** saffron dot. Subtle, not a casino.
- **Staggered entrance** — cards fade-and-rise in on load (~260ms, capped cascade). Pull-to-refresh replays it.
- **Optimistic UI** — posting a question/answer/reply, upvoting, and following all reflect **instantly** (the reducer is synchronous), then the confirmation plays.
- **Milestone moments** — upvoting an answer past 5/10/20/50/100/200/500 fires a brief **saffron flash** on the button *and* drops a celebratory entry into Activity.

### Visual language

- **Colour** — a deep **Nepali crimson** primary, used sparingly (buttons, active states, expert/verified markers). Warm neutrals (off-white `#FAF6F0`, warm near-black text, soft grey borders) carry the layout. A **saffron/marigold** secondary is reserved for highlights only — the live pill, the expert-answered marker, upvote-milestone flashes. All of it lives as tokens in `src/theme/theme.js`; there are no one-off colours in the screens.
- **Type** — a clear scale (display / title / subtitle / body / caption / tiny) with generous line-height, since Askers read a lot of text.
- **Restrained Nepali nods** — a small **diamond motif** (textile/temple-inspired, built from plain Views) appears only in the splash, empty states, and dividers. Warm microcopy ("Namaste", "The chautari is quiet") where it feels natural — belonging felt quietly, not flags everywhere.
- **Depth & shape** — soft shadows, ~16px card radius, comfortable spacing, thumb-reachable primary actions.

---

## What's implemented

### Priority loop (flawless end-to-end)
`signup → feed → ask → answer → expert-profile → follow` all work against the mock data layer:

- **Auth (mock OTP):** phone entry (+61, AU mobile validation) → 6-digit OTP (any code accepted, 60s resend, 3-attempt counter) → name (required) → suburb + photo (optional, skippable).
- **Home feed:** For You (smart mix) + Following (followed only, with a warm empty state offering suggested experts to follow inline). Live pill, pull-to-refresh, staggered entrance, inviting Ask FAB.
- **Ask composer:** friendly live character counts that turn **warm-green when valid**, category chips, photo thumbnails, a **safe anonymous toggle** with a live "how it will appear" preview, optimistic post + success confirmation that drops you straight into the live thread.
- **Question detail:** verified-expert answers **pinned** above community answers with clear crimson hierarchy; community answers sortable **Top / Newest**; tactile animated upvotes with milestone flash; one-level threaded replies.
- **Answer composer modal:** question context, link insert, char count, safe anonymous toggle.

### All 22 screen groups from the PRD
Splash · Welcome (3 value-prop slides) · Phone Entry · OTP · Name · Suburb & Photo · Home (For You/Following) · Categories (grid of 8 with live counts) · Search (+ category/suburb/date filters) · Ask Composer · Question Detail · Answer Composer · Expert Directory (filter by category + suburb, inline follow) · Expert Profile (bio, profession, suburb, contact, posts, followers, follow) · Verified Application · Notifications (grouped, elevated expert entries) · My Profile · Other User Profile · Edit Profile · Settings · Report (content + expert) · Confirmation modals.

### Connective screens added in the completion pass
**Help & FAQ** (expandable Q&A) · **Terms & Conditions** · **Privacy Policy** · **About Chautari** (all real screens reached from Settings) · **Delete Account** (multi-step flow) · **Image Viewer** (opened when a question photo is tapped).

## No dead ends (completion pass)

Every interactive element responds — it does its real action against the mock data, or gives honest, polished feedback. Specifically:

- **Settings links are real screens**, not alerts: Help/FAQ, Terms, Privacy, About.
- **Account deletion** is a full flow: a warning screen spelling out exactly what's destroyed → mock OTP re-auth → a final "last chance" confirm → hard delete → back to the auth flow.
- **Logout** confirms, then returns to auth.
- **Edit Profile** works end-to-end against mock data (name, bio, suburb, photo) with a photo-source picker (camera / library / remove) and a "Profile updated" toast; changes show immediately.
- **Report** (content + expert): reason picker + optional detail → submit → stored in the mock `reports` list → confirmation toast.
- **Delete your own question** from the question's ⋯ menu (others see "Report" there instead).
- **Follow / unfollow** anywhere confirms with a toast; **upvotes** animate and fire milestone celebrations.
- **Notifications tap-through**: every notification navigates somewhere sensible (the question, the actor's profile, the Experts tab for the welcome notice) or toasts if there's nothing to open.
- **Empty states** for every list — feed, filtered Following (with suggested experts), search no-results, empty notifications, a profile with no posts, a thread with no answers.
- **Loading state**: the Home feed shows skeleton cards on first load; pull-to-refresh shows a spinner.
- **Offline state**: a demo "Simulate offline" toggle in Settings drives a real "No connection" treatment — an offline banner on Home, and Ask/Answer/Report block politely with a clear message instead of failing silently.
- **Confirmation feedback** (toast or modal) on every create / delete / follow / report action.

### Rules enforced (client-side)
- **Question:** title 10–120, body 30–4000, category required, ≤5 photos, anonymous hides name/photo/suburb.
- **Answer:** body 20–4000, links allowed, no photos, anonymous toggle. Verified-expert answers pinned to top.
- **Reply:** one level only, 5–1000 chars.
- **Upvotes:** one per user per answer/reply, toggle off by re-tapping (`myUpvotes`). Crossing a milestone fires a notification.
- **Following:** one-way, no requests. Following count public; a community user's followers are visible only to self.
- **Verified expert:** claim → category (or custom) → credential upload (mock) → auto-approved; badge on profile + answers; 2/day cap surfaced as copy.
- **Anonymous mode** → "Anonymous" + neutral placeholder avatar. **No photo** → deterministic first-letter avatar.
- **Account deletion** → hard delete (wipes storage, returns to signed-out seeded state).

### Seed data (alive on first launch)
- **12 users** including **6 verified experts** spanning migration, tax & super, health, loans, IT & careers, and real estate — each with a bio, suburb, follower count, and their own posts.
- **23 questions** across all 8 categories with realistic Nepali-Australian context (485/820 visas, FHSS on a temp visa, bulk-billing GPs, rental applications, breaking a lease, IT job hunting, sending money home, Dashain), **~48 answers** + threaded replies, varied just-now/hours/days timestamps, and several **near-milestone** upvote counts to show the mechanic.
- The signed-in user **follows 2 experts** on launch so the Following tab isn't empty.

---

## What's mocked / simplified (assumptions)

- **Expo SDK 54** — the brief specified SDK 54 and the project is pinned to it (RN 0.81). No version downgrade was needed.
- **No real auth.** OTP accepts any 6 digits. A single local profile (`id: 'me'`) represents the signed-in user; "multi-device" isn't meaningful without a backend.
- **No image picker.** Photo and credential uploads are simulated. Edit Profile has a working photo-source picker (camera / library / remove); camera and library honestly report they're unavailable in the prototype and fall back to the letter avatar. Tapping a question photo opens a full-screen Image Viewer showing the placeholder enlarged. Wiring `expo-image-picker` would be the production step.
- **Offline is a demo toggle.** Nothing here truly needs a network, so rather than fake random failures, Settings has a clearly-labelled "Simulate offline mode" switch. With it on, the "No connection" states (Home banner, blocked posting/reporting) are real and demonstrable.
- **Notifications are local/in-app.** Seeded entries plus live milestone entries fired by your own upvotes. There's no push delivery (no real push service in a prototype).
- **Expert review is auto-approved** instead of a real admin queue. The store also supports a `pending` status to demo that path.
- **The question's own upvote** is local UI state (the detail screen lets you toggle it); answer/reply upvotes are fully interactive and persisted.
- **Links** in answers/replies are detected and styled but not made tappable (kept dependency-free). Expert "Contact" uses `Linking` to open `mailto:`.
- **Expert posting caps & promo-language rules** are surfaced as copy, not hard-enforced.
- **Icons** use emoji rather than an icon font, and motion uses React Native's built-in `Animated` — no `react-native-svg`, `reanimated`, or `gesture-handler` — so the prototype stays dependency-light and bundles cleanly anywhere.

### Intentionally left as honest stubs (and why)
- **Camera / photo library** — no `expo-image-picker`, so these report unavailability and fall back to the deterministic letter avatar. Keeps the prototype installable anywhere with no native permissions setup.
- **Credential upload** in the expert application is a mocked file state — there's no real file storage.
- **Followers / following counts** on profiles are not tappable. A dedicated followers-list screen isn't in the PRD, and the completion pass deliberately *finishes existing flows rather than adding net-new features*.
- **"Still need help?"** in the FAQ has no live-support link — there's no support backend in a prototype.
- These are surfaced with clear copy in-app; none is a silent dead tap.

---

## Project structure

```
App.js                      # SafeAreaProvider + DataProvider + RootNavigator
src/
  data/
    seed.js                 # 12 users, 23 questions, ~48 answers, notifications
    categories.js           # 8 fixed categories + Melbourne suburbs + professionLabel
    store.js                # Context + reducer + AsyncStorage + selectors (incl. alive signals)
    network.js              # mock connectivity (drives the offline demo)
  navigation/
    RootNavigator.js        # splash → auth stack ↔ signed-in stack (+ modals)
    MainTabs.js             # Home · Circles · Experts · Profile
    ExpertsStack.js         # Expert directory + profiles (tab stack)
  components/
    QuestionCard, UpvoteButton, ExpertMarker, FollowButton, VerifiedBadge,
    Avatar, Button, ProfileView, Motif, Motion (FadeRise/PulseDot),
    Toast (global), Skeleton, DocScreen, ui.js
  screens/                  # all screens incl. Help, Terms, Privacy, About,
                            #   DeleteAccount, ImageViewer
  theme/theme.js            # colour/spacing/type/shadow tokens (single source of truth)
  utils/format.js           # relative time, latency, milestones, compact numbers
```

## Tech notes
- State is a single `useReducer` store in `src/data/store.js`, mirrored to AsyncStorage under `chautari.state.v1`. All mutations go through typed actions; `useSelectors()` exposes read helpers including the "alive" signals (`expertAnswerOn`, `firstAnswerLatency`, `newTodayCount`, `suggestedExperts`).
- Motion is built on React Native's `Animated` API: `FadeRise` (staggered entrance), `PulseDot` (live indicator), the upvote scale + milestone flash, and the splash. No animation dependencies.
- Navigation is `@react-navigation/native` with a native-stack root (conditionally rendering auth vs. signed-in from `currentUserId`) and a bottom-tab navigator. Account creation is deferred to the **final** onboarding step so the navigator doesn't swap mid-flow.
- Plain JS/JSX (no TypeScript) for speed; light mode only (per brief).
