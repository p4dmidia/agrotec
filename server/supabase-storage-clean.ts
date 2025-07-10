import { createClient } from '@supabase/supabase-js';
import { IStorage } from './storage';
import type { 
  User, Farm, ChatConversation, ChatMessage, 
  LearningTrack, LearningVideo, UserProgress,
  CalendarEvent, InsertCalendarEvent, WeatherAlert, StoreProduct, 
  ShoppingCart, UserUsage, TaskTemplate, TaskSuggestion, UserActivity,
  Notification, InsertNotification
} from '@shared/schema';

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL must be set");
}

// Extract Supabase URL and anon key from DATABASE_URL
const dbUrl = process.env.DATABASE_URL;
const urlMatch = dbUrl.match(/postgres\.([^:]+):([^@]+)@aws-0-([^.]+)\.pooler\.supabase\.com/);
if (!urlMatch) {
  throw new Error("Invalid Supabase DATABASE_URL format");
}

const projectRef = urlMatch[1];
const supabaseUrl = `https://${projectRef}.supabase.co`;
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFrenB6cGNmbmFoZHFsZXhpbHJmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzM0NzUyMTUsImV4cCI6MjA0OTA1MTIxNX0.Wg3QU0Q8bJyU7h6rGZzJVLcPvUnLlJYIGYqF8Zi0vM8';

export class SupabaseStorage implements IStorage {
  private supabase;
  
  constructor() {
    this.supabase = createClient(supabaseUrl, supabaseAnonKey);
  }

  // Helper methods for ID conversion
  private mapSupabaseIdToNumber(uuid: string): number {
    let hash = 0;
    for (let i = 0; i < uuid.length; i++) {
      const char = uuid.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash;
    }
    return Math.abs(hash);
  }

  private mapNumberToSupabaseId(id: number): string {
    return `${id.toString().padStart(8, '0')}-0000-0000-0000-000000000000`;
  }

  // User operations
  async getUser(id: number): Promise<User | undefined> {
    try {
      const { data: users, error } = await this.supabase
        .from('users')
        .select('*')
        .limit(1);
      
      if (error || !users || users.length === 0) {
        return undefined;
      }
      
      const user = users[0];
      return {
        id: 1,
        fullName: user.nome_completo || 'Usuário',
        cpf: user.cpf || '12345678900',
        email: user.email || 'user@example.com',
        password: user.senha || 'password',
        phone: user.telefone || null,
        address: user.endereco || null,
        profileImageUrl: user.profile_image_url || null,
        plan: user.plano || 'gratuito',
        isAdimplente: user.adimplente || true,
        farmLocation: user.farm_location || null,
        farmCoordinates: user.farm_coordinates || null,
        farmCep: user.farm_cep || null,
        subscriptionEndsAt: user.subscription_ends_at ? new Date(user.subscription_ends_at) : null,
        createdAt: new Date(user.created_at),
        updatedAt: user.updated_at ? new Date(user.updated_at) : null
      };
    } catch (error) {
      console.error('Error getting user:', error);
      return undefined;
    }
  }

  async getUserByCpf(cpf: string): Promise<User | undefined> {
    try {
      const { data: users, error } = await this.supabase
        .from('users')
        .select('*')
        .eq('cpf', cpf)
        .limit(1);
      
      if (error || !users || users.length === 0) {
        return undefined;
      }
      
      const user = users[0];
      return {
        id: this.mapSupabaseIdToNumber(user.id),
        fullName: user.nome_completo || 'Usuário',
        cpf: user.cpf,
        email: user.email || 'user@example.com',
        password: user.senha || 'password',
        phone: user.telefone || null,
        address: user.endereco || null,
        profileImageUrl: user.profile_image_url || null,
        plan: user.plano || 'gratuito',
        isAdimplente: user.adimplente || true,
        farmLocation: user.farm_location || null,
        farmCoordinates: user.farm_coordinates || null,
        farmCep: user.farm_cep || null,
        subscriptionEndsAt: user.subscription_ends_at ? new Date(user.subscription_ends_at) : null,
        createdAt: new Date(user.created_at),
        updatedAt: user.updated_at ? new Date(user.updated_at) : null
      };
    } catch (error) {
      console.error('Error getting user by CPF:', error);
      return undefined;
    }
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    try {
      const { data: users, error } = await this.supabase
        .from('users')
        .select('*')
        .eq('email', email)
        .limit(1);
      
      if (error || !users || users.length === 0) {
        return undefined;
      }
      
      const user = users[0];
      return {
        id: this.mapSupabaseIdToNumber(user.id),
        fullName: user.nome_completo || 'Usuário',
        cpf: user.cpf,
        email: user.email,
        password: user.senha || 'password',
        phone: user.telefone || null,
        address: user.endereco || null,
        profileImageUrl: user.profile_image_url || null,
        plan: user.plano || 'gratuito',
        isAdimplente: user.adimplente || true,
        farmLocation: user.farm_location || null,
        farmCoordinates: user.farm_coordinates || null,
        farmCep: user.farm_cep || null,
        subscriptionEndsAt: user.subscription_ends_at ? new Date(user.subscription_ends_at) : null,
        createdAt: new Date(user.created_at),
        updatedAt: user.updated_at ? new Date(user.updated_at) : null
      };
    } catch (error) {
      console.error('Error getting user by email:', error);
      return undefined;
    }
  }

