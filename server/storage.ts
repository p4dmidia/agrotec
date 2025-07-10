import {
  users,
  farms,
  chatConversations,
  chatMessages,
  learningTracks,
  learningVideos,
  userProgress,
  calendarEvents,
  taskTemplates,
  taskSuggestions,
  weatherAlerts,
  storeProducts,
  shoppingCart,
  userUsage,
  userActivity,
  notifications,
  type User,
  type InsertUser,
  type Farm,
  type InsertFarm,
  type ChatConversation,
  type InsertChatConversation,
  type ChatMessage,
  type InsertChatMessage,
  type LearningTrack,
  type LearningVideo,
  type UserProgress,
  type CalendarEvent,
  type InsertCalendarEvent,
  type TaskTemplate,
  type InsertTaskTemplate,
  type TaskSuggestion,
  type InsertTaskSuggestion,
  type WeatherAlert,
  type StoreProduct,
  type InsertStoreProduct,
  type ShoppingCart,
  type InsertShoppingCart,
  type UserUsage,
  type UserActivity,
  type Notification,
  type InsertNotification,
} from "@shared/schema";
import { db } from "./db";
import { eq, and, gte, lte, desc } from "drizzle-orm";

export interface IStorage {
  // User operations
  getUser(id: number): Promise<User | undefined>;
  getUserById(id: number): Promise<User | undefined>;
  getUserByCpf(cpf: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: number, updates: Partial<User>): Promise<User>;
  
  // Admin user management
  getAllUsers(): Promise<User[]>;
  updateUserStatus(id: number, isActive: boolean): Promise<User>;
  updateUserPlan(id: number, plan: string): Promise<User>;
  updateUserRole(id: number, role: string): Promise<User>;
  
  // Billing operations
  getExpiredTrialUsers(): Promise<User[]>;
  updateUserAfterBilling(id: number, updates: Partial<User>): Promise<User>;
  
  // Farm operations
  getUserFarms(userId: number): Promise<Farm[]>;
  getUserActiveFarm(userId: number): Promise<Farm | undefined>;
  createFarm(farm: InsertFarm): Promise<Farm>;
  updateFarm(id: number, updates: Partial<Farm>): Promise<Farm>;
  deleteFarm(id: number): Promise<void>;
  
  // Chat operations
  getChatConversations(userId: number): Promise<ChatConversation[]>;
  createChatConversation(conversation: InsertChatConversation): Promise<ChatConversation>;
  getChatMessages(conversationId: number): Promise<ChatMessage[]>;
  createChatMessage(message: InsertChatMessage): Promise<ChatMessage>;
  
  // Learning operations
  getLearningTracks(): Promise<LearningTrack[]>;
  getLearningTrack(id: number): Promise<LearningTrack | undefined>;
  getLearningVideos(trackId: number): Promise<LearningVideo[]>;
  getUserProgress(userId: number): Promise<UserProgress[]>;
  updateUserProgress(userId: number, trackId: number, videoId: number, isCompleted: boolean, score?: number): Promise<UserProgress>;
  
  // Calendar operations
  getCalendarEvents(userId: number): Promise<CalendarEvent[]>;
  createCalendarEvent(event: InsertCalendarEvent): Promise<CalendarEvent>;
  updateCalendarEvent(id: number, updates: Partial<CalendarEvent>): Promise<CalendarEvent>;
  deleteCalendarEvent(id: number): Promise<void>;
  
  // Task template operations
  getTaskTemplates(userId: number): Promise<TaskTemplate[]>;
  createTaskTemplate(template: InsertTaskTemplate): Promise<TaskTemplate>;
  updateTaskTemplate(id: number, updates: Partial<TaskTemplate>): Promise<TaskTemplate>;
  deleteTaskTemplate(id: number): Promise<void>;
  
  // Task suggestion operations
  getTaskSuggestions(userId: number): Promise<TaskSuggestion[]>;
  createTaskSuggestion(suggestion: InsertTaskSuggestion): Promise<TaskSuggestion>;
  updateTaskSuggestion(id: number, updates: Partial<TaskSuggestion>): Promise<TaskSuggestion>;
  deleteTaskSuggestion(id: number): Promise<void>;
  generateSmartSuggestions(userId: number): Promise<TaskSuggestion[]>;
  
  // Weather operations
  getWeatherAlerts(userId: number): Promise<WeatherAlert[]>;
  createWeatherAlert(alert: Omit<WeatherAlert, 'id' | 'createdAt'>): Promise<WeatherAlert>;
  
  // Notification operations
  getNotifications(userId: number): Promise<Notification[]>;
  getUnreadNotifications(userId: number): Promise<Notification[]>;
  createNotification(notification: InsertNotification): Promise<Notification>;
  markNotificationAsRead(id: number): Promise<Notification>;
  markAllNotificationsAsRead(userId: number): Promise<void>;
  
  // Store operations
  getStoreProducts(): Promise<StoreProduct[]>;
  getStoreProductsByCategory(category: string): Promise<StoreProduct[]>;
  createStoreProduct(product: InsertStoreProduct): Promise<StoreProduct>;
  updateStoreProduct(id: number, updates: Partial<StoreProduct>): Promise<StoreProduct>;
  deleteStoreProduct(id: number): Promise<void>;
  getShoppingCart(userId: number): Promise<(ShoppingCart & { product: StoreProduct })[]>;
  addToCart(item: InsertShoppingCart): Promise<ShoppingCart>;
  updateCartItem(id: number, quantity: number): Promise<ShoppingCart>;
  removeFromCart(id: number): Promise<void>;
  clearCart(userId: number): Promise<void>;
  
  // Usage tracking
  getUserUsage(userId: number, month: string): Promise<UserUsage | undefined>;
  updateUserUsage(userId: number, month: string, updates: Partial<UserUsage>): Promise<UserUsage>;
  
  // Activity tracking for inactivity alerts
  getUserActivity(userId: number): Promise<UserActivity | undefined>;
  updateUserActivity(userId: number, activityType: 'calendar' | 'chat' | 'learning'): Promise<UserActivity>;
  
