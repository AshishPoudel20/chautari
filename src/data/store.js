// Global app state for Chautari. In-memory React state mirrored to AsyncStorage.
// This is the single mock "backend" — no network anywhere.
import React, { createContext, useContext, useEffect, useMemo, useReducer, useRef } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  seedUsers, seedQuestions, seedFollowing, seedNotifications,
  seedCircles, seedJoinedCircles,
} from './seed';
import { milestoneCrossed, startOfLocalDay } from '../utils/format';
import { computeKarmaForUser } from '../utils/karma';
import { slugify, isCircleNameTaken } from './circles';
import { NEWCOMER_WINDOW_MS } from '../constants/newcomer';

export const EXPERT_DAILY_POST_LIMIT = 2;

const STORAGE_KEY = 'chautari.state.v2';
const DataContext = createContext(null);

let idCounter = 1;
const uid = (p = 'id') => `${p}_${Date.now().toString(36)}_${idCounter++}`;

const sortQuestions = (list) => [...list].sort((a, b) => b.createdAt - a.createdAt);

function normalizeQuestion(q) {
  const circleId = q.circleId || q.category;
  return circleId ? { ...q, circleId } : q;
}

// Pull in new seed questions and refresh relative timestamps on every launch.
function mergeQuestions(persisted = []) {
  const byId = new Map(persisted.map((q) => [q.id, normalizeQuestion(q)]));
  for (const sq of seedQuestions) {
    const existing = byId.get(sq.id);
    const normalized = normalizeQuestion(sq);
    byId.set(sq.id, existing ? {
      ...existing,
      createdAt: normalized.createdAt,
      circleId: normalized.circleId,
    } : normalized);
  }
  return sortQuestions([...byId.values()]);
}

function mergeCircles(persisted = []) {
  const byId = new Map(persisted.map((c) => [c.id, c]));
  for (const sc of seedCircles) {
    const existing = byId.get(sc.id);
    if (!existing) {
      byId.set(sc.id, sc);
    } else {
      byId.set(sc.id, {
        ...existing,
        pinnedQuestionId: sc.isOfficial
          ? sc.pinnedQuestionId
          : (existing.pinnedQuestionId ?? sc.pinnedQuestionId ?? null),
        creatorId: sc.id === 'c_fhb' ? 'me' : existing.creatorId,
      });
    }
  }
  return [...byId.values()];
}

function defaultJoinedCircles() {
  return [...seedJoinedCircles];
}

function mergeUsers(persisted = []) {
  const byId = new Map(persisted.map((u) => [u.id, u]));
  for (const su of seedUsers) {
    const existing = byId.get(su.id);
    if (!existing) byId.set(su.id, su);
    else if (su.id !== 'me') {
      byId.set(su.id, {
        ...existing,
        verified: su.verified,
        profession: su.profession,
        verifiedCategory: su.verifiedCategory,
        bio: su.bio,
        name: su.name,
        suburb: su.suburb,
        isFoundingMember: existing.isFoundingMember ?? su.isFoundingMember ?? false,
      });
    }
  }
  return [...byId.values()];
}

function buildInitialState() {
  return {
    booted: false,
    currentUserId: null, // null = signed out
    users: seedUsers,
    circles: seedCircles,
    joinedCircles: defaultJoinedCircles(),
    questions: sortQuestions(seedQuestions.map(normalizeQuestion)),
    following: [], // ids the current user follows
    notifications: [],
    myUpvotes: { questions: [], answers: [], replies: [] },
    savedQuestions: [], // bookmarked question ids
    reports: [],
    expertApplication: null, // { category, customCategory, status }
    expertUpvoteBonuses: { u_bibek: 2, u_pratima: 1, u_dipesh: 3, u_sunita: 1 },
    digestMode: 'daily', // 'daily' | 'weekly' | 'off'
    checklistDone: [],
    checklistCardDismissed: false,
    newcomer: false,
    newcomerSince: null,
  };
}

