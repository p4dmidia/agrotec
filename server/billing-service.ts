import Stripe from "stripe";
import { storage } from "./storage";

if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error('Missing required Stripe secret: STRIPE_SECRET_KEY');
}

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: "2023-10-16",
});

interface BillingResult {
  success: boolean;
  message: string;
  error?: string;
}

export class BillingService {
  /**
   * Verifica e processa cobranças de usuários com trial expirado
   */
  async processExpiredTrials(): Promise<void> {
    console.log('🔄 Verificando trials expirados...');
    
    try {
      const expiredUsers = await storage.getExpiredTrialUsers();
      console.log(`Encontrados ${expiredUsers.length} usuários com trial expirado`);
      
      for (const user of expiredUsers) {
        await this.processUserBilling(user);
      }
    } catch (error) {
      console.error('Erro ao processar trials expirados:', error);
    }
  }

  /**
   * Processa a cobrança de um usuário específico
   */
  async processUserBilling(user: any): Promise<BillingResult> {
    console.log(`💳 Processando cobrança para usuário ${user.id} (${user.email})`);
    
    // Verificar se deve cobrar
    if (!user.trialAtivo || !user.cobrancaAgendada) {
      console.log(`❌ Usuário ${user.id} não deve ser cobrado (trialAtivo: ${user.trialAtivo}, cobrancaAgendada: ${user.cobrancaAgendada})`);
      return { success: false, message: 'Usuário não deve ser cobrado' };
    }

    // Verificar se trial realmente expirou
    const now = new Date();
    const trialExpiration = new Date(user.trialExpiraEm);
    
    if (trialExpiration > now) {
      console.log(`⏰ Trial do usuário ${user.id} ainda não expirou`);
      return { success: false, message: 'Trial ainda não expirou' };
    }

    try {
      // Obter informações do plano
      const planAmount = this.getPlanAmount(user.plano);
      
      // Criar cobrança no Stripe
      const paymentIntent = await stripe.paymentIntents.create({
        amount: planAmount,
        currency: 'brl',
        customer: user.stripe_customer_id,
        payment_method: user.stripe_payment_method_id,
        confirm: true,
        return_url: process.env.STRIPE_RETURN_URL || 'https://localhost:5000',
      });

      if (paymentIntent.status === 'succeeded') {
        // Atualizar usuário após cobrança bem-sucedida
        await storage.updateUserAfterBilling(user.id, {
          trialAtivo: false,
          isAdimplente: true,
          subscriptionEndsAt: this.calculateNextBillingDate(user.plano),
        });

        console.log(`✅ Cobrança processada com sucesso para usuário ${user.id}`);
        return { success: true, message: 'Cobrança processada com sucesso' };
      } else {
        console.log(`❌ Falha na cobrança para usuário ${user.id}: ${paymentIntent.status}`);
        
        // Marcar como inadimplente
        await storage.updateUserAfterBilling(user.id, {
          trialAtivo: false,
          isAdimplente: false,
        });

        return { success: false, message: 'Falha na cobrança', error: paymentIntent.status };
      }
    } catch (error: any) {
      console.error(`❌ Erro ao processar cobrança para usuário ${user.id}:`, error);
      
      // Marcar como inadimplente em caso de erro
      await storage.updateUserAfterBilling(user.id, {
        trialAtivo: false,
        isAdimplente: false,
      });

      return { success: false, message: 'Erro na cobrança', error: error.message };
    }
  }

  /**
   * Verifica um usuário específico durante login
   */
  async checkUserBillingOnLogin(userId: number): Promise<void> {
    console.log(`🔍 Verificando status de cobrança para usuário ${userId} no login`);
    
    try {
      const user = await storage.getUserById(userId);
      if (!user) return;

      // Verificar se precisa processar cobrança
      if (user.trial_ativo && user.cobranca_agendada) {
        const now = new Date();
        const trialExpiration = new Date(user.trial_expira_em);
        
        if (trialExpiration <= now) {
          console.log(`⚠️ Trial expirado detectado no login para usuário ${userId}`);
          await this.processUserBilling(user);
        }
      }
    } catch (error) {
      console.error(`Erro ao verificar cobrança no login para usuário ${userId}:`, error);
    }
  }

  /**
   * Calcula o valor do plano em centavos
   */
  private getPlanAmount(plano: string): number {
    const planPrices = {
      mensal: 4700, // R$ 47,00
      trimestral: 11900, // R$ 119,00
      anual: 39700, // R$ 397,00
    };

    return planPrices[plano as keyof typeof planPrices] || planPrices.mensal;
  }

  /**
   * Calcula a próxima data de vencimento baseada no plano
   */
  private calculateNextBillingDate(plano: string): Date {
    const now = new Date();
    
    switch (plano) {
      case 'mensal':
        return new Date(now.getFullYear(), now.getMonth() + 1, now.getDate());
      case 'trimestral':
        return new Date(now.getFullYear(), now.getMonth() + 3, now.getDate());
      case 'anual':
        return new Date(now.getFullYear() + 1, now.getMonth(), now.getDate());
      default:
        return new Date(now.getFullYear(), now.getMonth() + 1, now.getDate());
    }
  }
}

export const billingService = new BillingService();