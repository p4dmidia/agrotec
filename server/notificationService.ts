import twilio from 'twilio';
import cron from 'node-cron';
import { storage } from './storage';
import WeatherService from './weatherService';

interface NotificationConfig {
  phone: string;
  enabled: boolean;
  alertTypes: string[];
  lastSent: Date | null;
}

interface WeatherAlert {
  id: string;
  userId: number;
  alertType: 'rain' | 'wind' | 'cold' | 'frost';
  severity: 'low' | 'medium' | 'high';
  title: string;
  message: string;
  whatsappMessage: string;
  scheduledFor: Date;
  sent: boolean;
  createdAt: Date;
}

export class NotificationService {
  private twilioClient: twilio.Twilio | null = null;
  private weatherService: WeatherService;
  private notifications: Map<string, WeatherAlert> = new Map();

  constructor() {
    this.weatherService = new WeatherService();
    this.initializeTwilio();
    this.startWeatherMonitoring();
  }

  private initializeTwilio() {
    const accountSid = process.env.TWILIO_ACCOUNT_SID;
    const authToken = process.env.TWILIO_AUTH_TOKEN;
    const phoneNumber = process.env.TWILIO_PHONE_NUMBER;

    if (accountSid && authToken && phoneNumber) {
      this.twilioClient = twilio(accountSid, authToken);
      console.log('📱 Twilio WhatsApp service initialized');
    } else {
      console.warn('⚠️  Twilio credentials not configured - WhatsApp notifications disabled');
    }
  }

  private startWeatherMonitoring() {
    // Check for weather alerts every 30 minutes
    cron.schedule('*/30 * * * *', async () => {
      await this.checkWeatherAlerts();
    });

    // Send scheduled notifications every 5 minutes
    cron.schedule('*/5 * * * *', async () => {
      await this.sendScheduledNotifications();
    });

    console.log('🕐 Weather monitoring started - checking every 30 minutes');
  }

  private async checkWeatherAlerts() {
    try {
      // Get all users with active farms and pro/premium plans
      const users = await this.getEligibleUsers();
      
      for (const user of users) {
        if (user.plan === 'gratuito') continue; // Skip free users
        
        const farm = await storage.getUserActiveFarm(user.id);
        if (!farm) continue;

        const location = `${farm.municipality}, ${farm.state}`;
        const forecast = await this.weatherService.getForecast(location, 2);
        
        await this.generateWeatherAlerts(user, farm, forecast);
      }
    } catch (error) {
      console.error('Error checking weather alerts:', error);
    }
  }

  private async getEligibleUsers() {
    // This would normally query the database for users with pro/premium plans
    // For now, we'll use a mock approach since we don't have this query method
    // In a real implementation, you'd add this method to the storage interface
    return [
      {
        id: 2,
        fullName: "teste",
        plan: "pro",
        phone: "+5531998007412" // Test phone number
      }
    ];
  }

  private async generateWeatherAlerts(user: any, farm: any, forecast: any[]) {
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    for (const day of forecast) {
      const dayDate = new Date(day.date);
      
      // Check for strong winds (>40 km/h)
      if (day.windSpeed > 40) {
        await this.createAlert({
          userId: user.id,
          alertType: 'wind',
          severity: day.windSpeed > 60 ? 'high' : 'medium',
          title: '🌪️ Alerta de Vento Forte',
          message: `Ventos de ${day.windSpeed} km/h previstos`,
          whatsappMessage: `🚨 Alerta: ventos de ${day.windSpeed} km/h previstos ${this.formatDateForMessage(dayDate)} – adie pulverizações!`,
          scheduledFor: new Date(dayDate.getTime() - 3 * 60 * 60 * 1000), // 3 hours before
          phone: user.phone
        });
      }

      // Check for heavy rain (>15mm)
      if (day.precipitation > 15) {
        await this.createAlert({
          userId: user.id,
          alertType: 'rain',
          severity: day.precipitation > 30 ? 'high' : 'medium',
          title: '🌧️ Alerta de Chuva Intensa',
          message: `Chuva de ${day.precipitation}mm prevista`,
          whatsappMessage: `🚨 Alerta: chuva intensa de ${day.precipitation}mm prevista ${this.formatDateForMessage(dayDate)} – proteja equipamentos e cultivos!`,
          scheduledFor: new Date(dayDate.getTime() - 2 * 60 * 60 * 1000), // 2 hours before
          phone: user.phone
        });
      }

      // Check for cold/frost risk (<5°C)
      if (day.tempMin < 5) {
        await this.createAlert({
          userId: user.id,
          alertType: 'cold',
          severity: day.tempMin < 2 ? 'high' : 'medium',
          title: '🧊 Alerta de Frio/Geada',
          message: `Temperatura mínima de ${day.tempMin}°C prevista`,
          whatsappMessage: `🚨 Alerta: temperatura de ${day.tempMin}°C prevista ${this.formatDateForMessage(dayDate)} – proteja culturas sensíveis ao frio!`,
          scheduledFor: new Date(dayDate.getTime() - 12 * 60 * 60 * 1000), // 12 hours before
          phone: user.phone
        });
      }
    }
  }