  async createUser(userData: any): Promise<User> {
    try {
      const { data, error } = await this.supabase
        .from('users')
        .insert({
          nome_completo: userData.fullName,
          cpf: userData.cpf,
          email: userData.email,
          senha: userData.password,
          telefone: userData.phone,
          endereco: userData.address,
          plano: userData.plan || 'gratuito',
          adimplente: userData.isAdimplente || true,
        })
        .select()
        .single();

      if (error) {
        throw new Error('Failed to create user');
      }

      return {
        id: this.mapSupabaseIdToNumber(data.id),
        fullName: data.nome_completo,
        cpf: data.cpf,
        email: data.email,
        password: data.senha,
        phone: data.telefone,
        address: data.endereco,
        profileImageUrl: null,
        plan: data.plano,
        isAdimplente: data.adimplente,
        farmLocation: null,
        farmCoordinates: null,
        farmCep: null,
        subscriptionEndsAt: null,
        createdAt: new Date(data.created_at),
        updatedAt: null
      };
    } catch (error) {
      console.error('Error creating user:', error);
      throw error;
    }
  }

  async updateUser(id: number, updates: any): Promise<User> {
    try {
      const { data, error } = await this.supabase
        .from('users')
        .update({
          nome_completo: updates.fullName,
          telefone: updates.phone,
          endereco: updates.address,
          plano: updates.plan,
          adimplente: updates.isAdimplente
        })
        .eq('id', this.mapNumberToSupabaseId(id))
        .select()
        .single();

      if (error) {
        throw new Error('Failed to update user');
      }

      return {
        id: this.mapSupabaseIdToNumber(data.id),
        fullName: data.nome_completo,
        cpf: data.cpf,
        email: data.email,
        password: data.senha,
        phone: data.telefone,
        address: data.endereco,
        profileImageUrl: data.profile_image_url,
        plan: data.plano,
        isAdimplente: data.adimplente,
        farmLocation: data.farm_location,
        farmCoordinates: data.farm_coordinates,
        farmCep: data.farm_cep,
        subscriptionEndsAt: data.subscription_ends_at ? new Date(data.subscription_ends_at) : null,
        createdAt: new Date(data.created_at),
        updatedAt: new Date(data.updated_at)
      };
    } catch (error) {
      console.error('Error updating user:', error);
      throw error;
    }
  }

  // Farm operations
  async getUserFarms(userId: number): Promise<Farm[]> {
    try {
      const { data: farms, error } = await this.supabase
        .from('fazendas')
        .select('*')
        .eq('usuario_id', userId);
      
      if (error) {
        console.error('Error getting user farms:', error);
        return [];
      }
      
      return farms?.map(farm => ({
        id: this.mapSupabaseIdToNumber(farm.id),
        name: farm.nome,
        userId: farm.usuario_id,
        address: farm.endereco,
        coordinates: farm.coordenadas,
        cep: farm.cep,
        area: farm.area_total,
        mainCrop: farm.cultura_principal,
        cropStage: farm.estagio_desenvolvimento,
        municipality: farm.municipio,
        state: farm.estado,
        isActive: farm.ativo,
        createdAt: new Date(farm.created_at),
        updatedAt: farm.updated_at ? new Date(farm.updated_at) : null
      })) || [];
    } catch (error) {
      console.error('Error getting user farms:', error);
      return [];
    }
  }

