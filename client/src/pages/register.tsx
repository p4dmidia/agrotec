import { useState, useEffect } from "react";
import { useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { CheckCircle, CreditCard, Shield, Zap } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { loadStripe } from "@stripe/stripe-js";
import { Elements, CardElement, useStripe, useElements } from "@stripe/react-stripe-js";

// Initialize Stripe
const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLIC_KEY!);

const registerSchema = z.object({
  fullName: z.string().min(2, "Nome deve ter pelo menos 2 caracteres"),
  email: z.string().email("Email inválido"),
  cpf: z.string().min(11, "CPF deve ter 11 dígitos").max(11, "CPF deve ter 11 dígitos"),
  password: z.string().min(6, "Senha deve ter pelo menos 6 caracteres"),
  confirmPassword: z.string()
}).refine((data) => data.password === data.confirmPassword, {
  message: "Senhas não coincidem",
  path: ["confirmPassword"],
});

const cardSchema = z.object({
  cardNumber: z.string().min(16, "Número do cartão inválido").optional(),
  expiryDate: z.string().min(5, "Data de validade inválida").optional(),
  cvv: z.string().min(3, "CVV inválido").optional(),
  cardName: z.string().min(2, "Nome no cartão obrigatório"),
  setup_intent_id: z.string().optional(),
  payment_method_id: z.string().optional()
});

type RegisterForm = z.infer<typeof registerSchema>;
type CardForm = z.infer<typeof cardSchema>;

const plans = [
  {
    id: "mensal",
    name: "Mensal",
    price: "R$ 47,00",
    originalPrice: "R$ 69,90",
    period: "/mês",
    description: "Ideal para começar",
    features: [
      "Chat IA ilimitado",
      "Monitoramento climático",
      "Calendário agrícola",
      "Notificações WhatsApp",
      "Suporte por email"
    ]
  },
  {
    id: "trimestral",
    name: "Trimestral",
    price: "R$ 119,00",
    originalPrice: "R$ 179,70",
    period: "/3 meses",
    description: "Mais popular - Economize 20%",
    features: [
      "Tudo do plano mensal",
      "Relatórios avançados",
      "Histórico climático",
      "Análises preditivas",
      "Suporte prioritário"
    ],
    popular: true
  },
  {
    id: "anual",
    name: "Anual",
    price: "R$ 397,00",
    originalPrice: "R$ 564,00",
    period: "/ano",
    description: "Melhor valor - Economize 40%",
    features: [
      "Tudo do plano trimestral",
      "Consultoria especializada",
      "Integração avançada",
      "API personalizada",
      "Suporte telefônico"
    ]
  }
];

// Stripe Card Validation Component
function CardValidationForm({ onSuccess, userEmail }: { onSuccess: (data: any) => void; userEmail: string }) {
  const stripe = useStripe();
  const elements = useElements();
  const [isProcessing, setIsProcessing] = useState(false);
  const [clientSecret, setClientSecret] = useState<string>('');
  const [cardName, setCardName] = useState('');
  const { toast } = useToast();

  // Create SetupIntent on component mount
  useEffect(() => {
    const createSetupIntent = async () => {
      try {
        const response = await apiRequest("POST", "/api/stripe/setup-intent", {
          customer_email: userEmail
        });
        const data = await response.json();
        setClientSecret(data.client_secret);
      } catch (error) {
        console.error('Error creating setup intent:', error);
        toast({
          title: "Erro",
          description: "Não foi possível inicializar a validação do cartão",
          variant: "destructive"
        });
      }
    };

    createSetupIntent();
  }, [userEmail]);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!stripe || !elements || !clientSecret) {
      return;
    }

    setIsProcessing(true);

    const cardElement = elements.getElement(CardElement);

    if (!cardElement) {
      setIsProcessing(false);
      return;
    }

    // Confirm the SetupIntent
    const { error, setupIntent } = await stripe.confirmCardSetup(clientSecret, {
      payment_method: {
        card: cardElement,
        billing_details: {
          name: cardName,
        },
      },
    });

    if (error) {
      toast({
        title: "Erro na validação",
        description: error.message || "Erro ao validar cartão",
        variant: "destructive"
      });
      setIsProcessing(false);
    } else {
      // Card validated successfully
      console.log('Card validation success:', setupIntent.id);
      setIsProcessing(false);
      onSuccess({
        cardName,
        setup_intent_id: setupIntent.id,
        payment_method_id: setupIntent.payment_method
      });
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label htmlFor="cardName">Nome no Cartão</Label>
        <Input
          id="cardName"
          value={cardName}
          onChange={(e) => setCardName(e.target.value)}
          placeholder="Nome como aparece no cartão"
          required
        />
      </div>

      <div>
        <Label>Dados do Cartão</Label>
        <div className="border rounded-md p-3 mt-1">
          <CardElement
            options={{
              style: {
                base: {
                  fontSize: '16px',
                  color: '#424770',
                  '::placeholder': {
                    color: '#aab7c4',
                  },
                },
              },
            }}
          />
        </div>
      </div>

      <Button 
        type="submit" 
        disabled={!stripe || isProcessing || !cardName}
        className="w-full bg-green-600 hover:bg-green-700"
      >
        {isProcessing ? "Validando cartão..." : "Validar Cartão e Finalizar"}
      </Button>

      <div className="text-center text-sm text-gray-600">
        <Shield className="inline h-4 w-4 mr-1" />
        Seus dados estão protegidos com criptografia SSL
      </div>
    </form>
  );
}

