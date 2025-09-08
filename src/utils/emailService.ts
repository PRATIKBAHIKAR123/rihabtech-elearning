import { db } from '../lib/firebase';
import { collection, addDoc, serverTimestamp, query, where, getDocs, updateDoc, doc } from 'firebase/firestore';
import { getEmailSettings, getEmailTemplate } from './configService';

export interface EmailTemplate {
  id: string;
  name: string;
  subject: string;
  htmlContent: string;
  textContent: string;
  variables: string[];
  type: 'subscription_confirmation' | 'subscription_expiry_reminder' | 'payment_confirmation' | 'subscription_expired';
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface EmailNotification {
  id: string;
  to: string;
  subject: string;
  htmlContent: string;
  textContent: string;
  templateId: string;
  templateType: string;
  variables: { [key: string]: any };
  status: 'pending' | 'sent' | 'failed' | 'delivered';
  sentAt?: Date;
  deliveredAt?: Date;
  errorMessage?: string;
  retryCount: number;
  maxRetries: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface SubscriptionEmailData {
  userName: string;
  userEmail: string;
  planName: string;
  planDuration: string;
  amount: number;
  currency: string;
  receipt: string;
  paymentId: string;
  subscriptionId: string;
  startDate: Date;
  endDate: Date;
  categoryName?: string;
}

export interface ExpiryReminderData {
  userName: string;
  userEmail: string;
  planName: string;
  planDuration: string;
  endDate: Date;
  daysUntilExpiry: number;
  subscriptionId: string;
  renewalUrl: string;
}

class EmailService {
  private readonly EMAIL_TEMPLATES_COLLECTION = 'emailTemplates';
  private readonly EMAIL_NOTIFICATIONS_COLLECTION = 'emailNotifications';
  private readonly SUBSCRIPTIONS_COLLECTION = 'subscriptions';
  private readonly USERS_COLLECTION = 'users';

  // Default email templates
  private readonly DEFAULT_TEMPLATES: Omit<EmailTemplate, 'id' | 'createdAt' | 'updatedAt'>[] = [
    {
      name: 'Subscription Confirmation',
      subject: 'Welcome! Your {{planName}} subscription is now active',
      htmlContent: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Subscription Confirmation</title>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
            .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
            .plan-details { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #667eea; }
            .amount { font-size: 24px; font-weight: bold; color: #28a745; }
            .footer { text-align: center; margin-top: 30px; color: #666; font-size: 14px; }
            .button { display: inline-block; background: #667eea; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; margin: 10px 0; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🎉 Welcome to Rihab Technologies!</h1>
              <p>Your subscription is now active</p>
            </div>
            <div class="content">
              <h2>Hello {{userName}},</h2>
              <p>Thank you for subscribing to our platform! Your subscription is now active and you can start learning immediately.</p>
              
              <div class="plan-details">
                <h3>Subscription Details</h3>
                <p><strong>Plan:</strong> {{planName}}</p>
                <p><strong>Duration:</strong> {{planDuration}}</p>
                <p><strong>Amount Paid:</strong> <span class="amount">{{currency}} {{amount}}</span></p>
                <p><strong>Receipt:</strong> {{receipt}}</p>
                <p><strong>Payment ID:</strong> {{paymentId}}</p>
                <p><strong>Valid Until:</strong> {{endDate}}</p>
                {{#categoryName}}<p><strong>Category Access:</strong> {{categoryName}}</p>{{/categoryName}}
              </div>
              
              <p>You now have access to all premium content and features. Start your learning journey today!</p>
              
              <div style="text-align: center;">
                <a href="https://rihabtech.com/dashboard" class="button">Go to Dashboard</a>
              </div>
              
              <p>If you have any questions, feel free to contact our support team.</p>
              
              <p>Happy Learning!<br>The Rihab Technologies Team</p>
            </div>
            <div class="footer">
              <p>This email was sent to {{userEmail}}. If you didn't make this purchase, please contact support immediately.</p>
              <p>&copy; 2025 Rihab Technologies. All rights reserved.</p>
            </div>
          </div>
        </body>
        </html>
      `,
      textContent: `
        Welcome to Rihab Technologies!
        
        Hello {{userName}},
        
        Thank you for subscribing to our platform! Your subscription is now active.
        
        Subscription Details:
        - Plan: {{planName}}
        - Duration: {{planDuration}}
        - Amount Paid: {{currency}} {{amount}}
        - Receipt: {{receipt}}
        - Payment ID: {{paymentId}}
        - Valid Until: {{endDate}}
        {{#categoryName}}- Category Access: {{categoryName}}{{/categoryName}}
        
        You now have access to all premium content and features.
        
        Visit your dashboard: https://rihabtech.com/dashboard
        
        If you have any questions, feel free to contact our support team.
        
        Happy Learning!
        The Rihab Technologies Team
      `,
      variables: ['userName', 'userEmail', 'planName', 'planDuration', 'amount', 'currency', 'receipt', 'paymentId', 'subscriptionId', 'startDate', 'endDate', 'categoryName'],
      type: 'subscription_confirmation',
      isActive: true
    },
    {
      name: 'Subscription Expiry Reminder',
      subject: 'Your {{planName}} subscription expires in {{daysUntilExpiry}} days',
      htmlContent: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Subscription Expiry Reminder</title>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #ff6b6b 0%, #ee5a24 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
            .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
            .warning { background: #fff3cd; border: 1px solid #ffeaa7; padding: 15px; border-radius: 8px; margin: 20px 0; }
            .plan-details { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #ff6b6b; }
            .footer { text-align: center; margin-top: 30px; color: #666; font-size: 14px; }
            .button { display: inline-block; background: #ff6b6b; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; margin: 10px 0; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>⏰ Subscription Expiry Reminder</h1>
              <p>Don't lose access to your learning content</p>
            </div>
            <div class="content">
              <h2>Hello {{userName}},</h2>
              
              <div class="warning">
                <strong>⚠️ Important:</strong> Your {{planName}} subscription will expire in {{daysUntilExpiry}} days on {{endDate}}.
              </div>
              
              <p>To continue enjoying unlimited access to all our premium content and features, please renew your subscription before it expires.</p>
              
              <div class="plan-details">
                <h3>Current Subscription</h3>
                <p><strong>Plan:</strong> {{planName}}</p>
                <p><strong>Duration:</strong> {{planDuration}}</p>
                <p><strong>Expires:</strong> {{endDate}}</p>
              </div>
              
              <p>Renew now to avoid any interruption in your learning journey!</p>
              
              <div style="text-align: center;">
                <a href="{{renewalUrl}}" class="button">Renew Subscription</a>
              </div>
              
              <p>If you have any questions about your subscription or need assistance, please contact our support team.</p>
              
              <p>Best regards,<br>The Rihab Technologies Team</p>
            </div>
            <div class="footer">
              <p>This email was sent to {{userEmail}}. If you no longer wish to receive these reminders, please update your notification preferences.</p>
              <p>&copy; 2025 Rihab Technologies. All rights reserved.</p>
            </div>
          </div>
        </body>
        </html>
      `,
      textContent: `
        Subscription Expiry Reminder
        
        Hello {{userName}},
        
        ⚠️ Important: Your {{planName}} subscription will expire in {{daysUntilExpiry}} days on {{endDate}}.
        
        To continue enjoying unlimited access to all our premium content and features, please renew your subscription before it expires.
        
        Current Subscription:
        - Plan: {{planName}}
        - Duration: {{planDuration}}
        - Expires: {{endDate}}
        
        Renew now to avoid any interruption in your learning journey!
        
        Renew your subscription: {{renewalUrl}}
        
        If you have any questions about your subscription or need assistance, please contact our support team.
        
        Best regards,
        The Rihab Technologies Team
      `,
      variables: ['userName', 'userEmail', 'planName', 'planDuration', 'endDate', 'daysUntilExpiry', 'subscriptionId', 'renewalUrl'],
      type: 'subscription_expiry_reminder',
      isActive: true
    },
    {
      name: 'Subscription Expired',
      subject: 'Your {{planName}} subscription has expired',
      htmlContent: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Subscription Expired</title>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #6c757d 0%, #495057 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
            .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
            .expired { background: #f8d7da; border: 1px solid #f5c6cb; padding: 15px; border-radius: 8px; margin: 20px 0; }
            .plan-details { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #6c757d; }
            .footer { text-align: center; margin-top: 30px; color: #666; font-size: 14px; }
            .button { display: inline-block; background: #667eea; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; margin: 10px 0; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>📅 Subscription Expired</h1>
              <p>Your access has been temporarily suspended</p>
            </div>
            <div class="content">
              <h2>Hello {{userName}},</h2>
              
              <div class="expired">
                <strong>📅 Expired:</strong> Your {{planName}} subscription expired on {{endDate}}.
              </div>
              
              <p>We hope you enjoyed your learning experience with us! Your subscription has now expired, and your access to premium content has been temporarily suspended.</p>
              
              <div class="plan-details">
                <h3>Expired Subscription</h3>
                <p><strong>Plan:</strong> {{planName}}</p>
                <p><strong>Duration:</strong> {{planDuration}}</p>
                <p><strong>Expired:</strong> {{endDate}}</p>
              </div>
              
              <p>Don't worry! You can easily renew your subscription to regain access to all premium content and continue your learning journey.</p>
              
              <div style="text-align: center;">
                <a href="{{renewalUrl}}" class="button">Renew Subscription</a>
              </div>
              
              <p>We're here to help you continue your learning journey. If you have any questions or need assistance, please contact our support team.</p>
              
              <p>Thank you for being part of our learning community!<br>The Rihab Technologies Team</p>
            </div>
            <div class="footer">
              <p>This email was sent to {{userEmail}}. If you no longer wish to receive these notifications, please update your preferences.</p>
              <p>&copy; 2025 Rihab Technologies. All rights reserved.</p>
            </div>
          </div>
        </body>
        </html>
      `,
      textContent: `
        Subscription Expired
        
        Hello {{userName}},
        
        📅 Expired: Your {{planName}} subscription expired on {{endDate}}.
        
        We hope you enjoyed your learning experience with us! Your subscription has now expired, and your access to premium content has been temporarily suspended.
        
        Expired Subscription:
        - Plan: {{planName}}
        - Duration: {{planDuration}}
        - Expired: {{endDate}}
        
        Don't worry! You can easily renew your subscription to regain access to all premium content and continue your learning journey.
        
        Renew your subscription: {{renewalUrl}}
        
        We're here to help you continue your learning journey. If you have any questions or need assistance, please contact our support team.
        
        Thank you for being part of our learning community!
        The Rihab Technologies Team
      `,
      variables: ['userName', 'userEmail', 'planName', 'planDuration', 'endDate', 'subscriptionId', 'renewalUrl'],
      type: 'subscription_expired',
      isActive: true
    }
  ];

  // Initialize default email templates
  async initializeDefaultTemplates(): Promise<void> {
    try {
      for (const template of this.DEFAULT_TEMPLATES) {
        // Check if template already exists
        const existingQuery = query(
          collection(db, this.EMAIL_TEMPLATES_COLLECTION),
          where('type', '==', template.type)
        );
        
        const existingSnapshot = await getDocs(existingQuery);
        
        if (existingSnapshot.empty) {
          await addDoc(collection(db, this.EMAIL_TEMPLATES_COLLECTION), {
            ...template,
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp()
          });
          console.log(`Created default template: ${template.name}`);
        }
      }
    } catch (error) {
      console.error('Error initializing default templates:', error);
    }
  }

  // Send subscription confirmation email
  async sendSubscriptionConfirmation(data: SubscriptionEmailData): Promise<string> {
    try {
      // Get template from Firebase
      const template = await getEmailTemplate('subscription_confirmation');
      if (!template) {
        throw new Error('Subscription confirmation template not found');
      }

      const variables = {
        userName: data.userName,
        userEmail: data.userEmail,
        planName: data.planName,
        planDuration: data.planDuration,
        amount: data.amount,
        currency: data.currency,
        receipt: data.receipt,
        paymentId: data.paymentId,
        subscriptionId: data.subscriptionId,
        startDate: data.startDate.toLocaleDateString('en-IN'),
        endDate: data.endDate.toLocaleDateString('en-IN'),
        categoryName: data.categoryName
      };

      return await this.sendEmail({
        to: data.userEmail,
        subject: this.replaceVariables(template.subject, variables),
        htmlContent: this.replaceVariables(template.htmlContent, variables),
        textContent: this.replaceVariables(template.textContent, variables),
        templateId: template.id,
        templateType: template.type,
        variables
      });
    } catch (error) {
      console.error('Error sending subscription confirmation:', error);
      throw new Error('Failed to send subscription confirmation email');
    }
  }

  // Send subscription expiry reminder
  async sendSubscriptionExpiryReminder(data: ExpiryReminderData): Promise<string> {
    try {
      const template = await this.getTemplate('subscription_expiry_reminder');
      if (!template) {
        throw new Error('Subscription expiry reminder template not found');
      }

      const variables = {
        userName: data.userName,
        userEmail: data.userEmail,
        planName: data.planName,
        planDuration: data.planDuration,
        endDate: data.endDate.toLocaleDateString('en-IN'),
        daysUntilExpiry: data.daysUntilExpiry,
        subscriptionId: data.subscriptionId,
        renewalUrl: data.renewalUrl
      };

      return await this.sendEmail({
        to: data.userEmail,
        subject: this.replaceVariables(template.subject, variables),
        htmlContent: this.replaceVariables(template.htmlContent, variables),
        textContent: this.replaceVariables(template.textContent, variables),
        templateId: template.id,
        templateType: template.type,
        variables
      });
    } catch (error) {
      console.error('Error sending subscription expiry reminder:', error);
      throw new Error('Failed to send subscription expiry reminder email');
    }
  }

  // Send subscription expired notification
  async sendSubscriptionExpired(data: ExpiryReminderData): Promise<string> {
    try {
      const template = await this.getTemplate('subscription_expired');
      if (!template) {
        throw new Error('Subscription expired template not found');
      }

      const variables = {
        userName: data.userName,
        userEmail: data.userEmail,
        planName: data.planName,
        planDuration: data.planDuration,
        endDate: data.endDate.toLocaleDateString('en-IN'),
        subscriptionId: data.subscriptionId,
        renewalUrl: data.renewalUrl
      };

      return await this.sendEmail({
        to: data.userEmail,
        subject: this.replaceVariables(template.subject, variables),
        htmlContent: this.replaceVariables(template.htmlContent, variables),
        textContent: this.replaceVariables(template.textContent, variables),
        templateId: template.id,
        templateType: template.type,
        variables
      });
    } catch (error) {
      console.error('Error sending subscription expired notification:', error);
      throw new Error('Failed to send subscription expired email');
    }
  }

  // Schedule expiry reminders for all active subscriptions
  async scheduleExpiryReminders(): Promise<void> {
    try {
      const now = new Date();
      const reminderDays = [7, 3, 1]; // Send reminders 7, 3, and 1 days before expiry

      for (const days of reminderDays) {
        const reminderDate = new Date(now);
        reminderDate.setDate(reminderDate.getDate() + days);

        // Get subscriptions expiring on the reminder date
        const subscriptionsQuery = query(
          collection(db, this.SUBSCRIPTIONS_COLLECTION),
          where('status', '==', 'active'),
          where('isActive', '==', true)
        );

        const subscriptionsSnapshot = await getDocs(subscriptionsQuery);

        for (const doc of subscriptionsSnapshot.docs) {
          const subscription = doc.data();
          const endDate = subscription.endDate?.toDate();
          
          if (endDate && this.isSameDay(endDate, reminderDate)) {
            // Get user details
            const userDoc = await getDocs(query(
              collection(db, this.USERS_COLLECTION),
              where('__name__', '==', subscription.userId)
            ));

            if (!userDoc.empty) {
              const userData = userDoc.docs[0].data();
              
              const reminderData: ExpiryReminderData = {
                userName: userData.displayName || userData.name || 'User',
                userEmail: subscription.userEmail,
                planName: subscription.planName,
                planDuration: subscription.planDuration,
                endDate: endDate,
                daysUntilExpiry: days,
                subscriptionId: doc.id,
                renewalUrl: `https://rihabtech.com/pricing?renew=${doc.id}`
              };

              await this.sendSubscriptionExpiryReminder(reminderData);
            }
          }
        }
      }
    } catch (error) {
      console.error('Error scheduling expiry reminders:', error);
    }
  }

  // Check for expired subscriptions and send notifications
  async checkExpiredSubscriptions(): Promise<void> {
    try {
      const now = new Date();
      
      // Get subscriptions that expired today
      const subscriptionsQuery = query(
        collection(db, this.SUBSCRIPTIONS_COLLECTION),
        where('status', '==', 'active'),
        where('isActive', '==', true)
      );

      const subscriptionsSnapshot = await getDocs(subscriptionsQuery);

      for (const doc of subscriptionsSnapshot.docs) {
        const subscription = doc.data();
        const endDate = subscription.endDate?.toDate();
        
        if (endDate && endDate <= now) {
          // Mark subscription as expired
          await updateDoc(doc.ref, {
            status: 'expired',
            isActive: false,
            updatedAt: serverTimestamp()
          });

          // Get user details
          const userDoc = await getDocs(query(
            collection(db, this.USERS_COLLECTION),
            where('__name__', '==', subscription.userId)
          ));

          if (!userDoc.empty) {
            const userData = userDoc.docs[0].data();
            
            const expiredData: ExpiryReminderData = {
              userName: userData.displayName || userData.name || 'User',
              userEmail: subscription.userEmail,
              planName: subscription.planName,
              planDuration: subscription.planDuration,
              endDate: endDate,
              daysUntilExpiry: 0,
              subscriptionId: doc.id,
              renewalUrl: `https://rihabtech.com/pricing?renew=${doc.id}`
            };

            await this.sendSubscriptionExpired(expiredData);
          }
        }
      }
    } catch (error) {
      console.error('Error checking expired subscriptions:', error);
    }
  }

  // Private helper methods
  private async getTemplate(type: string): Promise<EmailTemplate | null> {
    try {
      const templateQuery = query(
        collection(db, this.EMAIL_TEMPLATES_COLLECTION),
        where('type', '==', type),
        where('isActive', '==', true)
      );

      const templateSnapshot = await getDocs(templateQuery);
      
      if (!templateSnapshot.empty) {
        const doc = templateSnapshot.docs[0];
        return {
          id: doc.id,
          ...doc.data(),
          createdAt: doc.data().createdAt?.toDate() || new Date(),
          updatedAt: doc.data().updatedAt?.toDate() || new Date()
        } as EmailTemplate;
      }
      
      return null;
    } catch (error) {
      console.error('Error getting email template:', error);
      return null;
    }
  }

  private async sendEmail(emailData: Omit<EmailNotification, 'id' | 'status' | 'retryCount' | 'maxRetries' | 'createdAt' | 'updatedAt'>): Promise<string> {
    try {
      // Get email settings from Firebase
      const emailSettings = await getEmailSettings();
      
      const notificationData = {
        ...emailData,
        status: 'pending' as const,
        retryCount: 0,
        maxRetries: 3,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      };

      const docRef = await addDoc(collection(db, this.EMAIL_NOTIFICATIONS_COLLECTION), notificationData);
      
      // Send email using the configured email service
      await this.sendEmailWithNodemailer(emailData, emailSettings);
      
      // Update notification status to sent
      await updateDoc(docRef, {
        status: 'sent',
        sentAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });

      console.log('Email sent successfully:', {
        to: emailData.to,
        subject: emailData.subject,
        templateType: emailData.templateType
      });

      return docRef.id;
    } catch (error) {
      console.error('Error sending email:', error);
      
      // Update notification status to failed
      try {
        const docRef = await addDoc(collection(db, this.EMAIL_NOTIFICATIONS_COLLECTION), {
          ...emailData,
          status: 'failed',
          errorMessage: error instanceof Error ? error.message : String(error),
          retryCount: 0,
          maxRetries: 3,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp()
        });
      } catch (updateError) {
        console.error('Error updating failed email notification:', updateError);
      }
      
      throw error;
    }
  }

  private replaceVariables(content: string, variables: { [key: string]: any }): string {
    let result = content;
    
    for (const [key, value] of Object.entries(variables)) {
      const regex = new RegExp(`{{${key}}}`, 'g');
      result = result.replace(regex, String(value || ''));
    }
    
    return result;
  }

  private isSameDay(date1: Date, date2: Date): boolean {
    return date1.getFullYear() === date2.getFullYear() &&
           date1.getMonth() === date2.getMonth() &&
           date1.getDate() === date2.getDate();
  }

  // Send email using Nodemailer (backend integration)
  private async sendEmailWithNodemailer(emailData: any, emailSettings: any): Promise<void> {
    try {
      // In a real implementation, this would call your backend API that uses Nodemailer
      // For now, we'll simulate the email sending
      
      const emailPayload = {
        to: emailData.to,
        subject: emailData.subject,
        html: emailData.htmlContent,
        text: emailData.textContent,
        from: {
          name: emailSettings.from.name,
          address: emailSettings.from.email
        },
        replyTo: emailSettings.replyTo || emailSettings.from.email,
        settings: {
          provider: emailSettings.provider,
          smtp: emailSettings.smtp,
          gmail: emailSettings.gmail,
          outlook: emailSettings.outlook,
          sendgrid: emailSettings.sendgrid,
          mailgun: emailSettings.mailgun
        }
      };

      // Call backend API to send email with Nodemailer
      const response = await fetch('/api/send-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(emailPayload)
      });

      if (!response.ok) {
        throw new Error(`Email sending failed: ${response.statusText}`);
      }

      const result = await response.json();
      if (!result.success) {
        throw new Error(result.message || 'Email sending failed');
      }

      console.log('Email sent via Nodemailer:', result);
    } catch (error) {
      console.error('Error sending email with Nodemailer:', error);
      throw error;
    }
  }
}

export const emailService = new EmailService();
export default emailService;
