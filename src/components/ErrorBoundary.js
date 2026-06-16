import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';

/**
 * Catches render errors so one bad screen does not white-screen the whole app.
 * lastError is kept on the instance for console / future crash reporting.
 */
export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { error: null };
  }

  static getDerivedStateFromError(error) {
    return { error };
  }

  componentDidCatch(error, info) {
    this.lastError = { error, info };
    console.error('[ErrorBoundary]', error?.message || error, info?.componentStack);
  }

  reset = () => {
    this.setState({ error: null });
    this.props.onReset?.();
  };

  render() {
    const { error } = this.state;
    if (error) {
      const { fallbackTitle, fallbackMessage } = this.props;
      return (
        <View style={styles.wrap}>
          <Text style={styles.icon}>⚠️</Text>
          <Text style={styles.title}>{fallbackTitle || 'Something went wrong'}</Text>
          <Text style={styles.body}>
            {fallbackMessage || 'An unexpected error occurred. You can try again or go back.'}
          </Text>
          <Pressable onPress={this.reset} style={styles.btn}>
            <Text style={styles.btnText}>Try again</Text>
          </Pressable>
        </View>
      );
    }
    return this.props.children;
  }
}

const styles = StyleSheet.create({
  wrap: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
    backgroundColor: '#0f1419',
  },
  icon: { fontSize: 40, marginBottom: 16 },
  title: { fontSize: 20, fontWeight: '800', color: '#f5f5f5', marginBottom: 8, textAlign: 'center' },
  body: { fontSize: 15, color: '#9aa5b1', textAlign: 'center', lineHeight: 22, marginBottom: 24 },
  btn: {
    backgroundColor: '#c41e3a',
    paddingHorizontal: 28,
    paddingVertical: 14,
    borderRadius: 999,
  },
  btnText: { color: '#fff', fontWeight: '800', fontSize: 16 },
});
