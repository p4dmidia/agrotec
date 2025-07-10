import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth, type User } from "@/hooks/useAuth";
import { Header } from "@/components/layout/header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { useState } from "react";
import { Check, Crown, Star, Zap } from "lucide-react";

const plans = [
  {
    id: "gratuito",
    name: "Gratuito",
    price: 0,
    description: "Ideal para começar",
    icon: Star,
    color: "text-gray-600",
    bgColor: "bg-gray-50",
    features: [
      "3 consultas IA por mês",
      "Acesso a 1 trilha de aprendizado",
      "Calendário básico",
      "Previsão do tempo",
      "Suporte por email"
    ],
    limitations: [
      "Funcionalidades limitadas",
      "Sem análises avançadas",
      "Sem relatórios detalhados"
    ]
  },
  {
    id: "pro",
    name: "Mensal",
    price: 47.00,
    description: "Para produtores experientes",
    icon: Zap,
    color: "text-blue-600",
    bgColor: "bg-blue-50",
    popular: true,
    features: [
      "50 consultas IA por mês",
      "Acesso a 5 trilhas de aprendizado",
      "Calendário avançado com notificações",
      "Alertas meteorológicos personalizados",
      "Análise básica de dados",
      "Suporte prioritário",
      "Histórico detalhado"
    ],
    limitations: []
  },
  {
    id: "trimestral",
    name: "Trimestral",
    price: 119.00,
    description: "Para fazendas em crescimento",
    icon: Zap,
    color: "text-orange-600",
    bgColor: "bg-orange-50",
    features: [
      "50 consultas IA por mês",
      "Acesso a 5 trilhas de aprendizado",
      "Calendário avançado com notificações",
      "Alertas meteorológicos personalizados",
      "Análise básica de dados",
      "Suporte prioritário",
      "Histórico detalhado"
    ],
    limitations: []
  },
  {
    id: "premium",
    name: "Anual",
    price: 397.00,
    description: "Para operações profissionais",
    icon: Crown,
    color: "text-purple-600",
    bgColor: "bg-purple-50",
    features: [
      "Consultas IA ilimitadas",
      "Acesso a todas as trilhas",
      "Análise avançada de dados",
      "Relatórios detalhados e insights",
      "API para integração",
      "Suporte 24/7 por telefone",
      "Consultoria agrícola mensal",
      "Recursos beta antecipados"
    ],
    limitations: []
  }
];