  // Export functionality
  getCalendarHistoryForExport(userId: number, filters?: {
    eventType?: string;
    location?: string;
    startDate?: Date;
    endDate?: Date;
  }): Promise<CalendarEvent[]>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User> = new Map();
  private farms: Map<number, Farm> = new Map();
  private chatConversations: Map<number, ChatConversation> = new Map();
  private chatMessages: Map<number, ChatMessage> = new Map();
  private learningTracks: Map<number, LearningTrack> = new Map();
  private learningVideos: Map<number, LearningVideo> = new Map();
  private userProgress: Map<number, UserProgress> = new Map();
  private calendarEvents: Map<number, CalendarEvent> = new Map();
  private weatherAlerts: Map<number, WeatherAlert> = new Map();
  private storeProducts: Map<number, StoreProduct> = new Map();
  private shoppingCart: Map<number, ShoppingCart> = new Map();
  private userUsage: Map<number, UserUsage> = new Map();
  private notifications: Map<number, Notification> = new Map();
  protected taskTemplates: Map<number, TaskTemplate> = new Map();
  protected taskSuggestions: Map<number, TaskSuggestion> = new Map();
  protected userActivities: Map<number, UserActivity> = new Map();
  
  private currentUserId = 1;
  private currentFarmId = 1;
  private currentConversationId = 1;
  private currentMessageId = 1;
  private currentTrackId = 1;
  private currentVideoId = 1;
  private currentProgressId = 1;
  private currentEventId = 1;
  private currentAlertId = 1;
  private currentProductId = 1;
  private currentCartId = 1;
  private currentUsageId = 1;
  private currentNotificationId = 1;

  constructor() {
    // Initialize with basic data - learning tracks will be loaded on demand
    this.initializeBasicData();
  }

  private initializeBasicData() {
    // Initialize with empty collections - data will be loaded on demand
    // This avoids the complex import dependency issue

    // Initialize sample store products
    const products = [
      {
        id: this.currentProductId++,
        name: "Sementes de Tomate",
        description: "Variedade híbrida de alta produtividade",
        price: "29.90",
        category: "seeds",
        imageUrl: "https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=400&h=300&fit=crop",
        inStock: true,
        createdAt: new Date(),
      },
      {
        id: this.currentProductId++,
        name: "Fertilizante Orgânico",
        description: "NPK 10-10-10 para todas as culturas",
        price: "45.90",
        category: "fertilizers",
        imageUrl: "https://images.unsplash.com/photo-1464207687429-7505649dae38?w=400&h=300&fit=crop",
        inStock: true,
        createdAt: new Date(),
      },
      {
        id: this.currentProductId++,
        name: "Kit Ferramentas",
        description: "Conjunto completo para jardinagem",
        price: "89.90",
        category: "tools",
        imageUrl: "https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=400&h=300&fit=crop",
        inStock: true,
        createdAt: new Date(),
      },
      {
        id: this.currentProductId++,
        name: "Defensivo Natural",
        description: "Controle orgânico de pragas",
        price: "34.90",
        category: "pesticides",
        imageUrl: "https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=400&h=300&fit=crop",
        inStock: true,
        createdAt: new Date(),
      },
    ];

    products.forEach(product => this.storeProducts.set(product.id, product));

    // Initialize sample notifications
    const notifications = [
      {
        id: this.currentNotificationId++,
        userId: 1,
        title: "🌧️ Alerta de Chuva Forte",
        message: "Previsão de chuva intensa nas próximas 6 horas. Considere proteger as mudas expostas.",
        type: "weather",
        severity: "warning",
        isRead: false,
        actionUrl: "/monitoramento",
        metadata: null,
        createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
        readAt: null,
      },
      {
        id: this.currentNotificationId++,
        userId: 1,
        title: "📅 Irrigação Programada",
        message: "Lembrete: irrigação da banana prata agendada para hoje às 18:00",
        type: "calendar",
        severity: "info",
        isRead: false,
        actionUrl: "/calendario",
        metadata: null,
        createdAt: new Date(Date.now() - 30 * 60 * 1000), // 30 minutes ago
        readAt: null,
      },
      {
        id: this.currentNotificationId++,
        userId: 1,
        title: "🎯 Novo Curso Disponível",
        message: "Curso 'Manejo Integrado de Pragas na Banana' foi adicionado à sua trilha de aprendizado",
        type: "learning",
        severity: "success",
        isRead: true,
        actionUrl: "/aprendizado",
        metadata: null,
        createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000), // 1 day ago
        readAt: new Date(Date.now() - 23 * 60 * 60 * 1000),
      },
      {
        id: this.currentNotificationId++,
        userId: 1,
        title: "🛒 Desconto na Loja",
        message: "20% de desconto em fertilizantes orgânicos até sexta-feira",
        type: "store",
        severity: "info",
        isRead: false,
        actionUrl: "/loja",
        metadata: JSON.stringify({ discount: 20, category: "fertilizers" }),
        createdAt: new Date(Date.now() - 10 * 60 * 1000), // 10 minutes ago
        readAt: null,
      },
    ];

