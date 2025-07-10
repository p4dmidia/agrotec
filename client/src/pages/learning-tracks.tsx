import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { Header } from "@/components/layout/header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { Play, CheckCircle, Trophy, Clock, Video } from "lucide-react";

export default function LearningTracks() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedTrack, setSelectedTrack] = useState<number | null>(null);
  const [selectedVideo, setSelectedVideo] = useState<number | null>(null);

  const { data: tracks, isLoading } = useQuery({
    queryKey: ["/api/learning/tracks"],
  });

  const { data: videos, isLoading: videosLoading } = useQuery({
    queryKey: [`/api/learning/tracks/${selectedTrack}/videos`],
    enabled: !!selectedTrack,
  });

  const { data: userProgress } = useQuery({
    queryKey: ["/api/learning/progress"],
    enabled: !!user,
  });

  console.log('Current state - selectedTrack:', selectedTrack, 'selectedVideo:', selectedVideo, 'videos:', videos);

  const updateProgressMutation = useMutation({
    mutationFn: async (data: { trackId: number; videoId: number; isCompleted: boolean; score?: number }) => {
      return apiRequest("/api/learning/progress", "POST", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/learning/tracks"] });
      toast({
        title: "Progresso atualizado",
        description: "Seu progresso foi salvo com sucesso!",
      });
    },
  });

  const handleMarkAsCompleted = (trackId: number, videoId: number) => {
    updateProgressMutation.mutate({
      trackId,
      videoId,
      isCompleted: true,
    });
  };

  const handleQuizComplete = (trackId: number, videoId: number, score: number) => {
    updateProgressMutation.mutate({
      trackId,
      videoId,
      isCompleted: true,
      score,
    });
  };

  const canAccessTrack = (trackIndex: number) => {
    if (user?.plan === "premium") return true;
    if (user?.plan === "pro") return trackIndex < 5;
    return trackIndex < 1;
  };

  const getProgressColor = (progress: number) => {
    if (progress >= 80) return "bg-green-500";
    if (progress >= 50) return "bg-yellow-500";
    return "bg-gray-400";
  };

  // Calcular estatísticas reais baseadas nos dados do usuário
  const calculateProgressStats = () => {
    if (!tracks || !userProgress || !Array.isArray(tracks) || !Array.isArray(userProgress)) {
      return { totalPoints: 0, completedTracks: 0, totalHours: 0, completedVideos: 0 };
    }
    
    let totalPoints = 0;
    let completedTracks = 0;
    let totalHours = 0;
    let completedVideos = 0;
    
    tracks.forEach((track: any) => {
      const trackProgress = userProgress.filter((p: any) => p.trackId === track.id);
      const completedCount = trackProgress.filter((p: any) => p.isCompleted).length;
      
      // Pontuar baseado nos vídeos concluídos (100 pontos por vídeo)
      totalPoints += completedCount * 100;
      
      // Contar trilhas 100% concluídas
      if (track.videoCount > 0 && completedCount === track.videoCount) {
        completedTracks++;
      }
      
      // Calcular tempo total baseado na duração dos vídeos (estimativa)
      const trackMinutes = parseInt(track.duration.replace(/[^\d]/g, '')) || 0;
      const progressPercentage = track.videoCount > 0 ? (completedCount / track.videoCount) * 100 : 0;
      totalHours += (trackMinutes * progressPercentage) / 100;
      
      completedVideos += completedCount;
    });
    
    const hours = Math.floor(totalHours / 60);
    const minutes = Math.round(totalHours % 60);
    
    return {
      totalPoints,
      completedTracks,
      totalTimeFormatted: `${hours}h ${minutes}min`,
      completedVideos
    };
  };

  const progressStats = calculateProgressStats();

  return (
    <div className="space-y-6 min-h-screen overflow-auto">
      <Header title="Trilhas de Aprendizado" subtitle="Desenvolva seus conhecimentos agrícolas" />
      
      <div className="p-6">
        <Tabs defaultValue="tracks" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="tracks">Trilhas</TabsTrigger>
            <TabsTrigger value="progress">Meu Progresso</TabsTrigger>
          </TabsList>
          
          <TabsContent value="tracks" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
              {tracks?.map((track: any, index: number) => (
                <Card key={track.id} className="relative overflow-hidden">
                  {!canAccessTrack(index) && (
                    <div className="absolute inset-0 bg-black/50 z-10 flex items-center justify-center">
                      <div className="text-center text-white">
                        <Trophy className="h-8 w-8 mx-auto mb-2" />
                        <p className="font-semibold">Upgrade necessário</p>
                        <p className="text-sm">
                          {user?.plan === "gratuito" ? "Plano Pro ou Premium" : "Plano Premium"}
                        </p>
                      </div>
                    </div>
                  )}
                  
                  <CardHeader>
                    <div className="aspect-video bg-gray-100 rounded-lg mb-4 overflow-hidden">
                      <img
                        src={track.imageUrl}
                        alt={track.title}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg">{track.title}</CardTitle>
                      <Badge variant="outline">
                        {track.progress}% concluído
                      </Badge>
                    </div>
                    <CardDescription>{track.description}</CardDescription>
                  </CardHeader>
                  
                  <CardContent>
                    <div className="flex items-center justify-between text-sm text-gray-600 mb-4">
                      <div className="flex items-center">
                        <Video className="h-4 w-4 mr-1" />
                        {track.videoCount} vídeos
                      </div>
                      <div className="flex items-center">
                        <Clock className="h-4 w-4 mr-1" />
                        {track.duration}
                      </div>
                    </div>
                    
                    <Progress value={track.progress} className="mb-4" />
                    
                    <Button 
                      className="w-full"
                      onClick={() => {
                        console.log('Selecting track:', track.id);
                        setSelectedTrack(track.id);
                        setSelectedVideo(null); // Reset selected video
                      }}
                      disabled={!canAccessTrack(index)}
                    >
                      {track.progress > 0 ? "Continuar" : "Iniciar"}
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
          
          <TabsContent value="progress" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Trophy className="h-5 w-5 mr-2 text-yellow-500" />
                    Pontuação Total
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-yellow-600">{progressStats.totalPoints} pts</div>
                  <p className="text-sm text-gray-600">Em todas as trilhas</p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <CheckCircle className="h-5 w-5 mr-2 text-green-500" />
                    Trilhas Concluídas
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-green-600">{progressStats.completedTracks}</div>
                  <p className="text-sm text-gray-600">De {Array.isArray(tracks) ? tracks.length : 0} disponíveis</p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Clock className="h-5 w-5 mr-2 text-blue-500" />
                    Tempo Total
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-blue-600">{progressStats.totalTimeFormatted || "0h 0min"}</div>
                  <p className="text-sm text-gray-600">Tempo de estudo</p>
                </CardContent>
              </Card>
            </div>
            
            <Card>
              <CardHeader>
                <CardTitle>Progresso por Trilha</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {Array.isArray(tracks) && tracks.map((track: any) => (
                    <div key={track.id} className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-sm font-medium">{track.title}</span>
                          <span className="text-sm text-gray-600">{track.progress}%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div 
                            className={`h-2 rounded-full ${getProgressColor(track.progress)}`}
                            style={{ width: `${track.progress}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
        
        {/* Video Player Modal */}
        {selectedTrack && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 max-w-6xl w-full mx-4 max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold">Vídeos da Trilha</h3>
                <Button variant="ghost" onClick={() => setSelectedTrack(null)} className="text-xl">
                  ×
                </Button>
              </div>
              
              {selectedVideo ? (
                // Video Player View
                <div className="space-y-6">
                  <div className="aspect-video w-full bg-gray-900 rounded-lg overflow-hidden">
                    {(() => {
                      const selectedVideoData = videos?.find((v: any) => v.id === selectedVideo);
                      const videoUrl = selectedVideoData?.videoUrl;
                      
                      return videoUrl && videoUrl.includes('drive.google.com') ? (
                        <iframe
                          src={videoUrl}
                          className="w-full h-full"
                          allow="autoplay; encrypted-media"
                          allowFullScreen
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-white">
                          <div className="text-center">
                            <Play className="h-16 w-16 mx-auto mb-4" />
                            <p>Vídeo não disponível</p>
                            <p className="text-sm text-gray-400">Configure o link do Google Drive</p>
                          </div>
                        </div>
                      );
                    })()}
                  </div>
                  
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h4 className="text-xl font-bold mb-2">
                        {videos?.find((v: any) => v.id === selectedVideo)?.title}
                      </h4>
                      <p className="text-gray-600 mb-4">
                        {videos?.find((v: any) => v.id === selectedVideo)?.description}
                      </p>
                      <div className="flex items-center gap-4 text-sm text-gray-600">
                        <span>Duração: {videos?.find((v: any) => v.id === selectedVideo)?.duration}</span>
                        <span>Vídeo {videos?.find((v: any) => v.id === selectedVideo)?.order}</span>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Button 
                        onClick={() => handleMarkAsCompleted(selectedTrack, selectedVideo)}
                        disabled={updateProgressMutation.isPending}
                        className="bg-green-600 hover:bg-green-700"
                      >
                        <CheckCircle className="h-4 w-4 mr-2" />
                        Marcar como Concluído
                      </Button>
                      <Button 
                        variant="outline"
                        onClick={() => setSelectedVideo(null)}
                        className="w-full"
                      >
                        Voltar aos Vídeos
                      </Button>
                    </div>
                  </div>
                </div>
              ) : (
                // Video List View
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {videos?.map((video: any) => (
                    <Card key={video.id} className="cursor-pointer hover:shadow-md transition-shadow">
                      <CardHeader>
                        <div className="aspect-video bg-gray-100 rounded-lg mb-2 flex items-center justify-center relative group overflow-hidden">
                          {video.videoUrl ? (
                            <img 
                              src={video.videoUrl.replace('/preview', '/view').replace('https://drive.google.com/file/d/', 'https://drive.google.com/thumbnail?id=').replace('/view', '&sz=w320-h180')}
                              alt={video.title}
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                e.currentTarget.style.display = 'none';
                                e.currentTarget.parentElement.querySelector('.fallback-icon').style.display = 'flex';
                              }}
                            />
                          ) : null}
                          <div className="fallback-icon absolute inset-0 flex items-center justify-center" style={{ display: 'none' }}>
                            <Play className="h-8 w-8 text-gray-400" />
                          </div>
                          <div className="absolute inset-0 bg-black/20 group-hover:bg-black/40 transition-colors rounded-lg flex items-center justify-center">
                            <Play className="h-12 w-12 text-white drop-shadow-lg opacity-80 group-hover:opacity-100 transition-opacity" />
                          </div>
                        </div>
                        <CardTitle className="text-base">{video.title}</CardTitle>
                        <CardDescription className="text-sm">{video.description}</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="flex items-center justify-between text-sm text-gray-600 mb-4">
                          <span>Vídeo {video.order}</span>
                          <span>{video.duration}</span>
                        </div>
                        
                        <Button 
                          className="w-full bg-green-600 hover:bg-green-700"
                          onClick={() => setSelectedVideo(video.id)}
                        >
                          <Play className="h-4 w-4 mr-2" />
                          Assistir
                        </Button>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
