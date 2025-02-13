// import { User as DiscordUser } from "discord.js";
// import { prisma } from "@/lib/prisma";
// import { randBetween } from "@/utils/mathUtils";
// import { User } from "@prisma/client";

// export async function getUser(user: DiscordUser) {
//     const dbUser = await prisma.user.upsert({
//         where: {
//             id: user.id,
//         },
//         update: {},
//         create: {
//             id: user.id,
//             username: user.username,
//             discriminator: parseInt(user.discriminator),
//             avatarURL: user.avatarURL(),
//         },
//     });
//     return dbUser;
// }

// export async function manageXP(user: User) {
//     const oneMinuteAgo = new Date();
//     oneMinuteAgo.setMinutes(oneMinuteAgo.getMinutes() - 1);

//     if (!user.lastExperience || user.lastExperience < oneMinuteAgo) {
//         const xp = randBetween(15, 24);
//         const updatedUser = await prisma.user.update({
//             where: { id: user.id },
//             data: {
//                 experience: {
//                     increment: xp,
//                 },
//                 lastExperience: new Date(),
//             },
//         });
//         const newLevel = xpInfo(updatedUser.experience).currentLevel;
//         const didLevelUp = newLevel > xpInfo(user.experience).currentLevel;
//         if (didLevelUp) console.log(`${user.username} just levelled up to ${newLevel}`);
//         return updatedUser;
//     }
//     return user;
// }

// const xpScale = 0.1; // lower =  more xp per level
// const power = 2; // how quickly gaps between levels increases

// export const xpInfo = (xp: number) => {
//     const levelToXP = (level: number) => (level / xpScale) ** power;

//     const currentLevel = Math.floor(xpScale * xp ** (1 / power));

//     const xpAtStart = levelToXP(currentLevel); // how much XP was needed to get to the users current level
//     const xpThisLevel = xp - xpAtStart; // how much XP the user has in this current level
//     const nextLevelXP = levelToXP(currentLevel + 1) - xpAtStart; // how much XP user needs to level up
//     const xpRemaining = nextLevelXP - xpThisLevel; // how much the user has left to go in this level

//     return { currentLevel, nextLevelXP, xpThisLevel, xpRemaining };
// };
