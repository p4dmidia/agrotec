import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Microscope, FileText, Sparkles } from "lucide-react";
import { DiagnosisModal } from "./diagnosis-modal";

interface DiagnosisSummaryProps {
  summary: string;
  fullDiagnosis: string;
  producer: string;
}

export function DiagnosisSummary({ summary, fullDiagnosis, producer }: DiagnosisSummaryProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <>
      <Card className="max-w-2xl bg-gradient-to-br from-green-50 to-blue-50 border-green-200 shadow-lg">
        <CardContent className="p-5">
          {/* Cabeçalho */}
          <div className="flex items-center gap-3 mb-4">
            <div className="flex items-center justify-center w-10 h-10 bg-green-100 rounded-full">
              <Microscope className="h-5 w-5 text-green-600" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-semibold text-green-800">Dr. Agro</h3>
                <Badge variant="secondary" className="bg-green-100 text-green-700 border-green-300">
                  <Sparkles className="h-3 w-3 mr-1" />
                  Diagnóstico IA
                </Badge>
              </div>
              <p className="text-sm text-green-600">Análise de imagem concluída</p>
            </div>
          </div>

          {/* Resumo */}
          <div className="bg-white/70 rounded-lg p-4 mb-4 border border-green-100">
            <div className="prose prose-sm max-w-none">
              <div 
                className="text-gray-700 leading-relaxed"
                dangerouslySetInnerHTML={{ 
                  __html: summary.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>') 
                }}
              />
            </div>
          </div>

          {/* Botão para modal */}
          <div className="flex justify-center">
            <Button
              onClick={() => setIsModalOpen(true)}
              className="bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white shadow-md hover:shadow-lg transition-all duration-200 transform hover:scale-105"
              size="lg"
            >
              <FileText className="h-4 w-4 mr-2" />
              Ver Diagnóstico Completo
            </Button>
          </div>

          {/* Rodapé */}
          <div className="mt-4 pt-3 border-t border-green-200">
            <p className="text-xs text-green-600 text-center">
              Relatório técnico disponível com recomendações detalhadas de tratamento
            </p>
          </div>
        </CardContent>
      </Card>

      <DiagnosisModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        diagnosis={fullDiagnosis}
        producer={producer}
      />
    </>
  );
}