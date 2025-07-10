// Utility functions for handling diagnostic reports and consultation summaries

export function isDiagnosticReport(content: string): boolean {
  return content.includes("**Diagnóstico Provável:**") || 
         content.includes("**Sintomas Identificados:**") ||
         content.includes("**Tratamento Recomendado:**") ||
         content.includes("📄 **RELATÓRIO DE DIAGNÓSTICO") || 
         content.includes("RELATÓRIO DE DIAGNÓSTICO AGRÍCOLA");
}

export function isConsultationReport(content: string): boolean {
  // Check if it's a detailed consultation response that should have a summary
  return (content.length > 300 && 
         (content.includes("**Recomendações:**") || 
          content.includes("**Análise:**") ||
          content.includes("**Orientações:**") ||
          content.includes("**Cuidados:**") ||
          content.includes("**Dicas:**") ||
          content.includes("**Manejo:**") ||
          content.includes("plantio") ||
          content.includes("irrigação") ||
          content.includes("fertilização") ||
          content.includes("colheita"))) &&
         !isDiagnosticReport(content);
}

export function extractDiagnosticSummary(content: string): string {
  // Extract key information for summary
  const lines = content.split('\n');
  let diagnosis = "";
  let symptoms = "";
  let treatment = "";
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    
    // Look for diagnosis information
    if (line.includes("**Diagnóstico") || line.includes("**Problema") || line.includes("**Doença")) {
      diagnosis = lines[i + 1]?.replace(/^\*/, '').trim() || "";
    }
    
    // Look for symptoms
    if (line.includes("**Sintomas") && !symptoms) {
      const nextLine = lines[i + 1]?.replace(/^\*/, '').trim();
      if (nextLine) symptoms = nextLine;
    }
    
    // Look for treatment
    if (line.includes("**Tratamento") || line.includes("**Recomendação")) {
      const nextLine = lines[i + 1]?.replace(/^\*/, '').trim();
      if (nextLine) treatment = nextLine;
    }
  }
  
  // Build summary based on available information
  if (diagnosis && treatment) {
    return `${diagnosis}. Tratamento: ${treatment.substring(0, 80)}...`;
  } else if (diagnosis) {
    return `Diagnóstico identificado: ${diagnosis}`;
  } else if (symptoms) {
    return `Sintomas observados: ${symptoms}. Clique para ver o diagnóstico completo.`;
  }
  
  return "Relatório de diagnóstico técnico gerado com sucesso. Clique para visualizar os detalhes completos.";
}

export function extractConsultationSummary(content: string): string {
  // Extract key information for consultation summary
  const lines = content.split('\n');
  let recommendations = "";
  let analysis = "";
  let mainTopic = "";
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    
    // Look for main recommendations
    if (line.includes("**Recomendações") || line.includes("**Orientações") || line.includes("**Dicas")) {
      const nextLine = lines[i + 1]?.replace(/^\*/, '').trim();
      if (nextLine) recommendations = nextLine;
    }
    
    // Look for analysis
    if (line.includes("**Análise") || line.includes("**Considerações")) {
      const nextLine = lines[i + 1]?.replace(/^\*/, '').trim();
      if (nextLine) analysis = nextLine;
    }
    
    // Look for main topic in first lines
    if (i < 3 && line.trim() && !line.includes("**") && !mainTopic) {
      mainTopic = line.trim();
    }
  }
  
  // Build summary based on available information
  if (recommendations) {
    return `${recommendations.substring(0, 100)}...`;
  } else if (analysis) {
    return `${analysis.substring(0, 100)}...`;
  } else if (mainTopic) {
    return `${mainTopic.substring(0, 100)}...`;
  }
  
  // Fallback: extract first meaningful sentence
  const sentences = content.split('.').filter(s => s.trim().length > 20);
  if (sentences.length > 0) {
    return `${sentences[0].trim()}...`;
  }
  
  return "Consulta agrícola detalhada disponível. Clique para ver as recomendações completas.";
}

export function formatDiagnosticReport(content: string): string {
  // Clean up and format the diagnostic report for display
  return content
    .replace(/\*\*(.*?)\*\*/g, '$1') // Remove bold markdown
    .replace(/\*(.*?)\*/g, '$1')     // Remove italic markdown
    .trim();
}