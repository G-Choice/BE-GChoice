import { Injectable, Inject } from '@nestjs/common';
import * as admin from 'firebase-admin';

@Injectable()
export class FirebaseRepository {
  private messaging: admin.messaging.Messaging;

  constructor(@Inject('FIREBASE_APP') private firebaseApp: admin.app.App) {
    this.messaging = this.firebaseApp.messaging();
  }
  async sendPushNotification(token: string, notification: admin.messaging.Notification): Promise<string> {
    try {
      const message: admin.messaging.Message = {
        token: token,
        notification: notification,
      };
      const response = await this.messaging.send(message);
      return response;
    } catch (error) {
      throw new Error(`Failed to send push notification: ${error.message}`);
    }
  }

  
}
