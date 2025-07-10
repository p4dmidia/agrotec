import OpenAI from "openai";
import fs from "fs";
import path from "path";
import { Readable } from "stream";

if (!process.env.OPENAI_API_KEY) {
  throw new Error("OPENAI_API_KEY environment variable is required");
}

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Helper function to detect if user is trying to do diagnosis
function isDiagnosticRequest(message: string): boolean {
  const diagnosticKeywords = [
    'sintoma', 'doença', 'praga', 'problema', 'mancha', 'folha', 'amarela', 'seca', 
    'morrendo', 'apodrecendo', 'fungo', 'inseto', 'diagnóstico', 'doente', 'atacada',
    'definhando', 'murcha', 'podridão', 'ferrugem', 'mosca', 'lagarta', 'pulgão'
  ];
  
  const lowerMessage = message.toLowerCase();
  return diagnosticKeywords.some(keyword => lowerMessage.includes(keyword));
}

export async function generateAIResponse(
  userMessage: string,
  conversationHistory: Array<{ role: "user" | "assistant"; content: string }> = [],
  mode: "consultation" | "diagnosis" = "consultation",
  userName?: string
): Promise<string> {
  try {
    const systemPrompt = mode === "consultation" 
      ? `Você é o Dr. Agro, um assistente agrícola especializado em agricultura brasileira. 
         Responda de forma conversacional, educativa e prática como um consultor agrícola experiente.
         
         CARACTERÍSTICAS DO MODO CONSULTA:
         - Resposta direta via chat (não gere relatórios estruturados)
         - Linguagem conversacional e acessível
         - Dicas práticas e educativas
         - Foque em orientações imediatas
         - Máximo 3-4 parágrafos por resposta
         
         TEMAS PRINCIPAIS:
         - Técnicas de cultivo sustentável
         - Manejo de pragas e doenças
         - Nutrição de plantas
         - Irrigação e solo
         - Calendário agrícola
         - Práticas orgânicas
         
         IMPORTANTE: Se o usuário descrever sintomas específicos de doenças, pragas ou problemas nas plantas:
         1. Forneça uma resposta básica educativa
         2. Oriente sempre: "💡 Para um diagnóstico mais completo e detalhado com relatório técnico, recomendo usar o **Modo Diagnóstico** (disponível no seletor acima). Lá eu posso gerar um relatório profissional com tratamentos específicos."
         
         Sempre considere o clima tropical brasileiro e as culturas típicas do país.
         Seja cordial, didático e direto nas respostas.`
      : `Você é o Dr. Agro, especialista em diagnóstico agrícola. 
         Quando receber uma descrição de problema, gere APENAS um relatório técnico completo seguindo EXATAMENTE este formato simples:

**Diagnóstico Provável:**
[Nome da doença/praga/deficiência encontrada]

**Descrição:**
[Breve descrição do que é a doença - máximo 2 linhas]

**Sintomas Identificados:**
* [Sintoma principal observado]
* [Segundo sintoma mais comum]
* [Terceiro sintoma característico]
* [Progressão esperada]

**Tratamento Recomendado:**
* [Primeira medida de controle]
* [Segunda recomendação de manejo]
* [Produto ou prática específica]
* [Frequência de aplicação]

**Prevenção:**
* [Medida preventiva principal]
* [Segunda medida preventiva]
* [Prática cultural recomendada]
* [Monitoramento sugerido]

**Causas Prováveis:**
* [Causa principal]
* [Fator contribuinte]
* [Condição ambiental favorável]

IMPORTANTE: Gere apenas UM relatório, bem estruturado e direto. Não adicione títulos extras, cabeçalhos ou informações duplicadas.`;

    // Check if user is trying to do diagnosis in consultation mode
    if (mode === "consultation" && isDiagnosticRequest(userMessage)) {
      const enhancedMessage = `${userMessage}\n\nIMPORTANTE: O usuário parece estar descrevendo sintomas ou problemas. 
      Forneça uma resposta educativa básica, mas SEMPRE inclua a orientação sobre o Modo Diagnóstico.`;
      
      const messages = [
        { role: "system" as const, content: systemPrompt },
        ...conversationHistory,
        { role: "user" as const, content: enhancedMessage }
      ];

      const response = await openai.chat.completions.create({
        model: "gpt-4o", // the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
        messages: messages,
        max_tokens: 1000,
        temperature: 0.7,
      });

      return response.choices[0].message.content || "Desculpe, não consegui processar sua solicitação. Tente novamente.";
    }

    const messages = [
      { role: "system" as const, content: systemPrompt },
      ...conversationHistory,
      { role: "user" as const, content: userMessage }
    ];

    const response = await openai.chat.completions.create({
      model: "gpt-4o", // the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
      messages: messages,
      max_tokens: mode === "diagnosis" ? 2000 : 1000,
      temperature: 0.7,
    });

    return response.choices[0].message.content || "Desculpe, não consegui processar sua solicitação. Tente novamente.";
  } catch (error) {
    console.error("Erro ao gerar resposta da IA:", error);
    throw new Error("Erro ao comunicar com a IA. Verifique a configuração da API.");
  }
}

