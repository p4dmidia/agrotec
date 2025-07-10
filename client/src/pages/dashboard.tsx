import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { Header } from "@/components/layout/header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CalendarCheck, Sprout, AlertTriangle, TrendingUp, Droplet, Leaf, GraduationCap, MapPin, Calendar, CloudRain, Shield, Clock, Thermometer, Wind, Eye, Lightbulb, Plus, Timer } from "lucide-react";

export default function Dashboard() {
  const { user } = useAuth();
  
  const { data: usage, isLoading: usageLoading } = useQuery({
    queryKey: ["/api/user/usage"],
  });

  const { data: events, isLoading: eventsLoading } = useQuery({
    queryKey: ["/api/calendar/events"],
  });

  const { data: alerts, isLoading: alertsLoading } = useQuery({
    queryKey: ["/api/weather/alerts"],
  });

  // Fetch farm data for dashboard
  const { data: farm, isLoading: farmLoading } = useQuery({
    queryKey: ["/api/user/active-farm"],
  });

  // Fetch weather data for smart alerts
  const { data: weatherData, isLoading: weatherLoading } = useQuery({
    queryKey: ["/api/weather/farm"],
  });

  // Fetch smart recommendations
  const { data: recommendations, isLoading: recommendationsLoading } = useQuery({
    queryKey: ["/api/weather/recommendations/farm"],
  });

  // Fetch crop risks
  const { data: cropRisks, isLoading: cropRisksLoading } = useQuery({
    queryKey: ["/api/weather/crop-risks/farm"],
  });

  // Fetch forecast data
  const { data: forecast, isLoading: forecastLoading } = useQuery({
    queryKey: ["/api/weather/forecast/farm"],
  });

  const upcomingEvents = events?.slice(0, 4) || [];
  const activeAlerts = alerts?.filter((alert: any) => alert.isActive)?.slice(0, 2) || [];

  // Calculate remaining trial days
  const calculateTrialDaysRemaining = () => {
    if (!user || !user.trialExpiraEm) return 0;
    
    const now = new Date();
    const trialEnd = new Date(user.trialExpiraEm);
    const diffTime = trialEnd.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    return Math.max(0, diffDays);
  };

  const trialDaysRemaining = calculateTrialDaysRemaining();
  
  // Filter upcoming events (next 7 days)
  const today = new Date();
  const nextWeek = new Date();
  nextWeek.setDate(today.getDate() + 7);
  
  const upcomingTasks = upcomingEvents.filter((event: any) => {
    const eventDate = new Date(event.date);
    return eventDate >= today && eventDate <= nextWeek;
  }).sort((a: any, b: any) => new Date(a.date).getTime() - new Date(b.date).getTime());
  
  // Create smart agricultural alerts
  const smartAlerts = [];
  
  // Weather-based alerts
  if (recommendations && recommendations.length > 0) {
    recommendations.slice(0, 3).forEach((rec: any) => {
      smartAlerts.push({
        id: rec.id,
        type: rec.activity === 'irrigation' ? 'water' : rec.activity === 'fertilization' ? 'nutrient' : 'general',
        title: rec.title,
        message: rec.description,
        severity: rec.priority,
        icon: rec.activity === 'irrigation' ? 'droplet' : rec.activity === 'fertilization' ? 'leaf' : 'alert'
      });
    });
  }
  
  // Crop risk alerts
  if (cropRisks && cropRisks.length > 0) {
    cropRisks.slice(0, 2).forEach((risk: any) => {
      smartAlerts.push({
        id: risk.id,
        type: 'risk',
        title: risk.riskType,
        message: risk.description,
        severity: risk.severity,
        icon: 'shield'
      });
    });
  }
  
  // Weather alerts
  if (weatherData && weatherData.precipitation > 10) {
    smartAlerts.push({
      id: 'rain-alert',
      type: 'weather',
      title: 'Previsão de Chuva',
      message: 'Chuva forte prevista - considere adiar pulverizações',
      severity: 'medium',
      icon: 'cloud-rain'
    });
  }
  
  // Calculate next harvest estimation
  const getNextHarvestEstimation = () => {
    if (!farm || !farm.developmentStage) return 'Não definido';
    
    const stage = farm.developmentStage.toLowerCase();
    if (stage.includes('plantio') || stage.includes('germinação')) return 'Março/2026';
    if (stage.includes('crescimento') || stage.includes('desenvolvimento')) return 'Janeiro/2026';
    if (stage.includes('floração') || stage.includes('florescimento')) return 'Novembro/2025';
    if (stage.includes('frutificação') || stage.includes('formação')) return 'Outubro/2025';
    if (stage.includes('maturação') || stage.includes('amadurecimento')) return 'Setembro/2025';
    return 'Dezembro/2025';
  };

  // Generate smart daily recommendation
  const getDailyRecommendation = () => {
    if (!weatherData || !farm) return null;

    const temp = weatherData.temperature;
    const humidity = weatherData.humidity;
    const wind = weatherData.windSpeed;
    const rain = weatherData.precipitation;
    const stage = farm.developmentStage?.toLowerCase() || '';

    // Recommendation logic based on weather and crop stage
    if (rain > 10) {
      return {
        emoji: '☔',
        text: 'Dia chuvoso hoje! Evite aplicações foliares e atividades que compactem o solo. Aproveite para revisar o sistema de drenagem.',
        activity: 'Revisão de drenagem',
        priority: 'medium'
      };
    }

    if (humidity > 80 && temp > 25) {
      return {
        emoji: '🦠',
        text: 'Condições ideais para doenças fúngicas! Monitore sinais de sigatoka e outras doenças. Considere aplicação preventiva.',
        activity: 'Monitoramento fitossanitário',
        priority: 'high'
      };
    }

    if (wind > 30) {
      return {
        emoji: '💨',
        text: 'Ventos fortes hoje! Evite pulverizações e apoie plantas jovens. Verifique estruturas de proteção.',
        activity: 'Verificação de estruturas',
        priority: 'medium'
      };
    }

    if (temp >= 20 && temp <= 30 && humidity >= 60 && humidity <= 75 && rain < 5) {
      if (stage.includes('crescimento') || stage.includes('desenvolvimento')) {
        return {
          emoji: '🌱',
          text: 'Condições perfeitas para crescimento! Aproveite para fazer adubação de cobertura e limpeza de toceiras.',
          activity: 'Adubação de cobertura',
          priority: 'high'
        };
      }
      
      if (stage.includes('floração') || stage.includes('florescimento')) {
        return {
          emoji: '🌸',
          text: 'Clima ideal para floração! Mantenha irrigação constante e monitore polinizadores. Evite stress hídrico.',
          activity: 'Manejo de irrigação',
          priority: 'high'
        };
      }

      return {
        emoji: '🌿',
        text: 'Hoje é um ótimo dia para atividades de campo! Temperatura e umidade ideais para limpeza de toceiras e manejo cultural.',
        activity: 'Limpeza de toceiras',
        priority: 'medium'
      };
    }

    if (temp > 35) {
      return {
        emoji: '🌡️',
        text: 'Dia muito quente! Programe atividades para manhã cedo ou final da tarde. Verifique sistema de irrigação.',
        activity: 'Verificação de irrigação',
        priority: 'medium'
      };
    }

    if (temp < 15) {
      return {
        emoji: '❄️',
        text: 'Temperatura baixa hoje! Proteja plantas sensíveis e monitore sinais de stress térmico.',
        activity: 'Proteção contra frio',
        priority: 'medium'
      };
    }

    // Default recommendation
    return {
      emoji: '📋',
      text: 'Bom dia para atividades gerais de manejo! Aproveite para inspecionar a lavoura e planejar próximas atividades.',
      activity: 'Inspeção geral',
      priority: 'low'
    };
  };

  const dailyRecommendation = getDailyRecommendation();

  return (
    <div className="space-y-6 min-h-screen overflow-auto">
      <Header 
        title="Dashboard" 
        subtitle={`Bem-vindo de volta, ${user?.fullName?.split(' ')[0]}!`}
      />
      
      <div className="p-6">
        {/* Informações da Fazenda Ativa */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Sprout className="h-5 w-5 text-green-600" />
              Fazenda Ativa
            </CardTitle>
          </CardHeader>
          <CardContent>
            {farmLoading ? (
              <div className="animate-pulse">
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-1/2"></div>
              </div>
            ) : farm ? (
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <h3 className="text-xl font-bold text-gray-800">
                    {farm.name} – {farm.municipality}/{farm.state}
                  </h3>
                </div>
                <div className="flex flex-wrap gap-4 text-sm text-gray-600">
                  <div className="flex items-center gap-1">
                    <Leaf className="h-4 w-4" />
                    <span>{farm.mainCrop || 'Não especificado'}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <MapPin className="h-4 w-4" />
                    <span>{farm.area} ha</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Sprout className="h-4 w-4" />
                    <span>Estágio: {farm.cropStage || 'Não definido'}</span>
                  </div>
                </div>
                <div className="flex items-center gap-2 pt-2 border-t">
                  <Calendar className="h-4 w-4 text-green-600" />
                  <span className="text-sm font-medium text-green-700">
                    Próxima colheita estimada: {getNextHarvestEstimation()}
                  </span>
                </div>
              </div>
            ) : (
              <div className="text-center py-8">
                <div className="space-y-4">
                  <AlertTriangle className="h-12 w-12 text-amber-500 mx-auto" />
                  <div>
                    <h3 className="text-lg font-semibold text-gray-800 mb-2">
                      Você ainda não cadastrou uma fazenda
                    </h3>
                    <p className="text-gray-600 mb-4">
                      Cadastre uma fazenda para ativar o monitoramento climático personalizado e acessar todas as funcionalidades da plataforma.
                    </p>
                  </div>
                  <Button 
                    onClick={() => window.location.href = '/farm-register'} 
                    className="bg-green-600 hover:bg-green-700"
                  >
                    <Plus className="mr-2 h-4 w-4" />
                    Cadastrar Fazenda
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Trial Countdown */}
        {user?.trialAtivo && trialDaysRemaining > 0 && (
          <Card className="mb-6 border-orange-200 bg-orange-50">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Timer className="h-6 w-6 text-orange-600" />
                  <div>
                    <h3 className="font-semibold text-orange-900">
                      Avaliação Gratuita
                    </h3>
                    <p className="text-sm text-orange-700">
                      {trialDaysRemaining === 1 
                        ? "Último dia da sua avaliação gratuita"
                        : `Faltam ${trialDaysRemaining} dias para sua avaliação gratuita terminar`
                      }
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-orange-600">
                    {trialDaysRemaining}
                  </div>
                  <div className="text-xs text-orange-600">
                    {trialDaysRemaining === 1 ? "dia" : "dias"}
                  </div>
                </div>
              </div>
              {trialDaysRemaining <= 3 && (
                <div className="mt-3 p-2 bg-orange-100 rounded-lg">
                  <p className="text-xs text-orange-800">
                    ⚡ Sua cobrança será processada automaticamente após o período gratuito. 
                    Cancele a qualquer momento nas configurações.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Recomendação Técnica do Dia */}
        {dailyRecommendation && (
          <Card className="mb-6 bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Lightbulb className="h-5 w-5 text-yellow-600" />
                Recomendação Técnica do Dia
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-start gap-4">
                <div className="text-3xl">{dailyRecommendation.emoji}</div>
                <div className="flex-1">
                  <p className="text-gray-800 mb-3 leading-relaxed">
                    {dailyRecommendation.text}
                  </p>
                  <div className="flex items-center gap-3">
                    <Badge 
                      variant={dailyRecommendation.priority === 'high' ? 'destructive' : 
                              dailyRecommendation.priority === 'medium' ? 'default' : 'secondary'}
                    >
                      {dailyRecommendation.priority === 'high' ? 'Alta Prioridade' : 
                       dailyRecommendation.priority === 'medium' ? 'Média Prioridade' : 'Baixa Prioridade'}
                    </Badge>
                    <Button size="sm" className="gap-2">
                      <Plus className="h-4 w-4" />
                      Adicionar ao calendário
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Alertas Agronômicos Ativos */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-amber-500" />
              Alertas Agronômicos Ativos
            </CardTitle>
          </CardHeader>
          <CardContent>
            {smartAlerts.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {smartAlerts.slice(0, 4).map((alert) => (
                  <div key={alert.id} className="border rounded-lg p-4 bg-gradient-to-r from-amber-50 to-orange-50">
                    <div className="flex items-start gap-3">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                        alert.severity === 'high' ? 'bg-red-100' : 
                        alert.severity === 'medium' ? 'bg-amber-100' : 'bg-blue-100'
                      }`}>
                        {alert.icon === 'droplet' && <Droplet className={`h-4 w-4 ${
                          alert.severity === 'high' ? 'text-red-600' : 
                          alert.severity === 'medium' ? 'text-amber-600' : 'text-blue-600'
                        }`} />}
                        {alert.icon === 'leaf' && <Leaf className={`h-4 w-4 ${
                          alert.severity === 'high' ? 'text-red-600' : 
                          alert.severity === 'medium' ? 'text-amber-600' : 'text-blue-600'
                        }`} />}
                        {alert.icon === 'shield' && <Shield className={`h-4 w-4 ${
                          alert.severity === 'high' ? 'text-red-600' : 
                          alert.severity === 'medium' ? 'text-amber-600' : 'text-blue-600'
                        }`} />}
                        {alert.icon === 'cloud-rain' && <CloudRain className={`h-4 w-4 ${
                          alert.severity === 'high' ? 'text-red-600' : 
                          alert.severity === 'medium' ? 'text-amber-600' : 'text-blue-600'
                        }`} />}
                        {alert.icon === 'alert' && <AlertTriangle className={`h-4 w-4 ${
                          alert.severity === 'high' ? 'text-red-600' : 
                          alert.severity === 'medium' ? 'text-amber-600' : 'text-blue-600'
                        }`} />}
                      </div>
                      <div className="flex-1">
                        <h4 className="font-medium text-gray-800">{alert.title}</h4>
                        <p className="text-sm text-gray-600 mt-1">{alert.message}</p>
                        <div className="flex items-center justify-between mt-2">
                          <Badge variant={alert.severity === 'high' ? 'destructive' : 'secondary'}>
                            {alert.severity === 'high' ? 'Alto' : alert.severity === 'medium' ? 'Médio' : 'Baixo'}
                          </Badge>
                          <Button size="sm" variant="outline">
                            Ver mais
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <Shield className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                <p className="text-gray-500">Nenhum alerta agronômico ativo</p>
                <p className="text-sm text-gray-400">Suas culturas estão em boas condições</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Próximas Tarefas do Calendário e Clima da Fazenda */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {/* Próximas Tarefas do Calendário */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5 text-blue-600" />
                Próximas Tarefas do Calendário
              </CardTitle>
            </CardHeader>
            <CardContent>
              {upcomingTasks.length > 0 ? (
                <div className="space-y-3">
                  {upcomingTasks.slice(0, 4).map((task: any) => (
                    <div key={task.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                      <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                        {task.eventType === 'irrigation' && <Droplet className="h-4 w-4 text-blue-600" />}
                        {task.eventType === 'fertilization' && <Leaf className="h-4 w-4 text-green-600" />}
                        {task.eventType === 'pruning' && <Sprout className="h-4 w-4 text-green-600" />}
                        {task.eventType === 'harvest' && <CalendarCheck className="h-4 w-4 text-orange-600" />}
                        {!['irrigation', 'fertilization', 'pruning', 'harvest'].includes(task.eventType) && 
                         <Calendar className="h-4 w-4 text-gray-600" />}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 text-sm font-medium text-gray-800">
                          <span>📆 {new Date(task.date).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })}</span>
                          <span>–</span>
                          <span>{task.title}</span>
                        </div>
                        <div className="text-xs text-gray-600 mt-1">
                          {task.location && <span>📍 {task.location}</span>}
                          {task.notes && task.location && <span> • </span>}
                          {task.notes && <span>{task.notes}</span>}
                        </div>
                      </div>
                    </div>
                  ))}
                  <div className="pt-2 border-t">
                    <Button variant="outline" size="sm" className="w-full">
                      Ver calendário completo
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="text-center py-6">
                  <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                  <p className="text-gray-500">Nenhuma tarefa agendada</p>
                  <p className="text-sm text-gray-400">Próximos 7 dias</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Clima da Fazenda */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CloudRain className="h-5 w-5 text-blue-600" />
                Clima da Fazenda
              </CardTitle>
            </CardHeader>
            <CardContent>
              {weatherLoading ? (
                <div className="animate-pulse space-y-3">
                  <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                  <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                  <div className="h-4 bg-gray-200 rounded w-2/3"></div>
                </div>
              ) : weatherData ? (
                <div className="space-y-4">
                  {/* Informações atuais */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex items-center gap-2">
                      <Thermometer className="h-4 w-4 text-red-500" />
                      <div>
                        <p className="text-sm text-gray-600">Temperatura</p>
                        <p className="font-medium">{weatherData.temperature}°C</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Droplet className="h-4 w-4 text-blue-500" />
                      <div>
                        <p className="text-sm text-gray-600">Umidade</p>
                        <p className="font-medium">{weatherData.humidity}%</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Wind className="h-4 w-4 text-gray-500" />
                      <div>
                        <p className="text-sm text-gray-600">Vento</p>
                        <p className="font-medium">{weatherData.windSpeed} km/h</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <CloudRain className="h-4 w-4 text-blue-600" />
                      <div>
                        <p className="text-sm text-gray-600">Chuva</p>
                        <p className="font-medium">{weatherData.precipitation} mm</p>
                      </div>
                    </div>
                  </div>

                  {/* Previsão próximos dias */}
                  {forecast && forecast.length > 0 && (
                    <div className="pt-3 border-t">
                      <p className="text-sm font-medium text-gray-700 mb-2">Próximos dias</p>
                      <div className="grid grid-cols-3 gap-2">
                        {forecast.slice(0, 3).map((day: any, index: number) => (
                          <div key={index} className="text-center p-2 bg-gray-50 rounded">
                            <p className="text-xs text-gray-600">
                              {new Date(day.date).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })}
                            </p>
                            <p className="text-sm font-medium">{day.temperature}°C</p>
                            <p className="text-xs text-blue-600">{day.precipitation}mm</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-6">
                  <CloudRain className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                  <p className="text-gray-500">Dados climáticos indisponíveis</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Próxima Colheita</p>
                  <p className="text-2xl font-bold text-gray-800">
                    {farm ? getNextHarvestEstimation() : 'Não definido'}
                  </p>
                </div>
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                  <CalendarCheck className="h-6 w-6 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Estágio Atual</p>
                  <p className="text-2xl font-bold text-gray-800">
                    {farm?.cropStage || 'Não definido'}
                  </p>
                </div>
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                  <Sprout className="h-6 w-6 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Alertas Ativos</p>
                  <p className="text-2xl font-bold text-gray-800">{smartAlerts.length}</p>
                </div>
                <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                  <AlertTriangle className="h-6 w-6 text-red-600" />
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Consultas IA</p>
                  <p className="text-2xl font-bold text-gray-800">{usage?.aiConsultations || 0}</p>
                </div>
                <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                  <TrendingUp className="h-6 w-6 text-purple-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
        
        {/* Recent Activities and Alerts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Atividades Recentes</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {upcomingEvents.map((event: any) => (
                  <div key={event.id} className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                      {event.eventType === 'irrigation' && <Droplet className="h-4 w-4 text-green-600" />}
                      {event.eventType === 'fertilization' && <Leaf className="h-4 w-4 text-green-600" />}
                      {event.eventType === 'pruning' && <Sprout className="h-4 w-4 text-green-600" />}
                      {event.eventType === 'harvest' && <CalendarCheck className="h-4 w-4 text-green-600" />}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-800">{event.title}</p>
                      <p className="text-xs text-gray-600">
                        {new Date(event.date).toLocaleDateString('pt-BR')}
                      </p>
                    </div>
                  </div>
                ))}
                
                {upcomingEvents.length === 0 && (
                  <p className="text-sm text-gray-500 text-center py-4">
                    Nenhuma atividade recente
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Alertas Importantes</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {activeAlerts.map((alert: any) => (
                  <div key={alert.id} className="flex items-start space-x-3">
                    <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center">
                      <AlertTriangle className="h-4 w-4 text-red-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-800">{alert.alertType}</p>
                      <p className="text-xs text-gray-600">{alert.message}</p>
                      <Badge 
                        variant={alert.severity === 'high' ? 'destructive' : 'secondary'}
                        className="mt-1"
                      >
                        {alert.severity}
                      </Badge>
                    </div>
                  </div>
                ))}
                
                {activeAlerts.length === 0 && (
                  <p className="text-sm text-gray-500 text-center py-4">
                    Nenhum alerta ativo
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
