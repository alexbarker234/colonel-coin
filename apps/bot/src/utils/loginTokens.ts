import { db, lt } from "database";
import { loginTokens } from "database/schema";

export const deleteExpiredTokens = async () => {
    try {
        await db.delete(loginTokens).where(lt(loginTokens.expiresAt, new Date()));
    } catch (error) {
        console.error(error);
    }
};
