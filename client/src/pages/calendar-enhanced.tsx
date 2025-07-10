import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { useActivityTracking } from "@/hooks/useActivityTracking";
import { Header } from "@/components/layout/header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { 
  ChevronLeft, 
  ChevronRight, 
  Plus, 
  Edit, 
  Trash2, 
  Calendar as CalendarIcon, 
  Lightbulb, 
  Save, 
  Copy, 
  Repeat,
  Sprout,
  Droplets,
  Wheat,
  Bug,
  Package2,
  Camera,
  Download,
  Filter,
  FileImage,
  MapPin,
  FileText,
  AlertTriangle
} from "lucide-react";

const eventSchema = z.object({
  title: z.string().min(1, "Título é obrigatório"),
  description: z.string().optional(),
  eventType: z.enum(["plantio", "irrigacao", "nutricao", "manejo_pragas", "colheita", "outros"]),
  date: z.string().min(1, "Data é obrigatória"),
  customType: z.string().optional(),
  cropStage: z.string().optional(),
  recurrence: z.enum(["none", "daily", "weekly", "monthly"]).default("none"),
  isRecurring: z.boolean().default(false),
  imageUrl: z.string().optional(),
  technicalNotes: z.string().optional(),
  location: z.string().optional(),
});

type EventFormData = z.infer<typeof eventSchema>;

const eventTypes = [
  { value: "plantio", label: "🌱 Plantio", icon: Sprout, color: "bg-green-100 text-green-800 border-green-200" },
  { value: "irrigacao", label: "💧 Irrigação", icon: Droplets, color: "bg-blue-100 text-blue-800 border-blue-200" },
  { value: "nutricao", label: "🌾 Nutrição", icon: Wheat, color: "bg-yellow-100 text-yellow-800 border-yellow-200" },
  { value: "manejo_pragas", label: "🐛 Manejo de Pragas", icon: Bug, color: "bg-red-100 text-red-800 border-red-200" },
  { value: "colheita", label: "🌽 Colheita", icon: Package2, color: "bg-orange-100 text-orange-800 border-orange-200" },
  { value: "outros", label: "📋 Outros", icon: CalendarIcon, color: "bg-gray-100 text-gray-800 border-gray-200" },
];

const cropStages = [
  { value: "plantio", label: "Plantio" },
  { value: "germinacao", label: "Germinação" },
  { value: "crescimento", label: "Crescimento" },
  { value: "floracao", label: "Floração" },
  { value: "frutificacao", label: "Frutificação" },
  { value: "colheita", label: "Colheita" },
];