    notifications.forEach(notification => this.notifications.set(notification.id, notification));
  }

  // User operations
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByCpf(cpf: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(user => user.cpf === cpf);
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(user => user.email === email);
  }

  async createUser(userData: InsertUser): Promise<User> {
    const user: User = {
      id: this.currentUserId++,
      ...userData,
      phone: userData.phone ?? null,
      address: userData.address ?? null,
      plan: "gratuito",
      isAdimplente: true,
      subscriptionEndsAt: null,
      profileImageUrl: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.users.set(user.id, user);
    return user;
  }

  async updateUser(id: number, updates: Partial<User>): Promise<User> {
    const user = this.users.get(id);
    if (!user) throw new Error("User not found");
    
    const updatedUser = { ...user, ...updates, updatedAt: new Date() };
    this.users.set(id, updatedUser);
    return updatedUser;
  }

  async getUserById(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  // Billing operations
  async getExpiredTrialUsers(): Promise<User[]> {
    const now = new Date();
    return Array.from(this.users.values()).filter(user => 
      user.trialAtivo && 
      user.cobrancaAgendada &&
      user.trialExpiraEm && 
      new Date(user.trialExpiraEm) <= now
    );
  }

  async updateUserAfterBilling(id: number, updates: Partial<User>): Promise<User> {
    const user = this.users.get(id);
    if (!user) throw new Error("User not found");
    
    const updatedUser = { ...user, ...updates, updatedAt: new Date() };
    this.users.set(id, updatedUser);
    return updatedUser;
  }

  // Farm operations
  async getUserFarms(userId: number): Promise<Farm[]> {
    return Array.from(this.farms.values()).filter(farm => farm.userId === userId);
  }

  async getUserActiveFarm(userId: number): Promise<Farm | undefined> {
    return Array.from(this.farms.values()).find(farm => farm.userId === userId && farm.isActive);
  }

  async createFarm(farmData: InsertFarm): Promise<Farm> {
    const farm: Farm = {
      id: this.currentFarmId++,
      ...farmData,
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    this.farms.set(farm.id, farm);
    return farm;
  }

  async updateFarm(id: number, updates: Partial<Farm>): Promise<Farm> {
    const farm = this.farms.get(id);
    if (!farm) {
      throw new Error("Farm not found");
    }
    
    const updatedFarm = { ...farm, ...updates, updatedAt: new Date() };
    this.farms.set(id, updatedFarm);
    return updatedFarm;
  }

  async deleteFarm(id: number): Promise<void> {
    this.farms.delete(id);
  }

  // Chat operations
  async getChatConversations(userId: number): Promise<ChatConversation[]> {
    return Array.from(this.chatConversations.values()).filter(c => c.userId === userId);
  }

  async createChatConversation(conversationData: InsertChatConversation): Promise<ChatConversation> {
    const conversation: ChatConversation = {
      id: this.currentConversationId++,
      ...conversationData,
      createdAt: new Date(),
    };
    this.chatConversations.set(conversation.id, conversation);
    return conversation;
  }

  async getChatMessages(conversationId: number): Promise<ChatMessage[]> {
    return Array.from(this.chatMessages.values()).filter(m => m.conversationId === conversationId);
  }

  async createChatMessage(messageData: InsertChatMessage): Promise<ChatMessage> {
    const message: ChatMessage = {
      id: this.currentMessageId++,
      ...messageData,
      messageType: messageData.messageType ?? "text",
      fileUrl: messageData.fileUrl ?? null,
      createdAt: new Date(),
    };
    this.chatMessages.set(message.id, message);
    return message;
  }

  // Learning operations
  async getLearningTracks(): Promise<LearningTrack[]> {
    return Array.from(this.learningTracks.values());
  }

  async getLearningTrack(id: number): Promise<LearningTrack | undefined> {
    return this.learningTracks.get(id);
  }

  async getLearningVideos(trackId: number): Promise<LearningVideo[]> {
    return Array.from(this.learningVideos.values()).filter(v => v.trackId === trackId);
  }

  async getUserProgress(userId: number): Promise<UserProgress[]> {
    return Array.from(this.userProgress.values()).filter(p => p.userId === userId);
  }

  async updateUserProgress(userId: number, trackId: number, videoId: number, isCompleted: boolean, score?: number): Promise<UserProgress> {
    const existingProgress = Array.from(this.userProgress.values()).find(
      p => p.userId === userId && p.trackId === trackId && p.videoId === videoId
    );

    if (existingProgress) {
      const updated = {
        ...existingProgress,
        isCompleted,
        score: score || existingProgress.score,
        completedAt: isCompleted ? new Date() : existingProgress.completedAt,
      };
      this.userProgress.set(existingProgress.id, updated);
      return updated;
    }

    const progress: UserProgress = {
      id: this.currentProgressId++,
      userId,
      trackId,
      videoId,
      isCompleted,
      score: score || 0,
      completedAt: isCompleted ? new Date() : null,
      createdAt: new Date(),
    };
    this.userProgress.set(progress.id, progress);
    return progress;
  }

  // Calendar operations
  async getCalendarEvents(userId: number): Promise<CalendarEvent[]> {
    return Array.from(this.calendarEvents.values()).filter(e => e.userId === userId);
  }

  async createCalendarEvent(eventData: InsertCalendarEvent): Promise<CalendarEvent> {
    const event: CalendarEvent = {
      id: this.currentEventId++,
      ...eventData,
      description: eventData.description ?? null,
      isCompleted: false,
      createdAt: new Date(),
    };
    this.calendarEvents.set(event.id, event);
    return event;
  }

  async updateCalendarEvent(id: number, updates: Partial<CalendarEvent>): Promise<CalendarEvent> {
    const event = this.calendarEvents.get(id);
    if (!event) throw new Error("Event not found");
    
    const updatedEvent = { ...event, ...updates };
    this.calendarEvents.set(id, updatedEvent);
    return updatedEvent;
  }

  async deleteCalendarEvent(id: number): Promise<void> {
    this.calendarEvents.delete(id);
  }

  // Weather operations
  async getWeatherAlerts(userId: number): Promise<WeatherAlert[]> {
    return Array.from(this.weatherAlerts.values()).filter(a => a.userId === userId);
  }

  async createWeatherAlert(alertData: Omit<WeatherAlert, 'id' | 'createdAt'>): Promise<WeatherAlert> {
    const alert: WeatherAlert = {
      id: this.currentAlertId++,
      ...alertData,
      createdAt: new Date(),
    };
    this.weatherAlerts.set(alert.id, alert);
    return alert;
  }

  // Store operations
  async getStoreProducts(): Promise<StoreProduct[]> {
    return Array.from(this.storeProducts.values());
  }

  async getStoreProductsByCategory(category: string): Promise<StoreProduct[]> {
    return Array.from(this.storeProducts.values()).filter(p => p.category === category);
  }

  async getShoppingCart(userId: number): Promise<(ShoppingCart & { product: StoreProduct })[]> {
    const cartItems = Array.from(this.shoppingCart.values()).filter(c => c.userId === userId);
    return cartItems.map(item => ({
      ...item,
      product: this.storeProducts.get(item.productId)!,
    }));
  }

  async addToCart(itemData: InsertShoppingCart): Promise<ShoppingCart> {
    const existingItem = Array.from(this.shoppingCart.values()).find(
      c => c.userId === itemData.userId && c.productId === itemData.productId
    );

    if (existingItem) {
      const updated = {
        ...existingItem,
        quantity: existingItem.quantity + (itemData.quantity ?? 1),
      };
      this.shoppingCart.set(existingItem.id, updated);
      return updated;
    }

    const item: ShoppingCart = {
      id: this.currentCartId++,
      ...itemData,
      quantity: itemData.quantity ?? 1,
      createdAt: new Date(),
    };
    this.shoppingCart.set(item.id, item);
    return item;
  }

  async updateCartItem(id: number, quantity: number): Promise<ShoppingCart> {
    const item = this.shoppingCart.get(id);
    if (!item) throw new Error("Cart item not found");
    
    const updated = { ...item, quantity };
    this.shoppingCart.set(id, updated);
    return updated;
  }

  async removeFromCart(id: number): Promise<void> {
    this.shoppingCart.delete(id);
  }

  async clearCart(userId: number): Promise<void> {
    const userCartItems = Array.from(this.shoppingCart.values()).filter(c => c.userId === userId);
    userCartItems.forEach(item => this.shoppingCart.delete(item.id));
  }

  // Usage tracking
  async getUserUsage(userId: number, month: string): Promise<UserUsage | undefined> {
    return Array.from(this.userUsage.values()).find(u => u.userId === userId && u.month === month);
  }

  async updateUserUsage(userId: number, month: string, updates: Partial<UserUsage>): Promise<UserUsage> {
    const existing = await this.getUserUsage(userId, month);
    
    if (existing) {
      const updated = { ...existing, ...updates };
      this.userUsage.set(existing.id, updated);
      return updated;
    }

    const usage: UserUsage = {
      id: this.currentUsageId++,
      userId,
      month,
      aiConsultations: 0,
      tracksCompleted: 0,
      videoHours: "0",
      eventsCreated: 0,
      ...updates,
      createdAt: new Date(),
    };
    this.userUsage.set(usage.id, usage);
    return usage;
  }

  // Notification operations
  async getNotifications(userId: number): Promise<Notification[]> {
    return Array.from(this.notifications.values())
      .filter(n => n.userId === userId)
      .sort((a, b) => new Date(b.createdAt!).getTime() - new Date(a.createdAt!).getTime());
  }

  async getUnreadNotifications(userId: number): Promise<Notification[]> {
    return Array.from(this.notifications.values())
      .filter(n => n.userId === userId && !n.isRead)
      .sort((a, b) => new Date(b.createdAt!).getTime() - new Date(a.createdAt!).getTime());
  }

  async createNotification(notificationData: InsertNotification): Promise<Notification> {
    const notification: Notification = {
      id: this.currentNotificationId++,
      userId: notificationData.userId,
      title: notificationData.title,
      message: notificationData.message,
      type: notificationData.type,
      severity: notificationData.severity || 'info',
      isRead: false,
      actionUrl: notificationData.actionUrl || null,
      metadata: notificationData.metadata || null,
      createdAt: new Date(),
      readAt: null,
    };
    
    this.notifications.set(notification.id, notification);
    return notification;
  }

  async markNotificationAsRead(id: number): Promise<Notification> {
    const notification = this.notifications.get(id);
    if (!notification) {
      throw new Error("Notification not found");
    }

    const updated = {
      ...notification,
      isRead: true,
      readAt: new Date(),
    };

    this.notifications.set(id, updated);
    return updated;
  }

  async markAllNotificationsAsRead(userId: number): Promise<void> {
    const userNotifications = Array.from(this.notifications.values())
      .filter(n => n.userId === userId && !n.isRead);

    userNotifications.forEach(notification => {
      const updated = {
        ...notification,
        isRead: true,
        readAt: new Date(),
      };
      this.notifications.set(notification.id, updated);
    });
  }
}

export class DatabaseStorage implements IStorage {
  // User operations
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async getUserByCpf(cpf: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.cpf, cpf));
    return user || undefined;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user || undefined;
  }

  async createUser(userData: InsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values({
        ...userData,
        phone: userData.phone ?? null,
        address: userData.address ?? null,
      })
      .returning();
    return user;
  }

  async updateUser(id: number, updates: Partial<User>): Promise<User> {
    const [user] = await db
      .update(users)
      .set(updates)
      .where(eq(users.id, id))
      .returning();
    return user;
  }

  // Farm operations
  async getUserFarms(userId: number): Promise<Farm[]> {
    return await db.select().from(farms).where(eq(farms.userId, userId));
  }

  async getUserActiveFarm(userId: number): Promise<Farm | undefined> {
    const [farm] = await db
      .select()
      .from(farms)
      .where(and(eq(farms.userId, userId), eq(farms.isActive, true)))
      .limit(1);
    return farm;
  }

  async createFarm(farmData: InsertFarm): Promise<Farm> {
    const [farm] = await db
      .insert(farms)
      .values(farmData)
      .returning();
    return farm;
  }

  async updateFarm(id: number, updates: Partial<Farm>): Promise<Farm> {
    const [updated] = await db
      .update(farms)
      .set(updates)
      .where(eq(farms.id, id))
      .returning();
    return updated;
  }

  async deleteFarm(id: number): Promise<void> {
    await db.delete(farms).where(eq(farms.id, id));
  }

  // Chat operations
  async getChatConversations(userId: number): Promise<ChatConversation[]> {
    return await db.select().from(chatConversations).where(eq(chatConversations.userId, userId));
  }

  async createChatConversation(conversationData: InsertChatConversation): Promise<ChatConversation> {
    const [conversation] = await db
      .insert(chatConversations)
      .values(conversationData)
      .returning();
    return conversation;
  }

  async getChatMessages(conversationId: number): Promise<ChatMessage[]> {
    return await db.select().from(chatMessages).where(eq(chatMessages.conversationId, conversationId));
  }

  async createChatMessage(messageData: InsertChatMessage): Promise<ChatMessage> {
    const [message] = await db
      .insert(chatMessages)
      .values({
        ...messageData,
        messageType: messageData.messageType ?? "text",
        fileUrl: messageData.fileUrl ?? null,
      })
      .returning();
    return message;
  }

  // Learning operations
  async getLearningTracks(): Promise<LearningTrack[]> {
    return await db.select().from(learningTracks);
  }

  async getLearningTrack(id: number): Promise<LearningTrack | undefined> {
    const [track] = await db.select().from(learningTracks).where(eq(learningTracks.id, id));
    return track || undefined;
  }

  async getLearningVideos(trackId: number): Promise<LearningVideo[]> {
    return await db.select().from(learningVideos).where(eq(learningVideos.trackId, trackId));
  }

  async getUserProgress(userId: number): Promise<UserProgress[]> {
    return await db.select().from(userProgress).where(eq(userProgress.userId, userId));
  }

  async updateUserProgress(userId: number, trackId: number, videoId: number, isCompleted: boolean, score?: number): Promise<UserProgress> {
    const existing = await db.select().from(userProgress).where(
      and(
        eq(userProgress.userId, userId),
        eq(userProgress.trackId, trackId),
        eq(userProgress.videoId, videoId)
      )
    );

    if (existing.length > 0) {
      const [updated] = await db
        .update(userProgress)
        .set({ isCompleted, score })
        .where(eq(userProgress.id, existing[0].id))
        .returning();
      return updated;
    } else {
      const [created] = await db
        .insert(userProgress)
        .values({
          userId,
          trackId,
          videoId,
          isCompleted,
          score: score ?? null,
        })
        .returning();
      return created;
    }
  }

  // Calendar operations
  async getCalendarEvents(userId: number): Promise<CalendarEvent[]> {
    return await db.select().from(calendarEvents).where(eq(calendarEvents.userId, userId));
  }

  async createCalendarEvent(eventData: InsertCalendarEvent): Promise<CalendarEvent> {
    const [event] = await db
      .insert(calendarEvents)
      .values({
        ...eventData,
        description: eventData.description ?? null,
      })
      .returning();
    return event;
  }

  async updateCalendarEvent(id: number, updates: Partial<CalendarEvent>): Promise<CalendarEvent> {
    const [event] = await db
      .update(calendarEvents)
      .set(updates)
      .where(eq(calendarEvents.id, id))
      .returning();
    return event;
  }

  async deleteCalendarEvent(id: number): Promise<void> {
    await db.delete(calendarEvents).where(eq(calendarEvents.id, id));
  }

  // Weather operations
  async getWeatherAlerts(userId: number): Promise<WeatherAlert[]> {
    return await db.select().from(weatherAlerts).where(eq(weatherAlerts.userId, userId));
  }

  async createWeatherAlert(alertData: Omit<WeatherAlert, 'id' | 'createdAt'>): Promise<WeatherAlert> {
    const [alert] = await db
      .insert(weatherAlerts)
      .values(alertData)
      .returning();
    return alert;
  }

  // Store operations
  async getStoreProducts(): Promise<StoreProduct[]> {
    return await db.select().from(storeProducts);
  }

  async getStoreProductsByCategory(category: string): Promise<StoreProduct[]> {
    return await db.select().from(storeProducts).where(eq(storeProducts.category, category));
  }

  async createStoreProduct(productData: InsertStoreProduct): Promise<StoreProduct> {
    const [product] = await db
      .insert(storeProducts)
      .values({
        ...productData,
        price: productData.price.toString(),
      })
      .returning();
    return product;
  }

  async updateStoreProduct(id: number, updates: Partial<StoreProduct>): Promise<StoreProduct> {
    const [product] = await db
      .update(storeProducts)
      .set(updates)
      .where(eq(storeProducts.id, id))
      .returning();
    return product;
  }

  async deleteStoreProduct(id: number): Promise<void> {
    await db.delete(storeProducts).where(eq(storeProducts.id, id));
  }

  async getShoppingCart(userId: number): Promise<(ShoppingCart & { product: StoreProduct })[]> {
    const result = await db
      .select({
        id: shoppingCart.id,
        userId: shoppingCart.userId,
        productId: shoppingCart.productId,
        quantity: shoppingCart.quantity,
        createdAt: shoppingCart.createdAt,
        product: storeProducts,
      })
      .from(shoppingCart)
      .innerJoin(storeProducts, eq(shoppingCart.productId, storeProducts.id))
      .where(eq(shoppingCart.userId, userId));
    
    return result;
  }

  async addToCart(itemData: InsertShoppingCart): Promise<ShoppingCart> {
    const existing = await db.select().from(shoppingCart).where(
      and(
        eq(shoppingCart.userId, itemData.userId),
        eq(shoppingCart.productId, itemData.productId)
      )
    );

    if (existing.length > 0) {
      const [updated] = await db
        .update(shoppingCart)
        .set({ quantity: existing[0].quantity + (itemData.quantity ?? 1) })
        .where(eq(shoppingCart.id, existing[0].id))
        .returning();
      return updated;
    }

    const [item] = await db
      .insert(shoppingCart)
      .values({
        ...itemData,
        quantity: itemData.quantity ?? 1,
      })
      .returning();
    return item;
  }

  async updateCartItem(id: number, quantity: number): Promise<ShoppingCart> {
    const [item] = await db
      .update(shoppingCart)
      .set({ quantity })
      .where(eq(shoppingCart.id, id))
      .returning();
    return item;
  }

  async removeFromCart(id: number): Promise<void> {
    await db.delete(shoppingCart).where(eq(shoppingCart.id, id));
  }

  async clearCart(userId: number): Promise<void> {
    await db.delete(shoppingCart).where(eq(shoppingCart.userId, userId));
  }

  // Admin user management operations
  async getAllUsers(): Promise<User[]> {
    return await db.select().from(users);
  }

  async updateUserStatus(id: number, isActive: boolean): Promise<User> {
    const [user] = await db
      .update(users)
      .set({ isActive })
      .where(eq(users.id, id))
      .returning();
    return user;
  }

  async updateUserPlan(id: number, plan: string): Promise<User> {
    const [user] = await db
      .update(users)
      .set({ plan })
      .where(eq(users.id, id))
      .returning();
    return user;
  }

  async updateUserRole(id: number, role: string): Promise<User> {
    const [user] = await db
      .update(users)
      .set({ role })
      .where(eq(users.id, id))
      .returning();
    return user;
  }

  // Usage tracking
  async getUserUsage(userId: number, month: string): Promise<UserUsage | undefined> {
    const [usage] = await db.select().from(userUsage).where(
      and(
        eq(userUsage.userId, userId),
        eq(userUsage.month, month)
      )
    );
    return usage || undefined;
  }

  async updateUserUsage(userId: number, month: string, updates: Partial<UserUsage>): Promise<UserUsage> {
    const existing = await this.getUserUsage(userId, month);

    if (existing) {
      const [updated] = await db
        .update(userUsage)
        .set(updates)
        .where(eq(userUsage.id, existing.id))
        .returning();
      return updated;
    } else {
      const [created] = await db
        .insert(userUsage)
        .values({
          userId,
          month,
          aiConsultations: 0,
          tracksCompleted: 0,
          videoHours: "0",
          eventsCreated: 0,
          ...updates,
        })
        .returning();
      return created;
    }
  }

  // Task template operations
  async getTaskTemplates(userId: number): Promise<TaskTemplate[]> {
    return await db.select().from(taskTemplates).where(eq(taskTemplates.userId, userId));
  }

  async createTaskTemplate(templateData: InsertTaskTemplate): Promise<TaskTemplate> {
    const [template] = await db
      .insert(taskTemplates)
      .values(templateData)
      .returning();
    return template;
  }

  async updateTaskTemplate(id: number, updates: Partial<TaskTemplate>): Promise<TaskTemplate> {
    const [updated] = await db
      .update(taskTemplates)
      .set(updates)
      .where(eq(taskTemplates.id, id))
      .returning();
    return updated;
  }

  async deleteTaskTemplate(id: number): Promise<void> {
    await db.delete(taskTemplates).where(eq(taskTemplates.id, id));
  }

  // Task suggestion operations
  async getTaskSuggestions(userId: number): Promise<TaskSuggestion[]> {
    return await db.select().from(taskSuggestions).where(eq(taskSuggestions.userId, userId));
  }

  async createTaskSuggestion(suggestionData: InsertTaskSuggestion): Promise<TaskSuggestion> {
    const [suggestion] = await db
      .insert(taskSuggestions)
      .values(suggestionData)
      .returning();
    return suggestion;
  }

  async updateTaskSuggestion(id: number, updates: Partial<TaskSuggestion>): Promise<TaskSuggestion> {
    const [updated] = await db
      .update(taskSuggestions)
      .set(updates)
      .where(eq(taskSuggestions.id, id))
      .returning();
    return updated;
  }

  async deleteTaskSuggestion(id: number): Promise<void> {
    await db.delete(taskSuggestions).where(eq(taskSuggestions.id, id));
  }

  async generateSmartSuggestions(userId: number): Promise<TaskSuggestion[]> {
    // Get recent events to analyze patterns
    const recentEvents = await db
      .select()
      .from(calendarEvents)
      .where(eq(calendarEvents.userId, userId))
      .orderBy(calendarEvents.date)
      .limit(10);

    // Get user's learning progress
    const userProgress = await db
      .select()
      .from(userProgress)
      .where(eq(userProgress.userId, userId));

    const suggestions: InsertTaskSuggestion[] = [];
    const now = new Date();

    // Smart suggestion logic based on recent activities
    if (recentEvents.length > 0) {
      const lastIrrigation = recentEvents.find(e => e.eventType === 'irrigacao');
      const lastFertilization = recentEvents.find(e => e.eventType === 'nutricao');

      if (lastIrrigation && (now.getTime() - new Date(lastIrrigation.date).getTime()) > 3 * 24 * 60 * 60 * 1000) {
        suggestions.push({
          userId,
          title: "Verificar sistema de irrigação",
          description: "Recomendado verificar a irrigação após 3 dias da última aplicação",
          eventType: "irrigacao",
          suggestedDate: new Date(now.getTime() + 24 * 60 * 60 * 1000),
          reason: "Baseado no histórico de irrigação",
          priority: "medium",
        });
      }

      if (lastFertilization && (now.getTime() - new Date(lastFertilization.date).getTime()) > 7 * 24 * 60 * 60 * 1000) {
        suggestions.push({
          userId,
          title: "Controle de ervas daninhas",
          description: "Após a adubação, é recomendado verificar e controlar ervas daninhas",
          eventType: "manejo_pragas",
          suggestedDate: new Date(now.getTime() + 2 * 24 * 60 * 60 * 1000),
          reason: "Sequência recomendada após adubação",
          priority: "high",
        });
      }
    }

    // Suggestions based on learning progress
    if (userProgress.some(p => p.trackId === 1 && p.isCompleted)) { // Assuming track 1 is about irrigation
      suggestions.push({
        userId,
        title: "Aplicar conhecimentos de irrigação",
        description: "Baseado no seu progresso nas trilhas de aprendizado",
        eventType: "irrigacao",
        suggestedDate: new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000),
        reason: "Baseado nas trilhas de aprendizado concluídas",
        priority: "medium",
      });
    }

    // Create suggestions in database
    const createdSuggestions: TaskSuggestion[] = [];
    for (const suggestion of suggestions) {
      const [created] = await db
        .insert(taskSuggestions)
        .values(suggestion)
        .returning();
      createdSuggestions.push(created);
    }

    return createdSuggestions;
  }

  // Activity tracking for inactivity alerts
  async getUserActivity(userId: number): Promise<UserActivity | undefined> {
    const [activity] = await db
      .select()
      .from(userActivity)
      .where(eq(userActivity.userId, userId));
    return activity;
  }

  async updateUserActivity(userId: number, activityType: 'calendar' | 'chat' | 'learning'): Promise<UserActivity> {
    const now = new Date();
    const existing = await this.getUserActivity(userId);
    
    if (existing) {
      const updateData: any = { updatedAt: now };
      
      if (activityType === 'calendar') {
        updateData.lastCalendarActivity = now;
      } else if (activityType === 'chat') {
        updateData.lastChatActivity = now;
      } else if (activityType === 'learning') {
        updateData.lastLearningActivity = now;
      }
      
      const [updated] = await db
        .update(userActivity)
        .set(updateData)
        .where(eq(userActivity.userId, userId))
        .returning();
      return updated;
    } else {
      const newActivity: any = {
        userId,
        alertsDisabled: false,
        createdAt: now,
        updatedAt: now,
      };
      
      if (activityType === 'calendar') {
        newActivity.lastCalendarActivity = now;
      } else if (activityType === 'chat') {
        newActivity.lastChatActivity = now;
      } else if (activityType === 'learning') {
        newActivity.lastLearningActivity = now;
      }
      
      const [created] = await db
        .insert(userActivity)
        .values(newActivity)
        .returning();
      return created;
    }
  }

  // Export functionality
  async getCalendarHistoryForExport(userId: number, filters?: {
    eventType?: string;
    location?: string;
    startDate?: Date;
    endDate?: Date;
  }): Promise<CalendarEvent[]> {
    const conditions = [eq(calendarEvents.userId, userId)];

    // Apply filters if provided
    if (filters?.eventType) {
      conditions.push(eq(calendarEvents.eventType, filters.eventType));
    }
    
    if (filters?.location) {
      conditions.push(eq(calendarEvents.location, filters.location));
    }
    
    if (filters?.startDate) {
      conditions.push(gte(calendarEvents.date, filters.startDate));
    }
    
    if (filters?.endDate) {
      conditions.push(lte(calendarEvents.date, filters.endDate));
    }

    const events = await db
      .select()
      .from(calendarEvents)
      .where(and(...conditions))
      .orderBy(desc(calendarEvents.date));
      
    return events;
  }

  // Notification operations
  async getNotifications(userId: number): Promise<Notification[]> {
    const notificationList = await db
      .select()
      .from(notifications)
      .where(eq(notifications.userId, userId))
      .orderBy(desc(notifications.createdAt));
    
    return notificationList;
  }

  async getUnreadNotifications(userId: number): Promise<Notification[]> {
    const unreadNotifications = await db
      .select()
      .from(notifications)
      .where(and(
        eq(notifications.userId, userId),
        eq(notifications.isRead, false)
      ))
      .orderBy(desc(notifications.createdAt));
    
    return unreadNotifications;
  }

  async createNotification(notificationData: InsertNotification): Promise<Notification> {
    const [notification] = await db
      .insert(notifications)
      .values(notificationData)
      .returning();
    
    return notification;
  }

  async markNotificationAsRead(id: number): Promise<Notification> {
    const [notification] = await db
      .update(notifications)
      .set({ 
        isRead: true, 
        readAt: new Date() 
      })
      .where(eq(notifications.id, id))
      .returning();
    
    return notification;
  }

  async markAllNotificationsAsRead(userId: number): Promise<void> {
    await db
      .update(notifications)
      .set({ 
        isRead: true, 
        readAt: new Date() 
      })
      .where(and(
        eq(notifications.userId, userId),
        eq(notifications.isRead, false)
      ));
  }
}

