import { InferInsertModel, InferSelectModel } from "drizzle-orm";
import { users } from "./schema/schema";

export type User = InferSelectModel<typeof users>;
export type NewUser = InferInsertModel<typeof users>;
