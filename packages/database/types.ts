import { InferInsertModel, InferSelectModel } from "drizzle-orm";
import { pointOfInterest } from "./schema/points-game";
import { users } from "./schema/schema";

export type User = InferSelectModel<typeof users>;
export type NewUser = InferInsertModel<typeof users>;

export type PointOfInterest = InferSelectModel<typeof pointOfInterest>;
export type NewPointOfInterest = InferInsertModel<typeof pointOfInterest>;