import { SupabaseStorage } from './supabase-storage';

// Hybrid storage: Use Supabase para users/farms/chats, MemStorage para learning e outras operações
class HybridStorage extends MemStorage {
  private supabaseStorage = new SupabaseStorage();

  // Override user methods to use Supabase
  async getUser(id: number): Promise<User | undefined> {
    return this.supabaseStorage.getUser(id);
  }

  async getUserByCpf(cpf: string): Promise<User | undefined> {
    return this.supabaseStorage.getUserByCpf(cpf);
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    return this.supabaseStorage.getUserByEmail(email);
  }

  async createUser(user: InsertUser): Promise<User> {
    return this.supabaseStorage.createUser(user);
  }

  async updateUser(id: number, updates: Partial<User>): Promise<User> {
    return this.supabaseStorage.updateUser(id, updates);
  }

  async getUserById(id: number): Promise<User | undefined> {
    return this.supabaseStorage.getUser(id);
  }

  // Billing operations - use Supabase
  async getExpiredTrialUsers(): Promise<User[]> {
    return this.supabaseStorage.getExpiredTrialUsers();
  }

  async updateUserAfterBilling(id: number, updates: Partial<User>): Promise<User> {
    return this.supabaseStorage.updateUserAfterBilling(id, updates);
  }

