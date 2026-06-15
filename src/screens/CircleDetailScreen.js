import React, { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import {
  View, Text, StyleSheet, Pressable, Alert, StatusBar, Animated, Image, RefreshControl,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import QuestionCard from '../components/QuestionCard';
import PinnedQuestionCard from '../components/PinnedQuestionCard';
import CircleAboutSection from '../components/CircleAboutSection';
import ExpertsHereRow from '../components/ExpertsHereRow';
import MotifOverlay from '../components/MotifOverlay';
import CircleIcon from '../components/CircleIcon';
import { EmptyState } from '../components/ui';
import { FadeRise } from '../components/Motion';
import { useData, useSelectors } from '../data/store';
import { useNavigationGuard, openAuthorProfile, openExpertProfile, runAfterAlert } from '../utils/navigation';
import { useLiveDataRefresh } from '../hooks/useLiveDataRefresh';
import { useTheme } from '../theme/ThemeContext';
import { resolveCircleAccent, circleBannerGradient } from '../data/circles';
import { photoUrl, displayPhotoUrl } from '../utils/photos';

const BANNER_EXPANDED = 196;
const COLLAPSE_RANGE = 130;
const COMPACT_BAR = 52;

const LIST_PERF = {
  initialNumToRender: 8,
  maxToRenderPerBatch: 6,
  windowSize: 7,
  removeClippedSubviews: true,
};

function clampInterp(scrollY, inputRange, outputRange) {
  return scrollY.interpolate({ inputRange, outputRange, extrapolate: 'clamp' });
}

export default function CircleDetailScreen({ navigation, route }) {
  const circleId = route.params?.circleId;
  const { dispatch } = useData();
  const {
    circleById, isJoinedCircle, questionsInCircle, pinnedQuestionInCircle,
    expertsInCircle, isCircleCreator, joinedCirclesList,
    userById, answerCount, expertAnswerOn, state,
  } = useSelectors();
  const { navigate, goBack } = useNavigationGuard(navigation);
  const { colors, spacing, font, radius, shadow, isDark } = useTheme();
  const insets = useSafeAreaInsets();
  const styles = useMemo(() => createStyles(colors, spacing, font, radius, shadow, insets), [colors, spacing, font, radius, shadow, insets]);

  const circle = circleById(circleId);
  const joined = isJoinedCircle(circleId);
  const data = questionsInCircle(circleId);
  const pinned = pinnedQuestionInCircle(circleId);
  const experts = expertsInCircle(circleId);
  const creator = circle?.creatorId ? userById(circle.creatorId) : null;
  const showCreatorTools = isCircleCreator(circleId);
  const accent = circle ? resolveCircleAccent(circle.accentId, isDark, colors.surface) : null;
  const banner = circle ? circleBannerGradient(circle, isDark, colors) : null;

  const scrollY = useRef(new Animated.Value(0)).current;
  const [compactInteractive, setCompactInteractive] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const refreshLiveData = useLiveDataRefresh({ onFocus: true });

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await refreshLiveData();
    } finally {
      setRefreshing(false);
    }
  }, [refreshLiveData]);

  useEffect(() => {
    const threshold = COLLAPSE_RANGE * 0.45;
    const id = scrollY.addListener(({ value }) => {
      setCompactInteractive(value > threshold);
    });
    return () => scrollY.removeListener(id);
  }, [scrollY]);

  const onScroll = useMemo(
    () => Animated.event(
      [{ nativeEvent: { contentOffset: { y: scrollY } } }],
      { useNativeDriver: false },
    ),
    [scrollY],
  );

  const bannerStyle = useMemo(() => ({
    height: clampInterp(scrollY, [0, COLLAPSE_RANGE], [BANNER_EXPANDED, 72]),
    opacity: clampInterp(scrollY, [0, COLLAPSE_RANGE * 0.85], [1, 0.92]),
  }), [scrollY]);

  const expandedContentStyle = useMemo(() => ({
    opacity: clampInterp(scrollY, [0, COLLAPSE_RANGE * 0.55], [1, 0]),
    transform: [{
      translateY: clampInterp(scrollY, [0, COLLAPSE_RANGE], [0, -12]),
    }],
  }), [scrollY]);

  const compactBarStyle = useMemo(() => ({
    opacity: clampInterp(scrollY, [COLLAPSE_RANGE * 0.45, COLLAPSE_RANGE], [0, 1]),
    transform: [{
      translateY: clampInterp(scrollY, [COLLAPSE_RANGE * 0.45, COLLAPSE_RANGE], [-6, 0]),
    }],
  }), [scrollY]);

  useLayoutEffect(() => {
    navigation.setOptions({ headerShown: false });
  }, [navigation]);

  const toggleJoin = useCallback(() => {
    if (circle?.isOfficial) return;
    dispatch({ type: 'TOGGLE_JOIN_CIRCLE', circleId });
  }, [circle, dispatch, circleId]);

  const openCreatorMenu = useCallback(() => {
    Alert.alert('Circle settings', null, [
      { text: 'Edit circle', onPress: () => runAfterAlert(() => navigate('EditCircle', { circleId })) },
      { text: 'Cancel', style: 'cancel' },
    ]);
  }, [navigate, circleId]);

  const goToProfile = useCallback((userId) => {
    const u = userById(userId);
    if (u?.verified) {
      openExpertProfile(navigation, {
        userId,
        title: u.name,
        authUserId: state.authUserId,
        navigate,
      });
      return;
    }
    openAuthorProfile(navigate, userById, userId, { authUserId: state.authUserId, navigation });
  }, [navigate, navigation, userById, state.authUserId]);

  const openQuestion = useCallback(
    (questionId) => navigate('QuestionDetail', { questionId }),
    [navigate],
  );

  const renderItem = useCallback(({ item, index }) => {
    const ei = expertAnswerOn(item);
    return (
      <FadeRise index={index}>
        <QuestionCard
          question={item}
          author={userById(item.authorId)}
          circle={circle}
          answerCount={answerCount(item)}
          expert={ei?.expert || null}
          onPress={() => openQuestion(item.id)}
          onCirclePress={() => {}}
          onAuthorPress={() => openAuthorProfile(navigate, userById, item.authorId, { anonymous: item.anonymous, authUserId: state.authUserId, navigation })}
          hideCircleChip
        />
      </FadeRise>
    );
  }, [userById, circle, answerCount, expertAnswerOn, openQuestion, navigate]);

  const listHeader = useMemo(() => {
    const bannerImage = displayPhotoUrl(circle?.imageUrl);
    return (
    <View>
      <Animated.View style={[styles.bannerShell, bannerStyle]}>
        {bannerImage ? (
          <Image source={{ uri: bannerImage }} style={StyleSheet.absoluteFill} resizeMode="cover" />
        ) : null}
        <LinearGradient
          colors={banner?.colors || [colors.bg, colors.bg]}
          locations={banner?.locations}
          style={StyleSheet.absoluteFill}
        />
        <MotifOverlay color={banner?.onAccent || accent?.onAccent || '#fff'} opacity={banner?.motifOpacity || 0.1} />
        <Animated.View style={[styles.bannerInner, expandedContentStyle]}>
          <CircleIcon circle={circle} size="lg" />
          <View style={styles.bannerTextCol}>
            <View style={styles.titleRow}>
              <Text style={[styles.bannerTitle, { color: accent?.onAccent }]} numberOfLines={2}>{circle?.name}</Text>
              {circle?.isOfficial ? (
                <View style={[styles.official, { backgroundColor: `${accent?.onAccent}22`, borderColor: `${accent?.onAccent}55` }]}>
                  <Text style={[styles.officialText, { color: accent?.onAccent }]}>Official</Text>
                </View>
              ) : null}
            </View>
            <Text style={[styles.bannerMembers, { color: `${accent?.onAccent}cc` }]}>{circle?.memberCount} members</Text>
          </View>
          {circle?.isOfficial ? (
            <View style={[styles.bannerJoin, { backgroundColor: `${accent?.onAccent}22`, borderColor: `${accent?.onAccent}66` }]}>
              <Text style={[styles.bannerJoinText, { color: accent?.onAccent }]}>Member</Text>
            </View>
          ) : (
            <Pressable
              onPress={toggleJoin}
              style={[styles.bannerJoin, { backgroundColor: `${accent?.onAccent}22`, borderColor: `${accent?.onAccent}66` }]}
            >
              <Text style={[styles.bannerJoinText, { color: accent?.onAccent }]}>{joined ? 'Joined' : 'Join'}</Text>
            </Pressable>
          )}
        </Animated.View>
      </Animated.View>

      <CircleAboutSection
        circle={circle}
        creator={creator}
        onCreatorPress={() => creator && goToProfile(creator.id)}
      />

      <ExpertsHereRow experts={experts} onExpertPress={goToProfile} />

      {pinned ? (
        <PinnedQuestionCard
          question={pinned}
          author={userById(pinned.authorId)}
          circle={circle}
          answerCount={answerCount(pinned)}
          expert={expertAnswerOn(pinned)?.expert || null}
          onPress={() => openQuestion(pinned.id)}
          onCirclePress={() => {}}
          onAuthorPress={() => openAuthorProfile(navigate, userById, pinned.authorId, { anonymous: pinned.anonymous, authUserId: state.authUserId, navigation })}
          hideCircleChip
        />
      ) : null}
    </View>
  );
  }, [styles, bannerStyle, banner, colors, accent, circle, expandedContentStyle, joined, toggleJoin, creator, goToProfile, experts, pinned, userById, answerCount, expertAnswerOn, openQuestion]);

  if (!circle) {
    return (
      <View style={styles.container}>
        <Text style={styles.missing}>This circle is no longer available.</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} />

      <Animated.View
        pointerEvents={compactInteractive ? 'box-none' : 'none'}
        style={[styles.compactBar, compactBarStyle, { paddingTop: insets.top }]}
      >
        <View style={styles.compactInner}>
          <View style={styles.compactTitleWrap}>
            <CircleIcon circle={circle} size="chip" />
            <Text style={styles.compactTitle} numberOfLines={1}>{circle.name}</Text>
          </View>
          {circle.isOfficial ? (
            <View style={[styles.compactJoin, styles.compactJoinOn]}>
              <Text style={[styles.compactJoinText, { color: accent?.color }]}>Member</Text>
            </View>
          ) : (
            <Pressable onPress={toggleJoin} style={[styles.compactJoin, joined && styles.compactJoinOn]}>
              <Text style={[styles.compactJoinText, joined && { color: accent?.color }]}>{joined ? 'Joined' : 'Join'}</Text>
            </Pressable>
          )}
        </View>
      </Animated.View>

      <View pointerEvents="box-none" style={[styles.navRow, { paddingTop: insets.top + 6 }]}>
        <Pressable onPress={goBack} style={styles.backBtn} hitSlop={{ top: 4, bottom: 4, left: 4, right: 4 }}>
          <Text style={styles.backIcon}>←</Text>
        </Pressable>
        {showCreatorTools ? (
          <Pressable onPress={openCreatorMenu} style={styles.backBtn} hitSlop={8}>
            <Text style={styles.gearIcon}>⚙</Text>
          </Pressable>
        ) : <View style={styles.gearBtn} />}
      </View>

      <Animated.FlatList
        data={data}
        keyExtractor={(q) => q.id}
        renderItem={renderItem}
        ListHeaderComponent={listHeader}
        ListEmptyComponent={(
          <EmptyState
            icon={circle.icon}
            title="Be the first to post"
            subtitle={`Start the conversation in ${circle.name}.`}
            action={{
              label: `Post in ${circle.name.split(' ')[0]}`,
              onPress: () => navigate('AskComposer', { circleId }),
            }}
          />
        )}
        contentContainerStyle={{ paddingBottom: 110 }}
        showsVerticalScrollIndicator={false}
        onScroll={onScroll}
        scrollEventThrottle={16}
        refreshControl={(
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={accent?.color || colors.primary}
            colors={[accent?.color || colors.primary]}
          />
        )}
        {...LIST_PERF}
      />

      <Pressable
        style={({ pressed }) => [styles.fab, { backgroundColor: accent.color }, pressed && { opacity: 0.9 }]}
        onPress={() => navigate('AskComposer', { circleId })}
      >
        <Text style={[styles.fabText, { color: accent.onAccent }]}>＋ Post</Text>
      </Pressable>
    </View>
  );
}

