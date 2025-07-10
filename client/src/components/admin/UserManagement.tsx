import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Users, Shield, UserCheck, UserX, Edit, Search, AlertCircle } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

interface User {
  id: number;
  fullName: string;
  email: string;
  cpf: string;
  plan: string;
  role: string;
  isActive: boolean;
  createdAt: string;
  trialAtivo: boolean;
  isAdimplente: boolean;
}

const planLabels = {
  gratuito: "Gratuito",
  pro: "Pro",
  premium: "Premium",
};

const planColors = {
  gratuito: "bg-gray-100 text-gray-800",
  pro: "bg-blue-100 text-blue-800",
  premium: "bg-purple-100 text-purple-800",
};

const roleLabels = {
  user: "Usuário",
  admin: "Administrador",
};

const roleColors = {
  user: "bg-green-100 text-green-800",
  admin: "bg-red-100 text-red-800",
};

export default function UserManagement() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState("");
  const [filterPlan, setFilterPlan] = useState("all");
  const [filterRole, setFilterRole] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");

  // Fetch users
  const { data: users = [], isLoading } = useQuery<User[]>({
    queryKey: ["/api/admin/users"],
    queryFn: async () => {
      const response = await apiRequest("GET", "/api/admin/users");
      return response.json();
    },
  });

  // Update user status mutation
  const updateStatusMutation = useMutation({
    mutationFn: async ({ id, isActive }: { id: number; isActive: boolean }) => {
      const response = await apiRequest("PUT", `/api/admin/users/${id}/status`, { isActive });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/users"] });
      toast({
        title: "Status atualizado!",
        description: "O status do usuário foi alterado com sucesso.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Erro ao alterar status",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Update user plan mutation
  const updatePlanMutation = useMutation({
    mutationFn: async ({ id, plan }: { id: number; plan: string }) => {
      const response = await apiRequest("PUT", `/api/admin/users/${id}/plan`, { plan });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/users"] });
      toast({
        title: "Plano atualizado!",
        description: "O plano do usuário foi alterado com sucesso.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Erro ao alterar plano",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Update user role mutation
  const updateRoleMutation = useMutation({
    mutationFn: async ({ id, role }: { id: number; role: string }) => {
      const response = await apiRequest("PUT", `/api/admin/users/${id}/role`, { role });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/users"] });
      toast({
        title: "Função atualizada!",
        description: "A função do usuário foi alterada com sucesso.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Erro ao alterar função",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleToggleStatus = (user: User) => {
    if (user.role === 'admin' && user.isActive) {
      if (!confirm("Tem certeza que deseja desativar este administrador?")) {
        return;
      }
    }
    updateStatusMutation.mutate({ id: user.id, isActive: !user.isActive });
  };

  const handleUpdatePlan = (userId: number, plan: string) => {
    updatePlanMutation.mutate({ id: userId, plan });
  };

  const handleUpdateRole = (userId: number, role: string) => {
    if (role === 'admin') {
      if (!confirm("Tem certeza que deseja tornar este usuário um administrador?")) {
        return;
      }
    }
    updateRoleMutation.mutate({ id: userId, role });
  };

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.cpf.includes(searchTerm);
    const matchesPlan = filterPlan === "all" || user.plan === filterPlan;
    const matchesRole = filterRole === "all" || user.role === filterRole;
    const matchesStatus = filterStatus === "all" || 
                         (filterStatus === "active" && user.isActive) ||
                         (filterStatus === "inactive" && !user.isActive);

    return matchesSearch && matchesPlan && matchesRole && matchesStatus;
  });

  const activeUsers = users.filter(user => user.isActive).length;
  const inactiveUsers = users.filter(user => !user.isActive).length;
  const admins = users.filter(user => user.role === 'admin').length;
  const trialUsers = users.filter(user => user.trialAtivo).length;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Gerenciar Usuários</h2>
          <p className="text-gray-600">Visualize e gerencie todos os usuários da plataforma</p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center">
              <Users className="h-8 w-8 text-blue-500" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total de Usuários</p>
                <p className="text-2xl font-bold text-gray-900">{users.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center">
              <UserCheck className="h-8 w-8 text-green-500" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Usuários Ativos</p>
                <p className="text-2xl font-bold text-gray-900">{activeUsers}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center">
              <Shield className="h-8 w-8 text-red-500" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Administradores</p>
                <p className="text-2xl font-bold text-gray-900">{admins}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center">
              <AlertCircle className="h-8 w-8 text-orange-500" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Em Trial</p>
                <p className="text-2xl font-bold text-gray-900">{trialUsers}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-4">
        <div className="flex items-center space-x-2">
          <Search className="h-4 w-4 text-gray-500" />
          <Input
            placeholder="Buscar usuários..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-64"
          />
        </div>

        <Select value={filterPlan} onValueChange={setFilterPlan}>
          <SelectTrigger className="w-32">
            <SelectValue placeholder="Plano" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos os planos</SelectItem>
            <SelectItem value="gratuito">Gratuito</SelectItem>
            <SelectItem value="pro">Pro</SelectItem>
            <SelectItem value="premium">Premium</SelectItem>
          </SelectContent>
        </Select>

        <Select value={filterRole} onValueChange={setFilterRole}>
          <SelectTrigger className="w-32">
            <SelectValue placeholder="Função" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todas as funções</SelectItem>
            <SelectItem value="user">Usuário</SelectItem>
            <SelectItem value="admin">Administrador</SelectItem>
          </SelectContent>
        </Select>

        <Select value={filterStatus} onValueChange={setFilterStatus}>
          <SelectTrigger className="w-32">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos os status</SelectItem>
            <SelectItem value="active">Ativo</SelectItem>
            <SelectItem value="inactive">Inativo</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Users Table */}
      <Card>
        <CardHeader>
          <CardTitle>Usuários ({filteredUsers.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nome</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>CPF</TableHead>
                  <TableHead>Plano</TableHead>
                  <TableHead>Função</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredUsers.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell className="font-medium">{user.fullName}</TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>{user.cpf}</TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <Badge className={planColors[user.plan as keyof typeof planColors]}>
                          {planLabels[user.plan as keyof typeof planLabels]}
                        </Badge>
                        <Select onValueChange={(value) => handleUpdatePlan(user.id, value)}>
                          <SelectTrigger className="w-24 h-8">
                            <Edit className="h-3 w-3" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="gratuito">Gratuito</SelectItem>
                            <SelectItem value="pro">Pro</SelectItem>
                            <SelectItem value="premium">Premium</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <Badge className={roleColors[user.role as keyof typeof roleColors]}>
                          {roleLabels[user.role as keyof typeof roleLabels]}
                        </Badge>
                        <Select onValueChange={(value) => handleUpdateRole(user.id, value)}>
                          <SelectTrigger className="w-24 h-8">
                            <Edit className="h-3 w-3" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="user">Usuário</SelectItem>
                            <SelectItem value="admin">Admin</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={user.isActive ? "default" : "secondary"}>
                        {user.isActive ? "Ativo" : "Inativo"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Button
                        size="sm"
                        variant={user.isActive ? "destructive" : "default"}
                        onClick={() => handleToggleStatus(user)}
                        disabled={
                          updateStatusMutation.isPending ||
                          updatePlanMutation.isPending ||
                          updateRoleMutation.isPending
                        }
                      >
                        {user.isActive ? (
                          <>
                            <UserX className="h-4 w-4 mr-1" />
                            Desativar
                          </>
                        ) : (
                          <>
                            <UserCheck className="h-4 w-4 mr-1" />
                            Ativar
                          </>
                        )}
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {filteredUsers.length === 0 && (
            <div className="text-center py-8">
              <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhum usuário encontrado</h3>
              <p className="text-gray-600">
                {searchTerm ? "Tente buscar com outros termos" : "Nenhum usuário corresponde aos filtros selecionados"}
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}