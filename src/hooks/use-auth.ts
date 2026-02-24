import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { fetchApi } from "@/lib/fetcher";
import { api, buildUrl } from "@shared/routes";
import { useToast } from "@/hooks/use-toast";
import { useLocation } from "wouter";

export function useAuth() {
  const { data: user, isLoading, error } = useQuery({
    queryKey: ["/api/auth/me"],
    queryFn: () => fetchApi(api.auth.me.path, {}, api.auth.me.responses[200]),
    retry: false,
    staleTime: Infinity,
  });

  return {
    user: user?.user ?? null,
    isLoading,
    error,
    isAuthenticated: !!user?.user,
  };
}

export function useLogin() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [, setLocation] = useLocation();

  return useMutation({
    mutationFn: async (data: any) => {
      const result = await fetchApi(api.auth.login.path, {
        method: api.auth.login.method,
        body: JSON.stringify(data),
      }, api.auth.login.responses[200]);
      return result;
    },
    onSuccess: (data) => {
      localStorage.setItem("auth_token", data.token);
      queryClient.setQueryData(["/api/auth/me"], { user: data.user });
      toast({ title: "Welcome back!", description: "Successfully logged in." });
      setLocation("/");
    },
    onError: (err: Error) => {
      toast({ title: "Login failed", description: err.message, variant: "destructive" });
    },
  });
}

export function useRegister() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [, setLocation] = useLocation();

  return useMutation({
    mutationFn: async (data: any) => {
      const result = await fetchApi(api.auth.register.path, {
        method: api.auth.register.method,
        body: JSON.stringify(data),
      }, api.auth.register.responses[201]);
      return result;
    },
    onSuccess: (data) => {
      localStorage.setItem("auth_token", data.token);
      queryClient.setQueryData(["/api/auth/me"], { user: data.user });
      toast({ title: "Account created!", description: "Welcome to AI Interviewer." });
      setLocation("/");
    },
    onError: (err: Error) => {
      toast({ title: "Registration failed", description: err.message, variant: "destructive" });
    },
  });
}

export function useLogout() {
  const queryClient = useQueryClient();
  const [, setLocation] = useLocation();
  const { toast } = useToast();

  return () => {
    localStorage.removeItem("auth_token");
    queryClient.setQueryData(["/api/auth/me"], null);
    queryClient.clear();
    toast({ title: "Logged out", description: "You have been successfully logged out." });
    setLocation("/auth");
  };
}
