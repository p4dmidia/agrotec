import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { Header } from "@/components/layout/header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { formatCPF } from "@/lib/authUtils";
import { User, Camera, CreditCard, BarChart3, Settings as SettingsIcon, AlertTriangle } from "lucide-react";

const profileSchema = z.object({
  fullName: z.string().min(1, "Nome é obrigatório"),
  email: z.string().email("Email inválido"),
  phone: z.string().optional(),
  address: z.string().optional(),
});

type ProfileFormData = z.infer<typeof profileSchema>;

export default function Settings() {
  const { user, logout } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [showCancelButton, setShowCancelButton] = useState(false);

  const { data: profile } = useQuery({
    queryKey: ["/api/user/profile"],
  });

  const { data: usage } = useQuery({
    queryKey: ["/api/user/usage"],
  });

  const updateProfileMutation = useMutation({
    mutationFn: async (data: ProfileFormData) => {
      const response = await apiRequest("PUT", "/api/user/profile", data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/user/profile"] });
      queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
      setIsEditingProfile(false);
      toast({
        title: "Perfil atualizado",
        description: "Suas informações foram salvas com sucesso!",
      });
    },
  });

  const cancelSubscriptionMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest("POST", "/api/subscription/cancel");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
      toast({
        title: "Assinatura cancelada",
        description: "Sua assinatura foi cancelada com sucesso. Você ainda pode usar a plataforma até o final do período gratuito.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Erro ao cancelar",
        description: error.message || "Tente novamente",
        variant: "destructive",
      });
    },
  });

  const form = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      fullName: profile?.fullName || "",
      email: profile?.email || "",
      phone: profile?.phone || "",
      address: profile?.address || "",
    },
  });

  // Update form when profile data loads
  React.useEffect(() => {
    if (profile) {
      form.reset({
        fullName: profile.fullName || "",
        email: profile.email || "",
        phone: profile.phone || "",
        address: profile.address || "",
      });
    }
  }, [profile, form]);

  const onSubmit = (data: ProfileFormData) => {
    updateProfileMutation.mutate(data);
  };

  const handleCancelEdit = () => {
    form.reset();
    setIsEditingProfile(false);
  };

  const getPlanDetails = (plan: string) => {
    switch (plan) {
      case "premium":
        return {
          name: "Premium",
          price: "R$ 49,90/mês",
          color: "bg-purple-100 text-purple-800",
          features: [
            "Consultas IA ilimitadas",
            "Todas as trilhas",
            "Análise avançada",
            "Relatórios detalhados",
            "Suporte 24/7"
          ]
        };
      case "pro":
        return {
          name: "Pro",
          price: "R$ 29,90/mês",
          color: "bg-blue-100 text-blue-800",
          features: [
            "50 consultas IA por mês",
            "Acesso a 5 trilhas",
            "Calendário avançado",
            "Alertas personalizados",
            "Suporte prioritário"
          ]
        };
      default:
        return {
          name: "Gratuito",
          price: "R$ 0/mês",
          color: "bg-gray-100 text-gray-800",
          features: [
            "3 consultas IA por mês",
            "Acesso a 1 trilha",
            "Calendário básico",
            "Previsão do tempo"
          ]
        };
    }
  };

  const planDetails = getPlanDetails(user?.plan || "gratuito");

  return (
    <div className="space-y-6 min-h-screen overflow-auto">
      <Header title="Configurações" subtitle="Gerencie sua conta e preferências" />
      
      <div className="p-6">
        <Tabs defaultValue="profile" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="profile" className="flex items-center">
              <User className="h-4 w-4 mr-2" />
              Perfil
            </TabsTrigger>
            <TabsTrigger value="subscription" className="flex items-center">
              <CreditCard className="h-4 w-4 mr-2" />
              Assinatura
            </TabsTrigger>
            <TabsTrigger value="usage" className="flex items-center">
              <BarChart3 className="h-4 w-4 mr-2" />
              Uso
            </TabsTrigger>
            <TabsTrigger value="preferences" className="flex items-center">
              <SettingsIcon className="h-4 w-4 mr-2" />
              Preferências
            </TabsTrigger>
          </TabsList>
          
          {/* Profile Tab */}
          <TabsContent value="profile" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Informações do Perfil</CardTitle>
                <CardDescription>
                  Atualize suas informações pessoais
                </CardDescription>
              </CardHeader>
              <CardContent>
                {isEditingProfile ? (
                  <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                      <div className="flex items-center space-x-6 mb-6">
                        <Avatar className="w-20 h-20">
                          <AvatarImage src={profile?.profileImageUrl || ""} />
                          <AvatarFallback className="text-lg">
                            {profile?.fullName?.split(" ").map((n: string) => n[0]).join("") || "U"}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <Button variant="outline" className="flex items-center">
                            <Camera className="h-4 w-4 mr-2" />
                            Alterar Foto
                          </Button>
                          <p className="text-xs text-gray-600 mt-1">
                            JPG, PNG até 2MB
                          </p>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormField
                          control={form.control}
                          name="fullName"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Nome Completo</FormLabel>
                              <FormControl>
                                <Input {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <div>
                          <Label>CPF</Label>
                          <Input 
                            value={formatCPF(profile?.cpf || "")} 
                            disabled 
                            className="bg-gray-50" 
                          />
                          <p className="text-xs text-gray-500 mt-1">
                            CPF não pode ser alterado
                          </p>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormField
                          control={form.control}
                          name="email"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Email</FormLabel>
                              <FormControl>
                                <Input type="email" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={form.control}
                          name="phone"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Telefone</FormLabel>
                              <FormControl>
                                <Input type="tel" placeholder="(11) 99999-9999" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                      
                      <FormField
                        control={form.control}
                        name="address"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Endereço</FormLabel>
                            <FormControl>
                              <Input placeholder="Rua, número, cidade, estado" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <div className="flex items-center space-x-4">
                        <Button 
                          type="submit" 
                          disabled={updateProfileMutation.isPending}
                        >
                          {updateProfileMutation.isPending ? "Salvando..." : "Salvar Alterações"}
                        </Button>
                        <Button 
                          type="button" 
                          variant="outline" 
                          onClick={handleCancelEdit}
                        >
                          Cancelar
                        </Button>
                      </div>
                    </form>
                  </Form>
                ) : (
                  <div className="space-y-6">
                    <div className="flex items-center space-x-6">
                      <Avatar className="w-20 h-20">
                        <AvatarImage src={profile?.profileImageUrl || ""} />
                        <AvatarFallback className="text-lg">
                          {profile?.fullName?.split(" ").map((n: string) => n[0]).join("") || "U"}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <h3 className="text-xl font-semibold">{profile?.fullName}</h3>
                        <p className="text-gray-600">{profile?.email}</p>
                        <Badge className={planDetails.color}>
                          {planDetails.name}
                        </Badge>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <Label className="text-sm font-medium text-gray-600">CPF</Label>
                        <p className="text-gray-800">{formatCPF(profile?.cpf || "")}</p>
                      </div>
                      
                      <div>
                        <Label className="text-sm font-medium text-gray-600">Telefone</Label>
                        <p className="text-gray-800">{profile?.phone || "Não informado"}</p>
                      </div>
                      
                      <div className="md:col-span-2">
                        <Label className="text-sm font-medium text-gray-600">Endereço</Label>
                        <p className="text-gray-800">{profile?.address || "Não informado"}</p>
                      </div>
                    </div>
                    
                    <Button onClick={() => setIsEditingProfile(true)}>
                      Editar Perfil
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
          
          {/* Subscription Tab */}
          <TabsContent value="subscription" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Minha Assinatura</CardTitle>
                <CardDescription>
                  Informações sobre seu plano atual
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <h4 className="font-semibold text-lg">{planDetails.name}</h4>
                      <p className="text-gray-600">{planDetails.price}</p>
                      <Badge 
                        variant={user?.isAdimplente ? "default" : "destructive"}
                        className="mt-1"
                      >
                        {user?.isAdimplente ? "Ativo" : "Inadimplente"}
                      </Badge>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-gray-600">Renovação</p>
                      <p className="font-medium">
                        {user?.subscriptionEndsAt 
                          ? new Date(user.subscriptionEndsAt).toLocaleDateString('pt-BR')
                          : "Sem vencimento"
                        }
                      </p>
                    </div>
                  </div>
                  
                  <div>
                    <h5 className="font-medium mb-3">Recursos inclusos:</h5>
                    <ul className="space-y-2">
                      {planDetails.features.map((feature, index) => (
                        <li key={index} className="flex items-center text-sm">
                          <span className="w-2 h-2 bg-green-500 rounded-full mr-3"></span>
                          {feature}
                        </li>
                      ))}
                    </ul>
                  </div>
                  
                  {user?.plan !== "premium" && (
                    <Button className="w-full">
                      Fazer Upgrade
                    </Button>
                  )}
                  
                  {/* Subscription Cancellation */}
                  {user?.trialAtivo && (
                    <div className="pt-4 border-t">
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => setShowCancelButton(!showCancelButton)}
                        className="text-gray-600 hover:text-gray-800 p-0 h-auto font-medium"
                      >
                        Gerenciar Assinatura
                      </Button>
                      
                      {showCancelButton && (
                        <div className="mt-3">
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => {
                              if (window.confirm("Tem certeza que deseja cancelar sua assinatura? Esta ação não pode ser desfeita.")) {
                                cancelSubscriptionMutation.mutate();
                              }
                            }}
                            disabled={cancelSubscriptionMutation.isPending}
                            className="text-red-700 border-red-300 hover:bg-red-600 hover:text-white hover:border-red-600"
                          >
                            {cancelSubscriptionMutation.isPending ? "Cancelando..." : "Cancelar Antes da Cobrança"}
                          </Button>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          {/* Usage Tab */}
          <TabsContent value="usage" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-gray-600">
                    Consultas IA
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-blue-600">
                    {usage?.aiConsultations || 0}
                  </div>
                  <p className="text-xs text-gray-500">este mês</p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-gray-600">
                    Trilhas Concluídas
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-green-600">
                    {usage?.tracksCompleted || 0}
                  </div>
                  <p className="text-xs text-gray-500">total</p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-gray-600">
                    Horas de Vídeo
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-purple-600">
                    {usage?.videoHours || "0"}h
                  </div>
                  <p className="text-xs text-gray-500">assistidas</p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-gray-600">
                    Eventos Criados
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-orange-600">
                    {usage?.eventsCreated || 0}
                  </div>
                  <p className="text-xs text-gray-500">este mês</p>
                </CardContent>
              </Card>
            </div>
            
            <Card>
              <CardHeader>
                <CardTitle>Histórico de Atividades</CardTitle>
                <CardDescription>
                  Seu uso da plataforma nos últimos meses
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <span className="text-sm font-medium">Dezembro 2024</span>
                    <div className="text-right">
                      <p className="text-sm">{usage?.aiConsultations || 0} consultas</p>
                      <p className="text-xs text-gray-600">{usage?.eventsCreated || 0} eventos criados</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <span className="text-sm font-medium">Novembro 2024</span>
                    <div className="text-right">
                      <p className="text-sm">15 consultas</p>
                      <p className="text-xs text-gray-600">8 eventos criados</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <span className="text-sm font-medium">Outubro 2024</span>
                    <div className="text-right">
                      <p className="text-sm">22 consultas</p>
                      <p className="text-xs text-gray-600">12 eventos criados</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          {/* Preferences Tab */}
          <TabsContent value="preferences" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Preferências da Conta</CardTitle>
                <CardDescription>
                  Configure como você recebe notificações e outros recursos
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div>
                    <h4 className="font-medium mb-3">Notificações</h4>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium">Alertas Meteorológicos</p>
                          <p className="text-sm text-gray-600">
                            Receba alertas sobre condições climáticas
                          </p>
                        </div>
                        <input type="checkbox" defaultChecked className="w-4 h-4" />
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium">Lembretes de Eventos</p>
                          <p className="text-sm text-gray-600">
                            Notificações sobre eventos do calendário
                          </p>
                        </div>
                        <input type="checkbox" defaultChecked className="w-4 h-4" />
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium">Novidades da Plataforma</p>
                          <p className="text-sm text-gray-600">
                            Atualizações sobre novos recursos
                          </p>
                        </div>
                        <input type="checkbox" className="w-4 h-4" />
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="font-medium mb-3">Privacidade</h4>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium">Perfil Público</p>
                          <p className="text-sm text-gray-600">
                            Permitir que outros usuários vejam seu perfil
                          </p>
                        </div>
                        <input type="checkbox" className="w-4 h-4" />
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium">Compartilhar Estatísticas</p>
                          <p className="text-sm text-gray-600">
                            Ajudar a melhorar a plataforma com dados anônimos
                          </p>
                        </div>
                        <input type="checkbox" defaultChecked className="w-4 h-4" />
                      </div>
                    </div>
                  </div>
                  
                  <div className="pt-4 border-t">
                    <Button 
                      variant="destructive" 
                      onClick={logout}
                      className="w-full"
                    >
                      Sair da Conta
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
