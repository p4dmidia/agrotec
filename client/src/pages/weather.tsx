import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Header } from "@/components/layout/header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { 
  Sun, 
  Cloud, 
  CloudRain, 
  Wind, 
  Droplet, 
  Eye,
  AlertTriangle,
  RefreshCw,
  MapPin,
  Gauge,
  Zap
} from "lucide-react";

export default function Weather() {
  const [searchLocation, setSearchLocation] = useState("");
  const [currentLocation, setCurrentLocation] = useState("São Paulo, SP");
  const { toast } = useToast();

  const { data: weatherData, isLoading, refetch } = useQuery({
    queryKey: ["/api/weather/current", currentLocation],
  });

  const { data: alerts, refetch: refetchAlerts } = useQuery({
    queryKey: ["/api/weather/alerts"],
  });

  const generateAlertsMutation = useMutation({
    mutationFn: async (location: string) => {
      return await apiRequest("/api/weather/alerts/generate", "POST", { location });
    },
    onSuccess: () => {
      refetchAlerts();
      toast({
        title: "Alertas atualizados",
        description: "Novos alertas agronômicos foram gerados com base nas condições meteorológicas.",
      });
    },
  });

  const handleLocationSearch = () => {
    if (searchLocation.trim()) {
      setCurrentLocation(searchLocation);
      setSearchLocation("");
      generateAlertsMutation.mutate(searchLocation);
    }
  };

  const handleRefresh = () => {
    refetch();
    refetchAlerts();
    generateAlertsMutation.mutate(currentLocation);
  };

  const getWeatherIcon = (condition: string) => {
    const iconClass = "h-16 w-16 text-yellow-500";
    
    switch (condition) {
      case "sun":
        return <Sun className={iconClass} />;
      case "cloud":
        return <Cloud className={`${iconClass} text-gray-500`} />;
      case "rain":
        return <CloudRain className={`${iconClass} text-blue-500`} />;
      default:
        return <Sun className={iconClass} />;
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "high":
        return "bg-red-100 text-red-800 border-red-200";
      case "medium":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "low":
        return "bg-green-100 text-green-800 border-green-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-green-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6 min-h-screen overflow-auto">
      <Header title="Monitoramento Climático Avançado" subtitle="Análise meteorológica para decisões agronômicas inteligentes" />
      
      <div className="p-6">
        {/* Header Controls */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="flex items-center space-x-2 flex-1">
            <MapPin className="h-5 w-5 text-gray-500" />
            <Input
              placeholder="Digite CEP, cidade ou coordenadas GPS"
              value={searchLocation}
              onChange={(e) => setSearchLocation(e.target.value)}
              onKeyPress={(e) => e.key === "Enter" && handleLocationSearch()}
              className="flex-1"
            />
            <Button onClick={handleLocationSearch} className="bg-green-600 hover:bg-green-700">
              <MapPin className="h-4 w-4 mr-2" />
              Buscar
            </Button>
          </div>
          
          <Button onClick={handleRefresh} variant="outline" disabled={generateAlertsMutation.isPending}>
            <RefreshCw className={`h-4 w-4 mr-2 ${generateAlertsMutation.isPending ? 'animate-spin' : ''}`} />
            Atualizar
          </Button>
        </div>

        {/* Current Weather Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* Main Weather Card */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <MapPin className="h-5 w-5" />
                  Condições Atuais
                </CardTitle>
                <Badge variant="outline" className="text-xs">
                  Atualizado agora
                </Badge>
              </div>
            </CardHeader>
            
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Main Weather Display */}
                <div className="text-center">
                  <div className="flex justify-center mb-4">
                    {getWeatherIcon(weatherData?.icon || "sun")}
                  </div>
                  <h4 className="text-xl font-bold text-gray-800 mb-2">
                    {weatherData?.city || "São Paulo, SP"}
                  </h4>
                  <p className="text-4xl font-bold text-gray-800 mb-2">
                    {weatherData?.temperature || 25}°C
                  </p>
                  <p className="text-gray-600 mb-2">{weatherData?.description || "Ensolarado"}</p>
                  <p className="text-sm text-gray-500">Sensação: {weatherData?.feelsLike || 27}°C</p>
                </div>
                
                {/* Weather Details Grid */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center p-3 bg-blue-50 rounded-lg">
                    <Droplet className="h-6 w-6 text-blue-600 mx-auto mb-2" />
                    <p className="text-xs text-gray-600">Umidade</p>
                    <p className="text-lg font-semibold text-gray-800">
                      {weatherData?.humidity || 65}%
                    </p>
                    <Progress value={weatherData?.humidity || 65} className="mt-1 h-1" />
                  </div>
                  
                  <div className="text-center p-3 bg-green-50 rounded-lg">
                    <Wind className="h-6 w-6 text-green-600 mx-auto mb-2" />
                    <p className="text-xs text-gray-600">Vento</p>
                    <p className="text-lg font-semibold text-gray-800">
                      {weatherData?.windSpeed || 15} km/h
                    </p>
                    <div className="flex justify-center mt-1">
                      <div className={`w-2 h-2 rounded-full ${(weatherData?.windSpeed || 15) > 30 ? 'bg-red-500' : (weatherData?.windSpeed || 15) > 15 ? 'bg-yellow-500' : 'bg-green-500'}`}></div>
                    </div>
                  </div>
                  
                  <div className="text-center p-3 bg-purple-50 rounded-lg">
                    <Gauge className="h-6 w-6 text-purple-600 mx-auto mb-2" />
                    <p className="text-xs text-gray-600">Pressão</p>
                    <p className="text-lg font-semibold text-gray-800">
                      {weatherData?.pressure || 1013} hPa
                    </p>
                  </div>
                  
                  <div className="text-center p-3 bg-orange-50 rounded-lg">
                    <Eye className="h-6 w-6 text-orange-600 mx-auto mb-2" />
                    <p className="text-xs text-gray-600">Visibilidade</p>
                    <p className="text-lg font-semibold text-gray-800">
                      {weatherData?.visibility || 10} km
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Additional Info Card */}
          <Card>
            <CardHeader>
              <CardTitle>Informações Extras</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg">
                  <div className="flex items-center gap-2">
                    <Sun className="h-5 w-5 text-yellow-600" />
                    <span className="text-sm font-medium">Índice UV</span>
                  </div>
                  <span className="text-lg font-bold">{weatherData?.uvIndex || 6}</span>
                </div>
                
                <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                  <div className="flex items-center gap-2">
                    <CloudRain className="h-5 w-5 text-blue-600" />
                    <span className="text-sm font-medium">Precipitação</span>
                  </div>
                  <span className="text-lg font-bold">{weatherData?.precipitation || 0}mm</span>
                </div>
                
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-2">
                    <Cloud className="h-5 w-5 text-gray-600" />
                    <span className="text-sm font-medium">Nuvens</span>
                  </div>
                  <span className="text-lg font-bold">{weatherData?.cloudCover || 20}%</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* 7-Day Forecast */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Sun className="h-5 w-5" />
              Previsão dos Próximos 7 Dias
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
              {weatherData?.forecast?.map((day: any, index: number) => (
                <div key={index} className="text-center p-3 bg-gray-50 rounded-lg">
                  <p className="text-sm font-medium text-gray-600 mb-2">{day.day}</p>
                  <div className="flex justify-center mb-2">
                    {getWeatherIcon(day.icon)}
                  </div>
                  <p className="text-xs text-gray-500 mb-2">{day.description}</p>
                  <div className="space-y-1">
                    <p className="text-sm font-bold">{day.high}°</p>
                    <p className="text-xs text-gray-500">{day.low}°</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Agricultural Alerts */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5" />
                Alertas Agronômicos Ativos
              </CardTitle>
              <Button 
                onClick={() => generateAlertsMutation.mutate(currentLocation)}
                disabled={generateAlertsMutation.isPending}
                variant="outline"
                size="sm"
              >
                <Zap className="h-4 w-4 mr-2" />
                Gerar Novos Alertas
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {alerts?.filter((alert: any) => alert.isActive)?.map((alert: any, index: number) => (
                <Alert key={index} className={`border-l-4 ${getSeverityColor(alert.severity)}`}>
                  <AlertTriangle className="h-4 w-4" />
                  <div className="ml-2 flex-1">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-semibold">{alert.title}</h4>
                      <Badge variant={alert.severity === 'high' ? 'destructive' : alert.severity === 'medium' ? 'default' : 'secondary'}>
                        {alert.severity === 'high' ? 'Alta' : alert.severity === 'medium' ? 'Média' : 'Baixa'}
                      </Badge>
                    </div>
                    <AlertDescription className="mb-3">
                      {alert.message}
                    </AlertDescription>
                    <div className="bg-white/50 rounded-md p-3 mb-2">
                      <p className="text-sm font-medium text-green-800 mb-1">Recomendação Agronômica:</p>
                      <p className="text-sm text-green-700">{alert.agriculturalAdvice}</p>
                    </div>
                    <div className="flex items-center gap-4 text-xs text-gray-600">
                      <span>📍 {alert.city}</span>
                      <span>⏰ Válido até: {new Date(alert.validUntil).toLocaleDateString('pt-BR')}</span>
                      <span>🔧 Atividades afetadas: {alert.affectedActivities?.join(', ')}</span>
                    </div>
                  </div>
                </Alert>
              ))}
              
              {(!alerts || alerts.filter((alert: any) => alert.isActive).length === 0) && (
                <div className="text-center py-8 text-gray-500">
                  <Sun className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                  <p>Nenhum alerta ativo no momento</p>
                  <p className="text-sm">Clique em "Gerar Novos Alertas" para verificar condições meteorológicas</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}