const buildAvatarURL = (userId: string, avatarHash: string) => {
  const isGif = avatarHash.startsWith("a_");
  const format = isGif ? "gif" : "png";
  return `https://cdn.discordapp.com/avatars/${userId}/${avatarHash}.${format}`;
};

export const getUserInfo = async (id: string) => {
  const response = await fetch(`https://discord.com/api/v10/users/${id}`, {
    headers: {
      Authorization: `Bot ${process.env.BOT_TOKEN}`
    },
    next: {
      revalidate: 86400
    }
  });

  if (!response.ok) {
    throw new Error("Failed to fetch user info");
  }

  const data = await response.json();

  const userInfo = {
    avatarURL: buildAvatarURL(data.id, data.avatar),
    username: data.username,
    id: data.id
  };
  return userInfo;
};