  // Chat methods - use Supabase exclusively
  async getChatConversations(userId: number): Promise<ChatConversation[]> {
    return this.supabaseStorage.getChatConversations(userId);
  }

  async createChatConversation(conversation: InsertChatConversation): Promise<ChatConversation> {
    return this.supabaseStorage.createChatConversation(conversation);
  }

  async getChatMessages(conversationId: number): Promise<ChatMessage[]> {
    return this.supabaseStorage.getChatMessages(conversationId);
  }

  async createChatMessage(message: InsertChatMessage): Promise<ChatMessage> {
    return this.supabaseStorage.createChatMessage(message);
  }

  // Farm methods - use Supabase
  async getUserFarms(userId: number): Promise<Farm[]> {
    return this.supabaseStorage.getUserFarms(userId);
  }

  async getUserActiveFarm(userId: number): Promise<Farm | undefined> {
    return this.supabaseStorage.getUserActiveFarm(userId);
  }

  async createFarm(farmData: InsertFarm): Promise<Farm> {
    return this.supabaseStorage.createFarm(farmData);
  }

  async updateFarm(id: number, updates: Partial<Farm>): Promise<Farm> {
    return this.supabaseStorage.updateFarm(id, updates);
  }

  async deleteFarm(id: number): Promise<void> {
    return this.supabaseStorage.deleteFarm(id);
  }

