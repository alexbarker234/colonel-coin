import { PointOfInterest } from "game-data";

export type PointData = PointOfInterest & {
  claimedBy: {
    id: string;
    username: string;
    avatar: string;
    claimedAt: Date;
  } | null;
};
