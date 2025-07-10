import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { CheckCircle, Clock, Wrench, Star, FileText, CheckSquare, MessageSquare, HelpCircle } from "lucide-react";
import { useState } from "react";

interface PracticalTaskProps {
  task: {
    title: string;
    description: string;
    actionType: "immediate" | "weekly" | "seasonal";
    difficulty: "easy" | "medium" | "hard";
    estimatedTime: string;
    materials?: string[];
  };
  isCompleted?: boolean;
  userNotes?: string;
  onMarkCompleted?: (notes: string) => void;
  onStartTask?: () => void;
}

export function PracticalTask({ 
  task, 
  isCompleted = false, 
  userNotes = "", 
  onMarkCompleted, 
  onStartTask 
}: PracticalTaskProps) {
  const [question, setQuestion] = useState("");
  const [showQuestion, setShowQuestion] = useState(false);

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "easy": return "bg-green-100 text-green-700";
      case "medium": return "bg-yellow-100 text-yellow-700";
      case "hard": return "bg-red-100 text-red-700";
      default: return "bg-gray-100 text-gray-700";
    }
  };

  const getActionTypeColor = (actionType: string) => {
    switch (actionType) {
      case "immediate": return "bg-blue-100 text-blue-700";
      case "weekly": return "bg-purple-100 text-purple-700";
      case "seasonal": return "bg-orange-100 text-orange-700";
      default: return "bg-gray-100 text-gray-700";
    }
  };

  return (
    <Card className={`transition-all duration-300 ${isCompleted ? "bg-green-50 border-green-200" : "bg-white"}`}>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className="flex items-center gap-2 text-lg mb-2">
              <FileText className="h-5 w-5 text-green-600" />
              📋 Ação prática: {task.title}
              {isCompleted && <CheckCircle className="h-5 w-5 text-green-500" />}
            </CardTitle>
            
            <div className="flex flex-wrap gap-2 mb-3">
              <Badge className={getDifficultyColor(task.difficulty)}>
                <Star className="w-3 h-3 mr-1" />
                {task.difficulty === "easy" ? "Fácil" : task.difficulty === "medium" ? "Médio" : "Difícil"}
              </Badge>
              
              <Badge className={getActionTypeColor(task.actionType)}>
                <Clock className="w-3 h-3 mr-1" />
                {task.actionType === "immediate" ? "Imediato" : task.actionType === "weekly" ? "Semanal" : "Sazonal"}
              </Badge>
              
              <Badge variant="outline">
                {task.estimatedTime}
              </Badge>
            </div>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        <p className="text-gray-700 leading-relaxed">{task.description}</p>

        {task.materials && task.materials.length > 0 && (
          <div className="bg-blue-50 p-4 rounded-lg">
            <h4 className="font-semibold text-blue-900 mb-2 flex items-center gap-2">
              <Wrench className="h-4 w-4" />
              Materiais necessários:
            </h4>
            <ul className="space-y-1">
              {task.materials.map((material, index) => (
                <li key={index} className="text-blue-800 flex items-center gap-2">
                  <CheckSquare className="h-3 w-3" />
                  {material}
                </li>
              ))}
            </ul>
          </div>
        )}

        {isCompleted ? (
          <div className="bg-green-50 p-4 rounded-lg border border-green-200">
            <div className="flex items-center gap-2 text-green-700 font-semibold mb-2">
              <CheckCircle className="h-5 w-5" />
              Tarefa concluída!
            </div>
            {userNotes && (
              <div className="mt-2">
                <p className="text-sm text-green-700 font-medium">Suas anotações:</p>
                <p className="text-green-600 text-sm mt-1 bg-white p-2 rounded border">
                  {userNotes}
                </p>
              </div>
            )}
          </div>
        ) : (
          <div className="space-y-3">
            {showQuestion && (
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <HelpCircle className="h-5 w-5 text-blue-600" />
                  <label className="text-sm font-medium text-gray-700">
                    Faça uma pergunta pública:
                  </label>
                </div>
                <Textarea
                  value={question}
                  onChange={(e) => setQuestion(e.target.value)}
                  placeholder="Tem alguma dúvida sobre esta tarefa ou aula? Faça sua pergunta aqui e ela será respondida por nossos especialistas..."
                  className="min-h-[100px]"
                />
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                  <div className="flex items-start gap-2">
                    <MessageSquare className="h-4 w-4 text-blue-600 mt-0.5" />
                    <div className="text-xs text-blue-700">
                      <p className="font-medium mb-1">📢 Pergunta Pública</p>
                      <p>Sua pergunta será visível para outros usuários e será respondida por administradores especialistas em agricultura.</p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            <div className="flex gap-2">
              {!showQuestion ? (
                <Button 
                  onClick={onStartTask}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  <Wrench className="h-4 w-4 mr-2" />
                  Começar tarefa
                </Button>
              ) : (
                <Button 
                  onClick={() => {
                    // Aqui seria enviada a pergunta para o backend
                    console.log('Pergunta enviada:', question);
                    onMarkCompleted?.(question);
                  }}
                  className="bg-green-600 hover:bg-green-700"
                  disabled={!question.trim()}
                >
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Enviar pergunta e concluir
                </Button>
              )}
              
              {!showQuestion && (
                <Button 
                  variant="outline"
                  onClick={() => setShowQuestion(true)}
                  className="border-blue-200 text-blue-700 hover:bg-blue-50"
                >
                  <HelpCircle className="h-4 w-4 mr-2" />
                  Fazer pergunta
                </Button>
              )}
              
              {showQuestion && (
                <Button 
                  variant="outline"
                  onClick={() => {
                    onMarkCompleted?.("");
                  }}
                  className="border-gray-200 text-gray-700 hover:bg-green-50 hover:text-green-700 hover:border-green-300"
                >
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Concluir sem pergunta
                </Button>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}