# Chautari — Polish Pass Bug Audit

Audit date: 2026-06-09. Navigation tree and every `navigation.*` call reviewed against PRD.md / BUILD_BRIEF.md.

## Navigation tree

```
RootNavigator (native-stack)
├── [boot] Splash
├── [auth] Welcome → PhoneEntry → Otp → ProfileName → ProfileSuburb
└── [signed-in]
    ├── Main (bottom-tabs, headerShown: false)
    │   ├── Home
    │   ├── Circles (CirclesDirectoryScreen)
    │   ├── Experts (ExpertsStack → ExpertDirectory / ExpertProfile)
    │   └── Profile (MyProfileScreen)
    ├── QuestionDetail
    ├── CircleDetail / CreateCircle / EditCircle
    ├── Search
    ├── Notifications (pushed from Home bell)
    ├── ExpertProfile / UserProfile (root stack — opened from feeds, search, notifications)
    ├── VerifiedApplication / EditProfile / Settings
    ├── Help / Terms / Privacy / About / DeleteAccount
    └── [modal] AskComposer / AnswerComposer / Report / ImageViewer
```

---

## Bugs

| ID | Severity | Status | Description |
|----|----------|--------|-------------|
| NAV-001 | **High** | **Fixed** | Categories grid navigates to `Search` with `{ category }`. User lands on search input (auto-focused), not a category feed. Wrong title, wrong context, feels like a teleport. |
| NAV-002 | Medium | **Fixed** | `SearchScreen` initialises filters from `route.params` once via `useState`; revisiting Search can show stale category/query/filters from a prior visit. |
| NAV-003 | Medium | **Fixed** | No guard against double-tap double-push on cards, FABs, and list rows — rapid taps can stack duplicate screens. |
| NAV-004 | Low | **Fixed** | Notifications welcome tap uses `navigate('Experts')` without nesting — fragile if called outside tab context. Use `Main` → `Experts` for reliability. |
| NAV-005 | Low | **Fixed** | Expert/User profile screens mount with empty header title, then `useLayoutEffect` sets name — visible title jump. |
| ANIM-001 | **High** | **Fixed** | Home `FlatList` uses `key={tab-animKey}` forcing full list unmount/remount on tab switch and pull-to-refresh → flicker/jank. |
| ANIM-002 | Medium | **Fixed** | `FadeRise` only runs on mount; replay after refresh required remounting entire list (see ANIM-001). Needs `replayKey` prop. |
| ANIM-003 | Medium | **Fixed** | No explicit native-stack transition spec; modals not consistently configured. Risk of inconsistent transitions. |
| ANIM-004 | Medium | **Fixed** | `react-native-screens` not explicitly enabled at app entry. |
| ANIM-005 | Medium | **Fixed** | `QuestionCard` not memoized; inline `renderItem` closures in feeds recreate every render → scroll jank with seed data. |
| ANIM-006 | Low | **Fixed** | AskComposer success + Toast use `Easing.back` — slightly bouncy vs brief's ease-out restraint. |
| ANIM-007 | Low | **Fixed** | Home first-load skeleton → content swap not deferred past transition (`InteractionManager`). |
| PERF-001 | Medium | **Fixed** | FlatLists missing `initialNumToRender` / `windowSize` tuning for feed screens. |

## Deferred (conscious)

| ID | Reason |
|----|--------|
| NAV-D1 | **Fixed (Pass 8)** | Notifications moved off tab bar; pushed from Home bell. Alerts tab removed. |
| ANIM-D1 | Splash → auth → main navigator swap replaces screen tree on auth state change. Intentional; smoothing would need a cross-fade overlay (new UI work). |
| ANIM-D2 | `react-native-reanimated` not added — existing `Animated` + native driver covers this pass; reanimated only needed for gesture-linked motion we don't have. |

---

## QA checklist (post-fix)

- [x] Category tap → dedicated feed, correct title, back to Categories
- [x] Search from Home → clean search UI, no leaked category filter
- [x] Double-tap card → single navigation
- [x] Notification expert welcome → Experts tab
- [x] Profile headers show name immediately
- [x] Tab switch / refresh → no full-list flicker
- [x] `npx expo export` bundles clean
