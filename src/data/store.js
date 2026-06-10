// Global app state for Chautari. In-memory React state mirrored to AsyncStorage.
// This is the single mock "backend" — no network anywhere.
import React, { createContext, useContext, useEffect, useMemo, useReducer, useRef } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { seedUsers, seedQuestions, seedFollowing, seedNotifications } from './seed';
import { milestoneCrossed } from '../utils/format';

const STORAGE_KEY = 'chautari.state.v1';
const DataContext = createContext(null);

let idCounter = 1;
const uid = (p = 'id') => `${p}_${Date.now().toString(36)}_${idCounter++}`;

function buildInitialState() {
  return {
    booted: false,
    currentUserId: null, // null = signed out
    users: seedUsers,
    questions: seedQuestions,
    following: [], // ids the current user follows
    notifications: [],
    myUpvotes: { questions: [], answers: [], replies: [] },
    savedQuestions: [], // bookmarked question ids
    reports: [],
    expertApplication: null, // { category, customCategory, status }
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
        myUpvotes: {
          questions: [],
          answers: [],
          replies: [],
          ...(p.myUpvotes || {}),
        },
        savedQuestions: p.savedQuestions || [],
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
      };
      return {
        ...state,
        currentUserId: 'me',
        users: [me, ...state.users.filter((u) => u.id !== 'me')],
        following: seedFollowing,
        notifications: seedNotifications,
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
      const q = {
        id: action.id || uid('q'),
        authorId: 'me',
        anonymous: action.anonymous,
        category: action.category,
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
      // Detect a milestone crossing so we can drop a celebratory notification.
      let milestoneNote = null;
      const questions = state.questions.map((q) => ({
        ...q,
        answers: q.answers.map((a) => {
          if (a.id !== action.answerId) return a;
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
      return {
        ...state,
        myUpvotes: {
          ...state.myUpvotes,
          answers: has
            ? state.myUpvotes.answers.filter((id) => id !== action.answerId)
            : [...state.myUpvotes.answers, action.answerId],
        },
        questions,
        notifications: milestoneNote ? [milestoneNote, ...state.notifications] : state.notifications,
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

  // Latency from question posted to its first answer (for the "answered fast" cue).
  const firstAnswerLatency = (q) => {
    if (!q.answers || q.answers.length === 0) return null;
    const first = Math.min(...q.answers.map((a) => a.createdAt));
    return Math.max(0, first - q.createdAt);
  };

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

  // Following tab: questions whose author is followed, or that have an answer from a followed user.
  const followingFeed = () =>
    state.questions.filter((q) => {
      if (state.following.includes(q.authorId)) return true;
      return (q.answers || []).some((a) => state.following.includes(a.authorId));
    });

  const categoryCounts = () => {
    const counts = {};
    state.questions.forEach((q) => {
      counts[q.category] = (counts[q.category] || 0) + 1;
    });
    return counts;
  };

  const experts = () => state.users.filter((u) => u.verified);
  const myQuestions = () => state.questions.filter((q) => q.authorId === 'me');
  const questionsByAuthor = (id) => state.questions.filter((q) => q.authorId === id);
  const unreadNotifs = () => state.notifications.filter((n) => !n.read).length;

  return {
    state, userById, me, isFollowing,
    hasUpvotedQuestion, hasUpvotedAnswer, hasUpvotedReply, isSaved,
    questionById, answerCount, followingFeed, categoryCounts, experts,
    myQuestions, questionsByAuthor, savedQuestionsList, unreadNotifs,
    expertAnswerOn, hasExpertAnswer, firstAnswerLatency, newTodayCount, suggestedExperts,
  };
}
