import { useState, useEffect } from 'react';
import { useQuery, useQueryClient, useMutation } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import { 
  Cloud, 
  Sun, 
  CloudRain, 
  CloudSnow, 
  Zap, 
  Eye, 
  Gauge, 
  MapPin, 
  Calendar, 
  AlertTriangle, 
  Droplets,
  Wind,
  Thermometer,
  RefreshCw,
  TrendingUp,
  Activity,
  Shield,
  Settings,
  Plus,
  Save,
  Edit3
} from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { useLocation } from 'wouter';

// Schema de validação para edição da fazenda
const farmEditSchema = z.object({
  name: z.string().min(2, 'Nome da fazenda deve ter pelo menos 2 caracteres'),
  municipality: z.string().min(2, 'Município é obrigatório'),
  state: z.string().min(2, 'Estado é obrigatório').max(2, 'Use a sigla do estado (ex: MG)'),
  address: z.string().optional(),
  area: z.string().optional(),
  mainCrop: z.string().optional(),
  cropStage: z.string().optional(),
  cep: z.string().optional(),
});

type FarmEditFormData = z.infer<typeof farmEditSchema>;

export default function WeatherSimple() {
  const [_, setLocation] = useLocation();
  const queryClient = useQueryClient();
  const [isConfigOpen, setIsConfigOpen] = useState(false);
  const { toast } = useToast();
  
  // Farm data query
  const { data: farm, refetch: refetchFarm } = useQuery({
    queryKey: ['/api/user/active-farm'],
  });

  // Configurar formulário de edição da fazenda
  const farmForm = useForm<FarmEditFormData>({
    resolver: zodResolver(farmEditSchema),
    defaultValues: {
      name: '',
      municipality: '',
      state: '',
      address: '',
      area: '',
      mainCrop: 'banana',
      cropStage: '',
      cep: '',
    },
  });

  // Atualizar valores do formulário quando farm data carrega
  useEffect(() => {
    if (farm) {
      farmForm.reset({
        name: farm.name || '',
        municipality: farm.municipality || '',
        state: farm.state || '',
        address: farm.address || '',
        area: farm.area ? String(farm.area) : '',
        mainCrop: farm.mainCrop || '',
        cropStage: farm.cropStage || '',
        cep: farm.cep || '',
      });
    }
  }, [farm, farmForm]);

  // Mutation para salvar alterações da fazenda
  const updateFarmMutation = useMutation({
    mutationFn: async (data: FarmEditFormData) => {
      return await apiRequest(`/api/user/farms/${farm.id}`, {
        method: 'PUT',
        body: JSON.stringify({
          ...data,
          area: data.area ? parseFloat(data.area) : null,
        }),
      });
    },
    onSuccess: () => {
      toast({
        title: "Fazenda atualizada",
        description: "As informações da fazenda foram salvas com sucesso.",
      });
      setIsConfigOpen(false);
      queryClient.invalidateQueries({ queryKey: ['/api/user/active-farm'] });
      queryClient.invalidateQueries({ queryKey: ['/api/weather'] });
    },
    onError: (error: any) => {
      toast({
        title: "Erro ao salvar",
        description: error.message || "Não foi possível salvar as alterações.",
        variant: "destructive",
      });
    },
  });

  // Force refresh weather data when farm is available and page loads
  useEffect(() => {
    if (farm) {
      // Invalidate all weather queries to force refresh
      queryClient.invalidateQueries({ queryKey: ['/api/weather/farm'] });
      queryClient.invalidateQueries({ queryKey: ['/api/weather/forecast/farm'] });
      queryClient.invalidateQueries({ queryKey: ['/api/weather/alerts/farm'] });
    }
  }, [farm, queryClient]);

  // Weather data query
  const { data: weather, isLoading: weatherLoading, refetch: refetchWeather } = useQuery({
    queryKey: ['/api/weather/farm'],
    enabled: !!farm,
  });

  // Forecast data query
  const { data: forecast, isLoading: forecastLoading } = useQuery({
    queryKey: ['/api/weather/forecast/farm'],
    enabled: !!farm,
  });

  // Alerts data query
  const { data: alerts } = useQuery({
    queryKey: ['/api/weather/alerts/farm'],
    enabled: !!farm,
  });

  // Smart agricultural recommendations data query
  const { data: smartRecommendations } = useQuery({
    queryKey: ['/api/weather/recommendations/farm'],
    enabled: !!farm,
  });

  // Disease risks data query
  const { data: diseaseRisks } = useQuery({
    queryKey: ['/api/weather/disease-risks/farm'],
    enabled: !!farm,
  });

  // Crop stage risks data query
  const { data: cropRisks } = useQuery({
    queryKey: ['/api/weather/crop-risks/farm'],
    enabled: !!farm,
  });

  if (!farm) {
    return (
      <div className="container mx-auto p-6">
        <Alert className="mb-6">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            Você precisa cadastrar uma fazenda para visualizar o monitoramento climático.
          </AlertDescription>
        </Alert>
        <div className="text-center">
          <Button 
            onClick={() => setLocation('/farm-register')}
            className="bg-green-600 hover:bg-green-700"
          >
            Cadastrar Fazenda
          </Button>
        </div>
      </div>
    );
  }

  const getWeatherIcon = (condition: string) => {
    const iconProps = { className: "h-8 w-8 mx-auto" };
    
    switch (condition?.toLowerCase()) {
      case 'clear':
        return <Sun {...iconProps} className="h-8 w-8 mx-auto text-yellow-500" />;
      case 'clouds':
        return <Cloud {...iconProps} className="h-8 w-8 mx-auto text-gray-500" />;
      case 'rain':
        return <CloudRain {...iconProps} className="h-8 w-8 mx-auto text-blue-500" />;
      case 'snow':
        return <CloudSnow {...iconProps} className="h-8 w-8 mx-auto text-blue-300" />;
      case 'thunderstorm':
        return <Zap {...iconProps} className="h-8 w-8 mx-auto text-purple-500" />;
      default:
        return <Sun {...iconProps} className="h-8 w-8 mx-auto text-yellow-500" />;
    }
  };

  const getAlertBadge = (severity: string) => {
    switch (severity?.toLowerCase()) {
      case 'alto':
        return <Badge variant="destructive">Alto</Badge>;
      case 'médio':
        return <Badge variant="default" className="bg-yellow-500">Médio</Badge>;
      case 'baixo':
        return <Badge variant="secondary">Baixo</Badge>;
      default:
        return <Badge variant="outline">Info</Badge>;
    }
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Location Selection Header */}
      <Card>
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <MapPin className="h-5 w-5 text-green-600" />
              <CardTitle className="text-lg">Monitoramento Climático</CardTitle>
            </div>
            <Dialog open={isConfigOpen} onOpenChange={setIsConfigOpen}>
              <DialogTrigger asChild>
                <Button variant="outline" size="sm">
                  <Edit3 className="h-4 w-4 mr-2" />
                  Editar Fazenda
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Editar Informações da Fazenda</DialogTitle>
                  <DialogDescription>
                    Atualize as informações da sua fazenda. Estes dados são utilizados para personalizar as previsões e recomendações agrícolas.
                  </DialogDescription>
                </DialogHeader>
                
                <Form {...farmForm}>
                  <form onSubmit={farmForm.handleSubmit((data) => updateFarmMutation.mutate(data))} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        control={farmForm.control}
                        name="name"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Nome da Fazenda *</FormLabel>
                            <FormControl>
                              <Input placeholder="Ex: Fazenda São João" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={farmForm.control}
                        name="area"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Área (hectares)</FormLabel>
                            <FormControl>
                              <Input placeholder="Ex: 50.5" type="number" step="0.1" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        control={farmForm.control}
                        name="municipality"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Município *</FormLabel>
                            <FormControl>
                              <Input placeholder="Ex: Uberlândia" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={farmForm.control}
                        name="state"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Estado (UF) *</FormLabel>
                            <FormControl>
                              <Input placeholder="Ex: MG" maxLength={2} {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <FormField
                      control={farmForm.control}
                      name="address"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Endereço Completo</FormLabel>
                          <FormControl>
                            <Input placeholder="Ex: Rua das Flores, 123, Centro" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={farmForm.control}
                      name="cep"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>CEP</FormLabel>
                          <FormControl>
                            <Input placeholder="Ex: 38400-100" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        control={farmForm.control}
                        name="mainCrop"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Cultura Principal</FormLabel>
                            <Select onValueChange={field.onChange} value={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Selecione a cultura" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="banana">Banana</SelectItem>
                                <SelectItem value="soja">Soja</SelectItem>
                                <SelectItem value="milho">Milho</SelectItem>
                                <SelectItem value="cafe">Café</SelectItem>
                                <SelectItem value="cana">Cana-de-açúcar</SelectItem>
                                <SelectItem value="algodao">Algodão</SelectItem>
                                <SelectItem value="feijao">Feijão</SelectItem>
                                <SelectItem value="trigo">Trigo</SelectItem>
                                <SelectItem value="arroz">Arroz</SelectItem>
                                <SelectItem value="citros">Citros</SelectItem>
                                <SelectItem value="outros">Outros</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={farmForm.control}
                        name="cropStage"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Estágio da Cultura</FormLabel>
                            <Select onValueChange={field.onChange} value={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Selecione o estágio" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="plantio">Plantio</SelectItem>
                                <SelectItem value="crescimento">Crescimento Vegetativo</SelectItem>
                                <SelectItem value="floracao">Floração</SelectItem>
                                <SelectItem value="frutificacao">Frutificação</SelectItem>
                                <SelectItem value="colheita">Colheita</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>


                    
                    <div className="flex justify-end space-x-2 pt-4">
                      <Button 
                        type="button" 
                        variant="outline" 
                        onClick={() => setIsConfigOpen(false)}
                      >
                        Cancelar
                      </Button>
                      <Button 
                        type="submit" 
                        disabled={updateFarmMutation.isPending}
                        className="min-w-24"
                      >
                        {updateFarmMutation.isPending ? (
                          <RefreshCw className="h-4 w-4 animate-spin" />
                        ) : (
                          <>
                            <Save className="h-4 w-4 mr-2" />
                            Salvar
                          </>
                        )}
                      </Button>
                    </div>
                  </form>
                </Form>
              </DialogContent>
            </Dialog>
          </div>
          
          {/* Current Location Display */}
          <div className="flex items-center justify-between mt-4 p-4 bg-green-50 rounded-lg">
            <div className="flex items-center gap-2">
              <MapPin className="h-4 w-4 text-green-600" />
              <div>
                <p className="font-medium text-green-800">
                  Fazenda: {farm?.name || 'Carregando...'}
                </p>
                {farm?.municipality && farm?.state && (
                  <p className="text-sm text-green-600">{farm.municipality}, {farm.state}</p>
                )}
              </div>
            </div>
            <Badge variant="outline" className="bg-white">
              Fazenda
            </Badge>
          </div>
        </CardHeader>
      </Card>



      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-green-800 mb-2">
          🌾 Monitoramento Climático da Fazenda: {farm?.name} – {farm?.municipality}/{farm?.state}
        </h1>
        <p className="text-gray-600">
          Dados meteorológicos em tempo real para otimizar suas atividades agrícolas
        </p>
      </div>

      {/* Current Weather Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Thermometer className="h-5 w-5" />
              Condições Atuais
            </div>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => refetchWeather()}
              disabled={weatherLoading}
            >
              {weatherLoading ? <RefreshCw className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
              Atualizar
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {weatherLoading ? (
            <div className="text-center py-8">
              <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4 text-blue-500" />
              <p>Carregando dados meteorológicos...</p>
            </div>
          ) : weather ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {/* Main Weather Display */}
              <div className="col-span-1 md:col-span-2 text-center">
                <div className="mb-4">
                  {getWeatherIcon(weather.condition)}
                </div>
                <h2 className="text-4xl font-bold mb-2">{weather.temperature}°C</h2>
                <p className="text-lg text-gray-600 mb-1">{weather.description}</p>
                <p className="text-sm text-gray-500">Sensação térmica: {weather.feelsLike}°C</p>
              </div>

              {/* Weather Details */}
              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                  <div className="flex items-center gap-2">
                    <Droplets className="h-4 w-4 text-blue-500" />
                    <span className="text-sm">Umidade</span>
                  </div>
                  <span className="font-semibold">{weather.humidity}%</span>
                </div>

                <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                  <div className="flex items-center gap-2">
                    <Wind className="h-4 w-4 text-green-500" />
                    <span className="text-sm">Vento</span>
                  </div>
                  <span className="font-semibold">{weather.windSpeed} km/h</span>
                </div>

                <div className="flex items-center justify-between p-3 bg-purple-50 rounded-lg">
                  <div className="flex items-center gap-2">
                    <Eye className="h-4 w-4 text-purple-500" />
                    <span className="text-sm">Visibilidade</span>
                  </div>
                  <span className="font-semibold">{weather.visibility} km</span>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg">
                  <div className="flex items-center gap-2">
                    <Gauge className="h-4 w-4 text-yellow-500" />
                    <span className="text-sm">Pressão</span>
                  </div>
                  <span className="font-semibold">{weather.pressure} hPa</span>
                </div>

                <div className="flex items-center justify-between p-3 bg-orange-50 rounded-lg">
                  <div className="flex items-center gap-2">
                    <Sun className="h-4 w-4 text-orange-500" />
                    <span className="text-sm">UV Index</span>
                  </div>
                  <span className="font-semibold">{weather.uvIndex}</span>
                </div>

                <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                  <div className="flex items-center gap-2">
                    <CloudRain className="h-4 w-4 text-blue-500" />
                    <span className="text-sm">Precipitação</span>
                  </div>
                  <span className="font-semibold">{weather.precipitation} mm</span>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-8">
              <Cloud className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">Dados meteorológicos não disponíveis</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Forecast Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Previsão dos Próximos Dias
          </CardTitle>
        </CardHeader>
        <CardContent>
          {forecastLoading ? (
            <div className="text-center py-4">
              <RefreshCw className="h-6 w-6 animate-spin mx-auto mb-2" />
              <p>Carregando previsão...</p>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Fazenda Info */}
              {farm && (
                <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                  <div className="flex items-center gap-2 mb-2">
                    <MapPin className="h-4 w-4 text-green-600" />
                    <h4 className="font-semibold text-green-900">Previsão para {farm.name}</h4>
                  </div>
                  <p className="text-sm text-green-700">
                    Cultura principal: <span className="font-medium">{farm.mainCrop || 'Não informado'}</span>
                  </p>
                  <p className="text-sm text-green-700">
                    Área: <span className="font-medium">{farm.area} hectares</span>
                  </p>
                </div>
              )}
              
              <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
                {forecast && forecast.length > 0 ? (
                  forecast.slice(0, 5).map((day: any, index: number) => (
                    <div key={index} className="text-center p-4 border rounded-lg bg-gradient-to-b from-blue-50 to-white">
                      <div className="mb-3">
                        <p className="text-sm font-bold text-blue-900">
                          {day.date && !isNaN(new Date(day.date).getTime()) 
                            ? format(new Date(day.date), 'EEE dd/MM', { locale: ptBR })
                            : 'Data inválida'
                          }
                        </p>
                        <p className="text-xs text-blue-600">
                          {index === 0 ? 'Hoje' : index === 1 ? 'Amanhã' : ''}
                        </p>
                      </div>
                      
                      <div className="mb-3">
                        {getWeatherIcon(day.condition)}
                      </div>
                      
                      <div className="space-y-1">
                        <p className="text-lg font-bold text-gray-900">
                          <span className="text-red-600">{day.tempMax}°</span>
                          <span className="text-gray-400 mx-1">/</span>
                          <span className="text-blue-600">{day.tempMin}°</span>
                        </p>
                        <p className="text-xs text-gray-700 font-medium">{day.description}</p>
                        
                        {day.precipitation > 0 && (
                          <div className="flex items-center justify-center gap-1 mt-2">
                            <Droplets className="h-3 w-3 text-blue-500" />
                            <span className="text-xs text-blue-600">{day.precipitation}mm</span>
                          </div>
                        )}
                        
                        {day.humidity && (
                          <p className="text-xs text-gray-500">
                            Umidade: {day.humidity}%
                          </p>
                        )}
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="col-span-full text-center py-8">
                    <Calendar className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                    <p className="text-gray-600">Previsão não disponível</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Crop Stage Climate Risks Panel */}
      {cropRisks && cropRisks.length > 0 && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <span className="text-2xl">🌾</span>
              Painel de Riscos Climáticos Agronômicos
            </CardTitle>
            <p className="text-sm text-gray-600">
              Análise específica por estágio da cultura: {(farm as any)?.cropStage || 'Crescimento Vegetativo'}
            </p>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4">
              {cropRisks.map((risk: any, index: number) => (
                <Alert 
                  key={index} 
                  className={`border-l-4 ${
                    risk.severity === 'high' 
                      ? 'border-red-500 bg-red-50 dark:bg-red-950/20' 
                      : risk.severity === 'medium'
                      ? 'border-yellow-500 bg-yellow-50 dark:bg-yellow-950/20'
                      : 'border-blue-500 bg-blue-50 dark:bg-blue-950/20'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <span className="text-2xl mt-1">{risk.icon}</span>
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-semibold text-sm">{risk.title}</h4>
                        <span className={`px-2 py-1 text-xs rounded-full ${
                          risk.severity === 'high' 
                            ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300' 
                            : risk.severity === 'medium'
                            ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300'
                            : 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300'
                        }`}>
                          {risk.severity === 'high' ? 'Alto' : risk.severity === 'medium' ? 'Médio' : 'Baixo'}
                        </span>
                      </div>
                      
                      <p className="text-sm text-gray-700 dark:text-gray-300 mb-3">
                        {risk.description}
                      </p>
                      
                      <div className="bg-white dark:bg-gray-800 rounded-lg p-3 border">
                        <h5 className="font-medium text-xs text-gray-600 dark:text-gray-400 mb-2">
                          AÇÕES RECOMENDADAS:
                        </h5>
                        <ul className="text-xs space-y-1">
                          {risk.actions?.map((action: string, actionIndex: number) => (
                            <li key={actionIndex} className="flex items-center gap-2">
                              <span className="text-green-600 dark:text-green-400">✓</span>
                              <span className="text-gray-700 dark:text-gray-300">{action}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                      
                      <div className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                        Estágio: {risk.stage} • Cultura: {risk.crop}
                      </div>
                    </div>
                  </div>
                </Alert>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Weather Alerts */}
      {alerts && alerts.length > 0 && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-amber-500" />
              Alertas Meteorológicos
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {alerts.map((alert: any, index: number) => (
                <div key={index} className="flex items-start justify-between p-3 bg-amber-50 border border-amber-200 rounded-lg">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      {getAlertBadge(alert.severity)}
                      <h4 className="font-semibold">{alert.title}</h4>
                    </div>
                    <p className="text-sm text-gray-700">{alert.description}</p>
                    <p className="text-xs text-gray-500 mt-1">
                      {alert.date && !isNaN(new Date(alert.date).getTime()) 
                        ? format(new Date(alert.date), 'dd/MM/yyyy HH:mm', { locale: ptBR })
                        : 'Data não disponível'
                      }
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Smart Agricultural Recommendations */}
      {smartRecommendations && smartRecommendations.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-green-500" />
              Sugestões Agronômicas Inteligentes
            </CardTitle>
            <p className="text-sm text-gray-600 mt-1">
              Baseadas no clima, estágio da cultura e atividades recentes
            </p>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4">
              {smartRecommendations.map((rec: any, index: number) => (
                <div key={index} className={`p-4 rounded-lg border-l-4 ${
                  rec.priority === 'alta' 
                    ? 'bg-red-50 border-red-500 dark:bg-red-950/20' 
                    : rec.priority === 'média'
                    ? 'bg-yellow-50 border-yellow-500 dark:bg-yellow-950/20'
                    : 'bg-blue-50 border-blue-500 dark:bg-blue-950/20'
                }`}>
                  <div className="flex items-start gap-3">
                    <span className="text-2xl mt-1">{rec.icon}</span>
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-semibold text-sm">{rec.title}</h4>
                        <Badge variant={rec.priority === 'alta' ? 'destructive' : rec.priority === 'média' ? 'default' : 'secondary'}>
                          {rec.priority}
                        </Badge>
                      </div>
                      <p className="text-sm text-gray-700 dark:text-gray-300 mb-3">{rec.description}</p>
                      
                      {/* Metadata */}
                      <div className="flex items-center gap-4 text-xs text-gray-500 mb-3">
                        <span>🌾 {rec.cropStage || 'crescimento'}</span>
                        <span>🌱 {rec.cropType || 'cultivo geral'}</span>
                        <span>📂 {rec.category}</span>
                      </div>
                      
                      {/* Actions */}
                      {rec.actions && rec.actions.length > 0 && (
                        <div className="space-y-1">
                          <p className="text-xs font-medium text-gray-600 dark:text-gray-400">Ações recomendadas:</p>
                          <ul className="text-xs text-gray-600 dark:text-gray-400 space-y-1">
                            {rec.actions.map((action: string, actionIndex: number) => (
                              <li key={actionIndex} className="flex items-center gap-2">
                                <span className="w-1 h-1 bg-gray-400 rounded-full"></span>
                                {action}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                      
                      {/* Based on indicators */}
                      {rec.basedOn && (
                        <div className="flex items-center gap-2 mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
                          <span className="text-xs text-gray-500">Baseado em:</span>
                          {rec.basedOn.weather && <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded">🌤️ Clima</span>}
                          {rec.basedOn.stage && <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded">🌱 Estágio</span>}
                          {rec.basedOn.activities && <span className="text-xs bg-purple-100 text-purple-700 px-2 py-1 rounded">📋 Atividades</span>}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Seasonal Disease Risks */}
      {diseaseRisks && diseaseRisks.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-orange-500" />
              Análise de Doenças Sazonais
            </CardTitle>
            <p className="text-sm text-gray-600 mt-1">
              Detecção automática de condições propícias para doenças foliares
            </p>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {diseaseRisks.map((risk: any, index: number) => (
                <div key={index} className={`p-4 rounded-lg border-l-4 ${
                  risk.severity === 'high' 
                    ? 'bg-red-50 border-red-500 dark:bg-red-950/20' 
                    : risk.severity === 'medium'
                    ? 'bg-orange-50 border-orange-500 dark:bg-orange-950/20'
                    : 'bg-yellow-50 border-yellow-500 dark:bg-yellow-950/20'
                }`}>
                  <div className="flex items-start gap-3">
                    <span className="text-2xl mt-1">{risk.icon}</span>
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-semibold text-sm">{risk.title}</h4>
                        <Badge variant={risk.severity === 'high' ? 'destructive' : 'secondary'}>
                          {risk.severity === 'high' ? 'Alto Risco' : risk.severity === 'medium' ? 'Risco Médio' : 'Atenção'}
                        </Badge>
                      </div>
                      
                      <p className="text-sm text-gray-700 dark:text-gray-300 mb-3">{risk.description}</p>
                      
                      {/* Conditions and days detected */}
                      <div className="flex items-center gap-4 text-xs text-gray-500 mb-3">
                        <span>🔍 {risk.conditions}</span>
                        <span>📅 {risk.daysDetected} dias detectados</span>
                        {risk.diseaseType && (
                          <span className="bg-gray-100 text-gray-700 px-2 py-1 rounded">
                            {risk.diseaseType === 'sigatoka' ? 'Sigatoka' : 
                             risk.diseaseType === 'fusarium' ? 'Fusarium' : 'Múltiplas doenças'}
                          </span>
                        )}
                      </div>
                      
                      {/* Risk factors */}
                      {risk.riskFactors && Array.isArray(risk.riskFactors) && (
                        <div className="mb-3 p-3 bg-white dark:bg-gray-800 rounded-lg border">
                          <p className="text-xs font-medium text-gray-600 dark:text-gray-400 mb-2">Fatores de risco detectados:</p>
                          <div className="grid grid-cols-2 gap-2 text-xs">
                            {risk.riskFactors.map((factor: any, factorIndex: number) => (
                              <div key={factorIndex} className="flex justify-between">
                                <span>{factor.date}:</span>
                                <span>
                                  {factor.humidity && `${factor.humidity}% umidade`}
                                  {factor.cloudCover && ` | ${factor.cloudCover}% nuvens`}
                                  {factor.precipitation && `${factor.precipitation}mm chuva`}
                                  {factor.windSpeed && ` | ${factor.windSpeed}km/h vento`}
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                      
                      {/* Actions */}
                      {risk.actions && risk.actions.length > 0 && (
                        <div className="mb-3">
                          <p className="text-xs font-medium text-gray-600 dark:text-gray-400 mb-2">Ações imediatas:</p>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-1">
                            {risk.actions.slice(0, 4).map((action: string, actionIndex: number) => (
                              <div key={actionIndex} className="flex items-center gap-2 text-xs">
                                <span className="w-1.5 h-1.5 bg-red-500 rounded-full"></span>
                                {action}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                      
                      {/* Prevention measures */}
                      {risk.prevention && risk.prevention.length > 0 && (
                        <div className="pt-3 border-t border-gray-200 dark:border-gray-700">
                          <p className="text-xs font-medium text-gray-600 dark:text-gray-400 mb-2">Medidas preventivas:</p>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-1">
                            {risk.prevention.slice(0, 4).map((prevention: string, preventionIndex: number) => (
                              <div key={preventionIndex} className="flex items-center gap-2 text-xs text-blue-600 dark:text-blue-400">
                                <span className="w-1.5 h-1.5 bg-blue-500 rounded-full"></span>
                                {prevention}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Weather History Link */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-semibold mb-1">Histórico Meteorológico</h3>
              <p className="text-sm text-gray-600">
                Visualize dados históricos e tendências climáticas da sua região
              </p>
            </div>
            <Button variant="outline" onClick={() => setLocation('/weather')}>
              Ver Histórico
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}