function reducer(state, action) {
  switch (action.type) {
    case 'HYDRATE': {
      const p = action.payload;
      return {
        ...state,
        ...p,
        booted: true,
        users: mergeUsers(p.users || []).map((u) =>
          u.id === 'me' ? { ...u, isFoundingMember: u.isFoundingMember ?? true } : u
        ),
        questions: mergeQuestions(p.questions || []),
        myUpvotes: {
          questions: [],
          answers: [],
          replies: [],
          ...(p.myUpvotes || {}),
        },
        savedQuestions: p.savedQuestions || [],
        circles: mergeCircles(p.circles || []),
        joinedCircles: p.joinedCircles?.length ? p.joinedCircles : defaultJoinedCircles(),
        expertUpvoteBonuses: p.expertUpvoteBonuses || {},
        digestMode: p.digestMode || 'daily',
        checklistDone: p.checklistDone || [],
        checklistCardDismissed: !!p.checklistCardDismissed,
        newcomer: p.newcomer ?? (p.currentUserId === 'me'),
        newcomerSince: p.newcomerSince ?? (p.currentUserId === 'me' ? Date.now() : null),
      };
    }
    case 'BOOTED':
      return { ...state, booted: true };

    case 'SIGN_UP': {
      // Create the 'me' user with a name; following/notifications seeded now.
      const me = {
        id: 'me',
        name: action.name,
        suburb: null,
        photo: null,
        bio: '',
        verified: false,
        followers: 7,
        createdAt: Date.now(),
        isFoundingMember: true,
      };
      return {
        ...state,
        currentUserId: 'me',
        users: [me, ...state.users.filter((u) => u.id !== 'me')],
        following: seedFollowing,
        notifications: seedNotifications,
        joinedCircles: defaultJoinedCircles(),
        circles: state.circles.map((c) =>
          c.id === 'c_fhb' ? { ...c, creatorId: 'me' } : c
        ),
        newcomer: !!action.newcomer,
        newcomerSince: action.newcomer ? Date.now() : null,
      };
    }

    case 'UPDATE_PROFILE':
      return {
        ...state,
        users: state.users.map((u) => (u.id === 'me' ? { ...u, ...action.patch } : u)),
      };

    case 'LOGOUT':
      return { ...state, currentUserId: null };

    case 'DELETE_ACCOUNT': {
      // Hard delete: wipe everything and return to a clean seeded, signed-out state.
      return buildInitialState();
    }

    case 'ASK_QUESTION': {
      const author = state.users.find((u) => u.id === 'me');
      if (author?.verified) {
        const dayStart = startOfLocalDay();
        const todayCount = state.questions.filter(
          (q) => q.authorId === 'me' && q.createdAt >= dayStart,
        ).length;
        if (todayCount >= EXPERT_DAILY_POST_LIMIT) return state;
      }
      const q = {
        id: action.id || uid('q'),
        authorId: 'me',
        anonymous: action.anonymous,
        circleId: action.circleId,
        title: action.title.trim(),
        body: action.body.trim(),
        photos: action.photos || [],
        createdAt: Date.now(),
        upvotes: 0,
        views: 0,
        answers: [],
      };
      return { ...state, questions: [q, ...state.questions] };
    }

    case 'ADD_ANSWER': {
      const answer = {
        id: uid('a'),
        authorId: 'me',
        anonymous: action.anonymous,
        body: action.body.trim(),
        createdAt: Date.now(),
        upvotes: 0,
        replies: [],
      };
      return {
        ...state,
        questions: state.questions.map((q) =>
          q.id === action.questionId ? { ...q, answers: [...q.answers, answer] } : q
        ),
      };
    }

    case 'ADD_REPLY': {
      const reply = {
        id: uid('r'),
        authorId: 'me',
        anonymous: action.anonymous,
        body: action.body.trim(),
        createdAt: Date.now(),
        upvotes: 0,
      };
      return {
        ...state,
        questions: state.questions.map((q) =>
          q.id !== action.questionId
            ? q
            : {
                ...q,
                answers: q.answers.map((a) =>
                  a.id === action.answerId ? { ...a, replies: [...(a.replies || []), reply] } : a
                ),
              }
        ),
      };
    }

    case 'TOGGLE_UPVOTE_QUESTION': {
      const has = state.myUpvotes.questions.includes(action.questionId);
      const delta = has ? -1 : 1;
      return {
        ...state,
        myUpvotes: {
          ...state.myUpvotes,
          questions: has
            ? state.myUpvotes.questions.filter((id) => id !== action.questionId)
            : [...state.myUpvotes.questions, action.questionId],
        },
        questions: state.questions.map((q) =>
          q.id === action.questionId ? { ...q, upvotes: Math.max(0, q.upvotes + delta) } : q
        ),
      };
    }

    case 'TOGGLE_SAVE_QUESTION': {
      const has = state.savedQuestions.includes(action.questionId);
      return {
        ...state,
        savedQuestions: has
          ? state.savedQuestions.filter((id) => id !== action.questionId)
          : [...state.savedQuestions, action.questionId],
      };
    }

    case 'TOGGLE_UPVOTE_ANSWER': {
      const has = state.myUpvotes.answers.includes(action.answerId);
      const delta = has ? -1 : 1;
      const meUser = state.users.find((u) => u.id === 'me');
      let milestoneNote = null;
      let answerAuthorId = null;
      let questionIdForBonus = null;

      const questions = state.questions.map((q) => ({
        ...q,
        answers: q.answers.map((a) => {
          if (a.id !== action.answerId) return a;
          answerAuthorId = a.authorId;
          questionIdForBonus = q.id;
          const next = Math.max(0, a.upvotes + delta);
          const m = milestoneCrossed(a.upvotes, next);
          if (m) {
            milestoneNote = {
              id: uid('n'),
              type: 'milestone',
              questionId: q.id,
              milestone: m,
              text: `An answer you upvoted just hit ${m} upvotes 🎉`,
              createdAt: Date.now(),
              read: false,
            };
          }
          return { ...a, upvotes: next };
        }),
      }));

      let expertUpvoteBonuses = { ...state.expertUpvoteBonuses };
      if (!has && delta > 0 && meUser?.verified && answerAuthorId && answerAuthorId !== 'me') {
        expertUpvoteBonuses[answerAuthorId] = (expertUpvoteBonuses[answerAuthorId] || 0) + 1;
      } else if (has && meUser?.verified && answerAuthorId && answerAuthorId !== 'me') {
        expertUpvoteBonuses[answerAuthorId] = Math.max(0, (expertUpvoteBonuses[answerAuthorId] || 0) - 1);
      }

      const newNotifs = [milestoneNote].filter(Boolean);
      return {
        ...state,
        myUpvotes: {
          ...state.myUpvotes,
          answers: has
            ? state.myUpvotes.answers.filter((id) => id !== action.answerId)
            : [...state.myUpvotes.answers, action.answerId],
        },
        questions,
        expertUpvoteBonuses,
        notifications: newNotifs.length ? [...newNotifs, ...state.notifications] : state.notifications,
      };
    }

    case 'TOGGLE_UPVOTE_REPLY': {
      const has = state.myUpvotes.replies.includes(action.replyId);
      const delta = has ? -1 : 1;
      return {
        ...state,
        myUpvotes: {
          ...state.myUpvotes,
          replies: has
            ? state.myUpvotes.replies.filter((id) => id !== action.replyId)
            : [...state.myUpvotes.replies, action.replyId],
        },
        questions: state.questions.map((q) => ({
          ...q,
          answers: q.answers.map((a) => ({
            ...a,
            replies: (a.replies || []).map((r) =>
              r.id === action.replyId ? { ...r, upvotes: Math.max(0, r.upvotes + delta) } : r
            ),
          })),
        })),
      };
    }

    case 'TOGGLE_FOLLOW': {
      const has = state.following.includes(action.userId);
      return {
        ...state,
        following: has
          ? state.following.filter((id) => id !== action.userId)
          : [...state.following, action.userId],
        users: state.users.map((u) =>
          u.id === action.userId
            ? { ...u, followers: Math.max(0, (u.followers || 0) + (has ? -1 : 1)) }
            : u
        ),
      };
    }

    case 'DELETE_QUESTION':
      return { ...state, questions: state.questions.filter((q) => q.id !== action.questionId) };

    case 'MARK_NOTIFS_READ':
      return { ...state, notifications: state.notifications.map((n) => ({ ...n, read: true })) };

    case 'SUBMIT_EXPERT_APPLICATION':
      return {
        ...state,
        expertApplication: {
          category: action.category,
          customCategory: action.customCategory || null,
          credentialName: action.credentialName || null,
          status: action.status, // 'approved' | 'pending'
          submittedAt: Date.now(),
        },
        users:
          action.status === 'approved'
            ? state.users.map((u) =>
                u.id === 'me'
                  ? {
                      ...u,
                      verified: true,
                      verifiedCategory: action.category,
                      profession: action.customCategory || u.profession || 'Verified Expert',
                    }
                  : u
              )
            : state.users,
      };

    case 'ADD_REPORT':
      return { ...state, reports: [...state.reports, { id: uid('rep'), ...action.report, createdAt: Date.now() }] };

    case 'ADD_NOTIFICATION': {
      const n = { id: uid('n'), read: false, ...action.notification };
      return { ...state, notifications: [n, ...state.notifications] };
    }

    case 'CREATE_CIRCLE': {
      const name = action.name.trim();
      if (!name || isCircleNameTaken(name, state.circles)) return state;
      const id = action.id || uid('c');
      const circle = {
        id,
        name,
        handle: slugify(name),
        description: action.description.trim(),
        icon: action.icon,
        accentId: action.accentId,
        creatorId: 'me',
        memberCount: 1,
        createdAt: Date.now(),
        isOfficial: false,
      };
      return {
        ...state,
        circles: [circle, ...state.circles],
        joinedCircles: [...state.joinedCircles, id],
      };
    }

    case 'TOGGLE_JOIN_CIRCLE': {
      const { circleId } = action;
      const has = state.joinedCircles.includes(circleId);
      if (has && state.joinedCircles.length <= 1) return state;
      const joinedCircles = has
        ? state.joinedCircles.filter((id) => id !== circleId)
        : [...state.joinedCircles, circleId];
      const delta = has ? -1 : 1;
      return {
        ...state,
        joinedCircles,
        circles: state.circles.map((c) =>
          c.id === circleId ? { ...c, memberCount: Math.max(0, (c.memberCount || 0) + delta) } : c
        ),
      };
    }

    case 'SET_DIGEST_MODE':
      return { ...state, digestMode: action.mode };

    case 'UPDATE_CIRCLE': {
      const circle = state.circles.find((c) => c.id === action.circleId);
      if (!circle || circle.isOfficial || circle.creatorId !== 'me') return state;
      const name = action.name?.trim();
      if (!name || isCircleNameTaken(name, state.circles, action.circleId)) return state;
      return {
        ...state,
        circles: state.circles.map((c) =>
          c.id === action.circleId
            ? {
                ...c,
                name,
                handle: slugify(name),
                description: action.description.trim(),
                accentId: action.accentId,
              }
            : c
        ),
      };
    }

    case 'PIN_QUESTION_TO_CIRCLE': {
      const circle = state.circles.find((c) => c.id === action.circleId);
      const question = state.questions.find((q) => q.id === action.questionId);
      if (!circle || circle.isOfficial || circle.creatorId !== 'me') return state;
      if (!question || question.circleId !== action.circleId) return state;
      return {
        ...state,
        circles: state.circles.map((c) =>
          c.id === action.circleId ? { ...c, pinnedQuestionId: action.questionId } : c
        ),
      };
    }

    case 'TOGGLE_CHECKLIST_ITEM': {
      const has = state.checklistDone.includes(action.itemId);
      return {
        ...state,
        checklistDone: has
          ? state.checklistDone.filter((id) => id !== action.itemId)
          : [...state.checklistDone, action.itemId],
      };
    }

    case 'DISMISS_CHECKLIST_CARD':
      return { ...state, checklistCardDismissed: true };

    case 'UNPIN_QUESTION_FROM_CIRCLE': {
      const circle = state.circles.find((c) => c.id === action.circleId);
      if (!circle || circle.isOfficial || circle.creatorId !== 'me') return state;
      if (circle.pinnedQuestionId !== action.questionId) return state;
      return {
        ...state,
        circles: state.circles.map((c) =>
          c.id === action.circleId ? { ...c, pinnedQuestionId: null } : c
        ),
      };
    }

    default:
      return state;
  }
}

