// app/services/notification.service.ts
import { Platform } from 'react-native';
import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import messaging from '@react-native-firebase/messaging';
import { databases } from '../Service-Vale-apk/lib/appwrite'; // Adjust the import path as necessary
import { ID, Query } from 'appwrite';

const DATABASE_ID = '681c428b00159abb5e8b';
const TOKENS_COLLECTION_ID = 'notification_tokens';

// Configure notification handling
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

// Get FCM token and save to Appwrite
export async function registerForPushNotifications(userId: string) {
  if (!Device.isDevice) return;

  // Request permission
  const { status } = await Notifications.requestPermissionsAsync();
  if (status !== 'granted') return;

  // Get FCM token
  const token = await messaging().getToken();

  // Save to Appwrite
  try {
    const existingTokens = await databases.listDocuments(
      DATABASE_ID,
      TOKENS_COLLECTION_ID,
      [Query.equal('device_id', userId)]
    );

    if (existingTokens.documents.length > 0) {
      // Update existing token
      await databases.updateDocument(
        DATABASE_ID,
        TOKENS_COLLECTION_ID,
        existingTokens.documents[0].$id,
        { token, platform: Platform.OS }
      );
    } else {
      // Create new token
      await databases.createDocument(
        DATABASE_ID,
        TOKENS_COLLECTION_ID,
        ID.unique(),
        { token, device_id: userId, platform: Platform.OS }
      );
    }
  } catch (error) {
    console.error("Failed to save FCM token:", error);
  }
}

// Handle background notifications
messaging().setBackgroundMessageHandler(async (remoteMessage) => {
  console.log("Background notification:", remoteMessage);
});

// Foreground notification listener
export function onMessage(callback: (message: any) => void) {
  return messaging().onMessage(callback);
}