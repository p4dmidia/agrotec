import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";

export interface User {
  id: number;
  fullName: string;
  cpf: string;
  email: string;
  phone: string | null;
  address: string | null;
  profileImageUrl: string | null;
  plan: string;
  isAdimplente: boolean;
  subscriptionEndsAt: Date | null;
  createdAt: Date | null;
  updatedAt: Date | null;
  role: string;
}

export function useAuth() {
  const queryClient = useQueryClient();
  
  const { data: user, isLoading } = useQuery<User>({
    queryKey: ["/api/auth/user"],
    queryFn: async () => {
      const token = localStorage.getItem("token");
      if (!token) {
        return null;
      }
      
      const headers: Record<string, string> = {
        "Authorization": `Bearer ${token}`,
      };
      
      const res = await fetch("/api/auth/user", {
        headers,
        credentials: "include",
      });
      
      if (res.status === 401) {
        localStorage.removeItem("token");
        return null;
      }
      
      if (!res.ok) {
        throw new Error(`${res.status}: ${res.statusText}`);
      }
      
      return await res.json();
    },
    retry: false,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  const loginMutation = useMutation({
    mutationFn: async (credentials: { cpf: string; password: string }) => {
      const response = await apiRequest("POST", "/api/auth/login", credentials);
      return response.json();
    },
    onSuccess: (data) => {
      localStorage.setItem("token", data.token);
      queryClient.setQueryData(["/api/auth/user"], data.user);
    },
  });

  const registerMutation = useMutation({
    mutationFn: async (userData: {
      fullName: string;
      cpf: string;
      email: string;
      password: string;
      confirmPassword: string;
      phone?: string;
      address?: string;
    }) => {
      const response = await apiRequest("POST", "/api/auth/register", userData);
      return response.json();
    },
    onSuccess: (data) => {
      localStorage.setItem("token", data.token);
      queryClient.setQueryData(["/api/auth/user"], data.user);
    },
  });

  const logout = () => {
    localStorage.removeItem("token");
    queryClient.setQueryData(["/api/auth/user"], null);
    queryClient.clear();
  };

  return {
    user,
    isLoading,
    isAuthenticated: !!user,
    login: loginMutation.mutateAsync,
    register: registerMutation.mutateAsync,
    logout,
    loginError: loginMutation.error,
    registerError: registerMutation.error,
    isLoggingIn: loginMutation.isPending,
    isRegistering: registerMutation.isPending,
  };
}
