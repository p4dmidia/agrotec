import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Award, Star, Trophy, CheckCircle, Target, Zap } from "lucide-react";

interface Seal {
  id: number;
  title: string;
  description: string;
  iconUrl: string;
  sealType: string;
  unlockedAt: Date;
}

interface SealsWallProps {
  userSeals: Seal[];
  totalModules: number;
}

export function SealsWall({ userSeals, totalModules }: SealsWallProps) {
  // Definir selos disponíveis
  const availableSeals = [
    {
      id: 1,
      title: "Primeiro Passo",
      description: "Assistiu ao primeiro vídeo",
      icon: Star,
      sealType: "first_video",
      color: "bg-blue-500"
    },
    {
      id: 2,
      title: "Módulo Completo",
      description: "Concluiu o primeiro módulo",
      icon: CheckCircle,
      sealType: "module_complete_1",
      color: "bg-green-500"
    },
    {
      id: 3,
      title: "Dedicação Total",
      description: "Concluiu todos os módulos",
      icon: Trophy,
      sealType: "all_modules",
      color: "bg-gold-500"
    },
    {
      id: 4,
      title: "Praticante",
      description: "Completou 5 tarefas práticas",
      icon: Target,
      sealType: "practical_tasks_5",
      color: "bg-purple-500"
    },
    {
      id: 5,
      title: "Especialista",
      description: "Concluiu 3 módulos em sequência",
      icon: Award,
      sealType: "streak_3",
      color: "bg-orange-500"
    },
    {
      id: 6,
      title: "Velocista",
      description: "Assistiu 3 vídeos em um dia",
      icon: Zap,
      sealType: "daily_streak",
      color: "bg-red-500"
    }
  ];

  const getSealStatus = (sealType: string) => {
    return userSeals.find(seal => seal.sealType === sealType);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Trophy className="h-6 w-6 text-yellow-500" />
          Mural de Conquistas Agrícolas
        </CardTitle>
        <p className="text-sm text-gray-600">
          Seus selos de progresso na jornada da bananicultura
        </p>
      </CardHeader>

      <CardContent>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {availableSeals.map((seal) => {
            const unlockedSeal = getSealStatus(seal.sealType);
            const isUnlocked = !!unlockedSeal;

            return (
              <div
                key={seal.id}
                className={`
                  relative p-4 rounded-xl transition-all duration-300 text-center
                  ${isUnlocked 
                    ? `${seal.color} text-white shadow-lg transform hover:scale-105` 
                    : "bg-gray-100 text-gray-400 opacity-60"
                  }
                `}
              >
                {/* Ícone do Selo */}
                <div className={`
                  w-16 h-16 mx-auto mb-3 rounded-full flex items-center justify-center
                  ${isUnlocked ? "bg-white/20" : "bg-gray-200"}
                `}>
                  <seal.icon className={`w-8 h-8 ${isUnlocked ? "text-white" : "text-gray-400"}`} />
                </div>

                {/* Informações do Selo */}
                <h3 className="font-bold text-sm mb-1">{seal.title}</h3>
                <p className="text-xs opacity-90 leading-tight">{seal.description}</p>

                {/* Data de Desbloqueio */}
                {isUnlocked && unlockedSeal && (
                  <Badge 
                    variant="secondary" 
                    className="mt-2 text-xs bg-white/20 text-white border-white/30"
                  >
                    {new Date(unlockedSeal.unlockedAt).toLocaleDateString('pt-BR')}
                  </Badge>
                )}

                {/* Efeito de brilho para selos desbloqueados */}
                {isUnlocked && (
                  <>
                    <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-yellow-200/20 to-transparent animate-pulse" />
                    <div className="absolute -top-1 -right-1 w-6 h-6 bg-yellow-400 rounded-full flex items-center justify-center">
                      <CheckCircle className="w-4 h-4 text-white" />
                    </div>
                  </>
                )}
              </div>
            );
          })}
        </div>

        {/* Estatísticas */}
        <div className="mt-6 p-4 bg-gray-50 rounded-lg">
          <div className="flex justify-between items-center">
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{userSeals.length}</div>
              <div className="text-xs text-gray-600">Selos conquistados</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{availableSeals.length}</div>
              <div className="text-xs text-gray-600">Selos disponíveis</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">
                {Math.round((userSeals.length / availableSeals.length) * 100)}%
              </div>
              <div className="text-xs text-gray-600">Progresso total</div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}