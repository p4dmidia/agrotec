import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { FileText, Download, User, Leaf, AlertTriangle, CheckCircle, ShieldCheck, Printer, Mail, MessageCircle } from "lucide-react";
import jsPDF from 'jspdf';

interface DiagnosticReportModalProps {
  reportContent: string;
  summary: string;
}

// Function to format report content to HTML for printing/download
function formatReportToHTML(content: string): string {
  let html = '';
  
  // Split content into paragraphs
  const paragraphs = content.split('\n\n');
  
  paragraphs.forEach(paragraph => {
    const lines = paragraph.trim().split('\n');
    
    if (lines.length === 0) return;
    
    const firstLine = lines[0];
    
    // Check if it's a title with **
    if (firstLine.includes('**') && firstLine.includes(':')) {
      const title = firstLine.replace(/\*\*/g, '').replace(':', '').trim();
      const restContent = lines.slice(1).join('\n');
      
      html += `<div class="section">`;
      html += `<h3>${title}</h3>`;
      
      if (restContent.trim()) {
        // Check if content has bullet points
        if (restContent.includes('*')) {
          const bulletLines = restContent.split('\n');
          let inList = false;
          
          bulletLines.forEach(line => {
            if (line.trim().startsWith('*')) {
              if (!inList) {
                html += '<ul>';
                inList = true;
              }
              html += `<li>${line.replace(/^\*/, '').trim()}</li>`;
            } else if (line.trim()) {
              if (inList) {
                html += '</ul>';
                inList = false;
              }
              html += `<p>${line.trim()}</p>`;
            }
          });
          
          if (inList) {
            html += '</ul>';
          }
        } else {
          // Regular paragraph content
          html += `<p>${restContent.trim()}</p>`;
        }
      }
      
      html += `</div>`;
    } else if (firstLine.includes('📄') || firstLine.includes('RELATÓRIO')) {
      // Header section
      html += `<div class="section">`;
      html += `<h2>${firstLine.replace(/📄/g, '').trim()}</h2>`;
      html += `</div>`;
    } else if (paragraph.trim()) {
      // Regular content
      html += `<div class="section">`;
      html += `<p>${paragraph.trim()}</p>`;
      html += `</div>`;
    }
  });
  
  return html;
}



