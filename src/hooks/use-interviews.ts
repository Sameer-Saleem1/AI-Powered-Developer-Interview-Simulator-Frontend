import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { fetchApi } from "@/lib/fetcher";
import { api, buildUrl } from "@shared/routes";
import { useToast } from "@/hooks/use-toast";
import { useLocation } from "wouter";

export function useSessions() {
  return useQuery({
    queryKey: [api.sessions.list.path],
    queryFn: () => fetchApi(api.sessions.list.path, {}, api.sessions.list.responses[200]),
  });
}

export function useSession(id: number) {
  return useQuery({
    queryKey: [api.sessions.get.path, id],
    queryFn: () => fetchApi(buildUrl(api.sessions.get.path, { id }), {}, api.sessions.get.responses[200]),
    enabled: !!id,
  });
}

export function useCreateSession() {
  const { toast } = useToast();
  const [, setLocation] = useLocation();

  return useMutation({
    mutationFn: async (data: { role: string; level: string; techStack: string[] }) => {
      return fetchApi(api.sessions.create.path, {
        method: api.sessions.create.method,
        body: JSON.stringify(data),
      }, api.sessions.create.responses[201]);
    },
    onSuccess: (session) => {
      toast({ title: "Session created", description: "Your interview is ready to begin." });
      setLocation(`/interview/${session.id}`);
    },
    onError: (err: Error) => {
      toast({ title: "Failed to create session", description: err.message, variant: "destructive" });
    },
  });
}

export function useSubmitAnswer() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ questionId, answerText }: { questionId: number; answerText: string }) => {
      const url = buildUrl(api.questions.answer.path, { id: questionId });
      return fetchApi(url, {
        method: api.questions.answer.method,
        body: JSON.stringify({ answerText }),
      }, api.questions.answer.responses[200]);
    },
    onSuccess: (_updatedQuestion) => {
      // Invalidate the session query to refresh the questions list
      queryClient.invalidateQueries({ queryKey: [api.sessions.get.path] });
      // Also invalidate the sessions list to update the dashboard
      queryClient.invalidateQueries({ queryKey: [api.sessions.list.path] });
    },
    onError: (err: Error) => {
      toast({ title: "Failed to submit answer", description: err.message, variant: "destructive" });
    },
  });
}