  async getUserActiveFarm(userId: number): Promise<Farm | undefined> {
    try {
      const { data: farms, error } = await this.supabase
        .from('fazendas')
        .select('*')
        .eq('usuario_id', userId)
        .eq('ativo', true)
        .limit(1);
      
      if (error || !farms || farms.length === 0) {
        return undefined;
      }
      
      const farm = farms[0];
      return {
        id: this.mapSupabaseIdToNumber(farm.id),
        name: farm.nome,
        userId: farm.usuario_id,
        address: farm.endereco,
        coordinates: farm.coordenadas,
        cep: farm.cep,
        area: farm.area_total,
        mainCrop: farm.cultura_principal,
        cropStage: farm.estagio_desenvolvimento,
        municipality: farm.municipio,
        state: farm.estado,
        isActive: farm.ativo,
        createdAt: new Date(farm.created_at),
        updatedAt: farm.updated_at ? new Date(farm.updated_at) : null
      };
    } catch (error) {
      console.error('Error getting user active farm:', error);
      return undefined;
    }
  }

  async createFarm(farmData: any): Promise<Farm> {
    try {
      const { data, error } = await this.supabase
        .from('fazendas')
        .insert({
          nome: farmData.name,
          usuario_id: farmData.userId,
          endereco: farmData.address,
          coordenadas: farmData.coordinates,
          cep: farmData.cep,
          area_total: farmData.area,
          cultura_principal: farmData.mainCrop,
          estagio_desenvolvimento: farmData.cropStage,
          municipio: farmData.municipality,
          estado: farmData.state,
          ativo: true
        })
        .select()
        .single();

      if (error) {
        throw new Error('Failed to create farm');
      }

      return {
        id: this.mapSupabaseIdToNumber(data.id),
        name: data.nome,
        userId: data.usuario_id,
        address: data.endereco,
        coordinates: data.coordenadas,
        cep: data.cep,
        area: data.area_total,
        mainCrop: data.cultura_principal,
        cropStage: data.estagio_desenvolvimento,
        municipality: data.municipio,
        state: data.estado,
        isActive: data.ativo,
        createdAt: new Date(data.created_at),
        updatedAt: null
      };
    } catch (error) {
      console.error('Error creating farm:', error);
      throw error;
    }
  }

  async updateFarm(id: number, updates: any): Promise<Farm> {
    try {
      const { data, error } = await this.supabase
        .from('fazendas')
        .update({
          nome: updates.name,
          endereco: updates.address,
          coordenadas: updates.coordinates,
          cep: updates.cep,
          area_total: updates.area,
          cultura_principal: updates.mainCrop,
          estagio_desenvolvimento: updates.cropStage,
          municipio: updates.municipality,
          estado: updates.state,
          ativo: updates.isActive
        })
        .eq('id', this.mapNumberToSupabaseId(id))
        .select()
        .single();

      if (error) {
        throw new Error('Failed to update farm');
      }

      return {
        id: this.mapSupabaseIdToNumber(data.id),
        name: data.nome,
        userId: data.usuario_id,
        address: data.endereco,
        coordinates: data.coordenadas,
        cep: data.cep,
        area: data.area_total,
        mainCrop: data.cultura_principal,
        cropStage: data.estagio_desenvolvimento,
        municipality: data.municipio,
        state: data.estado,
        isActive: data.ativo,
        createdAt: new Date(data.created_at),
        updatedAt: new Date(data.updated_at)
      };
    } catch (error) {
      console.error('Error updating farm:', error);
      throw error;
    }
  }

  async deleteFarm(id: number): Promise<void> {
    try {
      const { error } = await this.supabase
        .from('fazendas')
        .delete()
        .eq('id', this.mapNumberToSupabaseId(id));

      if (error) {
        throw new Error('Failed to delete farm');
      }
    } catch (error) {
      console.error('Error deleting farm:', error);
      throw error;
    }
  }