// Function to parse and format report sections
function formatReportSections(content: string) {
  const sections = content.split('\n\n');
  const parsedSections: any[] = [];
  
  let currentSection: any = null;
  
  sections.forEach((section, index) => {
    const lines = section.trim().split('\n');
    const firstLine = lines[0];
    
    // Header section
    if (firstLine.includes('RELATÓRIO DE DIAGNÓSTICO')) {
      parsedSections.push({
        type: 'header',
        content: firstLine.replace(/[📄*]/g, '').trim()
      });
    }
    // Field sections (Nome do Produtor, Cultura, etc.)
    else if (firstLine.includes('**') && firstLine.includes(':')) {
      const title = firstLine.replace(/\*\*/g, '').replace(':', '').trim();
      const content = lines.slice(1).join('\n').trim();
      
      let icon = FileText;
      let color = "bg-gray-50 border-gray-200";
      
      if (title.toLowerCase().includes('produtor')) {
        icon = User;
        color = "bg-blue-50 border-blue-200";
      } else if (title.toLowerCase().includes('cultura')) {
        icon = Leaf;
        color = "bg-green-50 border-green-200";
      } else if (title.toLowerCase().includes('diagnóstico')) {
        icon = AlertTriangle;
        color = "bg-red-50 border-red-200";
      } else if (title.toLowerCase().includes('tratamento') || title.toLowerCase().includes('recomend')) {
        icon = CheckCircle;
        color = "bg-emerald-50 border-emerald-200";
      } else if (title.toLowerCase().includes('preventiv')) {
        icon = ShieldCheck;
        color = "bg-purple-50 border-purple-200";
      }
      
      parsedSections.push({
        type: 'field',
        title,
        content,
        icon,
        color
      });
    }
    // List sections (starting with *)
    else if (section.includes('*') && !section.includes('**')) {
      const items = lines.filter(line => line.trim().startsWith('*')).map(line => 
        line.replace(/^\*/, '').trim()
      );
      
      if (currentSection && currentSection.type === 'field') {
        currentSection.items = items;
      }
    }
  });
  
  return parsedSections.map((section, index) => {
    if (section.type === 'header') {
      return (
        <div key={index} className="text-center pb-6 border-b border-gray-200 print:border-gray-400">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="w-12 h-12 bg-green-600 rounded-full flex items-center justify-center">
              <FileText className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-100 print:text-black">
                {section.content}
              </h1>
              <p className="text-sm text-gray-500 print:text-gray-600">
                Gerado em {new Date().toLocaleString('pt-BR')}
              </p>
            </div>
          </div>
        </div>
      );
    }
    
    if (section.type === 'field') {
      const IconComponent = section.icon;
      return (
        <div key={index} className={`${section.color} dark:bg-gray-800 dark:border-gray-600 p-4 rounded-lg border print:break-inside-avoid`}>
          <div className="flex items-start gap-3">
            <div className="mt-1">
              <IconComponent className="h-5 w-5 text-gray-600 dark:text-gray-300 print:text-gray-700" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-gray-800 dark:text-gray-100 print:text-black mb-2">
                {section.title}
              </h3>
              <div className="text-gray-700 dark:text-gray-200 print:text-gray-800 text-sm leading-relaxed">
                {section.content.split('\n').map((line: string, lineIndex: number) => {
                  if (line.trim().startsWith('*')) {
                    return (
                      <div key={lineIndex} className="flex items-start gap-2 mb-1">
                        <span className="text-green-600 print:text-green-700 mt-1">•</span>
                        <span>{line.replace(/^\*/, '').trim()}</span>
                      </div>
                    );
                  }
                  return line && (
                    <p key={lineIndex} className="mb-2 last:mb-0">
                      {line}
                    </p>
                  );
                })}
                {section.items && (
                  <div className="mt-3 space-y-1">
                    {section.items.map((item: string, itemIndex: number) => (
                      <div key={itemIndex} className="flex items-start gap-2">
                        <span className="text-green-600 print:text-green-700 mt-1">•</span>
                        <span>{item}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      );
    }
    
    return null;
  });
}

export function DiagnosticReportModal({ reportContent, summary }: DiagnosticReportModalProps) {
  const [isOpen, setIsOpen] = useState(false);

  // Function to render simple report similar to the image
  const renderSimpleReport = (content: string) => {
    const rendered: JSX.Element[] = [];
    
    // Add header
    rendered.push(
      <div key="header" className="border-l-4 border-orange-500 pl-4 mb-6">
        <div className="flex justify-between items-start">
          <h1 className="text-lg font-semibold text-gray-800 dark:text-gray-100">
            Diagnóstico: {extractDiagnosisTitle(content)}
          </h1>
          <div className="text-sm text-orange-600 font-medium">
            95% de confiança
          </div>
        </div>
      </div>
    );
    
    // Add description if exists
    const descriptionMatch = content.match(/doença fungica causada por[^.]*\./i);
    if (descriptionMatch) {
      rendered.push(
        <div key="description" className="mb-4">
          <p className="text-gray-700 dark:text-gray-300 text-sm leading-relaxed">
            {descriptionMatch[0]}
          </p>
        </div>
      );
    }
    
    // Process sections
    const sections = content.split('\n\n');
    
    sections.forEach((section, index) => {
      const lines = section.trim().split('\n');
      if (lines.length === 0) return;
      
      const firstLine = lines[0];
      
      // Section titles with **
      if (firstLine.includes('**') && firstLine.includes(':')) {
        const sectionTitle = firstLine.replace(/\*\*/g, '').replace(':', '').trim();
        const contentLines = lines.slice(1);
        
        // Get bullet points
        const bulletPoints = contentLines
          .filter(line => line.trim().startsWith('*'))
          .map(line => line.replace(/^\*/, '').trim())
          .filter(point => point.length > 0);
        
        if (bulletPoints.length > 0) {
          rendered.push(
            <div key={`section-${index}`} className="mb-6">
              <h3 className="text-gray-800 dark:text-gray-100 font-semibold mb-3">
                {getSectionTitle(sectionTitle)}:
              </h3>
              <ul className="space-y-2">
                {bulletPoints.map((point, pointIndex) => (
                  <li key={pointIndex} className="flex items-start gap-3">
                    <div className={`w-2 h-2 rounded-full mt-2 ${getSectionColor(sectionTitle)}`}></div>
                    <span className="text-gray-700 dark:text-gray-300 text-sm leading-relaxed">
                      {point}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          );
        }
      }
    });
    
    return rendered;
  };

  // Helper functions
  const extractDiagnosisTitle = (content: string): string => {
    // Try to extract diagnosis from content
    const diagnosisMatch = content.match(/diagnóstico[^:]*:\s*([^.\n]+)/i);
    if (diagnosisMatch) {
      return diagnosisMatch[1].trim();
    }
    return 'Análise Agrícola';
  };

  const getSectionTitle = (title: string): string => {
    const lowerTitle = title.toLowerCase();
    if (lowerTitle.includes('sintoma')) return 'Sintomas identificados';
    if (lowerTitle.includes('tratamento') || lowerTitle.includes('recomend')) return 'Tratamento recomendado';
    if (lowerTitle.includes('preventiv') || lowerTitle.includes('prevenção')) return 'Prevenção';
    if (lowerTitle.includes('causa')) return 'Causas identificadas';
    return title;
  };

  const getSectionColor = (title: string): string => {
    const lowerTitle = title.toLowerCase();
    if (lowerTitle.includes('sintoma')) return 'bg-orange-500';
    if (lowerTitle.includes('tratamento') || lowerTitle.includes('recomend')) return 'bg-green-500';
    if (lowerTitle.includes('preventiv') || lowerTitle.includes('prevenção')) return 'bg-blue-500';
    if (lowerTitle.includes('causa')) return 'bg-red-500';
    return 'bg-gray-500';
  };

  const handleDownloadReport = async () => {
    const pdf = new jsPDF();
    const pageWidth = pdf.internal.pageSize.width;
    const pageHeight = pdf.internal.pageSize.height;
    const margin = 20;
    const lineHeight = 7;
    let y = margin;

    // Helper function to check if we need a new page
    const checkNewPage = (additionalHeight = 0) => {
      if (y + additionalHeight > pageHeight - margin) {
        pdf.addPage();
        y = margin;
        return true;
      }
      return false;
    };

    // Helper function to add text with word wrap
    const addText = (text: string, x: number, fontSize = 12, maxWidth?: number) => {
      pdf.setFontSize(fontSize);
      const width = maxWidth || pageWidth - 2 * margin;
      const lines = pdf.splitTextToSize(text, width);
      
      lines.forEach((line: string) => {
        checkNewPage(lineHeight);
        pdf.text(line, x, y);
        y += lineHeight;
      });
    };

    // Title
    pdf.setFontSize(20);
    pdf.setTextColor(22, 163, 74); // Green color
    pdf.text('Relatório de Diagnóstico Agrícola', pageWidth / 2, y, { align: 'center' });
    y += 15;

    // Date
    pdf.setFontSize(10);
    pdf.setTextColor(102, 102, 102);
    pdf.text(`Gerado em ${new Date().toLocaleString('pt-BR')}`, pageWidth / 2, y, { align: 'center' });
    y += 20;

    // Reset color for content
    pdf.setTextColor(0, 0, 0);

    // Parse and add content
    const sections = reportContent.split('\n\n');
    
    sections.forEach((section) => {
      const lines = section.trim().split('\n');
      if (lines.length === 0) return;
      
      const firstLine = lines[0];
      
      // Skip the main header as we already added it
      if (firstLine.includes('📄') || firstLine.includes('RELATÓRIO DE DIAGNÓSTICO')) {
        return;
      }
      
      // Section titles
      if (firstLine.includes('**') && firstLine.includes(':')) {
        const title = firstLine.replace(/\*\*/g, '').replace(':', '').trim();
        
        checkNewPage(15);
        pdf.setFontSize(14);
        pdf.setTextColor(22, 163, 74);
        pdf.text(title, margin, y);
        y += 10;
        
        // Section content
        pdf.setTextColor(0, 0, 0);
        const content = lines.slice(1).join('\n').trim();
        
        if (content) {
          // Handle bullet points
          const contentLines = content.split('\n');
          contentLines.forEach((line) => {
            if (line.trim().startsWith('*')) {
              const bulletText = '• ' + line.replace(/^\*/, '').trim();
              addText(bulletText, margin + 5, 11);
            } else if (line.trim()) {
              addText(line.trim(), margin, 11);
            }
          });
        }
        
        y += 5; // Extra spacing after section
      }
      // Regular content
      else if (section.trim()) {
        addText(section.trim(), margin, 11);
        y += 5;
      }
    });

    // Save the PDF
    const fileName = `diagnostico-dr-agro-${new Date().toLocaleDateString('pt-BR').replace(/\//g, '-')}.pdf`;
    pdf.save(fileName);
  };

  const handleEmailReport = () => {
    const subject = "Relatório de Diagnóstico Agrícola - Dr. Agro";
    const body = `Olá,

Segue em anexo o relatório de diagnóstico agrícola gerado pelo Dr. Agro.

${reportContent}

Atenciosamente,
Dr. Agro - Plataforma Agrícola Inteligente`;
    
    const mailto = `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    window.open(mailto, '_blank');
  };

  const handleWhatsAppAgronomist = () => {
    const phoneNumber = "5511999999999"; // Número do agrônomo
    const message = `Olá! Preciso de ajuda com o seguinte diagnóstico agrícola:

${extractDiagnosisTitle(reportContent)}

Relatório completo gerado pelo Dr. Agro:
${reportContent}

Poderia me auxiliar com mais informações?`;
    
    const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
  };

  const handlePrintReport = () => {
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      // Generate HTML with the new simple layout
      let sectionsHTML = '';
      
      // Add description if exists
      const descriptionMatch = reportContent.match(/doença fungica causada por[^.]*\./i);
      if (descriptionMatch) {
        sectionsHTML += `
          <div style="margin-bottom: 20px;">
            <p style="color: #4b5563; line-height: 1.6; margin: 0; font-size: 14px;">
              ${descriptionMatch[0]}
            </p>
          </div>
        `;
      }
      
      // Process sections
      const sections = reportContent.split('\n\n');
      
      sections.forEach(section => {
        const lines = section.trim().split('\n');
        if (lines.length === 0) return;
        
        const firstLine = lines[0];
        
        if (firstLine.includes('**') && firstLine.includes(':')) {
          const sectionTitle = firstLine.replace(/\*\*/g, '').replace(':', '').trim();
          const contentLines = lines.slice(1);
          
          const bulletPoints = contentLines
            .filter(line => line.trim().startsWith('*'))
            .map(line => line.replace(/^\*/, '').trim())
            .filter(point => point.length > 0);
          
          if (bulletPoints.length > 0) {
            const color = getSectionColor(sectionTitle);
            sectionsHTML += `
              <div style="margin-bottom: 24px;">
                <h3 style="color: #1f2937; font-weight: 600; margin-bottom: 12px; font-size: 16px;">
                  ${getSectionTitle(sectionTitle)}:
                </h3>
                <ul style="list-style: none; padding: 0; margin: 0;">
                  ${bulletPoints.map(point => `
                    <li style="display: flex; align-items: flex-start; gap: 12px; margin-bottom: 8px;">
                      <div style="width: 8px; height: 8px; border-radius: 50%; background-color: ${color}; margin-top: 8px; flex-shrink: 0;"></div>
                      <span style="color: #4b5563; font-size: 14px; line-height: 1.6;">
                        ${point}
                      </span>
                    </li>
                  `).join('')}
                </ul>
              </div>
            `;
          }
        }
      });
      
      const htmlContent = `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="UTF-8">
          <title>Relatório de Diagnóstico - Dr. Agro</title>
          <style>
            body { 
              font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; 
              line-height: 1.6; 
              color: #333; 
              max-width: 800px; 
              margin: 0 auto; 
              padding: 20px; 
            }
            @media print {
              body { margin: 0; padding: 20px; }
            }
          </style>
        </head>
        <body>
          <!-- Header similar to modal -->
          <div style="border-left: 4px solid #f97316; padding-left: 16px; margin-bottom: 24px;">
            <div style="display: flex; justify-content: space-between; align-items: flex-start;">
              <h1 style="font-size: 18px; font-weight: 600; color: #1f2937; margin: 0;">
                Diagnóstico: ${extractDiagnosisTitle(reportContent)}
              </h1>
              <div style="font-size: 14px; color: #f97316; font-weight: 500;">
                95% de confiança
              </div>
            </div>
          </div>
          
          <!-- Content -->
          <div>
            ${sectionsHTML}
          </div>
          
          <!-- Generation date -->
          <div style="margin-top: 40px; padding-top: 20px; border-top: 1px solid #e5e7eb; text-align: center; color: #6b7280; font-size: 12px;">
            Gerado em ${new Date().toLocaleString('pt-BR')}
          </div>
        </body>
        </html>
      `;
      
      printWindow.document.write(htmlContent);
      printWindow.document.close();
      printWindow.focus();
      printWindow.print();
      printWindow.close();
    }
  };

  return (
    <div className="flex flex-wrap gap-2">
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogTrigger asChild>
          <Button 
            variant="default" 
            size="sm"
            className="bg-green-600 hover:bg-green-700 text-white"
          >
            <FileText className="h-4 w-4 mr-2" />
            Ver Relatório Completo
          </Button>
        </DialogTrigger>
        <DialogContent className="max-w-4xl max-h-[80vh] w-[95vw]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-green-600" />
              Relatório de Diagnóstico - Dr. Agro
            </DialogTitle>
            <DialogDescription>
              Relatório técnico completo gerado por inteligência artificial
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mb-4">
            <Button
              onClick={handleDownloadReport}
              variant="outline"
              size="sm"
              className="flex items-center gap-2 bg-green-50 hover:bg-green-100 border-green-200 text-green-700"
            >
              <Download className="h-4 w-4" />
              Baixar PDF
            </Button>
            <Button
              onClick={handleEmailReport}
              variant="outline"
              size="sm"
              className="flex items-center gap-2 bg-blue-50 hover:bg-blue-100 border-blue-200 text-blue-700"
            >
              <Mail className="h-4 w-4" />
              Enviar Email
            </Button>
            <Button
              onClick={handleWhatsAppAgronomist}
              variant="outline"
              size="sm"
              className="flex items-center gap-2 bg-green-50 hover:bg-green-100 border-green-200 text-green-700"
            >
              <MessageCircle className="h-4 w-4" />
              WhatsApp Agrônomo
            </Button>
            <Button
              onClick={handlePrintReport}
              variant="outline"
              size="sm"
              className="flex items-center gap-2 bg-gray-50 hover:bg-gray-100 border-gray-200 text-gray-700"
            >
              <Printer className="h-4 w-4" />
              Imprimir
            </Button>
          </div>

          <ScrollArea className="h-[60vh] w-full">
            <div className="p-8 bg-white dark:bg-gray-900 rounded-lg border print:shadow-none print:border-0">
              {/* Header with diagnosis title */}
              <div className="border-l-4 border-orange-500 pl-4 mb-6">
                <div className="flex justify-between items-start">
                  <h1 className="text-lg font-semibold text-gray-800 dark:text-gray-100">
                    Diagnóstico: {extractDiagnosisTitle(reportContent)}
                  </h1>
                  <div className="text-sm text-orange-500 font-medium">
                    95% de confiança
                  </div>
                </div>
              </div>
              
              {/* Report content */}
              <div className="space-y-6">
                {renderSimpleReport(reportContent)}
                
                {/* Action buttons similar to the image */}
                <div className="flex gap-3 pt-6 border-t border-gray-200 dark:border-gray-700">
                  <Button 
                    className="bg-green-600 hover:bg-green-700 text-white px-6 py-2"
                    onClick={handleDownloadReport}
                  >
                    Salvar Diagnóstico
                  </Button>
                  <Button 
                    variant="outline" 
                    className="border-gray-300 text-gray-700 hover:bg-gray-50 px-6 py-2"
                    onClick={() => setIsOpen(false)}
                  >
                    Falar com Especialista
                  </Button>
                  <Button 
                    variant="outline" 
                    className="border-gray-300 text-gray-700 hover:bg-gray-50 px-6 py-2"
                    onClick={() => window.location.reload()}
                  >
                    Novo Diagnóstico
                  </Button>
                </div>
              </div>
            </div>
          </ScrollArea>
        </DialogContent>
      </Dialog>

      <Button 
        onClick={handleDownloadReport}
        variant="outline" 
        size="sm"
        className="border-green-600 text-green-600 hover:bg-green-50 dark:hover:bg-green-900/20"
      >
        <Download className="h-4 w-4 mr-2" />
        Baixar PDF
      </Button>
    </div>
  );
}