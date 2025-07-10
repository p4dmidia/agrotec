import React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Download, Printer, X, FileText, AlertCircle, Activity, Shield, Target, MessageCircle, Mail } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import jsPDF from "jspdf";

interface DiagnosticReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  reportContent: string;
  title?: string;
}

export function DiagnosticReportModal({
  isOpen,
  onClose,
  reportContent,
  title = "Relatório de Diagnóstico"
}: DiagnosticReportModalProps) {
  const printRef = React.useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  const handlePrint = () => {
    if (printRef.current) {
      const printWindow = window.open("", "_blank");
      if (printWindow) {
        const sections = parseContent(reportContent);
        let sectionsHtml = '';
        
        sections.forEach(section => {
          sectionsHtml += `
            <div class="section">
              <div class="section-title">${section.title}</div>
              <div class="section-content">${section.content.replace(/\n/g, '<br>')}</div>
            </div>
          `;
        });
        
        printWindow.document.write(`
          <html>
            <head>
              <title>${title} - Dr. Agro</title>
              <style>
                @page {
                  margin: 2cm;
                  size: A4;
                }
                body { 
                  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                  line-height: 1.6;
                  color: #333;
                  margin: 0;
                  padding: 0;
                  background: white;
                }
                .header { 
                  background: linear-gradient(135deg, #10b981 0%, #059669 100%);
                  color: white;
                  padding: 30px 20px;
                  text-align: center;
                  margin-bottom: 30px;
                  border-radius: 8px;
                }
                .header h1 {
                  margin: 0 0 10px 0;
                  font-size: 2.5em;
                  font-weight: bold;
                }
                .header h2 {
                  margin: 0;
                  font-size: 1.2em;
                  opacity: 0.9;
                }
                .meta-info {
                  background: #f8fafc;
                  padding: 15px;
                  border-radius: 8px;
                  margin-bottom: 30px;
                  border-left: 4px solid #10b981;
                }
                .section { 
                  margin-bottom: 25px; 
                  padding: 20px;
                  background: #ffffff;
                  border-radius: 8px;
                  border: 1px solid #e2e8f0;
                  box-shadow: 0 1px 3px rgba(0,0,0,0.1);
                  page-break-inside: avoid;
                }
                .section-title { 
                  font-weight: 600;
                  color: #059669;
                  margin-bottom: 12px;
                  font-size: 1.3em;
                  padding-bottom: 8px;
                  border-bottom: 2px solid #e2e8f0;
                }
                .section-content {
                  white-space: pre-wrap;
                  line-height: 1.7;
                  color: #374151;
                }
                .footer {
                  text-align: center;
                  margin-top: 40px;
                  padding-top: 20px;
                  border-top: 2px solid #10b981;
                  font-size: 0.9em;
                  color: #64748b;
                  page-break-inside: avoid;
                }
                @media print {
                  body { margin: 0; padding: 0; }
                  .no-print { display: none !important; }
                  .header { margin-bottom: 20px; }
                  .section { margin-bottom: 15px; }
                }
              </style>
            </head>
            <body>
              <div class="header">
                <h1>🌱 Dr. Agro</h1>
                <h2>${title}</h2>
              </div>
              
              <div class="meta-info">
                <strong>Relatório gerado em:</strong> ${new Date().toLocaleString('pt-BR')}<br>
                <strong>Plataforma:</strong> Dr. Agro - Assistente Agrícola Inteligente
              </div>
              
              ${sectionsHtml}
              
              <div class="footer">
                <p><strong>Dr. Agro</strong> | Tecnologia a serviço da agricultura</p>
                <p>www.dragro.com.br | Relatório gerado automaticamente</p>
              </div>
            </body>
          </html>
        `);
        printWindow.document.close();
        printWindow.print();
        
        toast({
          title: "Preparando impressão",
          description: "A janela de impressão foi aberta com o relatório formatado.",
        });
      }
    }
  };

  const handleDownloadPDF = async () => {
    try {
      const doc = new jsPDF();
      let yPosition = 30;
      
      // Header with brand colors
      doc.setFillColor(16, 185, 129); // Green background
      doc.rect(0, 0, 210, 25, 'F');
      
      // Logo/Brand
      doc.setFontSize(24);
      doc.setTextColor(255, 255, 255);
      doc.text("🌱 Dr. Agro", 20, 18);
      
      // Subtitle
      doc.setFontSize(10);
      doc.setTextColor(255, 255, 255);
      doc.text("Assistente Agrícola Inteligente", 150, 18);
      
      yPosition = 40;
      
      // Report title
      doc.setFontSize(16);
      doc.setTextColor(55, 65, 81);
      doc.text(title, 20, yPosition);
      yPosition += 15;
      
      // Generation info
      doc.setFontSize(9);
      doc.setTextColor(100, 116, 139);
      doc.text(`Gerado em: ${new Date().toLocaleString('pt-BR')}`, 20, yPosition);
      yPosition += 15;
      
      // Line separator
      doc.setDrawColor(16, 185, 129);
      doc.setLineWidth(0.5);
      doc.line(20, yPosition, 190, yPosition);
      yPosition += 10;
      
      // Content sections
      const sections = parseContent(reportContent);
      
      sections.forEach((section) => {
        // Check if we need a new page
        if (yPosition > 250) {
          doc.addPage();
          yPosition = 30;
        }
        
        // Section title
        doc.setFontSize(12);
        doc.setTextColor(16, 185, 129);
        doc.text(section.title, 20, yPosition);
        yPosition += 8;
        
        // Section content
        doc.setFontSize(10);
        doc.setTextColor(55, 65, 81);
        const contentLines = doc.splitTextToSize(section.content, 170);
        doc.text(contentLines, 20, yPosition);
        yPosition += contentLines.length * 5 + 10;
      });
      
      // Footer on last page
      const pageCount = doc.internal.pages.length - 1;
      doc.setPage(pageCount);
      
      doc.setFontSize(8);
      doc.setTextColor(100, 116, 139);
      doc.text("Dr. Agro - Tecnologia a serviço da agricultura", 20, 285);
      doc.text(`Página ${pageCount} | www.dragro.com.br`, 150, 285);
      
      doc.save(`Dr-Agro-Diagnostico-${new Date().toISOString().split('T')[0]}.pdf`);
      
      toast({
        title: "PDF gerado com sucesso",
        description: "O relatório foi baixado com a identidade visual da plataforma.",
      });
    } catch (error) {
      console.error("Erro ao gerar PDF:", error);
      toast({
        title: "Erro ao gerar PDF",
        description: "Não foi possível gerar o arquivo PDF. Tente novamente.",
        variant: "destructive",
      });
    }
  };

  const handleWhatsAppContact = () => {
    const phoneNumber = "5511999999999"; // Número do agrônomo parceiro
    const message = encodeURIComponent(
      "Olá, recebi um diagnóstico no Dr. Agro e preciso de ajuda. Pode me orientar?"
    );
    const whatsappUrl = `https://wa.me/${phoneNumber}?text=${message}`;
    window.open(whatsappUrl, '_blank');
    
    toast({
      title: "Redirecionando para WhatsApp",
      description: "Você será direcionado para conversar com nosso agrônomo parceiro.",
    });
  };

  const handleEmailSend = async () => {
    try {
      const response = await apiRequest("POST", "/api/reports/send-email", {
        reportContent,
        title,
        timestamp: new Date().toISOString()
      });
      
      if (response.ok) {
        toast({
          title: "Email enviado com sucesso",
          description: "O relatório foi enviado para o agrônomo vinculado.",
        });
      } else {
        throw new Error("Falha ao enviar email");
      }
    } catch (error) {
      toast({
        title: "Erro ao enviar email",
        description: "Não foi possível enviar o relatório por email. Tente novamente.",
        variant: "destructive",
      });
    }
  };

  const parseContent = (content: string) => {
    if (!content || content.trim() === '') {
      return [];
    }

    const sections = [];
    const lines = content.split('\n');
    let currentSection = null;
    let currentContent = [];

    for (const line of lines) {
      const trimmed = line.trim();
      
      if (trimmed.startsWith('**') && trimmed.endsWith(':**')) {
        // Save previous section
        if (currentSection) {
          sections.push({
            title: currentSection,
            content: currentContent.join('\n').trim()
          });
        }
        
        // Start new section
        currentSection = trimmed.replace(/^\*\*/, '').replace(':**', '');
        currentContent = [];
      } else if (trimmed && currentSection) {
        currentContent.push(trimmed);
      }
    }

    // Add last section
    if (currentSection && currentContent.length > 0) {
      sections.push({
        title: currentSection,
        content: currentContent.join('\n').trim()
      });
    }

    return sections;
  };

  const getSectionIcon = (title: string) => {
    const titleLower = title.toLowerCase();
    if (titleLower.includes('diagnóstico')) return <FileText className="h-5 w-5" />;
    if (titleLower.includes('sintomas')) return <AlertCircle className="h-5 w-5" />;
    if (titleLower.includes('tratamento')) return <Activity className="h-5 w-5" />;
    if (titleLower.includes('prevenção')) return <Shield className="h-5 w-5" />;
    if (titleLower.includes('causas')) return <Target className="h-5 w-5" />;
    return <FileText className="h-5 w-5" />;
  };

  const sections = parseContent(reportContent);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="text-xl font-bold text-green-700 flex items-center gap-2">
              🌱 Dr. Agro - {title}
            </DialogTitle>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="flex items-center gap-1"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </DialogHeader>

        <div className="mt-4">
          {sections.length > 0 ? (
            <div ref={printRef} className="space-y-4">
              {sections.map((section, index) => (
                <div key={index} className="bg-gray-50 border border-gray-200 rounded-lg overflow-hidden">
                  <div className="bg-green-100 px-4 py-3 border-b border-green-200">
                    <h3 className="font-semibold text-green-800 flex items-center gap-2">
                      {getSectionIcon(section.title)}
                      {section.title}
                    </h3>
                  </div>
                  <div className="p-4">
                    <div className="text-gray-700 whitespace-pre-wrap leading-relaxed">
                      {section.content}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <FileText className="h-12 w-12 mx-auto mb-3 text-gray-300" />
              <p>Nenhum conteúdo encontrado no relatório</p>
              <p className="text-sm mt-1">O relatório pode estar vazio ou com formato incorreto</p>
            </div>
          )}

          {/* Action Buttons Section */}
          {sections.length > 0 && (
            <div className="mt-8 border-t border-gray-200 pt-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4 text-center">
                Ações do Relatório
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Button
                  onClick={handleDownloadPDF}
                  className="flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white p-4 h-auto"
                >
                  <Download className="h-5 w-5" />
                  <div className="text-left">
                    <div className="font-semibold">📄 Baixar em PDF</div>
                    <div className="text-xs opacity-90">Relatório completo com identidade visual</div>
                  </div>
                </Button>

                <Button
                  onClick={handlePrint}
                  variant="outline"
                  className="flex items-center justify-center gap-2 border-gray-300 hover:bg-gray-50 p-4 h-auto"
                >
                  <Printer className="h-5 w-5" />
                  <div className="text-left">
                    <div className="font-semibold">🖨️ Imprimir Relatório</div>
                    <div className="text-xs text-gray-600">Impressão via navegador</div>
                  </div>
                </Button>

                <Button
                  onClick={handleWhatsAppContact}
                  className="flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 text-white p-4 h-auto"
                >
                  <MessageCircle className="h-5 w-5" />
                  <div className="text-left">
                    <div className="font-semibold">💬 Falar com Agrônomo</div>
                    <div className="text-xs opacity-90">WhatsApp com especialista</div>
                  </div>
                </Button>

                <Button
                  onClick={handleEmailSend}
                  variant="outline"
                  className="flex items-center justify-center gap-2 border-orange-300 hover:bg-orange-50 text-orange-700 p-4 h-auto"
                >
                  <Mail className="h-5 w-5" />
                  <div className="text-left">
                    <div className="font-semibold">📧 Enviar por E-mail</div>
                    <div className="text-xs">Para agrônomo vinculado</div>
                  </div>
                </Button>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}