import { Platform } from 'react-native';

let Notifications;
const isAndroid = Platform.OS === 'android';
const isWeb = Platform.OS === 'web';

const mockNotifications = {
  setNotificationHandler: () => {},
  getPermissionsAsync: async () => ({ status: 'undetermined' }),
  requestPermissionsAsync: async () => ({ status: 'denied' }),
  scheduleNotificationAsync: async () => {},
  cancelAllScheduledNotificationsAsync: async () => {},
  getAllScheduledNotificationsAsync: async () => [],
  addNotificationReceivedListener: () => ({ remove: () => {} }),
  addNotificationResponseReceivedListener: () => ({ remove: () => {} }),
  removeAllNotificationListeners: () => {},
  getBadgeCountAsync: async () => 0,
  setBadgeCountAsync: async () => true,
  getDevicePushTokenAsync: async () => ({ data: 'mock-token' }),
  getExpoPushTokenAsync: async () => ({ data: 'mock-expo-token' }),
};

if (isAndroid || isWeb) {
  Notifications = { ...mockNotifications };
} else {
  try {
    Notifications = require('expo-notifications');
  } catch (e) {
    if (__DEV__) console.warn('Could not load expo-notifications, using mock.');
    Notifications = { ...mockNotifications };
  }
}

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

export const requestNotificationPermissions = async () => {
  try {
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;
    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }
    if (finalStatus !== 'granted') {
      return false;
    }
    return true;
  } catch (error) {
    if (__DEV__) console.error('Error requesting notification permissions:', error);
    return false;
  }
};

export const scheduleLocalNotification = async (title, body, data = {}) => {
  try {
    await Notifications.scheduleNotificationAsync({
      content: {
        title,
        body,
        data,
      },
      trigger: null,
    });
  } catch (error) {
    if (__DEV__) console.error('Error scheduling local notification:', error);
  }
};

export const scheduleAppointmentReminder = async (title, body, date) => {
  try {
    await Notifications.scheduleNotificationAsync({
      content: { title, body },
      trigger: date,
    });
  } catch (error) {
    if (__DEV__) console.error('Error scheduling appointment reminder:', error);
  }
};
