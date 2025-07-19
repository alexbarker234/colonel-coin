import { InferInsertModel, InferSelectModel } from "drizzle-orm";
import { pointsOfInterest } from "./schema/points-game";
import { users } from "./schema/schema";

export type User = InferSelectModel<typeof users>;
export type NewUser = InferInsertModel<typeof users>;

export type PointsOfInterest = InferSelectModel<typeof pointsOfInterest>;
export type NewPointsOfInterest = InferInsertModel<typeof pointsOfInterest>;
