import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CheckCircle, Clock, Play, Award, BookOpen } from "lucide-react";

interface TimelineProps {
  tracks: any[];
  userProgress: any[];
  onSelectTrack: (trackId: number) => void;
  selectedTrack?: number;
}

export function LearningTimeline({ tracks, userProgress, onSelectTrack, selectedTrack }: TimelineProps) {
  const getTrackProgress = (trackId: number) => {
    if (!Array.isArray(userProgress)) return 0;
    const trackProgress = userProgress.filter((p: any) => p.trackId === trackId);
    const completedCount = trackProgress.filter((p: any) => p.isCompleted).length;
    return tracks.find(t => t.id === trackId)?.videoCount > 0 
      ? (completedCount / tracks.find(t => t.id === trackId)?.videoCount) * 100 
      : 0;
  };

  const getTrackStatus = (trackId: number, index: number) => {
    const progress = getTrackProgress(trackId);
    if (progress === 100) return "completed";
    if (progress > 0) return "in-progress";
    if (index === 0 || getTrackProgress(tracks[index - 1]?.id) === 100) return "available";
    return "locked";
  };

  return (
    <div className="space-y-8">
      {/* Linha do Tempo Horizontal */}
      <div className="relative">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-2xl font-bold text-green-700">Sua Jornada na Bananicultura</h2>
          <Badge variant="outline" className="text-sm">
            {tracks?.filter((_, index) => getTrackStatus(tracks[index].id, index) === "completed").length} de {tracks?.length} módulos completos
          </Badge>
        </div>

        {/* Timeline */}
        <div className="relative">
          {/* Linha de conexão */}
          <div className="absolute top-16 left-0 right-0 h-1 bg-gray-200 rounded-full" />
          <div 
            className="absolute top-16 left-0 h-1 bg-green-500 rounded-full transition-all duration-500"
            style={{ 
              width: `${tracks?.length > 0 ? (tracks.filter((_, index) => getTrackProgress(tracks[index].id) === 100).length / tracks.length) * 100 : 0}%` 
            }}
          />

          {/* Nós da Timeline */}
          <div className="flex justify-between relative">
            {Array.isArray(tracks) && tracks.map((track, index) => {
              const status = getTrackStatus(track.id, index);
              const progress = getTrackProgress(track.id);
              
              return (
                <div key={track.id} className="flex flex-col items-center">
                  {/* Ícone do Módulo */}
                  <button
                    onClick={() => status !== "locked" && onSelectTrack(track.id)}
                    disabled={status === "locked"}
                    className={`
                      relative w-32 h-32 rounded-full border-4 transition-all duration-300 mb-4
                      ${status === "completed" 
                        ? "bg-green-500 border-green-500 text-white shadow-lg" 
                        : status === "in-progress"
                        ? "bg-yellow-100 border-yellow-500 text-yellow-700 shadow-md"
                        : status === "available"
                        ? "bg-white border-green-300 text-green-600 hover:border-green-500 hover:shadow-md"
                        : "bg-gray-100 border-gray-300 text-gray-400 cursor-not-allowed"
                      }
                      ${selectedTrack === track.id ? "ring-4 ring-green-200" : ""}
                    `}
                  >
                    {status === "completed" ? (
                      <CheckCircle className="w-12 h-12 mx-auto" />
                    ) : status === "locked" ? (
                      <div className="w-12 h-12 mx-auto rounded-full bg-gray-300" />
                    ) : (
                      <BookOpen className="w-12 h-12 mx-auto" />
                    )}
                    
                    {/* Badge de progresso */}
                    {status === "in-progress" && (
                      <div className="absolute -bottom-2 -right-2 bg-yellow-500 text-white text-xs px-2 py-1 rounded-full font-bold">
                        {Math.round(progress)}%
                      </div>
                    )}
                  </button>

                  {/* Informações do Módulo */}
                  <div className="text-center max-w-xs">
                    <h3 className="font-semibold text-sm mb-1 line-clamp-2">{track.title}</h3>
                    <div className="text-xs text-gray-600 space-y-1">
                      <div className="flex items-center justify-center gap-1">
                        <Play className="w-3 h-3" />
                        {track.videoCount} vídeos
                      </div>
                      <div className="flex items-center justify-center gap-1">
                        <Clock className="w-3 h-3" />
                        {track.duration}
                      </div>
                    </div>
                    
                    {status === "completed" && (
                      <Badge className="mt-2 bg-green-100 text-green-700 text-xs">
                        <Award className="w-3 h-3 mr-1" />
                        Concluído
                      </Badge>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}