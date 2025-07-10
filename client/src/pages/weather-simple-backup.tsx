import { useState, useEffect } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Cloud, 
  Sun, 
  CloudRain, 
  Wind, 
  Thermometer, 
  Droplets, 
  Eye, 
  Navigation,
  RefreshCw,
  MapPin,
  Calendar,
  AlertTriangle,
  TrendingUp,
  Activity,
  BarChart3,
  Lightbulb,
  Map,
  CheckCircle,
  Clock,
  History,
  ArrowRight,
  Plus
} from "lucide-react";
import { format, addDays, subDays } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Link } from "wouter";

export default function WeatherSimple() {
  const [farmArea, setFarmArea] = useState("Talhão Principal");
  const [historyDays, setHistoryDays] = useState("30");
  const [radarType, setRadarType] = useState("precipitation");
  const queryClient = useQueryClient();

  // Get user's active farm
  const { data: farm, isLoading: farmLoading } = useQuery({
    queryKey: ["/api/farms/active"],
  });

  // Get weather location based on farm
  const location = farm ? `${farm.municipality}, ${farm.state}` : null;

  // Current weather data
  const { data: weatherData, isLoading: weatherLoading, refetch: refetchWeather } = useQuery({
    queryKey: ["/api/weather/current", location],
    enabled: !!location,
  });

  // Weather alerts
  const { data: alerts, isLoading: alertsLoading, refetch: refetchAlerts } = useQuery({
    queryKey: ["/api/weather/alerts", location],
    enabled: !!location,
  });

  // Weather forecast
  const { data: forecast, isLoading: forecastLoading, refetch: refetchForecast } = useQuery({
    queryKey: ["/api/weather/forecast", location],
    enabled: !!location,
  });

  // Weather history
  const { data: history, isLoading: historyLoading, refetch: refetchHistory } = useQuery({
    queryKey: ["/api/weather/history", location, farmArea, historyDays],
    enabled: !!location,
  });

  // Smart suggestions
  const { data: suggestions, isLoading: suggestionsLoading, refetch: refetchSuggestions } = useQuery({
    queryKey: ["/api/weather/suggestions"],
    enabled: !!location,
  });

  // Radar data
  const { data: radarData, isLoading: radarLoading, refetch: refetchRadar } = useQuery({
    queryKey: ["/api/weather/radar", location, radarType],
    enabled: !!location,
  });

  // If no farm is found, show error message
  if (!farmLoading && !farm) {
    return (
      <div className="container mx-auto p-6 max-w-4xl">
        <div className="text-center py-12">
          <Card className="max-w-md mx-auto">
            <CardContent className="pt-6">
              <AlertTriangle className="h-16 w-16 text-amber-500 mx-auto mb-4" />
              <h2 className="text-xl font-semibold mb-2">⚠️ Você ainda não cadastrou uma fazenda</h2>
              <p className="text-gray-600 mb-6">
                Cadastre uma para ativar o monitoramento climático personalizado.
              </p>
              <Link href="/farm-register">
                <Button className="w-full">
                  <Plus className="mr-2 h-4 w-4" />
                  Cadastrar Fazenda
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // Get weather icon
  const getWeatherIcon = (condition: string) => {
    switch (condition?.toLowerCase()) {
      case 'ensolarado':
      case 'sunny':
        return <Sun className="h-12 w-12 text-yellow-500" />;
      case 'nublado':
      case 'cloudy':
        return <Cloud className="h-12 w-12 text-gray-500" />;
      case 'chuvoso':
      case 'rainy':
        return <CloudRain className="h-12 w-12 text-blue-500" />;
      default:
        return <Sun className="h-12 w-12 text-yellow-500" />;
    }
  };

  // Get alert type badge
  const getAlertBadge = (type: string) => {
    switch (type) {
      case 'high':
        return <Badge variant="destructive">Alto</Badge>;
      case 'medium':
        return <Badge variant="secondary">Médio</Badge>;
      case 'low':
        return <Badge variant="default">Baixo</Badge>;
      default:
        return <Badge variant="default">Info</Badge>;
    }
  };

  if (farmLoading || !farm) {
    return (
      <div className="container mx-auto p-6 max-w-4xl">
        <div className="text-center py-12">
          <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p>Carregando dados da fazenda...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <div className="mb-6 flex items-center gap-4">
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-gray-900">
            🌾 Monitoramento climático da fazenda: {farm?.name} – {farm?.municipality}/{farm?.state}
          </h1>
          <p className="text-gray-600">
            Acompanhe as condições climáticas da sua propriedade em tempo real
          </p>
        </div>
        <Button 
          onClick={() => {
            refetchWeather();
            refetchForecast();
            refetchHistory();
            refetchSuggestions();
            refetchRadar();
            refetchAlerts();
          }} 
          variant="outline"
          className="flex items-center gap-2"
        >
          <RefreshCw className="h-4 w-4" />
          Atualizar
        </Button>
      </div>

      {/* Weather Overview */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MapPin className="h-5 w-5" />
            Condições Atuais
          </CardTitle>
        </CardHeader>
        <CardContent>
          {weatherLoading ? (
            <div className="text-center py-8">
              <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4" />
              <p>Carregando dados meteorológicos...</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="text-center">
                {getWeatherIcon(weatherData?.condition || '')}
                <div className="mt-2">
                  <p className="text-3xl font-bold">{weatherData?.temperature || 0}°C</p>
                  <p className="text-gray-600">{weatherData?.description || 'Sem dados'}</p>
                  <p className="text-sm text-gray-500">Sensação: {weatherData?.feelsLike || 0}°C</p>
                </div>
              </div>
              
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Droplets className="h-4 w-4 text-blue-500" />
                    <span className="text-sm">Umidade</span>
                  </div>
                  <span className="font-semibold">{weatherData?.humidity || 0}%</span>
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Wind className="h-4 w-4 text-gray-500" />
                    <span className="text-sm">Vento</span>
                  </div>
                  <span className="font-semibold">{weatherData?.windSpeed || 0} km/h</span>
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Eye className="h-4 w-4 text-gray-500" />
                    <span className="text-sm">Visibilidade</span>
                  </div>
                  <span className="font-semibold">{weatherData?.visibility || 0} km</span>
                </div>
              </div>
              
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Navigation className="h-4 w-4 text-gray-500" />
                    <span className="text-sm">Pressão</span>
                  </div>
                  <span className="font-semibold">{weatherData?.pressure || 0} hPa</span>
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Sun className="h-4 w-4 text-yellow-500" />
                    <span className="text-sm">Índice UV</span>
                  </div>
                  <span className="font-semibold">{weatherData?.uvIndex || 0}</span>
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <CloudRain className="h-4 w-4 text-blue-500" />
                    <span className="text-sm">Precipitação</span>
                  </div>
                  <span className="font-semibold">{weatherData?.precipitation || 0} mm</span>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Weather Forecast */}
      <Card className="mb-6">
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

      {/* Weather Analytics */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Análise Climática
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="history" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="history">Histórico</TabsTrigger>
              <TabsTrigger value="suggestions">Sugestões</TabsTrigger>
              <TabsTrigger value="radar">Radar</TabsTrigger>
            </TabsList>
            
            <TabsContent value="history" className="space-y-4">
              <div className="flex items-center gap-4 mb-4">
                <Select value={farmArea} onValueChange={setFarmArea}>
                  <SelectTrigger className="w-48">
                    <SelectValue placeholder="Selecione o talhão" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Talhão Principal">Talhão Principal</SelectItem>
                    <SelectItem value="Talhão Norte">Talhão Norte</SelectItem>
                    <SelectItem value="Talhão Sul">Talhão Sul</SelectItem>
                    <SelectItem value="Área de Teste">Área de Teste</SelectItem>
                  </SelectContent>
                </Select>
                
                <Select value={historyDays} onValueChange={setHistoryDays}>
                  <SelectTrigger className="w-32">
                    <SelectValue placeholder="Período" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="7">7 dias</SelectItem>
                    <SelectItem value="15">15 dias</SelectItem>
                    <SelectItem value="30">30 dias</SelectItem>
                    <SelectItem value="60">60 dias</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              {historyLoading ? (
                <div className="text-center py-8">
                  <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4" />
                  <p>Carregando histórico...</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {history && history.length > 0 ? (
                    history.map((entry: any, index: number) => (
                      <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                        <div className="flex items-center gap-3">
                          <Calendar className="h-4 w-4 text-gray-500" />
                          <div>
                            <p className="text-sm font-medium">
                              {entry.date && !isNaN(new Date(entry.date).getTime()) 
                                ? format(new Date(entry.date), 'dd/MM/yyyy', { locale: ptBR })
                                : 'Data não disponível'
                              }
                            </p>
                            <p className="text-xs text-gray-600">{entry.location}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-semibold">{entry.maxTemp}°/{entry.minTemp}°</p>
                          <p className="text-xs text-gray-600">{entry.precipitation} mm</p>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-8">
                      <History className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                      <p className="text-gray-600">Nenhum dado histórico disponível</p>
                    </div>
                  )}
                </div>
              )}
            </TabsContent>
            
            <TabsContent value="suggestions" className="space-y-4">
              {suggestionsLoading ? (
                <div className="text-center py-8">
                  <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4" />
                  <p>Carregando sugestões...</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {suggestions && suggestions.length > 0 ? (
                    suggestions.map((suggestion: any, index: number) => (
                      <div key={index} className="p-4 bg-green-50 border border-green-200 rounded-lg">
                        <div className="flex items-start gap-3">
                          <Lightbulb className="h-5 w-5 text-green-600 mt-0.5" />
                          <div className="flex-1">
                            <h4 className="font-semibold text-green-900">{suggestion.title}</h4>
                            <p className="text-sm text-green-700 mt-1">{suggestion.description}</p>
                            <div className="flex items-center gap-2 mt-2">
                              <Clock className="h-4 w-4 text-green-600" />
                              <span className="text-xs text-green-600">{suggestion.timing}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-8">
                      <Lightbulb className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                      <p className="text-gray-600">Nenhuma sugestão disponível no momento</p>
                    </div>
                  )}
                </div>
              )}
            </TabsContent>
            
            <TabsContent value="radar" className="space-y-4">
              <div className="flex items-center gap-4 mb-4">
                <Select value={radarType} onValueChange={setRadarType}>
                  <SelectTrigger className="w-48">
                    <SelectValue placeholder="Tipo de radar" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="precipitation">Precipitação</SelectItem>
                    <SelectItem value="temperature">Temperatura</SelectItem>
                    <SelectItem value="pressure">Pressão</SelectItem>
                    <SelectItem value="wind">Vento</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              {radarLoading ? (
                <div className="text-center py-8">
                  <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4" />
                  <p>Carregando dados do radar...</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {radarData ? (
                    <div className="p-4 border rounded-lg">
                      <div className="flex items-center gap-3 mb-3">
                        <Map className="h-5 w-5 text-blue-600" />
                        <h4 className="font-semibold">Radar - {radarType}</h4>
                      </div>
                      <div className="bg-gray-100 rounded-lg p-8 text-center">
                        <p className="text-gray-600">Dados do radar meteorológico</p>
                        <p className="text-sm text-gray-500 mt-2">
                          Região: {radarData.region} | Tipo: {radarData.type}
                        </p>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <Map className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                      <p className="text-gray-600">Dados do radar não disponíveis</p>
                    </div>
                  )}
                </div>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}