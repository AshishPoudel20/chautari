import React, { useMemo,  useState  } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Button from '../components/Button';
import KeyboardScreen from '../components/KeyboardScreen';
import { Input } from '../components/ui';
import { useTheme } from '../theme/ThemeContext';

// AU mobile entry. +61 is fixed; user types the 9-digit mobile (starts with 4).
export default function PhoneEntryScreen({ navigation }) {
  const { colors, spacing, font, radius } = useTheme();
  const styles = useMemo(() => createStyles(colors, spacing, font, radius), [colors, spacing, font, radius]);

  const [digits, setDigits] = useState('');
  const cleaned = digits.replace(/\D/g, '');

  // AU mobile: 9 digits beginning with 4 (e.g. 412 345 678).
  const valid = /^4\d{8}$/.test(cleaned);

  const onSend = () => {
    if (!valid) return;
    navigation.navigate('Otp', { phone: `+61 ${cleaned}` });
  };

  return (
    <KeyboardScreen
      contentStyle={styles.body}
      footer={(
        <View style={styles.footer}>
          <Button title="Send code" onPress={onSend} disabled={!valid} />
        </View>
      )}
    >
      <Text style={styles.title}>What's your number?</Text>
      <Text style={styles.sub}>We'll text you a 6-digit code to verify it. No passwords, ever.</Text>

      <View style={styles.phoneRow}>
        <View style={styles.prefix}><Text style={styles.prefixText}>🇦🇺 +61</Text></View>
        <Input
          style={styles.phoneInput}
          placeholder="412 345 678"
          keyboardType="number-pad"
          value={digits}
          onChangeText={setDigits}
          maxLength={12}
          autoFocus
        />
      </View>
      {cleaned.length > 0 && !valid ? (
        <Text style={styles.err}>Enter a valid Australian mobile (9 digits starting with 4).</Text>
      ) : (
        <Text style={styles.hint}>Australian mobile numbers only for v1 (Greater Melbourne).</Text>
      )}
    </KeyboardScreen>
  );
}

const createStyles = (colors, spacing, font, radius) => StyleSheet.create({
  body: { paddingHorizontal: spacing.xl, paddingTop: spacing.lg, paddingBottom: spacing.xl },
  title: { fontSize: font.h1, fontWeight: '800', color: colors.text, marginBottom: spacing.sm },
  sub: { fontSize: font.body, color: colors.textMuted, lineHeight: 22, marginBottom: spacing.xl },
  phoneRow: { flexDirection: 'row', gap: spacing.sm },
  prefix: { justifyContent: 'center', paddingHorizontal: spacing.md, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border, borderRadius: radius.md },
  prefixText: { fontSize: font.body, fontWeight: '700', color: colors.text },
  phoneInput: { flex: 1, fontSize: font.h3, letterSpacing: 1 },
  hint: { fontSize: font.tiny, color: colors.textFaint, marginTop: spacing.sm },
  err: { fontSize: font.tiny, color: colors.danger, marginTop: spacing.sm, fontWeight: '600' },
  footer: { paddingHorizontal: spacing.xl, paddingBottom: spacing.md },
});