export default function Register() {
  const [step, setStep] = useState(1);
  const [selectedPlan, setSelectedPlan] = useState("trimestral");
  const [userData, setUserData] = useState<RegisterForm | null>(null);
  const { toast } = useToast();

  const registerForm = useForm<RegisterForm>({
    resolver: zodResolver(registerSchema),
  });

  const cardForm = useForm<CardForm>({
    resolver: zodResolver(cardSchema),
  });

  const createAccountMutation = useMutation({
    mutationFn: async (data: { user: RegisterForm; plan: string; card: CardForm }) => {
      const response = await apiRequest("POST", "/api/auth/register", data);
      return response.json();
    },
    onSuccess: (data) => {
      toast({
        title: "Conta criada com sucesso!",
        description: "Você tem 7 dias de trial gratuito. Bem-vindo ao Dr. Agro!",
      });
      
      // Store token and redirect to dashboard
      localStorage.setItem("token", data.token);
      window.location.href = "/dashboard";
    },
    onError: (error: any) => {
      toast({
        title: "Erro ao criar conta",
        description: error.message || "Tente novamente",
        variant: "destructive",
      });
    },
  });

  const handleUserDataSubmit = (data: RegisterForm) => {
    setUserData(data);
    setStep(2);
  };

  const handleCardSubmit = (cardData: CardForm) => {
    if (!userData) {
      console.error('No user data available');
      return;
    }
    
    console.log('Submitting registration with card data:', { 
      user: userData, 
      plan: selectedPlan, 
      card: { ...cardData, setup_intent_id: cardData.setup_intent_id ? 'present' : 'missing' }
    });
    
    createAccountMutation.mutate({
      user: userData,
      plan: selectedPlan,
      card: cardData
    });
  };

  const formatCPF = (value: string) => {
    return value.replace(/\D/g, '');
  };

  const formatCardNumber = (value: string) => {
    return value.replace(/\D/g, '').substring(0, 16);
  };

  const formatExpiryDate = (value: string) => {
    const cleaned = value.replace(/\D/g, '');
    if (cleaned.length >= 2) {
      return cleaned.substring(0, 2) + '/' + cleaned.substring(2, 4);
    }
    return cleaned;
  };

  if (step === 1) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center p-4">
        <div className="w-full max-w-6xl grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* User Registration Form */}
          <Card className="w-full">
            <CardHeader>
              <CardTitle className="text-2xl font-bold text-green-700">
                Criar Conta - Dr. Agro
              </CardTitle>
              <CardDescription>
                Preencha seus dados para começar seu trial gratuito de 7 dias
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={registerForm.handleSubmit(handleUserDataSubmit)} className="space-y-4">
                <div>
                  <Label htmlFor="fullName">Nome Completo</Label>
                  <Input
                    id="fullName"
                    {...registerForm.register("fullName")}
                    placeholder="Seu nome completo"
                  />
                  {registerForm.formState.errors.fullName && (
                    <p className="text-sm text-red-600 mt-1">
                      {registerForm.formState.errors.fullName.message}
                    </p>
                  )}
                </div>

                <div>
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    {...registerForm.register("email")}
                    placeholder="seu@email.com"
                  />
                  {registerForm.formState.errors.email && (
                    <p className="text-sm text-red-600 mt-1">
                      {registerForm.formState.errors.email.message}
                    </p>
                  )}
                </div>

                <div>
                  <Label htmlFor="cpf">CPF</Label>
                  <Input
                    id="cpf"
                    {...registerForm.register("cpf", {
                      onChange: (e) => {
                        e.target.value = formatCPF(e.target.value);
                      }
                    })}
                    placeholder="12345678900"
                    maxLength={11}
                  />
                  {registerForm.formState.errors.cpf && (
                    <p className="text-sm text-red-600 mt-1">
                      {registerForm.formState.errors.cpf.message}
                    </p>
                  )}
                </div>

                <div>
                  <Label htmlFor="password">Senha</Label>
                  <Input
                    id="password"
                    type="password"
                    {...registerForm.register("password")}
                    placeholder="Mínimo 6 caracteres"
                  />
                  {registerForm.formState.errors.password && (
                    <p className="text-sm text-red-600 mt-1">
                      {registerForm.formState.errors.password.message}
                    </p>
                  )}
                </div>

                <div>
                  <Label htmlFor="confirmPassword">Confirmar Senha</Label>
                  <Input
                    id="confirmPassword"
                    type="password"
                    {...registerForm.register("confirmPassword")}
                    placeholder="Digite a senha novamente"
                  />
                  {registerForm.formState.errors.confirmPassword && (
                    <p className="text-sm text-red-600 mt-1">
                      {registerForm.formState.errors.confirmPassword.message}
                    </p>
                  )}
                </div>

                <Button type="submit" className="w-full bg-green-600 hover:bg-green-700">
                  Continuar para Escolha do Plano
                </Button>

                <div className="text-center text-sm text-gray-600">
                  Já tem uma conta?{" "}
                  <a href="/login" className="text-green-600 hover:underline">
                    Fazer login
                  </a>
                </div>
              </form>
            </CardContent>
          </Card>

          {/* Plan Selection */}
          <div className="space-y-6">
            <div className="text-center">
              <h3 className="text-2xl font-bold text-gray-900 mb-2">
                Escolha seu Plano
              </h3>
              <p className="text-gray-600">
                Todos os planos incluem 7 dias de trial gratuito
              </p>
            </div>

            <div className="space-y-4">
              {plans.map((plan) => (
                <Card
                  key={plan.id}
                  className={`relative cursor-pointer transition-all ${
                    selectedPlan === plan.id
                      ? "ring-2 ring-green-500 border-green-500 shadow-lg"
                      : "hover:shadow-md"
                  }`}
                  onClick={() => setSelectedPlan(plan.id)}
                >
                  {plan.popular && (
                    <Badge className="absolute -top-2 left-4 bg-green-600">
                      Mais Popular
                    </Badge>
                  )}
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-semibold text-lg">{plan.name}</h4>
                        <p className="text-sm text-gray-600 mb-2">{plan.description}</p>
                        <div className="flex items-baseline gap-2">
                          <span className="text-2xl font-bold text-green-600">
                            {plan.price}
                          </span>
                          <span className="text-sm text-gray-500 line-through">
                            {plan.originalPrice}
                          </span>
                          <span className="text-sm text-gray-600">{plan.period}</span>
                        </div>
                      </div>
                      <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                        selectedPlan === plan.id 
                          ? "border-green-500 bg-green-500" 
                          : "border-gray-300"
                      }`}>
                        {selectedPlan === plan.id && (
                          <CheckCircle className="w-4 h-4 text-white" />
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            <div className="bg-blue-50 p-4 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <Shield className="h-5 w-5 text-blue-600" />
                <span className="font-medium text-blue-900">Trial Gratuito</span>
              </div>
              <p className="text-sm text-blue-700">
                Teste gratuitamente por 7 dias. Cancele a qualquer momento sem custos.
                A cobrança só será feita após o período de trial.
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Step 2 - Card Information with Stripe Elements
  return (
    <Elements stripe={stripePromise}>
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-2xl font-bold text-green-700 flex items-center gap-2">
              <CreditCard className="h-6 w-6" />
              Validação do Cartão
            </CardTitle>
            <CardDescription>
              Validaremos seu cartão sem cobrança. Você só será cobrado após o trial de 7 dias.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="mb-6 p-4 bg-green-50 rounded-lg">
              <div className="flex items-center justify-between">
                <div>
                  <span className="font-medium">Plano {plans.find(p => p.id === selectedPlan)?.name}</span>
                  <div className="text-sm text-gray-600">
                    Trial gratuito até {new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toLocaleDateString('pt-BR')}
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-bold text-green-600">
                    {plans.find(p => p.id === selectedPlan)?.price}
                  </div>
                  <div className="text-sm text-gray-500">
                    {plans.find(p => p.id === selectedPlan)?.period} após trial
                  </div>
                </div>
              </div>
            </div>

            <CardValidationForm 
              userEmail={userData?.email || ''} 
              onSuccess={handleCardSubmit} 
            />

            <div className="flex gap-3 mt-6">
              <Button
                type="button"
                variant="outline"
                onClick={() => setStep(1)}
                className="flex-1"
              >
                Voltar
              </Button>
            </div>

            <div className="text-center text-xs text-gray-500 mt-4">
              Ao continuar, você concorda com nossos termos de uso e política de privacidade.
              Seu trial de 7 dias começará imediatamente.
            </div>
          </CardContent>
        </Card>
      </div>
    </Elements>
  );
}