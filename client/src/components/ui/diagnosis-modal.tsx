import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  FileText, 
  Printer, 
  MessageCircle, 
  Mail,
  Microscope,
  AlertTriangle,
  CheckCircle,
  Shield,
  Eye,
  Clock
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import jsPDF from 'jspdf';

interface DiagnosisModalProps {
  isOpen: boolean;
  onClose: () => void;
  diagnosis: string;
  producer: string;
}

export function DiagnosisModal({ isOpen, onClose, diagnosis, producer }: DiagnosisModalProps) {
  const { toast } = useToast();
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);

  // Parse o diagnóstico em seções
  const parseDiagnosis = (text: string) => {
    const sections = {
      diagnostico: "",
      descricao: "",
      sintomas: [] as string[],
      tratamento: [] as string[],
      prevencao: [] as string[],
      causas: [] as string[],
      observacoes: [] as string[]
    };

    const lines = text.split('\n');
    let currentSection = '';

    lines.forEach(line => {
      const trimmed = line.trim();
      if (trimmed.includes('**Diagnóstico Provável:**')) {
        currentSection = 'diagnostico';
      } else if (trimmed.includes('**Descrição:**')) {
        currentSection = 'descricao';
      } else if (trimmed.includes('**Sintomas Identificados:**')) {
        currentSection = 'sintomas';
      } else if (trimmed.includes('**Tratamento Recomendado:**')) {
        currentSection = 'tratamento';
      } else if (trimmed.includes('**Prevenção:**')) {
        currentSection = 'prevencao';
      } else if (trimmed.includes('**Causas Prováveis:**')) {
        currentSection = 'causas';
      } else if (trimmed.includes('**Observações Adicionais:**')) {
        currentSection = 'observacoes';
      } else if (trimmed && !trimmed.startsWith('**')) {
        if (trimmed.startsWith('*')) {
          const item = trimmed.replace(/^\*\s*/, '');
          if (currentSection === 'sintomas') sections.sintomas.push(item);
          else if (currentSection === 'tratamento') sections.tratamento.push(item);
          else if (currentSection === 'prevencao') sections.prevencao.push(item);
          else if (currentSection === 'causas') sections.causas.push(item);
          else if (currentSection === 'observacoes') sections.observacoes.push(item);
        } else {
          if (currentSection === 'diagnostico') sections.diagnostico = trimmed;
          else if (currentSection === 'descricao') sections.descricao = trimmed;
        }
      }
    });

    return sections;
  };

  const sections = parseDiagnosis(diagnosis);

  const handleDownloadPDF = async () => {
    setIsGeneratingPDF(true);
    try {
      // Criar documento PDF
      const doc = new jsPDF();
      const pageWidth = doc.internal.pageSize.width;
      const margin = 20;
      const contentWidth = pageWidth - (margin * 2);
      
      // Cores
      const primaryGreen = [34, 197, 94] as const; // #22c55e
      const darkGreen = [22, 163, 74] as const; // #16a34a
      const lightGray = [107, 114, 128] as const; // #6b7280
      
      // Cabeçalho com fundo verde
      doc.setFillColor(34, 197, 94);
      doc.rect(0, 0, pageWidth, 35, 'F');
      
      // Título principal
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(22);
      doc.setFont('helvetica', 'bold');
      doc.text('Dr. Agro - Diagnostico Agricola', margin, 20);
      
      // Informações do cabeçalho
      doc.setFontSize(11);
      doc.setFont('helvetica', 'normal');
      doc.text(`Produtor: ${producer}`, margin, 28);
      doc.text(`Data: ${new Date().toLocaleDateString('pt-BR')}`, pageWidth - margin - 40, 28);
      
      let yPos = 50;
      
      // Função para adicionar seção
      const addSection = (title: string, icon: string, content: string | string[], isArray = false) => {
        // Verificar se precisa de nova página
        if (yPos > 250) {
          doc.addPage();
          yPos = 30;
        }
        
        // Título da seção com fundo
        doc.setFillColor(240, 253, 244); // #f0fdf4
        doc.rect(margin, yPos - 3, contentWidth, 12, 'F');
        
        // Borda esquerda verde
        doc.setFillColor(34, 197, 94);
        doc.rect(margin, yPos - 3, 4, 12, 'F');
        
        // Texto do título
        doc.setTextColor(22, 163, 74);
        doc.setFontSize(13);
        doc.setFont('helvetica', 'bold');
        doc.text(`${icon} ${title}`, margin + 8, yPos + 4);
        
        yPos += 18;
        
        // Conteúdo
        doc.setTextColor(51, 51, 51); // #333
        doc.setFontSize(11);
        doc.setFont('helvetica', 'normal');
        
        if (isArray && Array.isArray(content)) {
          content.forEach(item => {
            const lines = doc.splitTextToSize(`• ${item}`, contentWidth - 10);
            lines.forEach((line: string) => {
              if (yPos > 270) {
                doc.addPage();
                yPos = 30;
              }
              doc.text(line, margin + 10, yPos);
              yPos += 6;
            });
          });
        } else if (typeof content === 'string') {
          const lines = doc.splitTextToSize(content, contentWidth - 10);
          lines.forEach((line: string) => {
            if (yPos > 270) {
              doc.addPage();
              yPos = 30;
            }
            doc.text(line, margin + 10, yPos);
            yPos += 6;
          });
        }
        
        yPos += 8;
      };
      
      // Adicionar seções
      if (sections.diagnostico) {
        addSection('DIAGNOSTICO PROVAVEL', '•', sections.diagnostico);
      }
      
      if (sections.descricao) {
        addSection('DESCRICAO', '•', sections.descricao);
      }
      
      if (sections.sintomas.length > 0) {
        addSection('SINTOMAS IDENTIFICADOS', '•', sections.sintomas, true);
      }
      
      if (sections.tratamento.length > 0) {
        addSection('TRATAMENTO RECOMENDADO', '•', sections.tratamento, true);
      }
      
      if (sections.prevencao.length > 0) {
        addSection('PREVENCAO', '•', sections.prevencao, true);
      }
      
      if (sections.causas.length > 0) {
        addSection('CAUSAS PROVAVEIS', '•', sections.causas, true);
      }
      
      if (sections.observacoes.length > 0) {
        addSection('OBSERVACOES ADICIONAIS', '•', sections.observacoes, true);
      }
      
      // Rodapé
      const pageCount = doc.getNumberOfPages();
      for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        
        // Linha separadora
        doc.setDrawColor(107, 114, 128);
        doc.line(margin, doc.internal.pageSize.height - 25, pageWidth - margin, doc.internal.pageSize.height - 25);
        
        // Texto do rodapé
        doc.setTextColor(107, 114, 128);
        doc.setFontSize(9);
        doc.setFont('helvetica', 'normal');
        doc.text('Dr. Agro - Inteligência Artificial Agrícola', margin, doc.internal.pageSize.height - 15);
        doc.text('Este relatório foi gerado automaticamente pela IA', margin, doc.internal.pageSize.height - 8);
        
        // Numeração da página
        doc.text(`Página ${i} de ${pageCount}`, pageWidth - margin - 30, doc.internal.pageSize.height - 8);
      }
      
      // Salvar o PDF
      const fileName = `diagnostico-${producer.replace(/\s+/g, '-')}-${new Date().toISOString().split('T')[0]}.pdf`;
      doc.save(fileName);
      
      toast({
        title: "PDF Gerado",
        description: "Relatório de diagnóstico baixado com sucesso!",
      });
    } catch (error) {
      console.error('Erro ao gerar PDF:', error);
      toast({
        title: "Erro",
        description: "Não foi possível gerar o PDF.",
        variant: "destructive",
      });
    } finally {
      setIsGeneratingPDF(false);
    }
  };

  const handlePrint = () => {
    // Criar janela de impressão com o conteúdo formatado
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    const printContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Diagnóstico Agrícola - ${producer}</title>
          <style>
            body {
              font-family: Arial, sans-serif;
              line-height: 1.6;
              margin: 40px;
              color: #333;
            }
            .header {
              text-align: center;
              border-bottom: 3px solid #22c55e;
              padding-bottom: 20px;
              margin-bottom: 30px;
            }
            .header h1 {
              color: #16a34a;
              margin: 0;
              font-size: 28px;
            }
            .header p {
              color: #6b7280;
              margin: 5px 0;
            }
            .section {
              margin-bottom: 25px;
              page-break-inside: avoid;
            }
            .section-title {
              background: #f0fdf4;
              padding: 10px 15px;
              border-left: 4px solid #22c55e;
              font-weight: bold;
              font-size: 16px;
              color: #16a34a;
              margin-bottom: 10px;
            }
            .section-content {
              padding: 0 15px;
            }
            .list-item {
              margin: 8px 0;
              padding-left: 20px;
              position: relative;
            }
            .list-item:before {
              content: "•";
              color: #22c55e;
              font-weight: bold;
              position: absolute;
              left: 0;
            }
            .footer {
              margin-top: 40px;
              text-align: center;
              font-size: 12px;
              color: #6b7280;
              border-top: 1px solid #e5e7eb;
              padding-top: 20px;
            }
            @media print {
              body { margin: 20px; }
              .section { page-break-inside: avoid; }
            }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>🌱 Dr. Agro - Relatório de Diagnóstico</h1>
            <p><strong>Produtor:</strong> ${producer}</p>
            <p><strong>Data:</strong> ${new Date().toLocaleDateString('pt-BR')}</p>
          </div>

          ${sections.diagnostico ? `
            <div class="section">
              <div class="section-title">🔬 Diagnóstico Provável</div>
              <div class="section-content">${sections.diagnostico}</div>
            </div>
          ` : ''}

          ${sections.descricao ? `
            <div class="section">
              <div class="section-title">📋 Descrição</div>
              <div class="section-content">${sections.descricao}</div>
            </div>
          ` : ''}

          ${sections.sintomas.length > 0 ? `
            <div class="section">
              <div class="section-title">⚠️ Sintomas Identificados</div>
              <div class="section-content">
                ${sections.sintomas.map(sintoma => `<div class="list-item">${sintoma}</div>`).join('')}
              </div>
            </div>
          ` : ''}

          ${sections.tratamento.length > 0 ? `
            <div class="section">
              <div class="section-title">💊 Tratamento Recomendado</div>
              <div class="section-content">
                ${sections.tratamento.map(tratamento => `<div class="list-item">${tratamento}</div>`).join('')}
              </div>
            </div>
          ` : ''}

          ${sections.prevencao.length > 0 ? `
            <div class="section">
              <div class="section-title">🛡️ Prevenção</div>
              <div class="section-content">
                ${sections.prevencao.map(prevencao => `<div class="list-item">${prevencao}</div>`).join('')}
              </div>
            </div>
          ` : ''}

          ${sections.causas.length > 0 ? `
            <div class="section">
              <div class="section-title">🔍 Causas Prováveis</div>
              <div class="section-content">
                ${sections.causas.map(causa => `<div class="list-item">${causa}</div>`).join('')}
              </div>
            </div>
          ` : ''}

          ${sections.observacoes.length > 0 ? `
            <div class="section">
              <div class="section-title">📝 Observações Adicionais</div>
              <div class="section-content">
                ${sections.observacoes.map(obs => `<div class="list-item">${obs}</div>`).join('')}
              </div>
            </div>
          ` : ''}

          <div class="footer">
            <p><strong>Dr. Agro</strong> - Inteligência Artificial Agrícola</p>
            <p>Este relatório foi gerado automaticamente pela IA</p>
          </div>
        </body>
      </html>
    `;

    printWindow.document.write(printContent);
    printWindow.document.close();
    
    // Aguardar carregamento e imprimir
    printWindow.onload = () => {
      printWindow.print();
      printWindow.close();
    };

    toast({
      title: "Imprimindo",
      description: "Abrindo janela de impressão...",
    });
  };

  const handleWhatsApp = () => {
    const message = `Diagnóstico Agrícola - Dr. Agro\n\n*Produtor:* ${producer}\n*Diagnóstico:* ${sections.diagnostico}\n\nPreciso de orientação sobre este caso. Podemos conversar?`;
    window.open(`https://wa.me/?text=${encodeURIComponent(message)}`, '_blank');
  };

  const handleEmail = () => {
    const subject = `Diagnóstico Agrícola - ${sections.diagnostico}`;
    const body = `Diagnóstico realizado pelo Dr. Agro\n\nProdutor: ${producer}\nDiagnóstico: ${sections.diagnostico}\n\nDetalhes completos:\n${diagnosis}`;
    window.open(`mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`, '_blank');
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] p-0">
        <DialogHeader className="px-6 py-4 border-b bg-gradient-to-r from-green-50 to-green-100">
          <DialogTitle className="flex items-center gap-3 text-xl font-bold text-green-800">
            <Microscope className="h-6 w-6" />
            Diagnóstico Agrícola Completo
          </DialogTitle>
          <p className="text-sm text-green-600 mt-1">
            Relatório técnico gerado para {producer}
          </p>
        </DialogHeader>

        <ScrollArea className="flex-1 px-6 py-4 max-h-[calc(90vh-180px)]">
          <div className="space-y-6">
            {/* Diagnóstico Principal */}
            <div className="bg-gradient-to-r from-red-50 to-orange-50 border border-red-200 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <AlertTriangle className="h-5 w-5 text-red-600" />
                <h3 className="font-semibold text-red-800">Diagnóstico Provável</h3>
              </div>
              <p className="text-red-700 font-medium text-lg">{sections.diagnostico}</p>
              {sections.descricao && (
                <p className="text-red-600 mt-2 text-sm">{sections.descricao}</p>
              )}
            </div>

            {/* Sintomas */}
            {sections.sintomas.length > 0 && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-3">
                  <Eye className="h-5 w-5 text-yellow-600" />
                  <h3 className="font-semibold text-yellow-800">Sintomas Identificados</h3>
                </div>
                <ul className="space-y-2">
                  {sections.sintomas.map((sintoma, index) => (
                    <li key={index} className="flex items-start gap-2 text-yellow-700">
                      <Badge variant="outline" className="mt-0.5 text-xs border-yellow-300">
                        {index + 1}
                      </Badge>
                      <span className="text-sm">{sintoma}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Tratamento */}
            {sections.tratamento.length > 0 && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-3">
                  <CheckCircle className="h-5 w-5 text-blue-600" />
                  <h3 className="font-semibold text-blue-800">Tratamento Recomendado</h3>
                </div>
                <ul className="space-y-2">
                  {sections.tratamento.map((tratamento, index) => (
                    <li key={index} className="flex items-start gap-2 text-blue-700">
                      <Badge variant="outline" className="mt-0.5 text-xs border-blue-300">
                        {index + 1}
                      </Badge>
                      <span className="text-sm">{tratamento}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Prevenção */}
            {sections.prevencao.length > 0 && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-3">
                  <Shield className="h-5 w-5 text-green-600" />
                  <h3 className="font-semibold text-green-800">Medidas Preventivas</h3>
                </div>
                <ul className="space-y-2">
                  {sections.prevencao.map((prevencao, index) => (
                    <li key={index} className="flex items-start gap-2 text-green-700">
                      <Badge variant="outline" className="mt-0.5 text-xs border-green-300">
                        {index + 1}
                      </Badge>
                      <span className="text-sm">{prevencao}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Causas */}
            {sections.causas.length > 0 && (
              <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-3">
                  <AlertTriangle className="h-5 w-5 text-purple-600" />
                  <h3 className="font-semibold text-purple-800">Causas Prováveis</h3>
                </div>
                <ul className="space-y-2">
                  {sections.causas.map((causa, index) => (
                    <li key={index} className="flex items-start gap-2 text-purple-700">
                      <Badge variant="outline" className="mt-0.5 text-xs border-purple-300">
                        {index + 1}
                      </Badge>
                      <span className="text-sm">{causa}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Observações */}
            {sections.observacoes.length > 0 && (
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-3">
                  <Clock className="h-5 w-5 text-gray-600" />
                  <h3 className="font-semibold text-gray-800">Observações Adicionais</h3>
                </div>
                <ul className="space-y-2">
                  {sections.observacoes.map((observacao, index) => (
                    <li key={index} className="flex items-start gap-2 text-gray-700">
                      <Badge variant="outline" className="mt-0.5 text-xs border-gray-300">
                        {index + 1}
                      </Badge>
                      <span className="text-sm">{observacao}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </ScrollArea>

        <Separator />

        {/* Ações */}
        <div className="px-6 py-4 bg-gray-50">
          <div className="flex flex-wrap gap-2 justify-center">
            <Button
              onClick={handleDownloadPDF}
              disabled={isGeneratingPDF}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              <FileText className="h-4 w-4 mr-2" />
              {isGeneratingPDF ? "Gerando PDF..." : "Baixar PDF"}
            </Button>

            <Button
              onClick={handlePrint}
              variant="outline"
              className="border-gray-300 hover:bg-blue-50 hover:text-blue-700 transition-colors"
            >
              <Printer className="h-4 w-4 mr-2" />
              Imprimir
            </Button>

            <Button
              onClick={handleWhatsApp}
              className="bg-green-600 hover:bg-green-700 text-white"
            >
              <MessageCircle className="h-4 w-4 mr-2" />
              Falar com Agrônomo
            </Button>

            <Button
              onClick={handleEmail}
              variant="outline"
              className="border-blue-300 hover:bg-blue-50 hover:text-blue-700 text-gray-700 transition-colors"
            >
              <Mail className="h-4 w-4 mr-2" />
              Enviar por Email
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}