  // Calendar operations
  async getCalendarEvents(userId: number): Promise<CalendarEvent[]> {
    try {
      const { data: events, error } = await this.supabase
        .from('eventos_calendario')
        .select('*')
        .eq('usuario_id', userId)
        .order('data_evento', { ascending: false });

      if (error) {
        console.error('Error getting calendar events:', error);
        return [];
      }

      return events?.map(event => ({
        id: this.mapSupabaseIdToNumber(event.id),
        userId: event.usuario_id,
        title: event.titulo,
        description: event.descricao,
        date: new Date(event.data_evento),
        eventType: event.tipo_evento,
        location: event.localizacao,
        isCompleted: event.concluido,
        cropStage: event.estagio_cultura,
        imageUrl: event.imagem_url,
        priority: event.prioridade,
        weatherConditions: event.condicoes_clima,
        estimatedDuration: event.duracao_estimada,
        notes: event.observacoes,
        technicalNotes: event.notas_tecnicas,
        createdAt: new Date(event.created_at),
      })) || [];
    } catch (error) {
      console.error('Error in getCalendarEvents:', error);
      return [];
    }
  }

  async createCalendarEvent(event: InsertCalendarEvent): Promise<CalendarEvent> {
    try {
      const { data, error } = await this.supabase
        .from('eventos_calendario')
        .insert({
          usuario_id: event.userId,
          titulo: event.title,
          descricao: event.description || null,
          data_evento: event.date.toISOString(),
          tipo_evento: event.eventType,
          localizacao: event.location || null,
          concluido: event.isCompleted || false,
          estagio_cultura: event.cropStage || null,
          imagem_url: event.imageUrl || null,
          prioridade: event.priority || 'medium',
          condicoes_clima: event.weatherConditions || null,
          duracao_estimada: event.estimatedDuration || null,
          observacoes: event.notes || null,
          notas_tecnicas: event.technicalNotes || null,
        })
        .select()
        .single();

      if (error) {
        console.error('Error creating calendar event:', error);
        throw new Error('Failed to create calendar event');
      }

      return {
        id: this.mapSupabaseIdToNumber(data.id),
        userId: data.usuario_id,
        title: data.titulo,
        description: data.descricao,
        date: new Date(data.data_evento),
        eventType: data.tipo_evento,
        location: data.localizacao,
        isCompleted: data.concluido,
        cropStage: data.estagio_cultura,
        imageUrl: data.imagem_url,
        priority: data.prioridade,
        weatherConditions: data.condicoes_clima,
        estimatedDuration: data.duracao_estimada,
        notes: data.observacoes,
        technicalNotes: data.notas_tecnicas,
        createdAt: new Date(data.created_at),
      };
    } catch (error) {
      console.error('Error in createCalendarEvent:', error);
      throw error;
    }
  }

  async updateCalendarEvent(id: number, updates: Partial<CalendarEvent>): Promise<CalendarEvent> {
    try {
      const supabaseId = this.mapNumberToSupabaseId(id);
      const updateData: any = {};

      if (updates.title !== undefined) updateData.titulo = updates.title;
      if (updates.description !== undefined) updateData.descricao = updates.description;
      if (updates.date !== undefined) updateData.data_evento = updates.date.toISOString();
      if (updates.eventType !== undefined) updateData.tipo_evento = updates.eventType;
      if (updates.location !== undefined) updateData.localizacao = updates.location;
      if (updates.isCompleted !== undefined) updateData.concluido = updates.isCompleted;
      if (updates.cropStage !== undefined) updateData.estagio_cultura = updates.cropStage;
      if (updates.imageUrl !== undefined) updateData.imagem_url = updates.imageUrl;
      if (updates.priority !== undefined) updateData.prioridade = updates.priority;
      if (updates.weatherConditions !== undefined) updateData.condicoes_clima = updates.weatherConditions;
      if (updates.estimatedDuration !== undefined) updateData.duracao_estimada = updates.estimatedDuration;
      if (updates.notes !== undefined) updateData.observacoes = updates.notes;
      if (updates.technicalNotes !== undefined) updateData.notas_tecnicas = updates.technicalNotes;

      const { data, error } = await this.supabase
        .from('eventos_calendario')
        .update(updateData)
        .eq('id', supabaseId)
        .select()
        .single();

      if (error) {
        console.error('Error updating calendar event:', error);
        throw new Error('Failed to update calendar event');
      }

      return {
        id: this.mapSupabaseIdToNumber(data.id),
        userId: data.usuario_id,
        title: data.titulo,
        description: data.descricao,
        date: new Date(data.data_evento),
        eventType: data.tipo_evento,
        location: data.localizacao,
        isCompleted: data.concluido,
        cropStage: data.estagio_cultura,
        imageUrl: data.imagem_url,
        priority: data.prioridade,
        weatherConditions: data.condicoes_clima,
        estimatedDuration: data.duracao_estimada,
        notes: data.observacoes,
        technicalNotes: data.notas_tecnicas,
        createdAt: new Date(data.created_at),
      };
    } catch (error) {
      console.error('Error in updateCalendarEvent:', error);
      throw error;
    }
  }

