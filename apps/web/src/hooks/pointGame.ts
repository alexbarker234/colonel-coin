import { PointData } from "@/types";
import { useMutation, useQuery } from "@tanstack/react-query";
import axios from "axios";

export const useGetPoints = (gameId: string) => {
  return useQuery({
    queryKey: ["points", gameId],
    queryFn: async () => {
      const response: { data: { points: PointData[] } } = await axios.get(`/api/point-game/${gameId}/info`);
      return response.data.points;
    },
    refetchInterval: 60000
  });
};

export const useClaimPoint = () => {
  const mutationFn = async ({
    gameId,
    pointId,
    longitude,
    latitude
  }: {
    gameId: string;
    pointId: string;
    longitude: number;
    latitude: number;
  }) => {
    const url = `/api/point-game/${gameId}/claim`;

    const response = await axios.post(url, { pointId, longitude, latitude });

    return response.data;
  };

  return useMutation({
    mutationFn
  });
};