  // Learning operations - usar Supabase exclusivamente com dados reais
  async getLearningTracks(): Promise<LearningTrack[]> {
    return this.supabaseStorage.getLearningTracks();
  }

  async getLearningTrack(id: number): Promise<LearningTrack | undefined> {
    return this.supabaseStorage.getLearningTrack(id);
  }

  async getLearningVideos(trackId: number): Promise<LearningVideo[]> {
    return this.supabaseStorage.getLearningVideos(trackId);
  }

  async getUserProgress(userId: number): Promise<UserProgress[]> {
    return this.supabaseStorage.getUserProgress(userId);
  }

  async updateUserProgress(userId: number, trackId: number, videoId: number, isCompleted: boolean, score?: number): Promise<UserProgress> {
    return this.supabaseStorage.updateUserProgress(userId, trackId, videoId, isCompleted, score);
  }

  // Calendar methods - use Supabase
  async getCalendarEvents(userId: number): Promise<CalendarEvent[]> {
    return this.supabaseStorage.getCalendarEvents(userId);
  }

  async createCalendarEvent(event: InsertCalendarEvent): Promise<CalendarEvent> {
    return this.supabaseStorage.createCalendarEvent(event);
  }

  async updateCalendarEvent(id: number, updates: Partial<CalendarEvent>): Promise<CalendarEvent> {
    return this.supabaseStorage.updateCalendarEvent(id, updates);
  }