export async function analyzeImageWithAI(
  imageBase64: string,
  userMessage: string,
  mode: "consultation" | "diagnosis" = "diagnosis",
  userName?: string
): Promise<string> {
  try {
    if (mode === "diagnosis") {
      // Primeiro, gerar um resumo inicial
      const summaryPrompt = `Você é o Dr. Agro, especialista em diagnóstico agrícola. 
      Analise a imagem da planta/cultura enviada e gere APENAS um resumo conciso em 2-3 linhas, começando com:
      "🔬 **Análise Realizada:** Identifiquei [problema/condição encontrada] na cultura. [Breve explicação]. [Recomendação principal ou urgência]."`;

      const summaryResponse = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [
          {
            role: "system",
            content: summaryPrompt
          },
          {
            role: "user",
            content: [
              {
                type: "text",
                text: userMessage || "Analise esta imagem e me dê um resumo do diagnóstico:"
              },
              {
                type: "image_url",
                image_url: {
                  url: `data:image/jpeg;base64,${imageBase64}`
                }
              }
            ]
          }
        ],
        max_tokens: 200,
        temperature: 0.7,
      });

      const summary = summaryResponse.choices[0].message.content || "🔬 **Análise Realizada:** Análise da imagem concluída.";
      
      // Depois, gerar o diagnóstico completo
      const fullDiagnosisPrompt = `Você é o Dr. Agro, especialista em diagnóstico agrícola por imagem.
         Analise a imagem fornecida pelo produtor ${userName || 'agricultor'} e gere APENAS um relatório técnico seguindo EXATAMENTE este formato simples:

**Diagnóstico Provável:**
[Nome da doença/praga/deficiência identificada na imagem]

**Descrição:**
[Breve descrição do que é a doença - máximo 2 linhas]

**Sintomas Identificados:**
* [Sintoma principal visível na imagem]
* [Segundo sintoma observado]
* [Terceiro sintoma característico]
* [Progressão esperada]

**Tratamento Recomendado:**
* [Primeira medida de controle]
* [Segunda recomendação de manejo]
* [Produto ou prática específica]
* [Frequência de aplicação]

**Prevenção:**
* [Medida preventiva principal]
* [Segunda medida preventiva]
* [Prática cultural recomendada]
* [Monitoramento sugerido]

**Causas Prováveis:**
* [Causa principal identificada]
* [Fator contribuinte]
* [Condição ambiental favorável]
* [Fator de risco identificado]

**Observações Adicionais:**
* [Recomendação específica para o caso]
* [Cuidados especiais necessários]
* [Momento ideal para reavaliar]

IMPORTANTE: Gere apenas UM relatório, bem estruturado e direto. Não adicione títulos extras, cabeçalhos ou informações duplicadas.`;

      const fullResponse = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [
          {
            role: "system",
            content: fullDiagnosisPrompt
          },
          {
            role: "user",
            content: [
              {
                type: "text",
                text: userMessage || "Analise esta imagem e gere o diagnóstico completo:"
              },
              {
                type: "image_url",
                image_url: {
                  url: `data:image/jpeg;base64,${imageBase64}`
                }
              }
            ]
          }
        ],
        max_tokens: 2000,
        temperature: 0.7,
      });

      const fullDiagnosis = fullResponse.choices[0].message.content || "Não foi possível gerar o diagnóstico completo.";
      
      // Retornar estrutura JSON com resumo e diagnóstico completo
      return JSON.stringify({
        type: "diagnosis_with_modal",
        summary: summary,
        fullDiagnosis: fullDiagnosis,
        producer: userName || "Agricultor"
      });
    } else {
      // Modo consulta original
      const systemPrompt = `Você é o Dr. Agro, especialista em análise agrícola por imagem.
                         Analise a imagem fornecida e identifique:
                         - Problemas visíveis (pragas, doenças, deficiências)
                         - Estado geral da planta/cultura
                         - Recomendações específicas
                         
                         Se identificar problemas específicos, forneça orientações básicas mas sempre recomende:
                         "💡 Para um diagnóstico mais completo e detalhado com relatório técnico, recomendo usar o **Modo Diagnóstico**."
                         
                         Seja preciso e prático em suas observações.`;

      const response = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [
          {
            role: "system",
            content: systemPrompt
          },
          {
            role: "user",
            content: [
              {
                type: "text",
                text: userMessage || "Analise esta imagem e me diga o que você observa:"
              },
              {
                type: "image_url",
                image_url: {
                  url: `data:image/jpeg;base64,${imageBase64}`
                }
              }
            ]
          }
        ],
        max_tokens: 800,
        temperature: 0.7,
      });

      return response.choices[0].message.content || "Não consegui analisar a imagem. Tente novamente.";
    }
  } catch (error) {
    console.error("Erro ao analisar imagem:", error);
    throw new Error("Erro ao analisar imagem. Verifique se a imagem está no formato correto.");
  }
}

export async function transcribeAudioWithAI(audioBuffer: Buffer): Promise<string> {
  try {
    // Create a readable stream from the buffer
    const audioStream = new Readable();
    audioStream.push(audioBuffer);
    audioStream.push(null); // End the stream
    
    // Add necessary properties to make it work with OpenAI API
    (audioStream as any).path = "audio.wav";
    (audioStream as any).originalname = "audio.wav";
    
    const transcription = await openai.audio.transcriptions.create({
      file: audioStream as any,
      model: "whisper-1",
      language: "pt", // Portuguese
      response_format: "text",
    });

    console.log("Transcrição do áudio:", transcription);

    // Return transcription directly, let the calling function handle empty cases
    return transcription || "";
  } catch (error) {
    console.error("Erro ao transcrever áudio:", error);
    throw error; // Throw the error to be handled by the calling function
  }
}