  async deleteCalendarEvent(id: number): Promise<void> {
    try {
      const supabaseId = this.mapNumberToSupabaseId(id);
      const { error } = await this.supabase
        .from('eventos_calendario')
        .delete()
        .eq('id', supabaseId);

      if (error) {
        console.error('Error deleting calendar event:', error);
        throw new Error('Failed to delete calendar event');
      }
    } catch (error) {
      console.error('Error in deleteCalendarEvent:', error);
      throw error;
    }
  }

  // Stub implementations for other methods
  async getChatConversations(userId: number): Promise<ChatConversation[]> {
    return [];
  }

  async createChatConversation(conversation: any): Promise<ChatConversation> {
    return {
      id: 1,
      mode: conversation.mode,
      userId: conversation.userId,
      title: conversation.title || 'Nova Conversa',
      createdAt: new Date(),
    };
  }

  async getChatMessages(conversationId: number): Promise<ChatMessage[]> {
    return [];
  }

  async createChatMessage(message: any): Promise<ChatMessage> {
    return {
      id: 1,
      conversationId: message.conversationId,
      sender: message.sender,
      content: message.content,
      messageType: message.messageType,
      fileUrl: message.fileUrl || null,
      createdAt: new Date(),
    };
  }

  async getLearningTracks(): Promise<LearningTrack[]> {
    return [];
  }

  async getLearningTrack(id: number): Promise<LearningTrack | undefined> {
    return undefined;
  }

  async getLearningVideos(trackId: number): Promise<LearningVideo[]> {
    return [];
  }

  async getUserProgress(userId: number): Promise<UserProgress[]> {
    return [];
  }

  async updateUserProgress(userId: number, trackId: number, videoId: number, isCompleted: boolean, score?: number): Promise<UserProgress> {
    return {
      id: 1,
      userId,
      trackId,
      videoId,
      isCompleted,
      score: score || 0,
      completedAt: new Date(),
      createdAt: new Date(),
    };
  }

  async getTaskTemplates(userId: number): Promise<TaskTemplate[]> {
    return [];
  }

  async createTaskTemplate(template: any): Promise<TaskTemplate> {
    return {
      id: 1,
      userId: template.userId,
      name: template.name,
      title: template.title,
      description: template.description,
      eventType: template.eventType,
      customType: template.customType,
      recurrence: template.recurrence,
      recurrencePattern: template.recurrencePattern,
      isActive: true,
      createdAt: new Date(),
    };
  }

  async updateTaskTemplate(id: number, updates: any): Promise<TaskTemplate> {
    return {
      id,
      userId: updates.userId,
      name: updates.name,
      title: updates.title,
      description: updates.description,
      eventType: updates.eventType,
      customType: updates.customType,
      recurrence: updates.recurrence,
      recurrencePattern: updates.recurrencePattern,
      isActive: updates.isActive,
      createdAt: new Date(),
    };
  }

  async deleteTaskTemplate(id: number): Promise<void> {
    // Stub implementation
  }

  async getTaskSuggestions(userId: number): Promise<TaskSuggestion[]> {
    return [];
  }

  async createTaskSuggestion(suggestion: any): Promise<TaskSuggestion> {
    return {
      id: 1,
      userId: suggestion.userId,
      title: suggestion.title,
      description: suggestion.description,
      eventType: suggestion.eventType,
      suggestedDate: suggestion.suggestedDate,
      reason: suggestion.reason,
      priority: suggestion.priority,
      isAccepted: false,
      isDismissed: false,
      createdAt: new Date(),
    };
  }

