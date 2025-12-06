import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Equipo } from "../admin_c/Equipo";

export function useCreateTeam() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (team: Equipo) => {
      await new Promise((resolve) => setTimeout(resolve, 1000));
    },
    onMutate: (newTeam: Equipo) => {
      queryClient.setQueryData(["teams"], (prev: any) => [
        ...prev,
        {
          ...newTeam,
          id: (Math.random() + 1).toString(36).substring(7),
        },
      ]);
    },
  });
}
