import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
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
  History
} from "lucide-react";
import { apiRequest } from "@/lib/queryClient";

export default function WeatherEnhanced() {
  const [location, setLocation] = useState("São Paulo, SP");
  const [farmArea, setFarmArea] = useState("Talhão Principal");
  const [historyDays, setHistoryDays] = useState("30");
  const [radarType, setRadarType] = useState("precipitation");
  const queryClient = useQueryClient();

  // Current weather data
  const { data: weatherData = {}, isLoading: weatherLoading, refetch: refetchWeather } = useQuery({
    queryKey: ["/api/weather/current", location],
  });

  // Weather alerts
  const { data: alerts = [], isLoading: alertsLoading } = useQuery({
    queryKey: ["/api/weather/alerts", location],
  });

  // Weather history
  const { data: history = [], isLoading: historyLoading } = useQuery({
    queryKey: ["/api/weather/history", location, farmArea, historyDays],
  });

  // Smart suggestions
  const { data: suggestions = [], isLoading: suggestionsLoading } = useQuery({
    queryKey: ["/api/weather/suggestions"],
  });

  // Radar data
  const { data: radarData = [], isLoading: radarLoading } = useQuery({
    queryKey: ["/api/weather/radar", location, radarType],
  });

  // Generate alerts mutation
  const generateAlertsMutation = useMutation({
    mutationFn: (data: { location: string }) => apiRequest("/api/weather/alerts/generate", "POST", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/weather/alerts"] });
      queryClient.invalidateQueries({ queryKey: ["/api/weather/suggestions"] });
    },
  });

  // Mark suggestion as read
  const markSuggestionMutation = useMutation({
    mutationFn: ({ id, isRead, actionTaken }: { id: string; isRead?: boolean; actionTaken?: boolean }) =>
      apiRequest(`/api/weather/suggestions/${id}`, "PUT", { isRead, actionTaken }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/weather/suggestions"] });
    },
  });

  const handleLocationChange = () => {
    queryClient.invalidateQueries({ queryKey: ["/api/weather/current"] });
    queryClient.invalidateQueries({ queryKey: ["/api/weather/alerts"] });
    queryClient.invalidateQueries({ queryKey: ["/api/weather/history"] });
    queryClient.invalidateQueries({ queryKey: ["/api/weather/radar"] });
  };

  const handleRefresh = () => {
    refetchWeather();
    generateAlertsMutation.mutate({ location });
  };

  const getWeatherIcon = (condition: string) => {
    switch (condition?.toLowerCase()) {
      case 'sun':
      case 'ensolarado':
        return <Sun className="h-8 w-8 text-yellow-500" />;
      case 'cloud':
      case 'nublado':
      case 'parcialmente nublado':
        return <Cloud className="h-8 w-8 text-gray-500" />;
      case 'rain':
      case 'chuva':
      case 'chuva leve':
        return <CloudRain className="h-8 w-8 text-blue-500" />;
      default:
        return <Sun className="h-8 w-8 text-yellow-500" />;
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'high':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low':
        return 'bg-green-100 text-green-800 border-green-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'destructive';
      case 'medium':
        return 'default';
      case 'low':
        return 'secondary';
      default:
        return 'outline';
    }
  };

  const getRadarIntensityColor = (intensity: number, type: string) => {
    if (type === 'precipitation') {
      if (intensity > 80) return 'bg-red-500';
      if (intensity > 60) return 'bg-orange-500';
      if (intensity > 40) return 'bg-yellow-500';
      if (intensity > 20) return 'bg-blue-500';
      return 'bg-blue-200';
    } else if (type === 'temperature') {
      if (intensity > 30) return 'bg-red-500';
      if (intensity > 25) return 'bg-orange-500';
      if (intensity > 20) return 'bg-yellow-500';
      if (intensity > 15) return 'bg-green-500';
      return 'bg-blue-500';
    } else if (type === 'wind') {
      if (intensity > 40) return 'bg-purple-500';
      if (intensity > 30) return 'bg-red-500';
      if (intensity > 20) return 'bg-orange-500';
      if (intensity > 10) return 'bg-yellow-500';
      return 'bg-green-500';
    }
    return 'bg-gray-300';
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-green-800">Sistema Climático Avançado</h1>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <MapPin className="h-4 w-4" />
            <Input
              placeholder="Digite a localização"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              onBlur={handleLocationChange}
              className="w-48"
            />
          </div>
          <Button onClick={handleRefresh} disabled={weatherLoading}>
            <RefreshCw className={`h-4 w-4 mr-2 ${weatherLoading ? 'animate-spin' : ''}`} />
            Atualizar
          </Button>
        </div>
      </div>

      <Tabs defaultValue="current" className="w-full">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="current">Tempo Atual</TabsTrigger>
          <TabsTrigger value="history">Histórico</TabsTrigger>
          <TabsTrigger value="suggestions">Sugestões IA</TabsTrigger>
          <TabsTrigger value="map">Mapa Climático</TabsTrigger>
          <TabsTrigger value="alerts">Alertas</TabsTrigger>
        </TabsList>

        <TabsContent value="current" className="space-y-6">
          {/* Current Weather Overview */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                {getWeatherIcon(weatherData.icon)}
                Condições Atuais - {weatherData.city || location}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
                <div className="text-center">
                  <p className="text-4xl font-bold text-green-600">{weatherData.temperature || '--'}°C</p>
                  <p className="text-sm text-gray-600">{weatherData.description || 'Carregando...'}</p>
                  <p className="text-xs text-gray-500">Sensação: {weatherData.feelsLike || '--'}°C</p>
                </div>
                
                <div className="flex items-center gap-2">
                  <Droplets className="h-5 w-5 text-blue-500" />
                  <div>
                    <p className="font-semibold">{weatherData.humidity || '--'}%</p>
                    <p className="text-sm text-gray-600">Umidade</p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Wind className="h-5 w-5 text-gray-500" />
                  <div>
                    <p className="font-semibold">{weatherData.windSpeed || '--'} km/h</p>
                    <p className="text-sm text-gray-600">Vento</p>
                    <Badge variant={weatherData.windSpeed > 30 ? 'destructive' : weatherData.windSpeed > 15 ? 'default' : 'secondary'}>
                      {weatherData.windSpeed > 30 ? 'Alto' : weatherData.windSpeed > 15 ? 'Moderado' : 'Calmo'}
                    </Badge>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Navigation className="h-5 w-5 text-gray-500" />
                  <div>
                    <p className="font-semibold">{weatherData.pressure || '--'} hPa</p>
                    <p className="text-sm text-gray-600">Pressão</p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Eye className="h-5 w-5 text-gray-500" />
                  <div>
                    <p className="font-semibold">{weatherData.visibility || '--'} km</p>
                    <p className="text-sm text-gray-600">Visibilidade</p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Sun className="h-5 w-5 text-yellow-500" />
                  <div>
                    <p className="font-semibold">{weatherData.uvIndex || '--'}</p>
                    <p className="text-sm text-gray-600">Índice UV</p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <CloudRain className="h-5 w-5 text-blue-500" />
                  <div>
                    <p className="font-semibold">{weatherData.precipitation || 0}mm</p>
                    <p className="text-sm text-gray-600">Precipitação</p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Cloud className="h-5 w-5 text-gray-500" />
                  <div>
                    <p className="font-semibold">{weatherData.cloudCover || '--'}%</p>
                    <p className="text-sm text-gray-600">Nuvens</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* 7-Day Forecast */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Previsão 7 Dias
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-7 gap-4">
                {weatherData.forecast?.map((day: any, index: number) => (
                  <div key={index} className="text-center p-3 rounded-lg border">
                    <p className="font-semibold text-sm">{day.day}</p>
                    <div className="flex justify-center my-2">
                      {getWeatherIcon(day.icon)}
                    </div>
                    <p className="text-xs text-gray-600 mb-2">{day.description}</p>
                    <p className="font-bold">{day.high}°</p>
                    <p className="text-sm text-gray-500">{day.low}°</p>
                    {day.precipitation > 0 && (
                      <p className="text-xs text-blue-600 mt-1">{day.precipitation}mm</p>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="history" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <History className="h-5 w-5" />
                Histórico Climático por Talhão
              </CardTitle>
              <div className="flex gap-4">
                <div>
                  <label className="text-sm font-medium">Talhão/Fazenda:</label>
                  <Input
                    placeholder="Ex: Talhão Principal"
                    value={farmArea}
                    onChange={(e) => setFarmArea(e.target.value)}
                    className="w-48 mt-1"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Período:</label>
                  <Select value={historyDays} onValueChange={setHistoryDays}>
                    <SelectTrigger className="w-32 mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="30">30 dias</SelectItem>
                      <SelectItem value="60">60 dias</SelectItem>
                      <SelectItem value="90">90 dias</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {historyLoading ? (
                <div className="text-center py-8">Carregando histórico...</div>
              ) : (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Card>
                      <CardContent className="p-4">
                        <div className="flex items-center gap-2">
                          <Thermometer className="h-5 w-5 text-red-500" />
                          <div>
                            <p className="font-semibold">Temperatura Média</p>
                            <p className="text-2xl font-bold text-red-600">
                              {history.length > 0 ? 
                                Math.round(history.reduce((acc: number, day: any) => acc + day.temperature, 0) / history.length) 
                                : '--'}°C
                            </p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                    
                    <Card>
                      <CardContent className="p-4">
                        <div className="flex items-center gap-2">
                          <CloudRain className="h-5 w-5 text-blue-500" />
                          <div>
                            <p className="font-semibold">Chuva Total</p>
                            <p className="text-2xl font-bold text-blue-600">
                              {history.length > 0 ? 
                                Math.round(history.reduce((acc: number, day: any) => acc + (day.precipitation || 0), 0))
                                : '--'}mm
                            </p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                    
                    <Card>
                      <CardContent className="p-4">
                        <div className="flex items-center gap-2">
                          <Droplets className="h-5 w-5 text-green-500" />
                          <div>
                            <p className="font-semibold">Umidade Média</p>
                            <p className="text-2xl font-bold text-green-600">
                              {history.length > 0 ? 
                                Math.round(history.reduce((acc: number, day: any) => acc + day.humidity, 0) / history.length)
                                : '--'}%
                            </p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full border rounded-lg">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="p-3 text-left">Data</th>
                          <th className="p-3 text-center">Condição</th>
                          <th className="p-3 text-center">Temp (°C)</th>
                          <th className="p-3 text-center">Umidade (%)</th>
                          <th className="p-3 text-center">Vento (km/h)</th>
                          <th className="p-3 text-center">Chuva (mm)</th>
                          <th className="p-3 text-center">Observações</th>
                        </tr>
                      </thead>
                      <tbody>
                        {history.slice(0, 15).map((day: any, index: number) => (
                          <tr key={index} className="border-t">
                            <td className="p-3">{new Date(day.recordDate).toLocaleDateString('pt-BR')}</td>
                            <td className="p-3 text-center">{day.condition}</td>
                            <td className="p-3 text-center">{day.tempMin}° / {day.tempMax}°</td>
                            <td className="p-3 text-center">{day.humidity}%</td>
                            <td className="p-3 text-center">{day.windSpeed} {day.windDirection}</td>
                            <td className="p-3 text-center">{day.precipitation || 0}</td>
                            <td className="p-3 text-center text-xs">{day.notes || '-'}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="suggestions" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Lightbulb className="h-5 w-5" />
                Sugestões Inteligentes Baseadas no Clima
              </CardTitle>
            </CardHeader>
            <CardContent>
              {suggestionsLoading ? (
                <div className="text-center py-8">Carregando sugestões...</div>
              ) : suggestions.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  Nenhuma sugestão disponível no momento
                </div>
              ) : (
                <div className="space-y-4">
                  {suggestions.map((suggestion: any) => (
                    <Alert key={suggestion.id} className="border-l-4 border-l-blue-500">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <AlertTriangle className="h-4 w-4" />
                            <span className="font-semibold">{suggestion.title}</span>
                            <Badge variant={getPriorityColor(suggestion.priority)}>
                              {suggestion.priority}
                            </Badge>
                          </div>
                          <AlertDescription className="mb-3">
                            {suggestion.message}
                          </AlertDescription>
                          {suggestion.recommendedAction && (
                            <div className="bg-green-50 p-3 rounded border-l-2 border-l-green-400 mb-3">
                              <p className="text-sm font-medium text-green-800">Ação Recomendada:</p>
                              <p className="text-sm text-green-700">{suggestion.recommendedAction}</p>
                            </div>
                          )}
                          <div className="flex items-center gap-4 text-xs text-gray-500">
                            <span>Condição: {suggestion.weatherCondition}</span>
                            <span>Atividade: {suggestion.relatedActivity}</span>
                            <span>Válido até: {new Date(suggestion.validUntil).toLocaleString('pt-BR')}</span>
                          </div>
                        </div>
                        <div className="flex gap-2 ml-4">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => markSuggestionMutation.mutate({ id: suggestion.id, isRead: true })}
                            disabled={suggestion.isRead}
                          >
                            <CheckCircle className="h-4 w-4 mr-1" />
                            {suggestion.isRead ? 'Lida' : 'Marcar como Lida'}
                          </Button>
                          <Button
                            size="sm"
                            onClick={() => markSuggestionMutation.mutate({ id: suggestion.id, actionTaken: true })}
                            disabled={suggestion.actionTaken}
                          >
                            <Activity className="h-4 w-4 mr-1" />
                            {suggestion.actionTaken ? 'Ação Tomada' : 'Ação Realizada'}
                          </Button>
                        </div>
                      </div>
                    </Alert>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="map" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Map className="h-5 w-5" />
                Mapa Climático Interativo
              </CardTitle>
              <div className="flex gap-4">
                <div>
                  <label className="text-sm font-medium">Tipo de Dados:</label>
                  <Select value={radarType} onValueChange={setRadarType}>
                    <SelectTrigger className="w-48 mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="precipitation">Radar de Chuva</SelectItem>
                      <SelectItem value="temperature">Mapa de Temperatura</SelectItem>
                      <SelectItem value="wind">Zonas de Vento</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {radarLoading ? (
                <div className="text-center py-8">Carregando dados do radar...</div>
              ) : (
                <div className="space-y-4">
                  <div className="bg-gray-100 p-4 rounded-lg">
                    <h4 className="font-semibold mb-2">
                      {radarType === 'precipitation' && 'Intensidade de Precipitação'}
                      {radarType === 'temperature' && 'Variação de Temperatura'}
                      {radarType === 'wind' && 'Intensidade dos Ventos'}
                    </h4>
                    <div className="grid grid-cols-20 gap-1 max-w-4xl">
                      {radarData.map((point: any, index: number) => (
                        <div
                          key={index}
                          className={`w-4 h-4 ${getRadarIntensityColor(point.intensity, radarType)} opacity-70`}
                          title={`${point.latitude.toFixed(3)}, ${point.longitude.toFixed(3)} - ${point.intensity}${
                            radarType === 'precipitation' ? '%' : 
                            radarType === 'temperature' ? '°C' : 
                            ' km/h'
                          }`}
                        />
                      ))}
                    </div>
                    
                    <div className="flex items-center gap-4 mt-4 text-xs">
                      <span>Legenda:</span>
                      {radarType === 'precipitation' && (
                        <>
                          <div className="flex items-center gap-1">
                            <div className="w-3 h-3 bg-blue-200"></div>
                            <span>0-20%</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <div className="w-3 h-3 bg-blue-500"></div>
                            <span>20-40%</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <div className="w-3 h-3 bg-yellow-500"></div>
                            <span>40-60%</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <div className="w-3 h-3 bg-orange-500"></div>
                            <span>60-80%</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <div className="w-3 h-3 bg-red-500"></div>
                            <span>80-100%</span>
                          </div>
                        </>
                      )}
                      {radarType === 'temperature' && (
                        <>
                          <div className="flex items-center gap-1">
                            <div className="w-3 h-3 bg-blue-500"></div>
                            <span>&lt;15°C</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <div className="w-3 h-3 bg-green-500"></div>
                            <span>15-20°C</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <div className="w-3 h-3 bg-yellow-500"></div>
                            <span>20-25°C</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <div className="w-3 h-3 bg-orange-500"></div>
                            <span>25-30°C</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <div className="w-3 h-3 bg-red-500"></div>
                            <span>&gt;30°C</span>
                          </div>
                        </>
                      )}
                      {radarType === 'wind' && (
                        <>
                          <div className="flex items-center gap-1">
                            <div className="w-3 h-3 bg-green-500"></div>
                            <span>0-10 km/h</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <div className="w-3 h-3 bg-yellow-500"></div>
                            <span>10-20 km/h</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <div className="w-3 h-3 bg-orange-500"></div>
                            <span>20-30 km/h</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <div className="w-3 h-3 bg-red-500"></div>
                            <span>30-40 km/h</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <div className="w-3 h-3 bg-purple-500"></div>
                            <span>&gt;40 km/h</span>
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                  
                  <div className="text-sm text-gray-600">
                    <p>Última atualização: {new Date().toLocaleString('pt-BR')}</p>
                    <p>Dados fornecidos por: Dr. Agro Weather Service</p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="alerts" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5" />
                Alertas Agronômicos
              </CardTitle>
            </CardHeader>
            <CardContent>
              {alertsLoading ? (
                <div className="text-center py-8">Carregando alertas...</div>
              ) : alerts.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  Nenhum alerta ativo no momento
                </div>
              ) : (
                <div className="space-y-4">
                  {alerts.map((alert: any) => (
                    <Alert key={alert.id} className={`border ${getSeverityColor(alert.severity)}`}>
                      <AlertTriangle className="h-4 w-4" />
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-semibold">{alert.title}</span>
                          <Badge variant={alert.severity === 'high' ? 'destructive' : 'default'}>
                            {alert.severity === 'high' ? 'Alta' : alert.severity === 'medium' ? 'Média' : 'Baixa'}
                          </Badge>
                        </div>
                        <AlertDescription className="mb-3">
                          {alert.message}
                        </AlertDescription>
                        {alert.agriculturalAdvice && (
                          <div className="bg-green-50 p-3 rounded border-l-2 border-l-green-400 mb-3">
                            <p className="text-sm font-medium text-green-800">Orientação Agronômica:</p>
                            <p className="text-sm text-green-700">{alert.agriculturalAdvice}</p>
                          </div>
                        )}
                        <div className="flex items-center gap-4 text-xs text-gray-500">
                          <span>Válido até: {new Date(alert.validUntil).toLocaleString('pt-BR')}</span>
                          {alert.affectedActivities && (
                            <span>Atividades afetadas: {alert.affectedActivities.join(', ')}</span>
                          )}
                        </div>
                      </div>
                    </Alert>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}