export default function EnhancedCalendar() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { trackActivity } = useActivityTracking();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [editingEvent, setEditingEvent] = useState<any>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [showTemplates, setShowTemplates] = useState(false);
  const [showExportDialog, setShowExportDialog] = useState(false);
  const [exportFilters, setExportFilters] = useState({
    eventType: "",
    location: "",
    startDate: "",
    endDate: "",
  });
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>("");
  const [viewingEvent, setViewingEvent] = useState<any>(null);

  // Queries
  const { data: events = [] } = useQuery({
    queryKey: ["/api/calendar/events"],
  });

  const { data: suggestions = [] } = useQuery({
    queryKey: ["/api/calendar/suggestions"],
  });

  const { data: templates = [] } = useQuery({
    queryKey: ["/api/calendar/templates"],
  });

  // Export query
  const exportMutation = useMutation({
    mutationFn: async (filters: any) => {
      const params = new URLSearchParams();
      Object.entries(filters).forEach(([key, value]) => {
        if (value) params.append(key, value as string);
      });
      const response = await apiRequest("GET", `/api/calendar/export?${params}`);
      return response.json();
    },
  });

  // Image handling functions
  const handleImageSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedImage(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const uploadImage = async (file: File): Promise<string> => {
    const formData = new FormData();
    formData.append('file', file);
    
    const response = await apiRequest("POST", "/api/upload", formData);
    const result = await response.json();
    return result.url;
  };

  // Export functions
  const exportToPDF = async (data: any[]) => {
    // Simple CSV export that can be opened in Excel
    const csvContent = "data:text/csv;charset=utf-8," 
      + "Data,Título,Tipo,Descrição,Local,Estágio,Completo\n"
      + data.map(event => {
        const date = new Date(event.date).toLocaleDateString('pt-BR');
        const eventTypeLabel = eventTypes.find(t => t.value === event.eventType)?.label || event.eventType;
        return `"${date}","${event.title}","${eventTypeLabel}","${event.description || ''}","${event.location || ''}","${event.cropStage || ''}","${event.isCompleted ? 'Sim' : 'Não'}"`;
      }).join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `historico_calendario_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Mutations
  const createEventMutation = useMutation({
    mutationFn: async (data: EventFormData) => {
      let imageUrl = "";
      
      // Upload image if selected
      if (selectedImage) {
        try {
          imageUrl = await uploadImage(selectedImage);
        } catch (error) {
          console.error("Error uploading image:", error);
        }
      }
      
      const eventData = {
        ...data,
        imageUrl: imageUrl || undefined,
      };
      
      const response = await apiRequest("POST", "/api/calendar/events", eventData);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/calendar/events"] });
      setIsDialogOpen(false);
      setEditingEvent(null);
      setSelectedImage(null);
      setImagePreview("");
      
      // Track calendar activity
      trackActivity('calendar');
      
      toast({
        title: "Evento criado",
        description: "Evento adicionado ao calendário com sucesso!",
      });
    },
  });

  const generateSuggestionsMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest("POST", "/api/calendar/suggestions/generate");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/calendar/suggestions"] });
      toast({
        title: "Sugestões geradas",
        description: "Novas sugestões inteligentes foram criadas!",
      });
    },
  });

  const acceptSuggestionMutation = useMutation({
    mutationFn: async (suggestion: any) => {
      // Create event from suggestion
      const eventData = {
        title: suggestion.title,
        description: suggestion.description,
        eventType: suggestion.eventType,
        date: new Date(suggestion.suggestedDate).toISOString().split('T')[0],
      };
      const response = await apiRequest("POST", "/api/calendar/events", eventData);
      
      // Mark suggestion as accepted
      await apiRequest("PUT", `/api/calendar/suggestions/${suggestion.id}`, {
        isAccepted: true
      });
      
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/calendar/events"] });
      queryClient.invalidateQueries({ queryKey: ["/api/calendar/suggestions"] });
      toast({
        title: "Sugestão aceita",
        description: "Evento criado com base na sugestão!",
      });
    },
  });

  const form = useForm<EventFormData>({
    resolver: zodResolver(eventSchema),
    defaultValues: {
      title: "",
      description: "",
      eventType: "irrigacao",
      date: "",
      customType: "",
      cropStage: "",
      recurrence: "none",
      isRecurring: false,
    },
  });

  const getEventTypeDetails = (type: string) => {
    return eventTypes.find(t => t.value === type) || eventTypes[0];
  };

  const getEventsForDate = (date: Date) => {
    return events.filter((event: any) => {
      const eventDate = new Date(event.date);
      return eventDate.toDateString() === date.toDateString();
    });
  };

  const generateCalendarDays = () => {
    const daysInMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate();
    const firstDay = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1).getDay();
    const days = [];

    // Previous month days
    const prevMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 0);
    const daysInPrevMonth = prevMonth.getDate();
    
    for (let i = firstDay - 1; i >= 0; i--) {
      days.push({
        day: daysInPrevMonth - i,
        isCurrentMonth: false,
        date: new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, daysInPrevMonth - i),
      });
    }

    // Current month days
    for (let day = 1; day <= daysInMonth; day++) {
      days.push({
        day,
        isCurrentMonth: true,
        date: new Date(currentDate.getFullYear(), currentDate.getMonth(), day),
      });
    }

    // Next month days to fill the grid
    const remainingDays = 42 - days.length;
    for (let day = 1; day <= remainingDays; day++) {
      days.push({
        day,
        isCurrentMonth: false,
        date: new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, day),
      });
    }

    return days;
  };

  const navigateMonth = (direction: 'prev' | 'next') => {
    setCurrentDate(prev => {
      const newDate = new Date(prev);
      if (direction === 'prev') {
        newDate.setMonth(prev.getMonth() - 1);
      } else {
        newDate.setMonth(prev.getMonth() + 1);
      }
      return newDate;
    });
  };

  const handleCreateEvent = () => {
    form.reset();
    if (selectedDate) {
      form.setValue("date", selectedDate.toISOString().split('T')[0]);
    }
    setEditingEvent(null);
    setIsDialogOpen(true);
  };

  const onSubmit = (data: EventFormData) => {
    createEventMutation.mutate(data);
  };

  const calendarDays = generateCalendarDays();
  const monthNames = [
    "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
    "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"
  ];

  return (
    <div className="space-y-6 min-h-screen overflow-auto">
      <Header title="Calendário Agrícola Inteligente" subtitle="Organize suas atividades rurais com sugestões personalizadas" />
      
      <div className="p-6">
        {/* Action Buttons */}
        <div className="flex flex-wrap gap-3 mb-6">
          <Button onClick={handleCreateEvent} className="bg-green-600 hover:bg-green-700">
            <Plus className="h-4 w-4 mr-2" />
            Novo Evento
          </Button>
          <Button 
            variant="outline" 
            onClick={() => generateSuggestionsMutation.mutate()}
            disabled={generateSuggestionsMutation.isPending}
          >
            <Lightbulb className="h-4 w-4 mr-2" />
            Gerar Sugestões
          </Button>
          <Button variant="outline" onClick={() => setShowTemplates(!showTemplates)}>
            <Save className="h-4 w-4 mr-2" />
            Templates
          </Button>
          <Button variant="outline" onClick={() => setShowSuggestions(!showSuggestions)}>
            <Lightbulb className="h-4 w-4 mr-2" />
            Sugestões ({suggestions.filter((s: any) => !s.isAccepted && !s.isDismissed).length})
          </Button>
          <Button variant="outline" onClick={() => setShowExportDialog(true)}>
            <Download className="h-4 w-4 mr-2" />
            Exportar Histórico
          </Button>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
          {/* Calendar */}
          <div className="xl:col-span-3">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>
                    {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
                  </CardTitle>
                  <div className="flex items-center space-x-2">
                    <Button variant="ghost" size="sm" onClick={() => navigateMonth('prev')}>
                      <ChevronLeft className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => navigateMonth('next')}>
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              
              <CardContent>
                {/* Calendar Header */}
                <div className="grid grid-cols-7 gap-2 mb-4">
                  {["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"].map(day => (
                    <div key={day} className="text-center text-sm font-medium text-gray-600 py-2">
                      {day}
                    </div>
                  ))}
                </div>
                
                {/* Calendar Grid */}
                <div className="grid grid-cols-7 gap-2">
                  {calendarDays.map((dayInfo, index) => {
                    const dayEvents = getEventsForDate(dayInfo.date);
                    const isToday = dayInfo.date.toDateString() === new Date().toDateString();
                    const isSelected = selectedDate?.toDateString() === dayInfo.date.toDateString();
                    
                    return (
                      <div
                        key={index}
                        className={`
                          min-h-[80px] p-2 border rounded-lg cursor-pointer hover:bg-gray-50 transition-colors
                          ${!dayInfo.isCurrentMonth ? "text-gray-400 bg-gray-50" : ""}
                          ${isToday ? "bg-green-100 border-green-300" : ""}
                          ${isSelected ? "bg-blue-100 border-blue-300" : ""}
                        `}
                        onClick={() => setSelectedDate(dayInfo.date)}
                      >
                        <div className="text-sm font-medium mb-1">{dayInfo.day}</div>
                        <div className="space-y-1">
                          {dayEvents.slice(0, 2).map((event: any) => {
                            const eventType = getEventTypeDetails(event.eventType);
                            return (
                              <div
                                key={event.id}
                                className={`text-xs p-1 rounded truncate border ${eventType.color}`}
                                title={event.title}
                              >
                                {event.title}
                              </div>
                            );
                          })}
                          {dayEvents.length > 2 && (
                            <div className="text-xs text-gray-500">
                              +{dayEvents.length - 2} mais
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </div>
          
          {/* Sidebar */}
          <div className="space-y-6">
            {/* Smart Suggestions */}
            {showSuggestions && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Lightbulb className="h-5 w-5 mr-2" />
                    Sugestões Inteligentes
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {suggestions
                      .filter((s: any) => !s.isAccepted && !s.isDismissed)
                      .slice(0, 3)
                      .map((suggestion: any) => (
                        <div key={suggestion.id} className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                          <h4 className="font-medium text-sm">{suggestion.title}</h4>
                          <p className="text-xs text-gray-600 mt-1">{suggestion.description}</p>
                          <p className="text-xs text-blue-600 mt-1">{suggestion.reason}</p>
                          <div className="flex gap-2 mt-2">
                            <Button 
                              size="sm" 
                              className="text-xs"
                              onClick={() => acceptSuggestionMutation.mutate(suggestion)}
                            >
                              Aceitar
                            </Button>
                          </div>
                        </div>
                      ))}
                    
                    {suggestions.filter((s: any) => !s.isAccepted && !s.isDismissed).length === 0 && (
                      <p className="text-sm text-gray-500 text-center py-4">
                        Nenhuma sugestão disponível
                      </p>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Activity Types Legend */}
            <Card>
              <CardHeader>
                <CardTitle>Tipos de Atividade</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {eventTypes.map(type => (
                    <div key={type.value} className="flex items-center space-x-2">
                      <div className={`w-4 h-4 rounded border ${type.color}`}></div>
                      <span className="text-sm">{type.label}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Upcoming Events */}
            <Card>
              <CardHeader>
                <CardTitle>Próximos Eventos</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {events.slice(0, 5).map((event: any) => {
                    const eventType = getEventTypeDetails(event.eventType);
                    const Icon = eventType.icon;
                    return (
                      <div 
                        key={event.id} 
                        className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100 transition-colors"
                        onClick={() => setViewingEvent(event)}
                      >
                        <div className={`w-8 h-8 rounded-full bg-white flex items-center justify-center`}>
                          <Icon className="h-4 w-4" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-800 truncate">{event.title}</p>
                          <p className="text-xs text-gray-600">
                            {new Date(event.date).toLocaleDateString('pt-BR')}
                          </p>
                          {event.location && (
                            <div className="flex items-center gap-1 mt-1">
                              <MapPin className="h-3 w-3 text-gray-400" />
                              <span className="text-xs text-gray-500">{event.location}</span>
                            </div>
                          )}
                          <div className="flex items-center gap-2 mt-1">
                            {event.cropStage && (
                              <Badge variant="outline" className="text-xs">
                                {cropStages.find(s => s.value === event.cropStage)?.label}
                              </Badge>
                            )}
                            {event.imageUrl && (
                              <div className="flex items-center gap-1">
                                <FileImage className="h-3 w-3 text-green-600" />
                                <span className="text-xs text-green-600">Com foto</span>
                              </div>
                            )}
                            {event.technicalNotes && (
                              <div className="flex items-center gap-1">
                                <FileText className="h-3 w-3 text-blue-600" />
                                <span className="text-xs text-blue-600">Com observações</span>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                  
                  {events.length === 0 && (
                    <p className="text-sm text-gray-500 text-center py-4">
                      Nenhum evento agendado
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
        
        {/* Event Dialog */}
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent className="max-w-md max-h-[calc(100vh-20px)] overflow-y-auto" style={{ marginTop: '10px' }}>
            <DialogHeader>
              <DialogTitle>Novo Evento</DialogTitle>
              <DialogDescription>
                Adicione um novo evento ao seu calendário agrícola
              </DialogDescription>
            </DialogHeader>
            
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Título</FormLabel>
                      <FormControl>
                        <Input placeholder="Nome do evento" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="eventType"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Tipo de Atividade</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Selecione o tipo" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {eventTypes.map(type => (
                            <SelectItem key={type.value} value={type.value}>
                              {type.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {form.watch("eventType") === "outros" && (
                  <FormField
                    control={form.control}
                    name="customType"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Tipo Personalizado</FormLabel>
                        <FormControl>
                          <Input placeholder="Descreva o tipo de atividade" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}

                <FormField
                  control={form.control}
                  name="cropStage"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Estágio da Cultura (opcional)</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Selecione o estágio" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {cropStages.map(stage => (
                            <SelectItem key={stage.value} value={stage.value}>
                              {stage.label}
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
                  name="date"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Data</FormLabel>
                      <FormControl>
                        <Input type="date" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="recurrence"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Repetir</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Selecione a frequência" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="none">Não repetir</SelectItem>
                          <SelectItem value="daily">Diariamente</SelectItem>
                          <SelectItem value="weekly">Semanalmente</SelectItem>
                          <SelectItem value="monthly">Mensalmente</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="location"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Local/Talhão (opcional)</FormLabel>
                      <FormControl>
                        <Input placeholder="Ex: Talhão A, Lote 3, Setor Norte" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Descrição (opcional)</FormLabel>
                      <FormControl>
                        <Textarea placeholder="Detalhes do evento" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="technicalNotes"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Observações Técnicas (opcional)</FormLabel>
                      <FormControl>
                        <Textarea placeholder="Recomendações do agrônomo, dosagens, observações importantes..." {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="space-y-2">
                  <label className="text-sm font-medium">Anexar Imagem (opcional)</label>
                  <div className="flex items-center gap-2">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageSelect}
                      className="hidden"
                      id="image-upload"
                    />
                    <label
                      htmlFor="image-upload"
                      className="flex items-center gap-2 px-3 py-2 border border-gray-300 rounded-md cursor-pointer hover:bg-gray-50"
                    >
                      <Camera className="h-4 w-4" />
                      Selecionar Imagem
                    </label>
                    {selectedImage && (
                      <span className="text-sm text-gray-600">{selectedImage.name}</span>
                    )}
                  </div>
                  {imagePreview && (
                    <div className="mt-2">
                      <img src={imagePreview} alt="Preview" className="w-20 h-20 object-cover rounded-md" />
                    </div>
                  )}
                </div>
                
                <DialogFooter>
                  <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                    Cancelar
                  </Button>
                  <Button 
                    type="submit" 
                    disabled={createEventMutation.isPending}
                  >
                    Criar Evento
                  </Button>
                </DialogFooter>
              </form>
            </Form>
          </DialogContent>
        </Dialog>

        {/* Export Dialog */}
        <Dialog open={showExportDialog} onOpenChange={setShowExportDialog}>
          <DialogContent className="sm:max-w-[500px] max-h-[calc(100vh-20px)] overflow-y-auto" style={{ marginTop: '10px' }}>
            <DialogHeader>
              <DialogTitle>Exportar Histórico do Calendário</DialogTitle>
              <DialogDescription>
                Filtre e exporte seu histórico de atividades agrícolas em formato CSV (compatível com Excel)
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium">Tipo de Atividade</label>
                <Select onValueChange={(value) => setExportFilters(prev => ({ ...prev, eventType: value }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Todos os tipos" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">Todos os tipos</SelectItem>
                    {eventTypes.map((type) => (
                      <SelectItem key={type.value} value={type.value}>
                        {type.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm font-medium">Local/Talhão</label>
                <Input 
                  placeholder="Ex: Talhão A, Lote 3"
                  value={exportFilters.location}
                  onChange={(e) => setExportFilters(prev => ({ ...prev, location: e.target.value }))}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">Data Inicial</label>
                  <Input 
                    type="date"
                    value={exportFilters.startDate}
                    onChange={(e) => setExportFilters(prev => ({ ...prev, startDate: e.target.value }))}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Data Final</label>
                  <Input 
                    type="date"
                    value={exportFilters.endDate}
                    onChange={(e) => setExportFilters(prev => ({ ...prev, endDate: e.target.value }))}
                  />
                </div>
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setShowExportDialog(false)}>
                Cancelar
              </Button>
              <Button 
                onClick={async () => {
                  try {
                    const data = await exportMutation.mutateAsync(exportFilters);
                    await exportToPDF(data);
                    toast({
                      title: "Sucesso",
                      description: "Histórico exportado com sucesso!",
                    });
                    setShowExportDialog(false);
                  } catch (error) {
                    toast({
                      title: "Erro",
                      description: "Erro ao exportar histórico. Tente novamente.",
                      variant: "destructive",
                    });
                  }
                }}
                disabled={exportMutation.isPending}
              >
                <Download className="h-4 w-4 mr-2" />
                Exportar CSV
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Event Details Modal */}
        {viewingEvent && (
          <Dialog open={!!viewingEvent} onOpenChange={() => setViewingEvent(null)}>
            <DialogContent className="sm:max-w-[500px] max-h-[calc(100vh-20px)] overflow-y-auto" style={{ marginTop: '10px' }}>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  {(() => {
                    const eventType = getEventTypeDetails(viewingEvent.eventType);
                    const Icon = eventType.icon;
                    return (
                      <>
                        <Icon className="h-5 w-5" />
                        {viewingEvent.title}
                      </>
                    );
                  })()}
                </DialogTitle>
                <DialogDescription>
                  Detalhes completos da atividade agrícola
                </DialogDescription>
              </DialogHeader>
              
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="font-medium text-gray-600">Data:</span>
                    <p>{new Date(viewingEvent.date).toLocaleDateString('pt-BR')}</p>
                  </div>
                  <div>
                    <span className="font-medium text-gray-600">Tipo:</span>
                    <p>{getEventTypeDetails(viewingEvent.eventType).label}</p>
                  </div>
                </div>

                {viewingEvent.location && (
                  <div>
                    <span className="font-medium text-gray-600">Local/Talhão:</span>
                    <p className="text-sm mt-1">{viewingEvent.location}</p>
                  </div>
                )}

                {viewingEvent.cropStage && (
                  <div>
                    <span className="font-medium text-gray-600">Estágio da Cultura:</span>
                    <p className="text-sm mt-1">
                      {cropStages.find(s => s.value === viewingEvent.cropStage)?.label}
                    </p>
                  </div>
                )}

                {viewingEvent.description && (
                  <div>
                    <span className="font-medium text-gray-600">Descrição:</span>
                    <p className="text-sm mt-1">{viewingEvent.description}</p>
                  </div>
                )}

                {viewingEvent.technicalNotes && (
                  <div>
                    <span className="font-medium text-gray-600">Observações Técnicas:</span>
                    <p className="text-sm mt-1 p-3 bg-blue-50 rounded-md border-l-4 border-blue-200">
                      {viewingEvent.technicalNotes}
                    </p>
                  </div>
                )}

                {viewingEvent.imageUrl && (
                  <div>
                    <span className="font-medium text-gray-600">Imagem Anexada:</span>
                    <div className="mt-2">
                      <img 
                        src={viewingEvent.imageUrl} 
                        alt="Registro da atividade" 
                        className="w-full max-h-64 object-cover rounded-lg border"
                      />
                    </div>
                  </div>
                )}

                <div className="flex items-center gap-2 pt-2 border-t">
                  <span className="text-xs text-gray-500">Status:</span>
                  <Badge variant={viewingEvent.isCompleted ? "default" : "secondary"}>
                    {viewingEvent.isCompleted ? "Concluído" : "Pendente"}
                  </Badge>
                </div>
              </div>

              <DialogFooter>
                <Button variant="outline" onClick={() => setViewingEvent(null)}>
                  Fechar
                </Button>
                <Button onClick={() => {
                  setEditingEvent(viewingEvent);
                  setViewingEvent(null);
                  setIsDialogOpen(true);
                }}>
                  <Edit className="h-4 w-4 mr-2" />
                  Editar
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        )}
      </div>
    </div>
  );
}