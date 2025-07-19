import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { PointOfInterest } from "database";

export const useGetPoints = (guildId: string) => {
  return useQuery({
    queryKey: ["guildPoints", guildId],
    queryFn: async () => {
      const response = await axios.get<PointOfInterest[]>(`/api/guild/${guildId}/points`);
      return response.data;
    },
    refetchInterval: 60000
  });
};

export const useAddPoint = (guildId: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (point: { name: string; latitude: number; longitude: number }) => {
      const response = await axios.post<PointOfInterest>(`/api/guild/${guildId}/points`, point);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["guildPoints", guildId] });
    }
  });
};

export const useResetPoints = (guildId: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      const response = await axios.post<{ success: boolean }>(`/api/guild/${guildId}/points/reset`);
      return response.data.success;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["guildPoints", guildId] });
    }
  });
};

export const useDeletePoint = (guildId: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (pointId: string) => {
      const response = await axios.delete<{ success: boolean }>(`/api/guild/${guildId}/points/${pointId}`);
      return response.data.success;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["guildPoints", guildId] });
    }
  });
};
