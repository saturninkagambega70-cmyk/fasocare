import * as Sentry from '@sentry/react-native';

export const initSentry = () => {
  if (!__DEV__) {
    const dsn = process.env.EXPO_PUBLIC_SENTRY_DSN;
    if (!dsn) {
      if (__DEV__) console.warn('Sentry DSN non configuré. Définissez EXPO_PUBLIC_SENTRY_DSN dans .env');
      return;
    }
    Sentry.init({
      dsn,
      tracesSampleRate: 0.2,
      enableAutoPerformanceTracing: true,
      attachScreenshot: false,
    });
  }
};

export const captureError = (error, context = {}) => {
  if (!__DEV__) {
    Sentry.captureException(error, { extra: context });
  }
};

export default Sentry;
