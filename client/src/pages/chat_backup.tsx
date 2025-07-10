import { useState, useRef, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { Header } from "@/components/layout/header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { AudioRecorder } from "@/components/ui/audio-recorder";
import { FileUpload } from "@/components/ui/file-upload";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { isDiagnosticReport, extractDiagnosticSummary, formatDiagnosticReport } from "@/lib/diagnosticUtils";
import { DiagnosticReportModal } from "@/components/ui/diagnostic-report-modal-new";
import { Bot, User, Send, Mic, Image, FileText, Plus, Music } from "lucide-react";
import drAgroLogo from "@assets/ChatGPT Image 30 de mai. de 2025, 12_06_16_1751654766476.png";

interface ChatConversation {
  id: number;
  title: string;
  mode: string;
  createdAt: string;
}

interface ChatMessage {
  id: number;
  conversationId: number;
  sender: "user" | "ai";
  content: string;
  messageType: string;
  fileUrl?: string;
  createdAt: string;
}

export default function Chat() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedConversation, setSelectedConversation] = useState<number | null>(null);
  const [messageInput, setMessageInput] = useState("");
  const [chatMode, setChatMode] = useState<"consultation" | "diagnosis">("consultation");
  const [showFileUpload, setShowFileUpload] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [previousMessageCount, setPreviousMessageCount] = useState(0);
  const [isUserScrolling, setIsUserScrolling] = useState(false);
  const [reportModalOpen, setReportModalOpen] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);

  const { data: conversations } = useQuery<ChatConversation[]>({
    queryKey: ["/api/chat/conversations"],
  });

  const { data: messages, isLoading: messagesLoading } = useQuery<ChatMessage[]>({
    queryKey: ["/api/chat/conversations", selectedConversation, "messages"],
    queryFn: async () => {
      if (!selectedConversation) return [];
      const response = await apiRequest("GET", `/api/chat/conversations/${selectedConversation}/messages`);
      return response.json();
    },
    enabled: !!selectedConversation,
    refetchInterval: 10000, // Refetch every 10 seconds to catch new messages
  });

  // Detectar quando novas mensagens chegam e controlar a animação "digitando"
  useEffect(() => {
    if (messages && messages.length > 0) {
      const currentMessageCount = messages.length;
      
      // Se o número de mensagens aumentou
      if (currentMessageCount > previousMessageCount) {
        const lastMessage = messages[messages.length - 1];
        
        // Se a última mensagem é do AI, parar a animação e fazer scroll se necessário
        if (lastMessage.sender === "ai" && isTyping) {
          setIsTyping(false);
          
          // Fazer scroll apenas se o usuário não está navegando manualmente
          if (!isUserScrolling) {
            setTimeout(() => {
              scrollToBottom();
            }, 100);
          }
        }
      }
      
      setPreviousMessageCount(currentMessageCount);
    }
  }, [messages, previousMessageCount, isTyping, isUserScrolling]);

  // Scroll suave para o final apenas quando o usuário está enviando mensagem
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  // Detectar quando o usuário está rolando manualmente
  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const container = e.currentTarget;
    const isAtBottom = container.scrollHeight - container.scrollTop === container.clientHeight;
    
    // Se o usuário não está no final da conversa, ele está navegando manualmente
    if (!isAtBottom) {
      setIsUserScrolling(true);
    } else {
      setIsUserScrolling(false);
    }
  };
  


  const createConversationMutation = useMutation({
    mutationFn: async (data: { title: string; mode: string }) => {
      const response = await apiRequest("POST", "/api/chat/conversations", data);
      return response.json();
    },
    onSuccess: (newConversation) => {
      queryClient.invalidateQueries({ queryKey: ["/api/chat/conversations"] });
      setSelectedConversation(newConversation.id);
    },
  });

  const sendMessageMutation = useMutation({
    mutationFn: async (data: { 
      conversationId: number; 
      content: string; 
      messageType: string;
      fileUrl?: string;
    }) => {
      const response = await apiRequest("POST", "/api/chat/messages", {
        ...data,
        sender: "user",
      });
      return response.json();
    },
    onSuccess: (data, variables) => {
      setMessageInput("");
      
      // Invalidate queries immediately to show user message
      queryClient.invalidateQueries({ queryKey: ["/api/chat/conversations", selectedConversation, "messages"] });
      
      // Scroll to show the user's message that was just sent (sempre quando o usuário envia)
      setTimeout(() => {
        scrollToBottom();
        setIsUserScrolling(false); // Reset user scrolling state
        
        // Only show typing indicator for text messages after user message is visible
        if (variables.messageType === "text") {
          setTimeout(() => {
            setIsTyping(true);
          }, 800); // Wait longer to ensure user message is fully rendered and visible
        }
      }, 300);
    },
  });

  const handleSendMessage = async () => {
    if (!messageInput.trim() || !selectedConversation) return;

    await sendMessageMutation.mutateAsync({
      conversationId: selectedConversation,
      content: messageInput,
      messageType: "text",
    });
  };

  const handleCreateConversation = () => {
    const title = `${chatMode === "consultation" ? "Consulta" : "Diagnóstico"} - ${new Date().toLocaleString()}`;
    createConversationMutation.mutate({ title, mode: chatMode });
  };

  const handleRecordingStart = () => {
    setIsRecording(true);
  };

  const handleAudioRecording = async (audioBlob: Blob) => {
    if (!selectedConversation) return;
    
    setIsRecording(false);
    
    try {
      // First, create user message showing audio was sent
      await sendMessageMutation.mutateAsync({
        conversationId: selectedConversation,
        content: "🎤 Áudio enviado",
        messageType: "audio",
      });

      // Invalidate cache first to ensure user message is displayed
      queryClient.invalidateQueries({ queryKey: ["/api/chat/conversations", selectedConversation, "messages"] });
      
      // Wait longer to ensure user message appears first and renders completely
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Show "Dr. Agro está digitando..." animation
      setIsTyping(true);
      
      const formData = new FormData();
      formData.append('file', audioBlob, 'audio.wav');
      formData.append('conversationId', selectedConversation.toString());
      formData.append('message', 'Áudio transcrito e analisado');
      
      // Custom fetch for FormData upload
      const token = localStorage.getItem("token");
      const response = await fetch("/api/chat/upload", {
        method: "POST",
        headers: {
          "Authorization": token ? `Bearer ${token}` : "",
        },
        body: formData,
        credentials: "include",
      });
      
      if (response.ok) {
        queryClient.invalidateQueries({ queryKey: ["/api/chat/conversations", selectedConversation, "messages"] });
        
        toast({
          title: "Áudio processado",
          description: "Dr. Agro analisou seu áudio!",
        });
      } else {
        throw new Error("Erro na resposta do servidor");
      }
    } catch (error: any) {
      console.error("Erro no processamento do áudio:", error);
      toast({
        title: "Erro no áudio",
        description: "Não foi possível processar o áudio. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setIsTyping(false);
    }
  };

  const handleFileUpload = async (file: File) => {
    if (!selectedConversation) return;
    
    setShowFileUpload(false);
    
    try {
      // First, create user message showing file was sent
      const userMessageContent = file.type.startsWith('image/') 
        ? 'Analise esta imagem da minha plantação' 
        : `📄 Documento enviado: ${file.name}`;
        
      await sendMessageMutation.mutateAsync({
        conversationId: selectedConversation,
        content: userMessageContent,
        messageType: file.type.startsWith('image/') ? "image" : "document",
      });

      // Invalidate cache first to ensure user message is displayed
      queryClient.invalidateQueries({ queryKey: ["/api/chat/conversations", selectedConversation, "messages"] });
      
      // Wait longer to ensure user message appears first and renders completely
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Show "Dr. Agro está digitando..." animation
      setIsTyping(true);
      
      const formData = new FormData();
      formData.append('file', file);
      formData.append('conversationId', selectedConversation.toString());
      formData.append('message', userMessageContent);
      
      // Custom fetch for FormData upload
      const token = localStorage.getItem("token");
      const response = await fetch("/api/chat/upload", {
        method: "POST",
        headers: {
          "Authorization": token ? `Bearer ${token}` : "",
        },
        body: formData,
        credentials: "include",
      });
      
      if (response.ok) {
        queryClient.invalidateQueries({ queryKey: ["/api/chat/conversations", selectedConversation, "messages"] });
        
        toast({
          title: file.type.startsWith('image/') ? "Imagem analisada" : "Arquivo processado",
          description: "Dr. Agro analisou seu arquivo com sucesso!",
        });
      } else {
        throw new Error("Erro na resposta do servidor");
      }
    } catch (error: any) {
      console.error("Erro no upload:", error);
      toast({
        title: "Erro no upload",
        description: "Não foi possível processar o arquivo. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setIsTyping(false);
    }
  };



  return (
    <div className="min-h-screen flex flex-col">
      <Header title="Chat Dr. Agro" subtitle="Assistente agrícola inteligente" />
      
      <div className="flex-1 flex overflow-auto">
        {/* Conversations Sidebar */}
        <div className="w-80 bg-white border-r flex flex-col h-full">
          <div className="p-4 border-b bg-green-600 text-white">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-lg">Chat Dr. Agro</h3>
              <Button 
                size="sm" 
                onClick={handleCreateConversation}
                className="bg-green-500 hover:bg-green-400 text-white border-none"
              >
                <Plus className="h-4 w-4 mr-2" />
                Nova
              </Button>
            </div>
            
            <div className="flex space-x-2">
              <Button
                variant={chatMode === "consultation" ? "secondary" : "ghost"}
                size="sm"
                onClick={() => setChatMode("consultation")}
                className={chatMode === "consultation" ? "bg-white text-green-600" : "text-green-100 hover:bg-green-500"}
              >
                Consulta
              </Button>
              <Button
                variant={chatMode === "diagnosis" ? "secondary" : "ghost"}
                size="sm"
                onClick={() => setChatMode("diagnosis")}
                className={chatMode === "diagnosis" ? "bg-white text-green-600" : "text-green-100 hover:bg-green-500"}
              >
                Diagnóstico
              </Button>
            </div>
          </div>
          
          <div className="flex-1 overflow-y-auto bg-white">
            {conversations?.map((conversation) => (
              <div
                key={conversation.id}
                className={`p-4 border-b border-gray-100 cursor-pointer hover:bg-gray-50 transition-colors ${
                  selectedConversation === conversation.id ? "bg-green-50 border-l-4 border-l-green-500" : ""
                }`}
                onClick={() => setSelectedConversation(conversation.id)}
              >
                <div className="flex items-start space-x-3">
                  <Avatar className="h-10 w-10 mt-1">
                    <AvatarFallback className="bg-green-100 text-green-600">
                      <Bot className="h-5 w-5" />
                    </AvatarFallback>
                  </Avatar>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <p className="font-medium text-sm text-gray-900 truncate">
                        Dr. Agro
                      </p>
                      <span className="text-xs text-gray-500">
                        {new Date(conversation.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                    
                    <p className="text-sm text-gray-600 truncate mt-1">
                      {conversation.mode === "consultation" ? "Consulta" : "Diagnóstico"} • {conversation.title.substring(0, 30)}...
                    </p>
                    
                    <div className="flex items-center justify-between mt-2">
                      <Badge 
                        variant="outline" 
                        className={`text-xs ${
                          conversation.mode === "consultation" 
                            ? "border-blue-200 text-blue-600 bg-blue-50" 
                            : "border-orange-200 text-orange-600 bg-orange-50"
                        }`}
                      >
                        {conversation.mode === "consultation" ? "Consulta" : "Diagnóstico"}
                      </Badge>
                    </div>
                  </div>
                </div>
              </div>
            ))}
            
            {!conversations?.length && (
              <div className="p-6 text-center text-gray-500">
                <Bot className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                <p className="font-medium">Nenhuma conversa ainda</p>
                <p className="text-sm mt-1">Clique em "Nova" para começar a conversar com o Dr. Agro</p>
              </div>
            )}
          </div>
        </div>
        
        {/* Chat Area */}
        <div className="flex-1 flex flex-col h-full max-h-screen">
          {selectedConversation ? (
            <>
              {/* Chat Header - Fixed */}
              <div className="p-3 border-b bg-green-600 text-white flex-shrink-0">
                <div className="flex items-center space-x-3">
                  <Avatar className="h-10 w-10">
                    <AvatarImage 
                      src={drAgroLogo} 
                      alt="Dr. Agro"
                    />
                    <AvatarFallback className="bg-green-500 text-white">
                      <Bot className="h-6 w-6" />
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <h4 className="font-semibold text-lg">Dr. Agro</h4>
                    <p className="text-xs text-green-100">
                      {chatMode === "consultation" ? "Modo Consulta" : "Modo Diagnóstico"} • Online
                    </p>
                  </div>
                </div>
              </div>
              
              {/* Messages Container - Scrollable */}
              <div className="flex-1 flex flex-col min-h-0">
                <div 
                  ref={messagesContainerRef}
                  className="flex-1 overflow-y-auto p-3 space-y-3 bg-gray-50"
                  onScroll={handleScroll}
                >
                {messages?.map((message) => (
                  <div
                    key={message.id}
                    className={`flex ${message.sender === "user" ? "justify-end" : "justify-start"}`}
                  >
                    <div
                      className={`max-w-xs lg:max-w-md px-4 py-2 rounded-2xl relative ${
                        message.sender === "user"
                          ? "bg-green-500 text-white rounded-br-md"
                          : "bg-white text-gray-800 rounded-bl-md shadow-sm"
                      }`}
                    >
                      {message.sender === "ai" && (
                        <div className="flex items-center space-x-2 mb-1">
                          <img 
                            src={drAgroLogo} 
                            alt="Dr. Agro" 
                            className="h-4 w-4 rounded-full object-cover"
                          />
                          <span className="text-xs font-medium text-green-600">Dr. Agro</span>
                        </div>
                      )}
                      
                      {/* Show image if it's an image message */}
                      {message.messageType === "image" && message.fileUrl && (
                        <div className="mb-2">
                          <img 
                            src={message.fileUrl} 
                            alt="Imagem enviada" 
                            className="max-w-full h-auto rounded-lg max-h-48 object-cover"
                          />
                        </div>
                      )}
                      
                      {/* Show document indicator if it's a document message */}
                      {message.messageType === "document" && message.fileUrl && (
                        <div className="mb-2 flex items-center space-x-2 p-2 bg-gray-100 rounded-lg">
                          <FileText className="h-4 w-4 text-gray-600" />
                          <span className="text-xs text-gray-600">Documento enviado</span>
                        </div>
                      )}
                      
                      {/* Check if this is a diagnostic report and render appropriately */}
                      {message.sender === "ai" && isDiagnosticReport(message.content) ? (
                        <div className="space-y-3">
                          {/* Summary */}
                          <div className="bg-green-50 dark:bg-green-900/20 p-3 rounded-lg border border-green-200 dark:border-green-800">
                            <div className="flex items-start gap-2">
                              <FileText className="h-4 w-4 text-green-600 dark:text-green-400 mt-0.5 flex-shrink-0" />
                              <div className="flex-1">
                                <h5 className="font-semibold text-green-800 dark:text-green-200 mb-1 text-sm">
                                  Relatório de Diagnóstico
                                </h5>
                                <p className="text-green-700 dark:text-green-300 text-xs leading-relaxed">
                                  {extractDiagnosticSummary(message.content)}
                                </p>
                              </div>
                            </div>
                          </div>
                          
                          {/* Button */}
                          <Button 
                            onClick={() => setReportModalOpen(true)}
                            className="w-full mt-3 bg-green-600 hover:bg-green-700 text-white"
                          >
                            <FileText className="mr-2 h-4 w-4" />
                            Ver Relatório Completo
                          </Button>
                          
                          <DiagnosticReportModal 
                            isOpen={reportModalOpen}
                            onClose={() => setReportModalOpen(false)}
                            reportContent={message.content}
                            title="Relatório de Diagnóstico Agrícola"
                          />
                        </div>
                      ) : (
                        <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                      )}
                      
                      <div className={`flex items-center justify-end mt-1 space-x-1 ${
                        message.sender === "user" ? "text-green-100" : "text-gray-400"
                      }`}>
                        <span className="text-xs">
                          {new Date(message.createdAt).toLocaleTimeString([], {
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </span>
                        {message.sender === "user" && (
                          <div className="flex space-x-1">
                            <div className="w-1 h-1 bg-green-100 rounded-full"></div>
                            <div className="w-1 h-1 bg-green-100 rounded-full"></div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
                
                {/* Typing Indicator */}
                {isTyping && (
                  <div className="flex justify-start">
                    <div className="bg-white text-gray-800 rounded-2xl rounded-bl-md shadow-sm px-4 py-3 max-w-xs">
                      <div className="flex items-center space-x-2">
                        <Bot className="h-4 w-4 text-green-600" />
                        <span className="text-xs font-medium text-green-600">Dr. Agro</span>
                      </div>
                      <div className="flex items-center space-x-1 mt-1">
                        <span className="text-sm text-gray-600">está digitando</span>
                        <div className="flex space-x-1">
                          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
                
                {messages?.length === 0 && !isTyping && (
                  <div className="text-center text-gray-500 py-8">
                    <Bot className="h-12 w-12 mx-auto mb-4 text-green-600" />
                    <p className="text-lg font-medium text-gray-700">Olá! Sou o Dr. Agro</p>
                    <p className="text-sm">Seu assistente agrícola especializado</p>
                    <p className="text-sm mt-2">Como posso ajudá-lo com suas culturas hoje?</p>
                  </div>
                )}
                
                <div ref={messagesEndRef} />
                </div>
              </div>
              
              {/* Message Input */}
              <div className="p-3 bg-white border-t flex-shrink-0">
                {/* Recording Animation */}
                {isRecording && (
                  <div className="mb-3 p-3 bg-red-50 border border-red-200 rounded-lg">
                    <div className="flex items-center space-x-2">
                      <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
                      <span className="text-red-600 font-medium text-sm animate-pulse">Gravando...</span>
                    </div>
                  </div>
                )}
                
                {showFileUpload && (
                  <div className="mb-4 p-4 bg-gray-50 rounded-lg">
                    <FileUpload
                      onFileSelect={handleFileUpload}
                      accept="image/*,audio/*"
                      maxSize={10}
                    />
                  </div>
                )}
                
                <div className="flex items-end space-x-2">
                  {/* Attachment buttons */}
                  <div className="flex space-x-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setShowFileUpload(!showFileUpload)}
                      className="p-2 h-10 w-10 rounded-full hover:bg-gray-100"
                      title="Enviar imagem"
                    >
                      <Image className="h-5 w-5 text-gray-500" />
                    </Button>
                    
                    <AudioRecorder
                      onRecordingComplete={handleAudioRecording}
                      onRecordingStart={handleRecordingStart}
                      isRecording={isRecording}
                      disabled={!selectedConversation}
                    />
                  </div>
                  
                  {/* Message input */}
                  <div className="flex-1 relative">
                    <Input
                      placeholder="Digite uma mensagem sobre agricultura..."
                      value={messageInput}
                      onChange={(e) => setMessageInput(e.target.value)}
                      onKeyPress={(e) => e.key === "Enter" && !e.shiftKey && handleSendMessage()}
                      className="rounded-full py-3 px-4 pr-12 resize-none min-h-[44px] max-h-32"
                      disabled={sendMessageMutation.isPending}
                    />
                  </div>
                  
                  {/* Send button */}
                  <Button
                    onClick={handleSendMessage}
                    disabled={!messageInput.trim() || sendMessageMutation.isPending}
                    className="h-10 w-10 rounded-full bg-green-500 hover:bg-green-600 p-0"
                    title="Enviar mensagem"
                  >
                    <Send className="h-5 w-5" />
                  </Button>
                </div>
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center">
                <Bot className="h-16 w-16 mx-auto mb-4 text-gray-400" />
                <h3 className="text-lg font-semibold text-gray-800 mb-2">
                  Selecione uma conversa
                </h3>
                <p className="text-gray-600">
                  Escolha uma conversa existente ou crie uma nova para começar
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