  private formatDateForMessage(date: Date): string {
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    if (date.toDateString() === today.toDateString()) {
      return 'hoje';
    } else if (date.toDateString() === tomorrow.toDateString()) {
      return 'amanhã';
    } else {
      return date.toLocaleDateString('pt-BR');
    }
  }

  private async createAlert(alertData: any) {
    const alertId = `alert_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    const alert: WeatherAlert = {
      id: alertId,
      userId: alertData.userId,
      alertType: alertData.alertType,
      severity: alertData.severity,
      title: alertData.title,
      message: alertData.message,
      whatsappMessage: alertData.whatsappMessage,
      scheduledFor: alertData.scheduledFor,
      sent: false,
      createdAt: new Date()
    };

    this.notifications.set(alertId, alert);
    
    // Store phone number for later use
    (alert as any).phone = alertData.phone;
    
    console.log(`📅 Alert scheduled: ${alert.title} for ${alert.scheduledFor.toLocaleString()}`);
  }

  private async sendScheduledNotifications() {
    const now = new Date();
    
    Array.from(this.notifications.keys()).forEach(async (alertId) => {
      const alert = this.notifications.get(alertId);
      if (alert && !alert.sent && alert.scheduledFor <= now) {
        await this.sendWhatsAppNotification(alert);
        alert.sent = true;
        this.notifications.set(alertId, alert);
      }
    });
  }

  private async sendWhatsAppNotification(alert: WeatherAlert) {
    if (!this.twilioClient) {
      console.log(`📱 WhatsApp not configured - would send: ${alert.whatsappMessage}`);
      return;
    }

    try {
      const phone = (alert as any).phone;
      if (!phone) {
        console.error('No phone number for alert:', alert.id);
        return;
      }

      const message = await this.twilioClient.messages.create({
        body: alert.whatsappMessage,
        from: `whatsapp:${process.env.TWILIO_PHONE_NUMBER}`,
        to: `whatsapp:${phone}`
      });

      console.log(`✅ WhatsApp sent to ${phone}: ${alert.title}`);
      console.log(`Message SID: ${message.sid}`);
      
    } catch (error) {
      console.error('Error sending WhatsApp:', error);
    }
  }

  // Test method to send immediate notification
  async sendTestNotification(phone: string) {
    const testMessage = "🚨 Alerta: ventos de 50 km/h previstos hoje às 15h – adie pulverizações!";
    
    if (!this.twilioClient) {
      console.log(`📱 Test notification (WhatsApp not configured): ${testMessage}`);
      return { 
        success: true, 
        message: 'Teste simulado com sucesso! (Twilio não configurado - apenas simulação)',
        simulated: true 
      };
    }

    try {
      const message = await this.twilioClient.messages.create({
        body: testMessage,
        from: `whatsapp:${process.env.TWILIO_PHONE_NUMBER}`,
        to: `whatsapp:${phone}`
      });

      console.log(`✅ Test WhatsApp sent to ${phone}`);
      console.log(`Message SID: ${message.sid}`);
      
      return { success: true, messageSid: message.sid };
      
    } catch (error) {
      console.error('Error sending test WhatsApp:', error);
      return { success: false, error: (error as Error).message || 'Unknown error' };
    }
  }

  // Get current alerts for a user
  getUserAlerts(userId: number): WeatherAlert[] {
    return Array.from(this.notifications.values())
      .filter(alert => alert.userId === userId)
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  // Get notification statistics
  getNotificationStats() {
    const alerts = Array.from(this.notifications.values());
    return {
      total: alerts.length,
      sent: alerts.filter(a => a.sent).length,
      pending: alerts.filter(a => !a.sent).length,
      byType: {
        wind: alerts.filter(a => a.alertType === 'wind').length,
        rain: alerts.filter(a => a.alertType === 'rain').length,
        cold: alerts.filter(a => a.alertType === 'cold').length,
      }
    };
  }
}

// Export singleton instance
export const notificationService = new NotificationService();