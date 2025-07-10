import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { Header } from "@/components/layout/header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { ChevronLeft, ChevronRight, Plus, Edit, Trash2, Calendar as CalendarIcon, Droplet, Leaf, Scissors, Package, Lightbulb, Save, Copy, Repeat } from "lucide-react";

const eventSchema = z.object({
  title: z.string().min(1, "Título é obrigatório"),
  description: z.string().optional(),
  eventType: z.enum(["plantio", "irrigacao", "nutricao", "manejo_pragas", "colheita", "outros"]),
  date: z.string().min(1, "Data é obrigatória"),
  customType: z.string().optional(),
  cropStage: z.string().optional(),
  recurrence: z.enum(["none", "daily", "weekly", "monthly"]).default("none"),
  isRecurring: z.boolean().default(false),
});

type EventFormData = z.infer<typeof eventSchema>;

const eventTypes = [
  { value: "plantio", label: "🌱 Plantio", icon: Package, color: "bg-green-100 text-green-800 border-green-200" },
  { value: "irrigacao", label: "💧 Irrigação", icon: Droplet, color: "bg-blue-100 text-blue-800 border-blue-200" },
  { value: "nutricao", label: "🌾 Nutrição", icon: Leaf, color: "bg-yellow-100 text-yellow-800 border-yellow-200" },
  { value: "manejo_pragas", label: "🐛 Manejo de Pragas", icon: Scissors, color: "bg-red-100 text-red-800 border-red-200" },
  { value: "colheita", label: "🌽 Colheita", icon: Package, color: "bg-orange-100 text-orange-800 border-orange-200" },
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

export default function Calendar() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [editingEvent, setEditingEvent] = useState<any>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [showTemplates, setShowTemplates] = useState(false);

  const { data: events = [], isLoading } = useQuery({
    queryKey: ["/api/calendar/events"],
  });

  const { data: suggestions = [] } = useQuery({
    queryKey: ["/api/calendar/suggestions"],
  });

  const { data: templates = [] } = useQuery({
    queryKey: ["/api/calendar/templates"],
  });

  const createEventMutation = useMutation({
    mutationFn: async (data: EventFormData) => {
      const response = await apiRequest("POST", "/api/calendar/events", data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/calendar/events"] });
      setIsDialogOpen(false);
      setEditingEvent(null);
      toast({
        title: "Evento criado",
        description: "Evento adicionado ao calendário com sucesso!",
      });
    },
  });

  const updateEventMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: Partial<EventFormData> }) => {
      const response = await apiRequest("PUT", `/api/calendar/events/${id}`, data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/calendar/events"] });
      setIsDialogOpen(false);
      setEditingEvent(null);
      toast({
        title: "Evento atualizado",
        description: "Evento modificado com sucesso!",
      });
    },
  });

  const deleteEventMutation = useMutation({
    mutationFn: async (id: number) => {
      const response = await apiRequest("DELETE", `/api/calendar/events/${id}`);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/calendar/events"] });
      toast({
        title: "Evento excluído",
        description: "Evento removido do calendário!",
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

  const getDaysInMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
  };

  const generateCalendarDays = () => {
    const daysInMonth = getDaysInMonth(currentDate);
    const firstDay = getFirstDayOfMonth(currentDate);
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

  const getEventsForDate = (date: Date) => {
    if (!events) return [];
    return events.filter((event: any) => {
      const eventDate = new Date(event.date);
      return eventDate.toDateString() === date.toDateString();
    });
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

  const handleEditEvent = (event: any) => {
    form.reset({
      title: event.title,
      description: event.description || "",
      eventType: event.eventType,
      date: new Date(event.date).toISOString().split('T')[0],
    });
    setEditingEvent(event);
    setIsDialogOpen(true);
  };

  const onSubmit = (data: EventFormData) => {
    if (editingEvent) {
      updateEventMutation.mutate({ id: editingEvent.id, data });
    } else {
      createEventMutation.mutate(data);
    }
  };

  const getEventTypeDetails = (type: string) => {
    return eventTypes.find(t => t.value === type) || eventTypes[0];
  };

  const calendarDays = generateCalendarDays();
  const monthNames = [
    "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
    "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"
  ];

  return (
    <div className="space-y-6">
      <Header title="Calendário Agrícola" subtitle="Organize suas atividades rurais" />
      
      <div className="p-6">
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
                    <Button onClick={handleCreateEvent} className="bg-green-600 hover:bg-green-700">
                      <Plus className="h-4 w-4 mr-2" />
                      Novo Evento
                    </Button>
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
                            const Icon = eventType.icon;
                            return (
                              <div
                                key={event.id}
                                className="text-xs p-1 bg-green-100 text-green-800 rounded truncate flex items-center"
                                title={event.title}
                              >
                                <Icon className="h-3 w-3 mr-1" />
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
          
          {/* Events List */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Próximos Eventos</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {events?.slice(0, 5).map((event: any) => {
                    const eventType = getEventTypeDetails(event.eventType);
                    const Icon = eventType.icon;
                    return (
                      <div key={event.id} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                        <div className={`w-8 h-8 rounded-full bg-white flex items-center justify-center ${eventType.color}`}>
                          <Icon className="h-4 w-4" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-800 truncate">{event.title}</p>
                          <p className="text-xs text-gray-600">
                            {new Date(event.date).toLocaleDateString('pt-BR')}
                          </p>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEditEvent(event)}
                          >
                            <Edit className="h-3 w-3" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => deleteEventMutation.mutate(event.id)}
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    );
                  })}
                  
                  {!events?.length && (
                    <p className="text-sm text-gray-500 text-center py-4">
                      Nenhum evento agendado
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
            
            {/* Selected Date Events */}
            {selectedDate && (
              <Card>
                <CardHeader>
                  <CardTitle>
                    {selectedDate.toLocaleDateString('pt-BR', { 
                      weekday: 'long', 
                      year: 'numeric', 
                      month: 'long', 
                      day: 'numeric' 
                    })}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {getEventsForDate(selectedDate).map((event: any) => {
                      const eventType = getEventTypeDetails(event.eventType);
                      const Icon = eventType.icon;
                      return (
                        <div key={event.id} className="flex items-center space-x-3 p-3 border rounded-lg">
                          <div className={`w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center ${eventType.color}`}>
                            <Icon className="h-4 w-4" />
                          </div>
                          <div className="flex-1">
                            <p className="text-sm font-medium">{event.title}</p>
                            {event.description && (
                              <p className="text-xs text-gray-600">{event.description}</p>
                            )}
                            <Badge variant="outline" className="mt-1">
                              {eventType.label}
                            </Badge>
                          </div>
                        </div>
                      );
                    })}
                    
                    {getEventsForDate(selectedDate).length === 0 && (
                      <p className="text-sm text-gray-500 text-center py-4">
                        Nenhum evento nesta data
                      </p>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
        
        {/* Event Dialog */}
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {editingEvent ? "Editar Evento" : "Novo Evento"}
              </DialogTitle>
              <DialogDescription>
                {editingEvent ? "Modifique os detalhes do evento" : "Adicione um novo evento ao seu calendário"}
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
                  name="eventType"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Tipo de Evento</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Selecione o tipo" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {eventTypes.map(type => (
                            <SelectItem key={type.value} value={type.value}>
                              <div className="flex items-center">
                                <type.icon className={`h-4 w-4 mr-2 ${type.color}`} />
                                {type.label}
                              </div>
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
                
                <DialogFooter>
                  <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                    Cancelar
                  </Button>
                  <Button 
                    type="submit" 
                    disabled={createEventMutation.isPending || updateEventMutation.isPending}
                  >
                    {editingEvent ? "Atualizar" : "Criar"}
                  </Button>
                </DialogFooter>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
