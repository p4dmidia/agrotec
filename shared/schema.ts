import { pgTable, text, serial, integer, boolean, timestamp, json, decimal, date, jsonb, varchar } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Users table
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  fullName: text("full_name").notNull(),
  cpf: text("cpf").notNull().unique(),
  email: text("email").notNull().unique(),
  password: text("password").notNull(),
  phone: text("phone"),
  address: text("address"),
  profileImageUrl: text("profile_image_url"),
  plan: text("plan").notNull().default("gratuito"), // gratuito, pro, premium
  isAdimplente: boolean("is_adimplente").notNull().default(true),
  subscriptionEndsAt: timestamp("subscription_ends_at"),
  // New subscription fields
  plano: text("plano").default("mensal"), // mensal, trimestral, anual
  trialAtivo: boolean("trial_ativo").default(true),
  trialExpiraEm: timestamp("trial_expira_em"),
  cobrancaAgendada: boolean("cobranca_agendada").default(false),
  role: text("role").default("user"),
  isActive: boolean("is_active").notNull().default(true),
  // Farm location information
  farmLocation: text("farm_location"), // City, State or address
  farmCoordinates: text("farm_coordinates"), // "lat,lon" format
  farmCep: text("farm_cep"), // Brazilian postal code
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Farms table - detailed farm information
export const farms = pgTable("farms", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  name: text("name").notNull(), // Nome da fazenda
  municipality: text("municipality").notNull(), // Município
  state: text("state").notNull(), // Estado (UF)
  address: text("address"),
  coordinates: text("coordinates"), // "lat,lon" format
  cep: text("cep"), // Brazilian postal code
  area: decimal("area", { precision: 10, scale: 2 }), // Área em hectares
  mainCrop: text("main_crop"), // Cultura principal
  cropStage: text("crop_stage"), // Estágio da cultura (plantio, crescimento, floração, frutificação, colheita)
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Chat conversations
export const chatConversations = pgTable("chat_conversations", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  title: text("title").notNull(),
  mode: text("mode").notNull(), // consultation, diagnosis
  createdAt: timestamp("created_at").defaultNow(),
});

// Chat messages
export const chatMessages = pgTable("chat_messages", {
  id: serial("id").primaryKey(),
  conversationId: integer("conversation_id").notNull(),
  sender: text("sender").notNull(), // user, ai
  content: text("content").notNull(),
  messageType: text("message_type").notNull().default("text"), // text, image, audio, pdf, diagnostic
  fileUrl: text("file_url"),

  createdAt: timestamp("created_at").defaultNow(),
});

