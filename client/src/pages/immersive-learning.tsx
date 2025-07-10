import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import jsPDF from "jspdf";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  ArrowLeft, 
  Play, 
  CheckCircle, 
  Award, 
  BookOpen, 
  Clock,
  FileText,
  Download,
  Printer
} from "lucide-react";

import { LearningTimeline } from "@/components/LearningTimeline";
import { PracticalTask } from "@/components/PracticalTask";
import { SealsWall } from "@/components/SealsWall";

export default function ImmersiveLearning() {
  const { user } = useAuth();
  const { toast } = useToast();

  // Função para gerar PDF do checklist
  const generateChecklistPDF = (checklist: any) => {
    const pdf = new jsPDF();
    
    // Cabeçalho
    pdf.setFontSize(20);
    pdf.text("Dr. Agro - Plataforma Agrícola", 20, 20);
    
    pdf.setFontSize(16);
    pdf.text(checklist.title, 20, 35);
    
    if (checklist.description) {
      pdf.setFontSize(12);
      pdf.text(checklist.description, 20, 45);
    }
    
    // Itens do checklist
    let yPosition = 60;
    pdf.setFontSize(12);
    
    checklist.items.forEach((item: string, index: number) => {
      if (yPosition > 280) {
        pdf.addPage();
        yPosition = 20;
      }
      
      // Remove o ✓ do início e adiciona checkbox
      const cleanItem = item.replace(/^✓\s*/, '');
      pdf.text(`☐ ${cleanItem}`, 20, yPosition);
      yPosition += 8;
    });
    
    // Rodapé
    const pageCount = (pdf as any).internal.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      pdf.setPage(i);
      pdf.setFontSize(10);
      pdf.text(`Página ${i} de ${pageCount} - Dr. Agro`, 20, 290);
      pdf.text(`Gerado em: ${new Date().toLocaleDateString('pt-BR')}`, 150, 290);
    }
    
    // Download do PDF
    pdf.save(`${checklist.title.replace(/[^a-zA-Z0-9]/g, '_')}.pdf`);
    
    toast({
      title: "PDF gerado com sucesso!",
      description: "O checklist foi baixado como PDF.",
    });
  };

  // Função para imprimir o checklist
  const printChecklist = (checklist: any) => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;
    
    const printContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>${checklist.title}</title>
          <style>
            body { 
              font-family: Arial, sans-serif; 
              margin: 20px; 
              line-height: 1.6; 
            }
            .header { 
              text-align: center; 
              border-bottom: 2px solid #22c55e; 
              padding-bottom: 20px; 
              margin-bottom: 30px; 
            }
            .title { 
              font-size: 24px; 
              font-weight: bold; 
              color: #22c55e; 
              margin-bottom: 10px; 
            }
            .description { 
              font-size: 14px; 
              color: #666; 
              margin-bottom: 20px; 
            }
            .checklist-item { 
              margin: 12px 0; 
              padding: 8px; 
              border: 1px solid #e5e7eb; 
              border-radius: 4px; 
            }
            .checkbox { 
              margin-right: 10px; 
              transform: scale(1.2); 
            }
            .footer { 
              margin-top: 40px; 
              padding-top: 20px; 
              border-top: 1px solid #e5e7eb; 
              text-align: center; 
              font-size: 12px; 
              color: #666; 
            }
            @media print {
              body { margin: 0; }
              .header { border-color: #000; }
            }
          </style>
        </head>
        <body>
          <div class="header">
            <div class="title">Dr. Agro - ${checklist.title}</div>
            ${checklist.description ? `<div class="description">${checklist.description}</div>` : ''}
          </div>
          
          <div class="checklist">
            ${checklist.items.map((item: string) => {
              const cleanItem = item.replace(/^✓\s*/, '');
              return `
                <div class="checklist-item">
                  <input type="checkbox" class="checkbox" /> ${cleanItem}
                </div>
              `;
            }).join('')}
          </div>
          
          <div class="footer">
            <p>Dr. Agro - Plataforma Agrícola Inteligente</p>
            <p>Gerado em: ${new Date().toLocaleDateString('pt-BR')} às ${new Date().toLocaleTimeString('pt-BR')}</p>
          </div>
        </body>
      </html>
    `;
    
    printWindow.document.write(printContent);
    printWindow.document.close();
    
    // Aguarda o carregamento e inicia impressão
    setTimeout(() => {
      printWindow.print();
      printWindow.close();
    }, 250);
    
    toast({
      title: "Preparando impressão...",
      description: "O checklist está sendo preparado para impressão.",
    });
  };
  const [selectedTrack, setSelectedTrack] = useState<number | null>(null);
  const [selectedVideo, setSelectedVideo] = useState<number | null>(null);
  const [activeTab, setActiveTab] = useState("timeline");

  // Buscar dados
  const { data: tracks, isLoading } = useQuery({
    queryKey: ["/api/learning/tracks"],
  });

  const { data: videos } = useQuery({
    queryKey: [`/api/learning/tracks/${selectedTrack}/videos`],
    enabled: !!selectedTrack,
  });

  const { data: userProgress } = useQuery({
    queryKey: ["/api/learning/progress"],
    enabled: !!user,
  });

  const { data: userSeals } = useQuery({
    queryKey: ["/api/learning/seals"],
    enabled: !!user,
  });

  // Mutações
  const updateProgressMutation = useMutation({
    mutationFn: async (data: { trackId: number; videoId: number; isCompleted: boolean; score?: number }) => {
      return apiRequest("/api/learning/progress", "POST", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/learning/tracks"] });
      queryClient.invalidateQueries({ queryKey: ["/api/learning/progress"] });
      toast({
        title: "Progresso atualizado",
        description: "Seu progresso foi salvo com sucesso!",
      });
    },
  });

  const canAccessTrack = (trackIndex: number) => {
    if (user?.plan === "premium") return true;
    if (user?.plan === "pro") return trackIndex < 5;
    return trackIndex < 1;
  };

  const handleMarkAsCompleted = (trackId: number, videoId: number) => {
    updateProgressMutation.mutate({
      trackId,
      videoId,
      isCompleted: true,
    });
  };

  const handleSelectTrack = (trackId: number) => {
    setSelectedTrack(trackId);
    setSelectedVideo(null);
    setActiveTab("videos");
  };

  // Função para gerar checklist de campo
  const generateFieldChecklist = (trackId: number) => {
    const checklists = {
      1: {
        title: "Checklist – MÓDULO 1: Introdução à Bananicultura",
        description: "Objetivo: Entender o potencial do cultivo, seus fundamentos e iniciar o planejamento.",
        items: [
          "✓ Defini um nome para minha propriedade ou futura área de produção.",
          "✓ Assisti todos os vídeos do módulo 1.",
          "✓ Listei 3 motivos que me fazem querer investir na bananicultura.",
          "✓ Pesquisei qual variedade de banana é mais valorizada na minha região.",
          "✓ Identifiquei se há concorrência ou produtores próximos a mim.",
          "✓ Estimei qual área pretendo começar plantando (ex: 0,5 ha, 1 ha).",
          "✓ Anotei qual será meu objetivo: venda direta, mercado local, revenda, etc.",
          "✓ Avaliei se tenho acesso a assistência técnica ou consultoria agronômica.",
          "✓ Anotei os recursos que já tenho disponíveis: solo, água, mão de obra, etc.",
          "✓ Criei um esboço ou plano inicial com metas para os próximos 6 meses."
        ]
      },
      2: {
        title: "Checklist – MÓDULO 2: Escolha da Área Ideal para Implantação",
        description: "Objetivo: Avaliar tecnicamente o terreno ideal para plantar e evitar problemas futuros.",
        items: [
          "✓ Visitei o terreno que pretendo usar para plantio.",
          "✓ Observei se o local recebe luz solar direta o dia todo.",
          "✓ Identifiquei áreas encharcadas, de declive acentuado ou com pedras.",
          "✓ Classifiquei a topografia como: plana, levemente ondulada ou íngreme.",
          "✓ Verifiquei se há presença de mato alto, erosões ou trilhas de água.",
          "✓ Realizei o teste do toque no solo (argila, areia, mistura).",
          "✓ Recolhi uma amostra de solo para análise (ou planejei fazer isso).",
          "✓ Verifiquei a existência de uma fonte de água próxima.",
          "✓ Me informei sobre o tipo de solo mais adequado para banana.",
          "✓ Criei um desenho ou mapa simples com a área útil de plantio e áreas de proteção."
        ]
      },
      3: {
        title: "Checklist – MÓDULO 3: Plantio Eficiente",
        description: "Objetivo: Preparar corretamente o solo, adubar, escolher e plantar as mudas com planejamento.",
        items: [
          "✓ Marquei na área os limites da zona de plantio.",
          "✓ Escolhi o tipo de muda que será usado (rizoma, espada, micropropagada, etc.).",
          "✓ Organizei ou contratei os implementos para o preparo do solo (ou preparei manualmente).",
          "✓ Defini o tipo e a dose de adubo de plantio (com base em análise ou recomendação).",
          "✓ Verifiquei se é necessário fazer calagem ou aplicar gesso agrícola.",
          "✓ Planejei o espaçamento ideal com base na variedade (ex: 2,5m x 2,0m).",
          "✓ Fiz um teste de marcação no solo com estacas ou barbantes para simular o plantio.",
          "✓ Preparei a cova ou sulco com profundidade adequada (30-40 cm, dependendo da muda).",
          "✓ Separei um local sombreado e seguro para armazenar as mudas até o plantio.",
          "✓ Fiz o plantio de uma linha experimental (ou simulei) e observei o espaçamento, firmeza da muda e alinhamento."
        ]
      }
    };

    return checklists[trackId] || { title: "Checklist", items: [] };
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando trilhas de aprendizado...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 min-h-screen overflow-auto bg-gradient-to-br from-green-50 to-blue-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-green-700 mb-2">
                🍌 Trilhas de Aprendizado Dr. Agro
              </h1>
              <p className="text-gray-600">
                Experiência completa e prática em bananicultura
              </p>
            </div>
            <div className="text-right">
              <Badge variant="outline" className="text-sm">
                Plano {user?.plan || "gratuito"}
              </Badge>
            </div>
          </div>
        </div>
      </div>

      <div className="p-6">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="timeline">Linha do Tempo</TabsTrigger>
            <TabsTrigger value="videos">Vídeos</TabsTrigger>
            <TabsTrigger value="progress">Conquistas</TabsTrigger>
            <TabsTrigger value="field">Campo</TabsTrigger>
          </TabsList>
          
          {/* Tab: Linha do Tempo Visual */}
          <TabsContent value="timeline" className="space-y-6">
            <LearningTimeline 
              tracks={tracks || []}
              userProgress={userProgress || []}
              onSelectTrack={handleSelectTrack}
              selectedTrack={selectedTrack}
            />
          </TabsContent>

          {/* Tab: Vídeos */}
          <TabsContent value="videos" className="space-y-6">
            {selectedTrack ? (
              <div className="space-y-6">
                <div className="flex items-center gap-4">
                  <Button 
                    variant="outline" 
                    onClick={() => setSelectedTrack(null)}
                    className="flex items-center gap-2"
                  >
                    <ArrowLeft className="h-4 w-4" />
                    Voltar à Timeline
                  </Button>
                  <h2 className="text-2xl font-bold text-green-700">
                    {tracks?.find(t => t.id === selectedTrack)?.title}
                  </h2>
                </div>

                {selectedVideo ? (
                  // Video Player + Practical Task
                  <div className="space-y-6">
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                      {/* Video Player */}
                      <div className="lg:col-span-2">
                        <Card>
                          <CardContent className="p-0">
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
                                    </div>
                                  </div>
                                );
                              })()}
                            </div>
                          </CardContent>
                        </Card>

                        {/* Video Info */}
                        <Card className="mt-4">
                          <CardHeader>
                            <CardTitle className="flex items-center justify-between">
                              <span>{videos?.find((v: any) => v.id === selectedVideo)?.title}</span>
                              <Button 
                                onClick={() => handleMarkAsCompleted(selectedTrack, selectedVideo)}
                                disabled={updateProgressMutation.isPending}
                                className="bg-green-600 hover:bg-green-700"
                              >
                                <CheckCircle className="h-4 w-4 mr-2" />
                                Concluir
                              </Button>
                            </CardTitle>
                          </CardHeader>
                          <CardContent>
                            <p className="text-gray-600 mb-4">
                              {videos?.find((v: any) => v.id === selectedVideo)?.description}
                            </p>
                            <div className="flex items-center gap-4 text-sm text-gray-600">
                              <span>Duração: {videos?.find((v: any) => v.id === selectedVideo)?.duration}</span>
                              <span>Vídeo {videos?.find((v: any) => v.id === selectedVideo)?.order}</span>
                            </div>
                          </CardContent>
                        </Card>
                      </div>

                      {/* Practical Task */}
                      <div className="lg:col-span-1 practical-task-section">
                        {(() => {
                          const videoData = videos?.find((v: any) => v.id === selectedVideo);
                          // Mock practical task data - in real app would come from API
                          const practicalTasks = {
                            101: {
                              title: "Pesquise o mercado local",
                              description: "Visite 3 mercados da região e anote preços, variedades e origem das bananas vendidas.",
                              actionType: "immediate" as const,
                              difficulty: "easy" as const,
                              estimatedTime: "2 horas",
                              materials: ["Caderno", "Caneta", "Smartphone"]
                            },
                            102: {
                              title: "Analise sua propriedade",
                              description: "Faça um mapeamento básico: solo, água, declividade e acesso.",
                              actionType: "immediate" as const,
                              difficulty: "medium" as const,
                              estimatedTime: "3 horas",
                              materials: ["Trena", "Smartphone", "Pá pequena"]
                            },
                            103: {
                              title: "Crie seu plano de plantio",
                              description: "Desenhe layout com espaçamento 3x2m e calcule mudas necessárias.",
                              actionType: "immediate" as const,
                              difficulty: "medium" as const,
                              estimatedTime: "2 horas",
                              materials: ["Papel milimetrado", "Lápis", "Calculadora"]
                            }
                          };

                          const task = practicalTasks[selectedVideo];
                          
                          return task && (
                            <PracticalTask 
                              task={task}
                              onStartTask={() => console.log('Starting task...')}
                              onMarkCompleted={(notes) => console.log('Task completed:', notes)}
                            />
                          );
                        })()}
                      </div>
                    </div>
                  </div>
                ) : (
                  // Modern Video Gallery - Netflix/Green App Style
                  <div className="space-y-6">
                    {/* Progress Overview */}
                    <div className="bg-gradient-to-r from-green-600 to-green-700 text-white p-6 rounded-xl shadow-lg">
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="text-2xl font-bold mb-2">
                            {tracks?.find((t: any) => t.id === selectedTrack)?.title}
                          </h3>
                          <p className="text-green-100 mb-4">
                            {tracks?.find((t: any) => t.id === selectedTrack)?.description}
                          </p>
                          <div className="flex items-center gap-4 text-sm">
                            <span className="flex items-center gap-1">
                              <Clock className="h-4 w-4" />
                              {tracks?.find((t: any) => t.id === selectedTrack)?.duration}
                            </span>
                            <span className="flex items-center gap-1">
                              <Play className="h-4 w-4" />
                              {Array.isArray(videos) ? videos.length : 0} aulas
                            </span>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-3xl font-bold">
                            {(() => {
                              const completedCount = (userProgress || []).filter((p: any) => 
                                p.trackId === selectedTrack && p.isCompleted
                              ).length;
                              const totalVideos = Array.isArray(videos) ? videos.length : 0;
                              return totalVideos > 0 ? Math.round((completedCount / totalVideos) * 100) : 0;
                            })()}%
                          </div>
                          <div className="text-green-100 text-sm">concluído</div>
                        </div>
                      </div>
                    </div>

                    {/* Video Cards - Horizontal Netflix Style */}
                    <div className="space-y-4">
                      {Array.isArray(videos) && videos.map((video: any, index: number) => {
                        const isCompleted = (userProgress || []).some((p: any) => 
                          p.trackId === selectedTrack && p.videoId === video.id && p.isCompleted
                        );
                        const isInProgress = !isCompleted && index === 0; // Mock logic - first incomplete video is "in progress"
                        
                        return (
                          <Card 
                            key={video.id} 
                            className="cursor-pointer hover:shadow-xl transition-all duration-300 hover:scale-[1.02] bg-white border-0 shadow-md"
                            onClick={() => setSelectedVideo(video.id)}
                          >
                            <div className="flex flex-col md:flex-row gap-4 p-4">
                              {/* Video Thumbnail */}
                              <div className="relative w-full md:w-80 aspect-video bg-gray-900 rounded-lg overflow-hidden group">
                                {video.videoUrl ? (
                                  <img 
                                    src={video.videoUrl.replace('/preview', '/view').replace('https://drive.google.com/file/d/', 'https://drive.google.com/thumbnail?id=').replace('/view', '&sz=w480-h270')}
                                    alt={video.title}
                                    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                                    onError={(e) => {
                                      e.currentTarget.style.display = 'none';
                                      const fallbackDiv = e.currentTarget.parentElement?.querySelector('.fallback-icon') as HTMLElement;
                                      if (fallbackDiv) fallbackDiv.style.display = 'flex';
                                    }}
                                  />
                                ) : null}
                                <div className="fallback-icon absolute inset-0 flex items-center justify-center bg-gray-800" style={{ display: 'none' }}>
                                  <Play className="h-12 w-12 text-gray-400" />
                                </div>
                                
                                {/* Play Button Overlay */}
                                <div className="absolute inset-0 bg-black/20 group-hover:bg-black/40 transition-colors flex items-center justify-center">
                                  <div className="bg-white/90 backdrop-blur-sm rounded-full p-4 transform transition-all duration-300 group-hover:scale-110">
                                    <Play className="h-8 w-8 text-gray-800 fill-gray-800" />
                                  </div>
                                </div>

                                {/* Duration Badge */}
                                <div className="absolute bottom-2 right-2 bg-black/80 text-white text-xs px-2 py-1 rounded">
                                  {video.duration}
                                </div>

                                {/* Progress Bar (if in progress) */}
                                {isInProgress && (
                                  <div className="absolute bottom-0 left-0 right-0 h-1 bg-white/20">
                                    <div className="h-full bg-green-400 w-1/3"></div>
                                  </div>
                                )}
                              </div>

                              {/* Video Information */}
                              <div className="flex-1 flex flex-col justify-between">
                                <div>
                                  {/* Status Badge */}
                                  <div className="flex items-center gap-2 mb-3">
                                    <Badge 
                                      variant={isCompleted ? "default" : isInProgress ? "secondary" : "outline"}
                                      className={`text-xs ${
                                        isCompleted 
                                          ? "bg-green-100 text-green-800 border-green-200" 
                                          : isInProgress 
                                            ? "bg-yellow-100 text-yellow-800 border-yellow-200"
                                            : "bg-gray-100 text-gray-600 border-gray-200"
                                      }`}
                                    >
                                      {isCompleted ? "✅ Concluído" : isInProgress ? "▶️ Em andamento" : "⏸️ Não iniciado"}
                                    </Badge>
                                    <span className="text-sm text-gray-500">
                                      🎬 Aula {video.order}
                                    </span>
                                  </div>

                                  {/* Title */}
                                  <h4 className="text-lg font-semibold text-gray-800 mb-2 line-clamp-2">
                                    {video.title}
                                  </h4>

                                  {/* Description */}
                                  <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                                    {video.description}
                                  </p>
                                </div>

                                {/* Action Buttons */}
                                <div className="flex flex-col sm:flex-row gap-2">
                                  <Button 
                                    className={`flex-1 ${
                                      isCompleted 
                                        ? "bg-green-600 hover:bg-green-700" 
                                        : isInProgress 
                                          ? "bg-yellow-600 hover:bg-yellow-700"
                                          : "bg-blue-600 hover:bg-blue-700"
                                    }`}
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setSelectedVideo(video.id);
                                    }}
                                  >
                                    {isCompleted ? (
                                      <>
                                        <CheckCircle className="h-4 w-4 mr-2" />
                                        Revisar
                                      </>
                                    ) : isInProgress ? (
                                      <>
                                        <Play className="h-4 w-4 mr-2" />
                                        Continuar
                                      </>
                                    ) : (
                                      <>
                                        <Play className="h-4 w-4 mr-2" />
                                        Assistir
                                      </>
                                    )}
                                  </Button>
                                  
                                  {/* Practical Task Button */}
                                  <Button 
                                    variant="outline" 
                                    className="flex-1 sm:flex-none border-green-200 text-green-700 hover:bg-green-50"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setSelectedVideo(video.id);
                                      // Scroll to practical task section
                                      setTimeout(() => {
                                        const practicalSection = document.querySelector('.practical-task-section');
                                        if (practicalSection) {
                                          practicalSection.scrollIntoView({ behavior: 'smooth' });
                                        }
                                      }, 100);
                                    }}
                                  >
                                    <FileText className="h-4 w-4 mr-2" />
                                    Ação Prática
                                  </Button>
                                </div>
                              </div>
                            </div>
                          </Card>
                        );
                      })}
                    </div>

                    {/* Next Steps */}
                    <Card className="bg-gradient-to-r from-blue-50 to-green-50 border-0">
                      <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                          <div>
                            <h4 className="text-lg font-semibold text-gray-800 mb-2">
                              🚀 Próximos passos
                            </h4>
                            <p className="text-gray-600 text-sm">
                              Complete as aulas em sequência para obter o melhor aproveitamento
                            </p>
                          </div>
                          <Button 
                            variant="outline"
                            className="border-green-200 text-green-700 hover:bg-green-50"
                            onClick={() => setActiveTab("field")}
                          >
                            <FileText className="h-4 w-4 mr-2" />
                            Ver Checklist
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-12">
                <BookOpen className="h-16 w-16 mx-auto text-gray-400 mb-4" />
                <h3 className="text-xl font-semibold text-gray-600 mb-2">
                  Selecione um módulo
                </h3>
                <p className="text-gray-500">
                  Escolha um módulo na linha do tempo para começar a assistir os vídeos
                </p>
                <Button 
                  className="mt-4"
                  onClick={() => setActiveTab("timeline")}
                >
                  Ver Linha do Tempo
                </Button>
              </div>
            )}
          </TabsContent>

          {/* Tab: Conquistas (Selos) */}
          <TabsContent value="progress" className="space-y-6">
            <SealsWall 
              userSeals={userSeals || []}
              totalModules={tracks?.length || 0}
            />
          </TabsContent>

          {/* Tab: Checklist de Campo */}
          <TabsContent value="field" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {Array.isArray(tracks) && tracks.map((track: any) => {
                const checklist = generateFieldChecklist(track.id);
                
                return (
                  <Card key={track.id}>
                    <CardHeader>
                      <CardTitle className="flex items-center justify-between">
                        <div className="flex flex-col gap-1">
                          <span className="flex items-center gap-2">
                            <FileText className="h-5 w-5 text-green-600" />
                            {checklist.title}
                          </span>
                          {checklist.description && (
                            <p className="text-sm text-gray-600 font-normal ml-7">
                              {checklist.description}
                            </p>
                          )}
                        </div>
                        <div className="flex gap-2">
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => generateChecklistPDF(checklist)}
                          >
                            <Download className="h-4 w-4 mr-1" />
                            PDF
                          </Button>
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => printChecklist(checklist)}
                          >
                            <Printer className="h-4 w-4 mr-1" />
                            Imprimir
                          </Button>
                        </div>
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {checklist.items.map((item, index) => (
                          <div key={index} className="flex items-center gap-3 p-2 rounded hover:bg-gray-50">
                            <input 
                              type="checkbox" 
                              className="rounded border-gray-300 text-green-600 focus:ring-green-500"
                            />
                            <span className="text-sm">{item}</span>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}