export default function Plans() {
  const { user } = useAuth();
  
  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-green-500"></div>
      </div>
    );
  }
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);
  const [isUpgradeDialogOpen, setIsUpgradeDialogOpen] = useState(false);

  const upgradeMutation = useMutation({
    mutationFn: async (plan: string) => {
      const response = await apiRequest("POST", "/api/plans/upgrade", { plan });
      return response.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
      setIsUpgradeDialogOpen(false);
      setSelectedPlan(null);
      toast({
        title: "Plano atualizado!",
        description: `Bem-vindo ao plano ${data.user.plan}! Aproveite os novos recursos.`,
      });
    },
  });

  const handleUpgrade = (planId: string) => {
    if (planId === "gratuito") return;
    setSelectedPlan(planId);
    setIsUpgradeDialogOpen(true);
  };

  const confirmUpgrade = () => {
    if (selectedPlan) {
      upgradeMutation.mutate(selectedPlan);
    }
  };

  const getCurrentPlanIndex = () => {
    return plans.findIndex(plan => plan.id === user?.plan) ?? 0;
  };

  const selectedPlanDetails = plans.find(plan => plan.id === selectedPlan);

  return (
    <div className="space-y-6 min-h-screen overflow-auto">
      <Header title="Planos e Assinatura" subtitle="Escolha o plano ideal para sua operação" />
      
      <div className="p-6">
        {/* Current Plan Status */}
        {user && (
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>Meu Plano Atual</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className={`w-12 h-12 rounded-full ${plans.find(p => p.id === user.plan)?.bgColor} flex items-center justify-center`}>
                    {(() => {
                      const currentPlan = plans.find(p => p.id === user.plan);
                      const IconComponent = currentPlan?.icon;
                      return IconComponent ? <IconComponent className={`h-6 w-6 ${currentPlan?.color}`} /> : null;
                    })()}
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold">
                      {plans.find(p => p.id === user.plan)?.name}
                    </h3>
                    <p className="text-gray-600">
                      {plans.find(p => p.id === user.plan)?.description}
                    </p>
                    <Badge 
                      variant={user.isAdimplente ? "default" : "destructive"}
                      className="mt-1"
                    >
                      {user.isAdimplente ? "Ativo" : "Inadimplente"}
                    </Badge>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold text-green-600">
                    R$ {plans.find(p => p.id === user.plan)?.price?.toFixed(2) || "0,00"}
                  </p>
                  <p className="text-sm text-gray-600">/mês</p>
                  {user.subscriptionEndsAt && (
                    <p className="text-xs text-gray-500 mt-1">
                      Renova em {new Date(user.subscriptionEndsAt).toLocaleDateString('pt-BR')}
                    </p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Plans Comparison */}
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Escolha o Plano Ideal
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Desbloqueie todo o potencial da agricultura inteligente com nossos planos especializados
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-7xl mx-auto">
          {plans.map((plan, index) => {
            const Icon = plan.icon;
            const isCurrentPlan = user?.plan === plan.id;
            const canUpgrade = getCurrentPlanIndex() < index;
            
            return (
              <Card 
                key={plan.id} 
                className={`relative ${
                  plan.popular ? "border-2 border-green-500 shadow-lg" : ""
                } ${isCurrentPlan ? "ring-2 ring-blue-500" : ""}`}
              >
                {plan.popular && (
                  <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                    <Badge className="bg-green-500 text-white px-3 py-1">
                      Mais Popular
                    </Badge>
                  </div>
                )}
                
                {isCurrentPlan && (
                  <div className="absolute -top-3 right-4">
                    <Badge className="bg-blue-500 text-white px-3 py-1">
                      Plano Atual
                    </Badge>
                  </div>
                )}

                <CardHeader className="text-center pb-4">
                  <div className={`w-16 h-16 rounded-full ${plan.bgColor} flex items-center justify-center mx-auto mb-4`}>
                    <Icon className={`h-8 w-8 ${plan.color}`} />
                  </div>
                  <CardTitle className="text-2xl">{plan.name}</CardTitle>
                  <CardDescription>{plan.description}</CardDescription>
                  <div className="mt-4">
                    <span className="text-4xl font-bold text-gray-900">
                      R$ {plan.price.toFixed(2)}
                    </span>
                    <span className="text-gray-600">/mês</span>
                  </div>
                </CardHeader>

                <CardContent className="pt-0">
                  <div className="space-y-4">
                    <div>
                      <h4 className="font-semibold text-sm text-gray-800 mb-3">
                        Recursos inclusos:
                      </h4>
                      <ul className="space-y-2">
                        {plan.features.map((feature, featureIndex) => (
                          <li key={featureIndex} className="flex items-start text-sm">
                            <Check className="h-4 w-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                            <span>{feature}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    {plan.limitations.length > 0 && (
                      <div>
                        <h4 className="font-semibold text-sm text-gray-600 mb-3">
                          Limitações:
                        </h4>
                        <ul className="space-y-2">
                          {plan.limitations.map((limitation, limitationIndex) => (
                            <li key={limitationIndex} className="flex items-start text-sm text-gray-600">
                              <span className="w-4 h-4 text-gray-400 mr-2 mt-0.5">×</span>
                              <span>{limitation}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    <div className="pt-4">
                      {isCurrentPlan ? (
                        <Button className="w-full" disabled>
                          Plano Atual
                        </Button>
                      ) : canUpgrade ? (
                        <Button 
                          className="w-full bg-green-600 hover:bg-green-700"
                          onClick={() => handleUpgrade(plan.id)}
                        >
                          {plan.id === "gratuito" ? "Grátis" : "Comece agora – 7 dias grátis"}
                        </Button>
                      ) : (
                        <Button className="w-full" variant="outline" disabled>
                          Plano Inferior
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Features Comparison Table */}
        <Card className="mt-12">
          <CardHeader>
            <CardTitle>Comparação Detalhada</CardTitle>
            <CardDescription>
              Veja todos os recursos disponíveis em cada plano
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 px-4">Recursos</th>
                    {plans.map(plan => (
                      <th key={plan.id} className="text-center py-3 px-4">
                        {plan.name}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b">
                    <td className="py-3 px-4 font-medium">Consultas IA</td>
                    <td className="py-3 px-4 text-center">3/mês</td>
                    <td className="py-3 px-4 text-center">50/mês</td>
                    <td className="py-3 px-4 text-center">50/mês</td>
                    <td className="py-3 px-4 text-center">Ilimitadas</td>
                  </tr>
                  <tr className="border-b">
                    <td className="py-3 px-4 font-medium">Trilhas de Aprendizado</td>
                    <td className="py-3 px-4 text-center">1</td>
                    <td className="py-3 px-4 text-center">5</td>
                    <td className="py-3 px-4 text-center">5</td>
                    <td className="py-3 px-4 text-center">Todas</td>
                  </tr>
                  <tr className="border-b">
                    <td className="py-3 px-4 font-medium">Análise de Dados</td>
                    <td className="py-3 px-4 text-center">-</td>
                    <td className="py-3 px-4 text-center">Básica</td>
                    <td className="py-3 px-4 text-center">Básica</td>
                    <td className="py-3 px-4 text-center">Avançada</td>
                  </tr>
                  <tr className="border-b">
                    <td className="py-3 px-4 font-medium">Suporte</td>
                    <td className="py-3 px-4 text-center">Email</td>
                    <td className="py-3 px-4 text-center">Prioritário</td>
                    <td className="py-3 px-4 text-center">Prioritário</td>
                    <td className="py-3 px-4 text-center">24/7</td>
                  </tr>
                  <tr>
                    <td className="py-3 px-4 font-medium">API de Integração</td>
                    <td className="py-3 px-4 text-center">-</td>
                    <td className="py-3 px-4 text-center">-</td>
                    <td className="py-3 px-4 text-center">-</td>
                    <td className="py-3 px-4 text-center">✓</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        {/* Upgrade Dialog */}
        <Dialog open={isUpgradeDialogOpen} onOpenChange={setIsUpgradeDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Confirmar Upgrade</DialogTitle>
              <DialogDescription>
                Você está prestes a fazer upgrade para o plano {selectedPlanDetails?.name}
              </DialogDescription>
            </DialogHeader>
            
            {selectedPlanDetails && (
              <div className="space-y-4">
                <div className="p-4 bg-green-50 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium">Plano {selectedPlanDetails.name}</span>
                    <span className="text-2xl font-bold text-green-600">
                      R$ {selectedPlanDetails.price.toFixed(2)}/mês
                    </span>
                  </div>
                  <p className="text-sm text-gray-600">{selectedPlanDetails.description}</p>
                </div>
                
                <div className="p-4 bg-blue-50 rounded-lg">
                  <p className="text-sm text-blue-800">
                    <strong>Simulação de Pagamento:</strong> Esta é uma demonstração. 
                    Em uma aplicação real, aqui seria integrado um gateway de pagamento seguro.
                  </p>
                </div>
                
                <div>
                  <h4 className="font-medium mb-2">Novos recursos inclusos:</h4>
                  <ul className="space-y-1">
                    {selectedPlanDetails.features.slice(0, 3).map((feature, index) => (
                      <li key={index} className="flex items-center text-sm">
                        <Check className="h-4 w-4 text-green-500 mr-2" />
                        {feature}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            )}
            
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsUpgradeDialogOpen(false)}>
                Cancelar
              </Button>
              <Button 
                onClick={confirmUpgrade}
                disabled={upgradeMutation.isPending}
                className="bg-green-600 hover:bg-green-700"
              >
                {upgradeMutation.isPending ? "Processando..." : "Confirmar Upgrade"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