// Learning tracks
export const learningTracks = pgTable("learning_tracks", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  imageUrl: text("image_url"),
  videoCount: integer("video_count").notNull().default(0),
  duration: text("duration").notNull(),
  category: text("category").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

// Learning videos
export const learningVideos = pgTable("learning_videos", {
  id: serial("id").primaryKey(),
  trackId: integer("track_id").notNull(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  videoUrl: text("video_url").notNull(),
  duration: text("duration").notNull(),
  order: integer("order").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

// User progress
export const userProgress = pgTable("user_progress", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  trackId: integer("track_id").notNull(),
  videoId: integer("video_id"),
  isCompleted: boolean("is_completed").notNull().default(false),
  score: integer("score").default(0),
  completedAt: timestamp("completed_at"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Achievement seals/badges (Selos de Progresso)
export const userSeals = pgTable("user_seals", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  trackId: integer("track_id").notNull(),
  sealType: text("seal_type").notNull(), // "module_complete", "first_video", "streak_7days", etc.
  title: text("title").notNull(),
  description: text("description").notNull(),
  iconUrl: text("icon_url").notNull(),
  unlockedAt: timestamp("unlocked_at").defaultNow(),
});

// Field checklists (Checklist de Campo)
export const fieldChecklists = pgTable("field_checklists", {
  id: serial("id").primaryKey(),
  trackId: integer("track_id").notNull(),
  title: text("title").notNull(),
  description: text("description"),
  items: jsonb("items").notNull(), // Array of checklist items
  createdAt: timestamp("created_at").defaultNow(),
});

// User checklist progress
export const userChecklistProgress = pgTable("user_checklist_progress", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  checklistId: integer("checklist_id").notNull(),
  itemIndex: integer("item_index").notNull(),
  isCompleted: boolean("is_completed").notNull().default(false),
  completedAt: timestamp("completed_at"),
  notes: text("notes"), // User notes for this item
});

// Practical tasks (Tarefas Práticas)
export const practicalTasks = pgTable("practical_tasks", {
  id: serial("id").primaryKey(),
  videoId: integer("video_id").notNull(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  actionType: text("action_type").notNull(), // "immediate", "weekly", "seasonal"
  difficulty: text("difficulty").notNull().default("easy"), // "easy", "medium", "hard"
  estimatedTime: text("estimated_time"), // "15 min", "1 hora", etc.
  materials: jsonb("materials"), // List of required materials
  createdAt: timestamp("created_at").defaultNow(),
});

// User practical task progress
export const userTaskProgress = pgTable("user_task_progress", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  taskId: integer("task_id").notNull(),
  isStarted: boolean("is_started").notNull().default(false),
  isCompleted: boolean("is_completed").notNull().default(false),
  startedAt: timestamp("started_at"),
  completedAt: timestamp("completed_at"),
  userNotes: text("user_notes"), // User feedback/notes about the task
  rating: integer("rating"), // 1-5 stars rating by user
});

// Calendar events
export const calendarEvents = pgTable("calendar_events", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  title: text("title").notNull(),
  description: text("description"),
  eventType: text("event_type").notNull(), // plantio, irrigacao, nutricao, manejo_pragas, colheita, outros
  date: timestamp("date").notNull(),
  isCompleted: boolean("is_completed").notNull().default(false),
  customType: text("custom_type"), // Para "outros" com texto livre
  cropStage: text("crop_stage"), // estagio da cultura
  recurrence: text("recurrence"), // daily, weekly, monthly, custom
  recurrencePattern: text("recurrence_pattern"), // JSON string para padrões personalizados
  isRecurring: boolean("is_recurring").notNull().default(false),
  templateId: integer("template_id"), // referência para templates
  imageUrl: text("image_url"), // URL da imagem anexada
  technicalNotes: text("technical_notes"), // Observações técnicas do agrônomo
  location: text("location"), // Talhão ou local da atividade
  createdAt: timestamp("created_at").defaultNow(),
});

// Task templates para tarefas recorrentes
export const taskTemplates = pgTable("task_templates", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  name: text("name").notNull(),
  title: text("title").notNull(),
  description: text("description"),
  eventType: text("event_type").notNull(),
  customType: text("custom_type"),
  recurrence: text("recurrence").notNull(),
  recurrencePattern: text("recurrence_pattern"),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").defaultNow(),
});

// Sugestões inteligentes de tarefas
export const taskSuggestions = pgTable("task_suggestions", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  title: text("title").notNull(),
  description: text("description"),
  eventType: text("event_type").notNull(),
  suggestedDate: timestamp("suggested_date").notNull(),
  reason: text("reason").notNull(), // motivo da sugestão
  priority: text("priority").notNull().default("medium"), // low, medium, high
  isAccepted: boolean("is_accepted").notNull().default(false),
  isDismissed: boolean("is_dismissed").notNull().default(false),
  createdAt: timestamp("created_at").defaultNow(),
});

// Weather alerts
export const weatherAlerts = pgTable("weather_alerts", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  city: text("city").notNull(),
  alertType: text("alert_type").notNull(), // 'wind', 'rain', 'frost', 'heat', 'drought'
  severity: text("severity").notNull(), // 'low', 'medium', 'high'
  title: text("title").notNull(),
  message: text("message").notNull(),
  agriculturalAdvice: text("agricultural_advice").notNull(),
  triggerConditions: json("trigger_conditions").notNull(),
  affectedActivities: text("affected_activities").array().notNull(),
  validUntil: timestamp("valid_until").notNull(),
  isActive: boolean("is_active").notNull().default(true),
  notificationSent: boolean("notification_sent").notNull().default(false),
  createdAt: timestamp("created_at").defaultNow(),
});

// Store products
export const storeProducts = pgTable("store_products", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description").notNull(),
  price: decimal("price", { precision: 10, scale: 2 }).notNull(),
  category: text("category").notNull(), // seeds, fertilizers, tools, pesticides, mudas
  imageUrl: text("image_url"),
  inStock: boolean("in_stock").notNull().default(true),
  createdAt: timestamp("created_at").defaultNow(),
});

// Shopping cart
export const shoppingCart = pgTable("shopping_cart", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  productId: integer("product_id").notNull(),
  quantity: integer("quantity").notNull().default(1),
  createdAt: timestamp("created_at").defaultNow(),
});

