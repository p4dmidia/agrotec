import { useState } from "react";
import { useLocation } from "wouter";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Header } from "@/components/layout/header";
import { Sprout, MapPin, ArrowLeft } from "lucide-react";

const farmSchema = z.object({
  name: z.string().min(2, "Nome deve ter pelo menos 2 caracteres"),
  municipality: z.string().min(2, "Município é obrigatório"),
  state: z.string().min(2, "Estado é obrigatório"),
  address: z.string().optional(),
  totalArea: z.coerce.number().min(0.1, "Área deve ser maior que 0"),
  cropType: z.string().min(2, "Tipo de cultura é obrigatório"),
  developmentStage: z.string().min(2, "Estágio de desenvolvimento é obrigatório"),
  cep: z.string().optional(),
});

type FarmFormData = z.infer<typeof farmSchema>;

const brazilianStates = [
  "AC", "AL", "AP", "AM", "BA", "CE", "DF", "ES", "GO", "MA", "MT", "MS", "MG", 
  "PA", "PB", "PR", "PE", "PI", "RJ", "RN", "RS", "RO", "RR", "SC", "SP", "SE", "TO"
];

const cropTypes = [
  "Banana", "Soja", "Milho", "Feijão", "Arroz", "Trigo", "Café", "Cana-de-açúcar", 
  "Algodão", "Mandioca", "Batata", "Tomate", "Cebola", "Alface", "Cenoura", "Outro"
];

const developmentStages = [
  "Plantio", "Germinação", "Crescimento", "Floração", "Frutificação", "Maturação", "Colheita"
];

export default function FarmRegister() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const form = useForm<FarmFormData>({
    resolver: zodResolver(farmSchema),
    defaultValues: {
      name: "",
      municipality: "",
      state: "",
      address: "",
      totalArea: 0,
      cropType: "Banana",
      developmentStage: "Crescimento",
      cep: "",
    },
  });

  const createFarmMutation = useMutation({
    mutationFn: (data: FarmFormData) => apiRequest("POST", "/api/user/farms", data),
    onSuccess: () => {
      toast({
        title: "Fazenda cadastrada!",
        description: "Sua fazenda foi cadastrada com sucesso.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/user/active-farm"] });
      queryClient.invalidateQueries({ queryKey: ["/api/user/farms"] });
      setLocation("/dashboard");
    },
    onError: (error: any) => {
      toast({
        title: "Erro ao cadastrar fazenda",
        description: error.message || "Ocorreu um erro inesperado.",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: FarmFormData) => {
    createFarmMutation.mutate(data);
  };

  return (
    <div className="space-y-6 min-h-screen overflow-auto">
      <Header title="Cadastrar Fazenda" subtitle="Adicione uma nova fazenda ao seu perfil" />
      
      <div className="p-6">
        <div className="max-w-2xl mx-auto">
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setLocation("/dashboard")}
                  className="p-2"
                >
                  <ArrowLeft className="h-4 w-4" />
                </Button>
                <div className="flex items-center gap-2">
                  <Sprout className="h-5 w-5 text-green-600" />
                  <CardTitle>Informações da Fazenda</CardTitle>
                </div>
              </div>
              <CardDescription>
                Preencha as informações da sua fazenda para personalizar as previsões e recomendações.
              </CardDescription>
            </CardHeader>
            
            <CardContent>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem className="md:col-span-2">
                          <FormLabel>Nome da Fazenda</FormLabel>
                          <FormControl>
                            <Input placeholder="Ex: Fazenda São João" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="municipality"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Município</FormLabel>
                          <FormControl>
                            <Input placeholder="Ex: Campinas" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="state"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Estado</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Selecione o estado" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {brazilianStates.map((state) => (
                                <SelectItem key={state} value={state}>
                                  {state}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="address"
                      render={({ field }) => (
                        <FormItem className="md:col-span-2">
                          <FormLabel>Endereço (Opcional)</FormLabel>
                          <FormControl>
                            <Input placeholder="Ex: Rua das Flores, 123" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="totalArea"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Área Total (hectares)</FormLabel>
                          <FormControl>
                            <Input 
                              type="number" 
                              step="0.1" 
                              placeholder="Ex: 50.5" 
                              {...field} 
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="cep"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>CEP (Opcional)</FormLabel>
                          <FormControl>
                            <Input placeholder="Ex: 13000-000" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="cropType"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Tipo de Cultura</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Selecione a cultura" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {cropTypes.map((crop) => (
                                <SelectItem key={crop} value={crop}>
                                  {crop}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="developmentStage"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Estágio de Desenvolvimento</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Selecione o estágio" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {developmentStages.map((stage) => (
                                <SelectItem key={stage} value={stage}>
                                  {stage}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="flex gap-4 pt-4">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setLocation("/dashboard")}
                      className="flex-1"
                    >
                      Cancelar
                    </Button>
                    <Button
                      type="submit"
                      disabled={createFarmMutation.isPending}
                      className="flex-1 bg-green-600 hover:bg-green-700"
                    >
                      {createFarmMutation.isPending ? "Cadastrando..." : "Cadastrar Fazenda"}
                    </Button>
                  </div>
                </form>
              </Form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}