  async updateTaskSuggestion(id: number, updates: any): Promise<TaskSuggestion> {
    return {
      id,
      userId: updates.userId,
      title: updates.title,
      description: updates.description,
      eventType: updates.eventType,
      suggestedDate: updates.suggestedDate,
      reason: updates.reason,
      priority: updates.priority,
      isAccepted: updates.isAccepted,
      isDismissed: updates.isDismissed,
      createdAt: new Date(),
    };
  }

  async deleteTaskSuggestion(id: number): Promise<void> {
    // Stub implementation
  }

  async generateSmartSuggestions(userId: number): Promise<TaskSuggestion[]> {
    return [];
  }

  async getWeatherAlerts(userId: number): Promise<WeatherAlert[]> {
    return [];
  }

  async createWeatherAlert(alert: any): Promise<WeatherAlert> {
    return {
      id: 1,
      userId: alert.userId,
      alertType: alert.alertType,
      severity: alert.severity,
      title: alert.title,
      message: alert.message,
      whatsappMessage: alert.whatsappMessage,
      scheduledFor: alert.scheduledFor,
      sent: false,
      createdAt: new Date(),
    };
  }

  async getNotifications(userId: number): Promise<Notification[]> {
    return [];
  }

  async getUnreadNotifications(userId: number): Promise<Notification[]> {
    return [];
  }

  async createNotification(notification: InsertNotification): Promise<Notification> {
    return {
      id: 1,
      userId: notification.userId,
      title: notification.title,
      message: notification.message,
      type: notification.type,
      severity: notification.severity || 'info',
      isRead: false,
      actionUrl: notification.actionUrl || null,
      metadata: notification.metadata || null,
      readAt: null,
      createdAt: new Date(),
    };
  }

  async markNotificationAsRead(id: number): Promise<Notification> {
    return {
      id,
      userId: 1,
      title: 'Test',
      message: 'Test',
      type: 'info',
      severity: 'info',
      isRead: true,
      actionUrl: null,
      metadata: null,
      readAt: new Date(),
      createdAt: new Date(),
    };
  }

  async markAllNotificationsAsRead(userId: number): Promise<void> {
    // Stub implementation
  }

  async getStoreProducts(): Promise<StoreProduct[]> {
    return [];
  }

  async getStoreProductsByCategory(category: string): Promise<StoreProduct[]> {
    return [];
  }

  async getShoppingCart(userId: number): Promise<(ShoppingCart & { product: StoreProduct })[]> {
    return [];
  }

  async addToCart(item: any): Promise<ShoppingCart> {
    return {
      id: 1,
      userId: item.userId,
      productId: item.productId,
      quantity: item.quantity,
      createdAt: new Date(),
    };
  }

  async updateCartItem(id: number, quantity: number): Promise<ShoppingCart> {
    return {
      id,
      userId: 1,
      productId: 1,
      quantity,
      createdAt: new Date(),
    };
  }

  async removeFromCart(id: number): Promise<void> {
    // Stub implementation
  }

  async clearCart(userId: number): Promise<void> {
    // Stub implementation
  }

  async getUserUsage(userId: number, month: string): Promise<UserUsage | undefined> {
    return undefined;
  }

  async updateUserUsage(userId: number, month: string, updates: any): Promise<UserUsage> {
    return {
      id: 1,
      userId,
      month,
      aiConsultations: updates.aiConsultations || 0,
      tracksCompleted: updates.tracksCompleted || 0,
      videoHours: updates.videoHours || '0',
      eventsCreated: updates.eventsCreated || 0,
      createdAt: new Date(),
    };
  }

  async getUserActivity(userId: number): Promise<UserActivity | undefined> {
    return undefined;
  }

  async updateUserActivity(userId: number, activityType: 'calendar' | 'chat' | 'learning'): Promise<UserActivity> {
    return {
      id: 1,
      userId,
      lastCalendarActivity: activityType === 'calendar' ? new Date() : null,
      lastChatActivity: activityType === 'chat' ? new Date() : null,
      lastLearningActivity: activityType === 'learning' ? new Date() : null,
      lastAlertSent: null,
      alertsDisabled: false,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
  }

  async getCalendarHistoryForExport(userId: number, filters?: any): Promise<any[]> {
    return [];
  }
}