  async deleteCalendarEvent(id: number): Promise<void> {
    return this.supabaseStorage.deleteCalendarEvent(id);
  }

  // Task template operations - simple implementation for now
  async getTaskTemplates(userId: number): Promise<TaskTemplate[]> {
    return [];
  }

  async createTaskTemplate(template: InsertTaskTemplate): Promise<TaskTemplate> {
    return {
      id: 1,
      name: template.name,
      title: template.title,
      description: template.description || null,
      eventType: template.eventType,
      customType: template.customType || null,
      recurrence: template.recurrence,
      recurrencePattern: template.recurrencePattern || null,
      userId: template.userId,
      isActive: true,
      createdAt: new Date(),
    };
  }

  async updateTaskTemplate(id: number, updates: Partial<TaskTemplate>): Promise<TaskTemplate> {
    throw new Error('Template not found');
  }

  async deleteTaskTemplate(id: number): Promise<void> {
    // No-op for now
  }

  // Task suggestion operations - simple implementation for now
  async getTaskSuggestions(userId: number): Promise<TaskSuggestion[]> {
    return [];
  }

  async createTaskSuggestion(suggestion: InsertTaskSuggestion): Promise<TaskSuggestion> {
    return {
      id: Date.now(),
      userId: suggestion.userId,
      title: suggestion.title,
      description: suggestion.description || null,
      eventType: suggestion.eventType,
      suggestedDate: suggestion.suggestedDate,
      reason: suggestion.reason,
      priority: suggestion.priority || "medium",
      isAccepted: false,
      isDismissed: false,
      createdAt: new Date(),
    };
  }

