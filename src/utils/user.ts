import { db } from "@/database/db";
import { users } from "@/database/schema";
import { eq, InferSelectModel } from "drizzle-orm";

export async function getUser(id: string): Promise<InferSelectModel<typeof users>> {
    const user = await db.select().from(users).where(eq(users.id, id)).limit(1);

    if (user.length === 0) {
        await db.insert(users).values({ id, balance: 0 });
        return await getUser(id);
    }

    return user[0];
}