export function DataProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, undefined, buildInitialState);
  const hydrated = useRef(false);

  // Load persisted state once.
  useEffect(() => {
    (async () => {
      try {
        const raw = await AsyncStorage.getItem(STORAGE_KEY);
        if (raw) dispatch({ type: 'HYDRATE', payload: JSON.parse(raw) });
        else dispatch({ type: 'BOOTED' });
      } catch (e) {
        dispatch({ type: 'BOOTED' });
      } finally {
        hydrated.current = true;
      }
    })();
  }, []);

  // Persist on change (after first hydration).
  useEffect(() => {
    if (!hydrated.current || !state.booted) return;
    const { booted, ...toSave } = state;
    AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(toSave)).catch(() => {});
  }, [state]);

  const value = useMemo(() => ({ state, dispatch }), [state]);
  return <DataContext.Provider value={value}>{children}</DataContext.Provider>;
}

export function useData() {
  const ctx = useContext(DataContext);
  if (!ctx) throw new Error('useData must be used within DataProvider');
  return ctx;
}

// ---- Selectors / helpers (hook form) -----------------------------------
export function useSelectors() {
  const { state } = useData();
  const userById = (id) => state.users.find((u) => u.id === id) || null;
  const me = () => userById('me');
  const isFollowing = (id) => state.following.includes(id);
  const hasUpvotedQuestion = (id) => state.myUpvotes.questions.includes(id);
  const hasUpvotedAnswer = (id) => state.myUpvotes.answers.includes(id);
  const hasUpvotedReply = (id) => state.myUpvotes.replies.includes(id);
  const isSaved = (id) => state.savedQuestions.includes(id);
  const savedQuestionsList = () =>
    state.savedQuestions
      .map((id) => state.questions.find((q) => q.id === id))
      .filter(Boolean);
  const questionById = (id) => state.questions.find((q) => q.id === id) || null;

  const answerCount = (q) => (q.answers || []).reduce((n, a) => n + 1 + (a.replies?.length || 0), 0);

  // "Alive" signals --------------------------------------------------------
  // The earliest non-anonymous verified-expert answer on a question, if any.
  const expertAnswerOn = (q) => {
    const expert = (q.answers || [])
      .filter((a) => !a.anonymous && userById(a.authorId)?.verified)
      .sort((a, b) => a.createdAt - b.createdAt)[0];
    if (!expert) return null;
    return { answer: expert, expert: userById(expert.authorId) };
  };
  const hasExpertAnswer = (q) => !!expertAnswerOn(q);

  // Questions posted in the last 24h — drives the "X new today" live pill.
  const newTodayCount = () => {
    const cutoff = Date.now() - 24 * 60 * 60 * 1000;
    return state.questions.filter((q) => q.createdAt >= cutoff).length;
  };

  // Experts the signed-in user does not yet follow — for the empty Following tab
  // and discovery prompts.
  const suggestedExperts = (limit = 3) =>
    state.users
      .filter((u) => u.verified && u.id !== 'me' && !state.following.includes(u.id))
      .sort((a, b) => (b.followers || 0) - (a.followers || 0))
      .slice(0, limit);

  const circleById = (id) => state.circles.find((c) => c.id === id) || null;
  const isJoinedCircle = (id) => state.joinedCircles.includes(id);
  const joinedCirclesList = () =>
    state.joinedCircles.map((id) => circleById(id)).filter(Boolean);
  const officialCircles = () => state.circles.filter((c) => c.isOfficial);
  const userCircles = () => state.circles.filter((c) => !c.isOfficial);

  const circleQuestionCount = (circleId) =>
    state.questions.filter((q) => q.circleId === circleId).length;

  const circleActivitySince = (circleId, sinceMs = 24 * 60 * 60 * 1000) => {
    const cutoff = Date.now() - sinceMs;
    return state.questions.filter((q) => q.circleId === circleId && q.createdAt >= cutoff).length;
  };

  const pinnedQuestionInCircle = (circleId) => {
    const circle = circleById(circleId);
    if (!circle?.pinnedQuestionId) return null;
    return questionById(circle.pinnedQuestionId);
  };

  const questionsInCircle = (circleId, { excludePinned = true } = {}) => {
    const circle = circleById(circleId);
    const pinned = excludePinned ? circle?.pinnedQuestionId : null;
    return sortQuestions(
      state.questions.filter((q) => q.circleId === circleId && q.id !== pinned),
    );
  };

  const expertsInCircle = (circleId) => {
    const expertIds = new Set();
    for (const q of state.questions) {
      if (q.circleId !== circleId) continue;
      for (const a of q.answers || []) {
        if (a.anonymous) continue;
        const u = userById(a.authorId);
        if (u?.verified) expertIds.add(u.id);
      }
    }
    return [...expertIds].map((id) => userById(id)).filter(Boolean);
  };

  const isCircleCreator = (circleId) => {
    const c = circleById(circleId);
    return !!c && !c.isOfficial && c.creatorId === 'me';
  };

  const recommendedCircles = (limit = 5) => {
    const joined = new Set(state.joinedCircles);
    const joinedWords = new Set();
    state.circles
      .filter((c) => joined.has(c.id))
      .forEach((c) => {
        `${c.name} ${c.description}`.toLowerCase().split(/\W+/).forEach((w) => {
          if (w.length > 3) joinedWords.add(w);
        });
      });
    return state.circles
      .filter((c) => !joined.has(c.id))
      .map((c) => {
        let score = c.memberCount || 0;
        `${c.name} ${c.description}`.toLowerCase().split(/\W+/).forEach((w) => {
          if (joinedWords.has(w)) score += 45;
        });
        return { c, score };
      })
      .sort((a, b) => b.score - a.score || b.c.createdAt - a.c.createdAt)
      .slice(0, limit)
      .map((x) => x.c);
  };

  const feedQuestions = () => sortQuestions(state.questions);

  // For You: joined circles boosted, but ALL circles eligible (liquidity protection).
  const forYouFeed = () => {
    const joined = new Set(state.joinedCircles);
    const dayAgo = Date.now() - 24 * 60 * 60 * 1000;
    return [...state.questions]
      .map((q) => {
        let score = (q.upvotes || 0) * 2 + (q.answers?.length || 0) * 4;
        if (joined.has(q.circleId)) score += 40;
        if (q.createdAt >= dayAgo) score += 25;
        score += q.createdAt / 1e12;
        return { q, score };
      })
      .sort((a, b) => b.score - a.score)
      .map((x) => x.q);
  };

  const followingFeed = () =>
    sortQuestions(
      state.questions.filter((q) => {
        if (state.following.includes(q.authorId)) return true;
        return (q.answers || []).some((a) => state.following.includes(a.authorId));
      }),
    );

  const karmaFor = (userId) => computeKarmaForUser(state, userId);

  const experts = () => state.users.filter((u) => u.verified);
  const myQuestions = () => sortQuestions(state.questions.filter((q) => q.authorId === 'me'));
  const questionsByAuthor = (id) => sortQuestions(state.questions.filter((q) => q.authorId === id));
  const expertAuthoredQuestions = () =>
    sortQuestions(
      state.questions.filter((q) => !q.anonymous && userById(q.authorId)?.verified),
    );

  const expertPostsToday = (userId = 'me') => {
    const dayStart = startOfLocalDay();
    return state.questions.filter((q) => q.authorId === userId && q.createdAt >= dayStart).length;
  };
  const expertPostsRemaining = (userId = 'me') =>
    Math.max(0, EXPERT_DAILY_POST_LIMIT - expertPostsToday(userId));
  const canExpertPostToday = () => {
    const user = me();
    if (!user?.verified) return true;
    return expertPostsToday() < EXPERT_DAILY_POST_LIMIT;
  };
  const unreadNotifs = () => state.notifications.filter((n) => !n.read).length;

  const isChecklistItemDone = (itemId) => state.checklistDone.includes(itemId);
  const checklistDoneCount = () => state.checklistDone.length;
  const isQuestionOwner = (q) => !!q && (q.authorId === 'me' || q.authorId === 'me_seed_anon');

  const isNewcomerActive = () =>
    !!state.newcomer
    && !!state.newcomerSince
    && Date.now() - state.newcomerSince < NEWCOMER_WINDOW_MS;

  return {
    state, userById, me, isFollowing,
    hasUpvotedQuestion, hasUpvotedAnswer, hasUpvotedReply, isSaved,
    questionById, answerCount, feedQuestions, forYouFeed, followingFeed, experts,
    myQuestions, questionsByAuthor, expertAuthoredQuestions, savedQuestionsList, unreadNotifs,
    expertAnswerOn, hasExpertAnswer, newTodayCount, suggestedExperts,
    expertPostsToday, expertPostsRemaining, canExpertPostToday, expertDailyPostLimit: EXPERT_DAILY_POST_LIMIT,
    circleById, isJoinedCircle, joinedCirclesList, officialCircles, userCircles,
    circleQuestionCount, circleActivitySince, questionsInCircle, pinnedQuestionInCircle,
    expertsInCircle, isCircleCreator, recommendedCircles, karmaFor,
    isChecklistItemDone, checklistDoneCount, isQuestionOwner, isNewcomerActive,
  };
}
