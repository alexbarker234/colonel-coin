import { PointOfInterest } from "database";

export type PointData = PointOfInterest & {
  claimedBy: {
    id: string;
    username: string;
    avatar: string;
    claimedAt: Date;
  } | null;
};
