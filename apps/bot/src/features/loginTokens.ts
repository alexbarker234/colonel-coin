import { db, loginTokens, lt } from "database";

export const deleteExpiredTokens = async () => {
    try {
        await db.delete(loginTokens).where(lt(loginTokens.expiresAt, new Date()));
    } catch (error) {
        console.error(error);
    }
};
