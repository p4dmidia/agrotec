import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Leaf, MessageSquare, GraduationCap, Calendar, Cloud, ShoppingCart } from "lucide-react";

export default function Landing() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-green-100">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center">
                <Leaf className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-800">Dr. Agro</h1>
                <p className="text-sm text-gray-600">Plataforma Agrícola Inteligente</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <Link href="/login">
                <Button variant="outline">Entrar</Button>
              </Link>
              <Link href="/register">
                <Button>Criar Conta</Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl font-bold text-gray-900 mb-6">
            Revolucione sua agricultura com inteligência artificial
          </h2>
          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
            Dr. Agro é sua plataforma completa para gestão agrícola inteligente. 
            Conte com IA, trilhas educacionais, calendário, previsão do tempo e muito mais.
          </p>
          <div className="flex justify-center space-x-4">
            <Link href="/register">
              <Button size="lg" className="bg-green-600 hover:bg-green-700">
                Começar Gratuitamente
              </Button>
            </Link>
            <Button size="lg" variant="outline">
              Saiba Mais
            </Button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h3 className="text-3xl font-bold text-gray-900 mb-4">
              Tudo que você precisa para uma agricultura de sucesso
            </h3>
            <p className="text-lg text-gray-600">
              Ferramentas completas para otimizar sua produção
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <Card>
              <CardHeader>
                <MessageSquare className="h-8 w-8 text-green-600 mb-2" />
                <CardTitle>Chat com IA</CardTitle>
                <CardDescription>
                  Consulte nosso assistente agrícola inteligente para diagnósticos e recomendações
                </CardDescription>
              </CardHeader>
            </Card>
            
            <Card>
              <CardHeader>
                <GraduationCap className="h-8 w-8 text-blue-600 mb-2" />
                <CardTitle>Trilhas Educacionais</CardTitle>
                <CardDescription>
                  Aprenda com vídeos especializados e faça quizzes para aprimorar seus conhecimentos
                </CardDescription>
              </CardHeader>
            </Card>
            
            <Card>
              <CardHeader>
                <Calendar className="h-8 w-8 text-purple-600 mb-2" />
                <CardTitle>Calendário Agrícola</CardTitle>
                <CardDescription>
                  Organize suas atividades de plantio, irrigação, poda e colheita
                </CardDescription>
              </CardHeader>
            </Card>
            
            <Card>
              <CardHeader>
                <Cloud className="h-8 w-8 text-yellow-600 mb-2" />
                <CardTitle>Previsão do Tempo</CardTitle>
                <CardDescription>
                  Receba alertas meteorológicos e planeje suas atividades com antecedência
                </CardDescription>
              </CardHeader>
            </Card>
            
            <Card>
              <CardHeader>
                <ShoppingCart className="h-8 w-8 text-red-600 mb-2" />
                <CardTitle>Loja Integrada</CardTitle>
                <CardDescription>
                  Compre sementes, fertilizantes e ferramentas diretamente na plataforma
                </CardDescription>
              </CardHeader>
            </Card>
            
            <Card>
              <CardHeader>
                <Leaf className="h-8 w-8 text-green-600 mb-2" />
                <CardTitle>Análise de Dados</CardTitle>
                <CardDescription>
                  Acompanhe o progresso da sua produção com relatórios detalhados
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h3 className="text-3xl font-bold text-gray-900 mb-4">
              Planos para todos os produtores
            </h3>
            <p className="text-lg text-gray-600">
              Escolha o plano ideal para sua operação
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <Card>
              <CardHeader className="text-center">
                <CardTitle>Gratuito</CardTitle>
                <div className="text-4xl font-bold text-gray-900 mt-2">R$ 0</div>
                <p className="text-gray-600">/mês</p>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  <li className="flex items-center">
                    <span className="text-green-500 mr-2">✓</span>
                    3 consultas IA por mês
                  </li>
                  <li className="flex items-center">
                    <span className="text-green-500 mr-2">✓</span>
                    Acesso a 1 trilha
                  </li>
                  <li className="flex items-center">
                    <span className="text-green-500 mr-2">✓</span>
                    Calendário básico
                  </li>
                  <li className="flex items-center">
                    <span className="text-green-500 mr-2">✓</span>
                    Previsão do tempo
                  </li>
                </ul>
                <div className="mt-4 pt-4 border-t">
                  <Link href="/register">
                    <Button className="w-full bg-gray-600 hover:bg-gray-700">
                      Grátis
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
            
            <Card className="border-green-200">
              <CardHeader className="text-center">
                <Badge className="mb-2">Mais Popular</Badge>
                <CardTitle>Mensal</CardTitle>
                <div className="text-4xl font-bold text-gray-900 mt-2">R$ 47,00</div>
                <p className="text-gray-600">/mês</p>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  <li className="flex items-center">
                    <span className="text-green-500 mr-2">✓</span>
                    50 consultas IA por mês
                  </li>
                  <li className="flex items-center">
                    <span className="text-green-500 mr-2">✓</span>
                    Acesso a 5 trilhas
                  </li>
                  <li className="flex items-center">
                    <span className="text-green-500 mr-2">✓</span>
                    Calendário avançado
                  </li>
                  <li className="flex items-center">
                    <span className="text-green-500 mr-2">✓</span>
                    Alertas personalizados
                  </li>
                  <li className="flex items-center">
                    <span className="text-green-500 mr-2">✓</span>
                    Suporte prioritário
                  </li>
                </ul>
                <div className="mt-4 pt-4 border-t">
                  <Link href="/register">
                    <Button className="w-full bg-green-600 hover:bg-green-700">
                      Comece agora – 7 dias grátis
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="text-center">
                <CardTitle>Trimestral</CardTitle>
                <div className="text-4xl font-bold text-gray-900 mt-2">R$ 119,00</div>
                <p className="text-gray-600">/3 meses</p>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  <li className="flex items-center">
                    <span className="text-green-500 mr-2">✓</span>
                    50 consultas IA por mês
                  </li>
                  <li className="flex items-center">
                    <span className="text-green-500 mr-2">✓</span>
                    Acesso a 5 trilhas
                  </li>
                  <li className="flex items-center">
                    <span className="text-green-500 mr-2">✓</span>
                    Calendário avançado
                  </li>
                  <li className="flex items-center">
                    <span className="text-green-500 mr-2">✓</span>
                    Alertas personalizados
                  </li>
                  <li className="flex items-center">
                    <span className="text-green-500 mr-2">✓</span>
                    Suporte prioritário
                  </li>
                </ul>
                <div className="mt-4 pt-4 border-t">
                  <Link href="/register">
                    <Button className="w-full bg-green-600 hover:bg-green-700">
                      Comece agora – 7 dias grátis
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="text-center">
                <CardTitle>Anual</CardTitle>
                <div className="text-4xl font-bold text-gray-900 mt-2">R$ 397,00</div>
                <p className="text-gray-600">/ano</p>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  <li className="flex items-center">
                    <span className="text-green-500 mr-2">✓</span>
                    Consultas IA ilimitadas
                  </li>
                  <li className="flex items-center">
                    <span className="text-green-500 mr-2">✓</span>
                    Todas as trilhas
                  </li>
                  <li className="flex items-center">
                    <span className="text-green-500 mr-2">✓</span>
                    Análise avançada
                  </li>
                  <li className="flex items-center">
                    <span className="text-green-500 mr-2">✓</span>
                    Relatórios detalhados
                  </li>
                  <li className="flex items-center">
                    <span className="text-green-500 mr-2">✓</span>
                    Suporte 24/7
                  </li>
                </ul>
                <div className="mt-4 pt-4 border-t">
                  <Link href="/register">
                    <Button className="w-full bg-green-600 hover:bg-green-700">
                      Comece agora – 7 dias grátis
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-white border-t py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                <Leaf className="h-5 w-5 text-white" />
              </div>
              <span className="text-lg font-bold text-gray-800">Dr. Agro</span>
            </div>
            <p className="text-gray-600">
              © 2024 Dr. Agro. Todos os direitos reservados.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
