import React, { useMemo, useEffect, useRef, useState } from 'react';
import { View, Text, StyleSheet, TextInput, Pressable, ActivityIndicator } from 'react-native';
import Button from '../../components/common/Button';
import KeyboardScreen from '../../components/common/KeyboardScreen';
import { useTheme } from '../../theme/ThemeContext';
import { useData } from '../../data/store';
import { fetchProfile } from '../../services/profile';
import { sendPhoneOtp, verifyPhoneOtp, usesMockOtp } from '../../services/auth';

const LENGTH = 6;

export default function OtpScreen({ navigation, route }) {
  const { colors, spacing, font, radius } = useTheme();
  const styles = useMemo(() => createStyles(colors, spacing, font, radius), [colors, spacing, font, radius]);
  const { dispatch } = useData();

  const phone = route.params?.phone || '';
  const phoneE164 = route.params?.phoneE164 || '';
  const [code, setCode] = useState('');
  const [seconds, setSeconds] = useState(60);
  const [attempts, setAttempts] = useState(3);
  const [error, setError] = useState('');
  const [verifying, setVerifying] = useState(false);
  const inputRef = useRef(null);
  const mockOtp = usesMockOtp();

  useEffect(() => {
    if (seconds <= 0) return;
    const t = setInterval(() => setSeconds((s) => (s > 0 ? s - 1 : 0)), 1000);
    return () => clearInterval(t);
  }, [seconds]);

  const goToOnboarding = () => {
    navigation.navigate('ProfileName', { phone, phoneE164 });
  };

  const afterRealOtp = async (userId) => {
    dispatch({ type: 'SET_AUTH', userId });
    const row = await fetchProfile(userId);
    if (row?.name?.trim()) {
      dispatch({ type: 'RESTORE_SESSION', userId, profile: row });
      return;
    }
    goToOnboarding();
  };

  const verify = async () => {
    if (code.length !== LENGTH || verifying) {
      if (code.length !== LENGTH) {
        const left = attempts - 1;
        setAttempts(left);
        setError(left > 0 ? `Enter all 6 digits. ${left} attempt${left === 1 ? '' : 's'} left.` : 'Too many attempts. Resend a new code.');
        if (left <= 0) setCode('');
      }
      return;
    }

    setError('');
    setVerifying(true);
    try {
      if (mockOtp) {
        goToOnboarding();
        return;
      }
      const { user } = await verifyPhoneOtp(phoneE164, code);
      await afterRealOtp(user.id);
    } catch (e) {
      const left = attempts - 1;
      setAttempts(left);
      setError(left > 0 ? (e?.message || 'Invalid code. Try again.') : 'Too many attempts. Resend a new code.');
      if (left <= 0) setCode('');
    } finally {
      setVerifying(false);
    }
  };

  const resend = async () => {
    setSeconds(60);
    setAttempts(3);
    setError('');
    setCode('');
    if (!mockOtp && phoneE164) {
      try {
        await sendPhoneOtp(phoneE164);
      } catch (e) {
        setError(e?.message || 'Could not resend code.');
      }
    }
  };

  const cells = Array.from({ length: LENGTH }, (_, i) => code[i] || '');

  return (
    <KeyboardScreen
      contentStyle={styles.body}
      footer={(
        <View style={styles.footer}>
          <Button title={verifying ? 'Verifying…' : 'Verify'} onPress={verify} disabled={code.length !== LENGTH || verifying} />
          {verifying ? <ActivityIndicator style={{ marginTop: spacing.md }} color={colors.primary} /> : null}
        </View>
      )}
    >
      <Text style={styles.title}>Enter your code</Text>
      <Text style={styles.sub}>
        Sent to {phone}.
        {mockOtp ? ' (Demo: type any 6 digits.)' : ''}
      </Text>

      <Pressable style={styles.cells} onPress={() => inputRef.current?.focus()}>
        {cells.map((c, i) => (
          <View key={i} style={[styles.cell, code.length === i && styles.cellActive]}>
            <Text style={styles.cellText}>{c}</Text>
          </View>
        ))}
      </Pressable>

      <TextInput
        ref={inputRef}
        value={code}
        onChangeText={(t) => { setError(''); setCode(t.replace(/\D/g, '').slice(0, LENGTH)); }}
        keyboardType="number-pad"
        style={styles.hiddenInput}
        autoFocus
        maxLength={LENGTH}
      />

      {error ? <Text style={styles.err}>{error}</Text> : null}

      <View style={styles.resendRow}>
        {seconds > 0 ? (
          <Text style={styles.resendMuted}>Resend code in {seconds}s</Text>
        ) : (
          <Pressable onPress={resend}><Text style={styles.resendLink}>Resend code</Text></Pressable>
        )}
      </View>
    </KeyboardScreen>
  );
}

const createStyles = (colors, spacing, font, radius) => StyleSheet.create({
  body: { paddingHorizontal: spacing.xl, paddingTop: spacing.lg, paddingBottom: spacing.xl },
  title: { fontSize: font.h1, fontWeight: '800', color: colors.text, marginBottom: spacing.sm },
  sub: { fontSize: font.body, color: colors.textMuted, marginBottom: spacing.xl },
  cells: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: spacing.lg },
  cell: { width: 48, height: 58, borderRadius: radius.md, borderWidth: 1.5, borderColor: colors.border, backgroundColor: colors.surface, alignItems: 'center', justifyContent: 'center' },
  cellActive: { borderColor: colors.primary },
  cellText: { fontSize: 26, fontWeight: '700', color: colors.text },
  hiddenInput: { position: 'absolute', opacity: 0, height: 1, width: 1 },
  err: { color: colors.danger, fontSize: font.small, fontWeight: '600', marginBottom: spacing.sm },
  resendRow: { marginTop: spacing.sm },
  resendMuted: { color: colors.textMuted, fontSize: font.small },
  resendLink: { color: colors.primary, fontSize: font.small, fontWeight: '700' },
  footer: { paddingHorizontal: spacing.xl, paddingBottom: spacing.md },
});
