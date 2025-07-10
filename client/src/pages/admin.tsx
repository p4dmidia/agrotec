import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ShieldCheck, Users, Settings, BarChart3, AlertTriangle, Package, ShoppingCart, HelpCircle, GraduationCap, TrendingUp, Calendar } from "lucide-react";
import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import ProductManagement from "@/components/admin/ProductManagement";
import UserManagement from "@/components/admin/UserManagement";

export default function Admin() {
  const { user } = useAuth();
  const [, navigate] = useLocation();
  const [activeSection, setActiveSection] = useState('dashboard');

  // Redirect if not admin
  useEffect(() => {
    if (user && user.role !== 'admin') {
      navigate('/dashboard');
    }
  }, [user, navigate]);

  // Show loading while checking authentication
  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-green-500"></div>
      </div>
    );
  }

  // Prevent rendering if not admin
  if (user.role !== 'admin') {
    return null;
  }

  // Render content based on active section
  const renderContent = () => {
    switch (activeSection) {
      case 'products':
        return <ProductManagement />;
      case 'users':
        return <UserManagement />;
      default:
        return renderDashboard();
    }
  };

  const renderDashboard = () => (
    <>
      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <Users className="h-8 w-8 text-blue-500" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Usuários Totais</p>
                <p className="text-2xl font-bold text-gray-900">3</p>
                <p className="text-xs text-gray-500">2 ativos</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <ShoppingCart className="h-8 w-8 text-green-500" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Pedidos Hoje</p>
                <p className="text-2xl font-bold text-gray-900">12</p>
                <p className="text-xs text-gray-500">R$ 2.847,50</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <Package className="h-8 w-8 text-purple-500" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Produtos</p>
                <p className="text-2xl font-bold text-gray-900">847</p>
                <p className="text-xs text-gray-500">23 baixo estoque</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <HelpCircle className="h-8 w-8 text-orange-500" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Dúvidas</p>
                <p className="text-2xl font-bold text-gray-900">8</p>
                <p className="text-xs text-gray-500">5 pendentes</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Admin Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
        {/* Gerenciar Produtos e Estoque */}
        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center">
                <Package className="h-5 w-5 mr-2 text-purple-600" />
                Gerenciar Produtos e Estoque
              </div>
              <Badge variant="outline" className="text-orange-600">
                23 baixo estoque
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600 mb-4">
              Adicionar, editar e gerenciar produtos da loja. Controle de estoque e categorias.
            </p>
            <div className="flex space-x-2">
              <Button className="flex-1" variant="outline" onClick={() => setActiveSection('products')}>
                Ver Produtos
              </Button>
              <Button className="flex-1" onClick={() => setActiveSection('products')}>
                Adicionar Produto
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Gerenciar Usuários */}
        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center">
                <Users className="h-5 w-5 mr-2 text-blue-600" />
                Gerenciar Usuários
              </div>
              <Badge variant="outline" className="text-green-600">
                3 usuários
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600 mb-4">
              Visualizar, editar e gerenciar contas de usuários. Controle de planos e permissões.
            </p>
            <div className="flex space-x-2">
              <Button className="flex-1" variant="outline" onClick={() => setActiveSection('users')}>
                Ver Usuários
              </Button>
              <Button className="flex-1" onClick={() => setActiveSection('users')}>
                Relatórios
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Visualizar Pedidos da Loja */}
        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center">
                <ShoppingCart className="h-5 w-5 mr-2 text-green-600" />
                Visualizar Pedidos da Loja
              </div>
              <Badge variant="outline" className="text-blue-600">
                12 hoje
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600 mb-4">
              Acompanhar pedidos, status de entrega e histórico de vendas da loja.
            </p>
            <div className="flex space-x-2">
              <Button className="flex-1" variant="outline">
                Ver Pedidos
              </Button>
              <Button className="flex-1">
                Relatório Vendas
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Responder Dúvidas nas Trilhas */}
        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center">
                <HelpCircle className="h-5 w-5 mr-2 text-orange-600" />
                Responder Dúvidas nas Trilhas
              </div>
              <Badge variant="outline" className="text-red-600">
                5 pendentes
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600 mb-4">
              Responder dúvidas dos usuários nas trilhas de aprendizado e moderar conteúdo.
            </p>
            <div className="flex space-x-2">
              <Button className="flex-1" variant="outline">
                Ver Dúvidas
              </Button>
              <Button className="flex-1">
                Moderação
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Additional Admin Tools */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader>
            <CardTitle className="flex items-center">
              <BarChart3 className="h-5 w-5 mr-2 text-indigo-600" />
              Analytics & Relatórios
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600 mb-4">
              Visualizar métricas detalhadas e gerar relatórios personalizados.
            </p>
            <Button className="w-full" variant="outline">
              Acessar Analytics
            </Button>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader>
            <CardTitle className="flex items-center">
              <GraduationCap className="h-5 w-5 mr-2 text-teal-600" />
              Gestão de Conteúdo
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600 mb-4">
              Gerenciar trilhas de aprendizado, vídeos e materiais educacionais.
            </p>
            <Button className="w-full" variant="outline">
              Gerenciar Conteúdo
            </Button>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Settings className="h-5 w-5 mr-2 text-gray-600" />
              Configurações do Sistema
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600 mb-4">
              Configurar parâmetros globais, integrações e preferências do sistema.
            </p>
            <Button className="w-full" variant="outline">
              Configurações
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Warning */}
      <Card className="mt-8 border-red-200 bg-red-50">
        <CardContent className="p-6">
          <div className="flex items-center">
            <AlertTriangle className="h-6 w-6 text-red-600 mr-3" />
            <div>
              <h3 className="text-lg font-semibold text-red-900">Área Restrita</h3>
              <p className="text-red-700">
                Este painel é restrito a administradores. Todas as ações são registradas.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <ShieldCheck className="h-8 w-8 text-red-600 mr-3" />
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Painel Administrativo</h1>
                <p className="text-sm text-gray-500">Gestão completa da plataforma</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              {activeSection !== 'dashboard' && (
                <Button 
                  variant="outline" 
                  onClick={() => setActiveSection('dashboard')}
                  className="flex items-center space-x-2"
                >
                  <BarChart3 className="h-4 w-4" />
                  <span>Dashboard</span>
                </Button>
              )}
              <div className="text-sm text-gray-500">
                Logado como: <span className="font-medium text-red-600">{user.fullName || user.email}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {renderContent()}
      </div>
    </div>
  );
}