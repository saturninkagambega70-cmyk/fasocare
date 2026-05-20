import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { FasoCareIcon } from './FasoCareIcon';

export class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    if (__DEV__) {
      console.warn('ErrorBoundary caught:', error, errorInfo);
    }
  }

  render() {
    if (this.state.hasError) {
      return (
        <View style={styles.container}>
          <FasoCareIcon size={64} />
          <Text style={styles.title}>Une erreur est survenue</Text>
          <Text style={styles.subtitle}>
            L'application a rencontré un problème. Nos équipes ont été notifiées.
          </Text>
          {__DEV__ && this.state.error && (
            <Text style={styles.errorDetail}>{this.state.error.toString()}</Text>
          )}
          <TouchableOpacity
            style={styles.button}
            onPress={() => this.setState({ hasError: false, error: null })}
            accessibilityRole="button"
            accessibilityLabel="Réessayer"
          >
            <Text style={styles.buttonText}>Réessayer</Text>
          </TouchableOpacity>
        </View>
      );
    }
    return this.props.children;
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8fafc',
    padding: 30,
  },
  title: {
    fontSize: 22,
    fontWeight: '900',
    color: '#1e293b',
    marginTop: 20,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 14,
    color: '#64748b',
    textAlign: 'center',
    marginTop: 10,
    lineHeight: 20,
  },
  errorDetail: {
    fontSize: 11,
    color: '#dc2626',
    textAlign: 'center',
    marginTop: 15,
    fontFamily: 'monospace',
    padding: 10,
    backgroundColor: '#fef2f2',
    borderRadius: 8,
    overflow: 'hidden',
  },
  button: {
    marginTop: 30,
    backgroundColor: '#0d6e3f',
    paddingVertical: 15,
    paddingHorizontal: 40,
    borderRadius: 16,
  },
  buttonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
});