  async updateTaskSuggestion(id: number, updates: Partial<TaskSuggestion>): Promise<TaskSuggestion> {
    throw new Error('Suggestion not found');
  }

  async deleteTaskSuggestion(id: number): Promise<void> {
    // No-op for now
  }

  // Generate smart suggestions based on historical data and farm conditions
  async generateSmartSuggestions(userId: number): Promise<TaskSuggestion[]> {
    try {
      const user = await this.getUser(userId);
      if (!user) throw new Error('User not found');

      const userFarm = await this.getUserActiveFarm(userId);
      if (!userFarm) throw new Error('No active farm found');

      const recentEvents = await this.getCalendarEvents(userId);
      const currentDate = new Date();
      
      // Generate suggestions based on crop stage and season
      const suggestions: InsertTaskSuggestion[] = [];

      // Check if it's time for irrigation (if no irrigation in last 3 days)
      const lastIrrigation = recentEvents
        .filter(e => e.eventType === 'irrigacao')
        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())[0];

      if (!lastIrrigation || this.daysBetween(new Date(lastIrrigation.date), currentDate) >= 3) {
        suggestions.push({
          userId,
          title: "Irrigação recomendada",
          description: "Baseado no histórico, é recomendado realizar irrigação",
          eventType: "irrigacao",
          suggestedDate: this.addDays(currentDate, 1),
          reason: "Última irrigação foi há mais de 3 dias",
          priority: "medium",
        });
      }

      // Suggest nutrition based on crop stage
      if (userFarm.cropStage === 'crescimento' || userFarm.cropStage === 'floração') {
        const lastNutrition = recentEvents
          .filter(e => e.eventType === 'nutricao')
          .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())[0];

        if (!lastNutrition || this.daysBetween(new Date(lastNutrition.date), currentDate) >= 14) {
          suggestions.push({
            userId,
            title: "Aplicação de nutrientes",
            description: `Aplicação de fertilizantes recomendada para a fase de ${userFarm.cropStage}`,
            eventType: "nutricao",
            suggestedDate: this.addDays(currentDate, 2),
            reason: `Cultura em fase de ${userFarm.cropStage} precisa de nutrição adequada`,
            priority: "high",
          });
        }
      }

      // Suggest pest management
      const lastPestControl = recentEvents
        .filter(e => e.eventType === 'manejo_pragas')
        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())[0];

      if (!lastPestControl || this.daysBetween(new Date(lastPestControl.date), currentDate) >= 21) {
        suggestions.push({
          userId,
          title: "Monitoramento de pragas",
          description: "Realizar inspeção e controle preventivo de pragas",
          eventType: "manejo_pragas",
          suggestedDate: this.addDays(currentDate, 3),
          reason: "Prevenção é essencial para manter a produtividade",
          priority: "medium",
        });
      }

      // Create suggestions
      const createdSuggestions: TaskSuggestion[] = [];
      for (const suggestion of suggestions) {
        const created = await this.createTaskSuggestion(suggestion);
        createdSuggestions.push(created);
      }

      return createdSuggestions;
    } catch (error) {
      console.error('Error generating smart suggestions:', error);
      return [];
    }
  }

  // Helper methods for date calculations
  private daysBetween(date1: Date, date2: Date): number {
    const diffTime = Math.abs(date2.getTime() - date1.getTime());
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }

  private addDays(date: Date, days: number): Date {
    const result = new Date(date);
    result.setDate(result.getDate() + days);
    return result;
  }

  // Activity tracking - simple implementation for now
  async getUserActivity(userId: number): Promise<UserActivity | undefined> {
    return undefined;
  }

  async updateUserActivity(userId: number, activityType: 'calendar' | 'chat' | 'learning'): Promise<UserActivity> {
    const now = new Date();
    return {
      id: 1,
      userId,
      lastCalendarActivity: activityType === 'calendar' ? now : null,
      lastChatActivity: activityType === 'chat' ? now : null,
      lastLearningActivity: activityType === 'learning' ? now : null,
      lastAlertSent: null,
      alertsDisabled: false,
      createdAt: now,
      updatedAt: now,
    };
  }

  // Export functionality
  async getCalendarHistoryForExport(userId: number, filters?: {
    eventType?: string;
    location?: string;
    startDate?: Date;
    endDate?: Date;
  }): Promise<CalendarEvent[]> {
    let events = await this.getCalendarEvents(userId);

    if (filters) {
      if (filters.eventType) {
        events = events.filter(e => e.eventType === filters.eventType);
      }
      if (filters.location) {
        events = events.filter(e => e.location?.includes(filters.location || ''));
      }
      if (filters.startDate) {
        events = events.filter(e => new Date(e.date) >= filters.startDate!);
      }
      if (filters.endDate) {
        events = events.filter(e => new Date(e.date) <= filters.endDate!);
      }
    }

    return events.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }
}

export const storage = new HybridStorage();
