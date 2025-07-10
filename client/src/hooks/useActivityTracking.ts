import { useEffect } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

export function useActivityTracking() {
  const { toast } = useToast();

  // Get user activity data
  const { data: activity } = useQuery({
    queryKey: ["/api/user/activity"],
    refetchInterval: 5 * 60 * 1000, // Check every 5 minutes
  });

  // Track activity mutation
  const trackActivity = useMutation({
    mutationFn: async (activityType: 'calendar' | 'chat' | 'learning') => {
      const response = await apiRequest("POST", "/api/user/activity", { activityType });
      return response.json();
    },
  });

  // Check for inactivity alerts
  useEffect(() => {
    if (!activity || activity.alertsDisabled) return;

    const now = new Date();
    const lastCalendarActivity = activity.lastCalendarActivity 
      ? new Date(activity.lastCalendarActivity) 
      : null;
    const lastAlertSent = activity.lastAlertSent 
      ? new Date(activity.lastAlertSent) 
      : null;

    // Check if user hasn't registered any calendar activity in 7 days
    if (lastCalendarActivity) {
      const daysSinceLastActivity = Math.floor(
        (now.getTime() - lastCalendarActivity.getTime()) / (1000 * 60 * 60 * 24)
      );

      // Check if we should send an alert (7+ days of inactivity and no alert sent in last 24 hours)
      const shouldSendAlert = daysSinceLastActivity >= 7 && 
        (!lastAlertSent || 
         (now.getTime() - lastAlertSent.getTime()) > 24 * 60 * 60 * 1000);

      if (shouldSendAlert) {
        toast({
          title: "Lembrete de Atividade",
          description: `Você não registrou nenhuma atividade no calendário há ${daysSinceLastActivity} dias. Deseja atualizar seu calendário agrícola?`,
          duration: 10000, // Show for 10 seconds
        });

        // Update last alert sent time
        trackActivity.mutate('calendar');
      }
    } else {
      // First time user - show welcome message
      toast({
        title: "Bem-vindo ao Calendário Agrícola!",
        description: "Comece registrando suas primeiras atividades para receber sugestões personalizadas.",
        duration: 8000,
      });
    }
  }, [activity, toast, trackActivity]);

  return {
    trackActivity: trackActivity.mutate,
    activity,
  };
}