import { useState } from "react";
import { Link, useLocation } from "wouter";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Leaf, Eye, EyeOff } from "lucide-react";
import { formatCPF } from "@/lib/authUtils";

export default function Login() {
  const [, setLocation] = useLocation();
  const { login, loginError, isLoggingIn } = useAuth();
  const [formData, setFormData] = useState({
    cpf: "",
    password: "",
  });
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await login(formData);
      setLocation("/dashboard");
    } catch (error) {
      // Error is handled by the hook
    }
  };

  const handleCPFChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, '');
    setFormData(prev => ({
      ...prev,
      cpf: value
    }));
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-green-100">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
            <Leaf className="h-8 w-8 text-white" />
          </div>
          <CardTitle className="text-3xl font-bold text-gray-800">Dr. Agro</CardTitle>
          <CardDescription>Sua plataforma agrícola inteligente</CardDescription>
        </CardHeader>
        
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {loginError && (
              <Alert variant="destructive">
                <AlertDescription>
                  {loginError.message}
                </AlertDescription>
              </Alert>
            )}
            
            <div className="space-y-2">
              <Label htmlFor="cpf">CPF</Label>
              <Input
                id="cpf"
                type="text"
                placeholder="000.000.000-00"
                value={formatCPF(formData.cpf)}
                onChange={handleCPFChange}
                maxLength={14}
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="password">Senha</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Sua senha"
                  value={formData.password}
                  onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
                  required
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </Button>
              </div>
            </div>
            
            <Button
              type="submit"
              className="w-full"
              disabled={isLoggingIn}
            >
              {isLoggingIn ? "Entrando..." : "Entrar"}
            </Button>
            
            <div className="text-center space-y-2">
              <Link href="/register">
                <Button variant="link" className="text-green-600">
                  Criar conta
                </Button>
              </Link>
              <br />
              <Button variant="link" className="text-gray-500 text-sm">
                Esqueci minha senha
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