// User usage tracking
export const userUsage = pgTable("user_usage", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  month: text("month").notNull(), // YYYY-MM format
  aiConsultations: integer("ai_consultations").notNull().default(0),
  tracksCompleted: integer("tracks_completed").notNull().default(0),
  videoHours: decimal("video_hours", { precision: 5, scale: 2 }).notNull().default("0"),
  eventsCreated: integer("events_created").notNull().default(0),
  createdAt: timestamp("created_at").defaultNow(),
});

// Weather forecast data
export const weatherForecast = pgTable("weather_forecast", {
  id: serial("id").primaryKey(),
  location: text("location").notNull(), // City/GPS coordinates
  date: date("date").notNull(),
  tempMin: decimal("temp_min", { precision: 4, scale: 1 }).notNull(),
  tempMax: decimal("temp_max", { precision: 4, scale: 1 }).notNull(),
  humidity: integer("humidity").notNull(),
  windSpeed: decimal("wind_speed", { precision: 4, scale: 1 }).notNull(),
  precipitation: decimal("precipitation", { precision: 5, scale: 2 }).notNull().default("0"),
  cloudCover: integer("cloud_cover").notNull().default(0),
  condition: text("condition").notNull(),
  icon: text("icon").notNull(),
  pressure: decimal("pressure", { precision: 6, scale: 2 }).notNull().default("1013"),
  visibility: decimal("visibility", { precision: 4, scale: 1 }).notNull().default("10"),
  uvIndex: integer("uv_index").notNull().default(0),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Notifications table
export const notifications = pgTable("notifications", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  title: text("title").notNull(),
  message: text("message").notNull(),
  type: text("type").notNull(), // 'weather', 'system', 'calendar', 'learning', 'store'
  severity: text("severity").notNull().default("info"), // 'info', 'warning', 'error', 'success'
  isRead: boolean("is_read").notNull().default(false),
  actionUrl: text("action_url"), // URL to redirect when clicked
  metadata: json("metadata"), // Additional data for the notification
  createdAt: timestamp("created_at").defaultNow(),
  readAt: timestamp("read_at"),
});



// Insert schemas
export const insertUserSchema = createInsertSchema(users).pick({
  fullName: true,
  cpf: true,
  email: true,
  password: true,
  phone: true,
  address: true,
});

export const insertChatConversationSchema = createInsertSchema(chatConversations).pick({
  userId: true,
  mode: true,
}).extend({
  title: z.string().optional(),
});

export const insertChatMessageSchema = createInsertSchema(chatMessages).pick({
  conversationId: true,
  sender: true,
  content: true,
  messageType: true,
  fileUrl: true,
});

export const insertCalendarEventSchema = createInsertSchema(calendarEvents).pick({
  userId: true,
  title: true,
  description: true,
  eventType: true,
  date: true,
  customType: true,
  cropStage: true,
  recurrence: true,
  recurrencePattern: true,
  isRecurring: true,
  templateId: true,
  imageUrl: true,
  technicalNotes: true,
  location: true,
});

export const insertTaskTemplateSchema = createInsertSchema(taskTemplates).pick({
  userId: true,
  name: true,
  title: true,
  description: true,
  eventType: true,
  customType: true,
  recurrence: true,
  recurrencePattern: true,
});

export const insertTaskSuggestionSchema = createInsertSchema(taskSuggestions).pick({
  userId: true,
  title: true,
  description: true,
  eventType: true,
  suggestedDate: true,
  reason: true,
  priority: true,
});

export const insertShoppingCartSchema = createInsertSchema(shoppingCart).pick({
  userId: true,
  productId: true,
  quantity: true,
});

export const insertStoreProductSchema = createInsertSchema(storeProducts).pick({
  name: true,
  description: true,
  price: true,
  category: true,
  imageUrl: true,
  inStock: true,
});

export const insertNotificationSchema = createInsertSchema(notifications).pick({
  userId: true,
  title: true,
  message: true,
  type: true,
  severity: true,
  actionUrl: true,
  metadata: true,
});

// Types
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;
export type Farm = typeof farms.$inferSelect;
export type InsertFarm = typeof farms.$inferInsert;
export type ChatConversation = typeof chatConversations.$inferSelect;
export type InsertChatConversation = z.infer<typeof insertChatConversationSchema>;
export type ChatMessage = typeof chatMessages.$inferSelect;
export type InsertChatMessage = z.infer<typeof insertChatMessageSchema>;
export type LearningTrack = typeof learningTracks.$inferSelect;
export type LearningVideo = typeof learningVideos.$inferSelect;
export type UserProgress = typeof userProgress.$inferSelect;
export type CalendarEvent = typeof calendarEvents.$inferSelect;
export type InsertCalendarEvent = z.infer<typeof insertCalendarEventSchema>;
export type TaskTemplate = typeof taskTemplates.$inferSelect;
export type InsertTaskTemplate = z.infer<typeof insertTaskTemplateSchema>;
export type TaskSuggestion = typeof taskSuggestions.$inferSelect;
export type InsertTaskSuggestion = z.infer<typeof insertTaskSuggestionSchema>;
export type WeatherAlert = typeof weatherAlerts.$inferSelect;
export type WeatherForecast = typeof weatherForecast.$inferSelect;
export type StoreProduct = typeof storeProducts.$inferSelect;
export type InsertStoreProduct = z.infer<typeof insertStoreProductSchema>;
export type ShoppingCart = typeof shoppingCart.$inferSelect;
export type InsertShoppingCart = z.infer<typeof insertShoppingCartSchema>;
export type UserUsage = typeof userUsage.$inferSelect;
export type Notification = typeof notifications.$inferSelect;
export type InsertNotification = z.infer<typeof insertNotificationSchema>;

// User activity tracking for inactivity alerts
export const userActivity = pgTable("user_activity", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  lastCalendarActivity: timestamp("last_calendar_activity"),
  lastChatActivity: timestamp("last_chat_activity"),
  lastLearningActivity: timestamp("last_learning_activity"),
  lastAlertSent: timestamp("last_alert_sent"),
  alertsDisabled: boolean("alerts_disabled").notNull().default(false),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export type UserActivity = typeof userActivity.$inferSelect;

// Historical weather data for farm analysis
export const weatherHistory = pgTable("weather_history", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  farmArea: varchar("farm_area"), // Talhão/Fazenda
  location: varchar("location").notNull(),
  recordDate: date("record_date").notNull(),
  temperature: integer("temperature"),
  tempMin: integer("temp_min"),
  tempMax: integer("temp_max"),
  humidity: integer("humidity"),
  windSpeed: integer("wind_speed"),
  windDirection: varchar("wind_direction", { length: 10 }),
  precipitation: decimal("precipitation", { precision: 5, scale: 2 }).default("0"),
  pressure: integer("pressure"),
  uvIndex: integer("uv_index"),
  soilMoisture: integer("soil_moisture"),
  condition: varchar("condition", { length: 100 }),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Weather-based smart suggestions
export const weatherSuggestions = pgTable("weather_suggestions", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  suggestionType: varchar("suggestion_type", { length: 50 }).notNull(), // 'activity_adjustment', 'optimal_timing', 'risk_warning'
  title: varchar("title").notNull(),
  message: text("message").notNull(),
  recommendedAction: text("recommended_action"),
  weatherCondition: varchar("weather_condition", { length: 100 }),
  priority: varchar("priority", { length: 20 }).default("medium"), // 'low', 'medium', 'high', 'critical'
  relatedActivity: varchar("related_activity", { length: 100 }),
  validUntil: timestamp("valid_until"),
  isActive: boolean("is_active").default(true),
  isRead: boolean("is_read").default(false),
  actionTaken: boolean("action_taken").default(false),
  createdAt: timestamp("created_at").defaultNow(),
});

// Weather radar and map data
export const weatherRadar = pgTable("weather_radar", {
  id: serial("id").primaryKey(),
  region: varchar("region").notNull(),
  latitude: decimal("latitude", { precision: 10, scale: 8 }),
  longitude: decimal("longitude", { precision: 11, scale: 8 }),
  radarType: varchar("radar_type", { length: 50 }), // 'precipitation', 'temperature', 'wind'
  intensity: integer("intensity"), // 0-100 scale
  timestamp: timestamp("timestamp").notNull(),
  dataSource: varchar("data_source", { length: 100 }),
  createdAt: timestamp("created_at").defaultNow(),
});

export type WeatherHistory = typeof weatherHistory.$inferSelect;
export type WeatherSuggestion = typeof weatherSuggestions.$inferSelect;
export type WeatherRadar = typeof weatherRadar.$inferSelect;

// New learning experience types
export type UserSeal = typeof userSeals.$inferSelect;
export type FieldChecklist = typeof fieldChecklists.$inferSelect;
export type UserChecklistProgress = typeof userChecklistProgress.$inferSelect;
export type PracticalTask = typeof practicalTasks.$inferSelect;
export type UserTaskProgress = typeof userTaskProgress.$inferSelect;
