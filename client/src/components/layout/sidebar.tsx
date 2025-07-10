import { Link, useLocation } from "wouter";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  LayoutDashboard,
  MessageSquare,
  GraduationCap,
  Calendar,
  Cloud,
  ShoppingCart,
  Settings,
  Crown,
  LogOut,
  Leaf,
  ShieldCheck,
} from "lucide-react";
import drAgroLogo from "@assets/ChatGPT Image 30 de mai. de 2025, 12_06_16_1751654766476.png";

const navigation = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { name: "Chat Dr Agro", href: "/chat", icon: MessageSquare },
  { name: "Trilhas", href: "/learning", icon: GraduationCap },
  { name: "Calendário", href: "/calendario", icon: Calendar },
  { name: "Monitoramento", href: "/weather", icon: Cloud },
  { name: "Loja", href: "/store", icon: ShoppingCart },
  { name: "Configurações", href: "/settings", icon: Settings },
  { name: "Planos", href: "/plans", icon: Crown },
];

export function Sidebar() {
  const [location] = useLocation();
  const { user, logout } = useAuth();

  const getPlanColor = (plan: string) => {
    switch (plan) {
      case "premium":
        return "bg-purple-100 text-purple-800";
      case "pro":
        return "bg-blue-100 text-blue-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getPlanLabel = (plan: string) => {
    switch (plan) {
      case "premium":
        return "Premium";
      case "pro":
        return "Pro";
      default:
        return "Gratuito";
    }
  };

  return (
    <div className="w-64 bg-white shadow-lg flex flex-col h-screen sticky top-0">
      {/* Header */}
      <div className="p-6 border-b flex-shrink-0">
        <div className="flex items-center space-x-3">
          <div className="w-14 h-14 rounded-full overflow-hidden bg-white shadow-sm border border-gray-200 flex items-center justify-center aspect-square">
            <img 
              src={drAgroLogo} 
              alt="Dr. Agro Logo" 
              className="w-14 h-14 object-cover rounded-full"
            />
          </div>
          <div>
            <h1 className="text-lg font-bold text-gray-800 leading-tight">Dr Agro</h1>
            <Badge className={getPlanColor(user?.plan || "gratuito")}>
              {getPlanLabel(user?.plan || "gratuito")}
            </Badge>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 mt-6 overflow-y-auto">
        <div className="px-4 space-y-2">
          {navigation.map((item) => {
            const Icon = item.icon;
            const isActive = location === item.href;
            
            return (
              <Link key={item.name} href={item.href}>
                <Button
                  variant={isActive ? "secondary" : "ghost"}
                  className="w-full justify-start"
                >
                  <Icon className="h-4 w-4 mr-3" />
                  {item.name}
                </Button>
              </Link>
            );
          })}
          
          {/* Admin Panel - Only show if user is admin */}
          {user?.role === 'admin' && (
            <Link href="/admin">
              <Button
                variant={location === "/admin" ? "secondary" : "ghost"}
                className="w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50"
              >
                <ShieldCheck className="h-4 w-4 mr-3" />
                Painel ADM
              </Button>
            </Link>
          )}
        </div>
      </nav>

      {/* User Profile */}
      <div className="p-4 border-t flex-shrink-0">
        <div className="flex items-center space-x-3">
          <Avatar>
            <AvatarImage src={user?.profileImageUrl || ""} />
            <AvatarFallback>
              {user?.fullName?.split(" ").map(n => n[0]).join("") || "U"}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-700 truncate">
              {user?.fullName}
            </p>
            <p className="text-xs text-gray-500 truncate">{user?.email}</p>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={logout}
            className="p-2"
          >
            <LogOut className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