const createStyles = (colors, spacing, font, radius, shadow, insets) => StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  missing: { padding: spacing.xl, color: colors.textMuted, textAlign: 'center' },

  navRow: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 20,
    elevation: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
  },
  backBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    ...shadow.card,
  },
  backIcon: { fontSize: 22, fontWeight: '700', color: colors.text },
  gearBtn: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center' },
  gearIcon: { fontSize: 20, color: colors.text },

  compactBar: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 15,
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    ...shadow.card,
  },
  compactInner: {
    height: COMPACT_BAR,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingLeft: spacing.lg + 44,
  },
  compactTitleWrap: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 8, marginRight: spacing.sm },
  compactTitle: { fontSize: font.body, fontWeight: '800', color: colors.text, flexShrink: 1 },
  compactJoin: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: radius.pill,
    borderWidth: 1.5,
    borderColor: colors.border,
  },
  compactJoinOn: { backgroundColor: colors.primaryTint },
  compactJoinText: { fontWeight: '800', fontSize: font.tiny, color: colors.text },

  bannerShell: { overflow: 'hidden', marginBottom: 0 },
  bannerInner: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.lg,
    paddingTop: insets.top + 52,
    gap: spacing.md,
  },
  bannerTextCol: { flex: 1 },
  titleRow: { flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap', gap: 8 },
  bannerTitle: { fontSize: font.h2, fontWeight: '800', flexShrink: 1 },
  official: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: radius.pill, borderWidth: 1 },
  officialText: { fontSize: font.tiny, fontWeight: '900', letterSpacing: 0.3 },
  bannerMembers: { fontSize: font.caption, fontWeight: '600', marginTop: 4 },
  bannerJoin: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: radius.pill,
    borderWidth: 1.5,
    alignSelf: 'flex-end',
  },
  bannerJoinText: { fontWeight: '800', fontSize: font.caption },

  fab: { position: 'absolute', right: spacing.lg, bottom: spacing.xl, paddingHorizontal: 22, paddingVertical: 14, borderRadius: radius.pill, ...shadow.floating },
  fabText: { fontWeight: '800', fontSize: font.bodyLg },
});
