const buildAvatarURL = (userId: string, avatarHash: string) => {
  const isGif = avatarHash.startsWith("a_");
  const format = isGif ? "gif" : "png";
  return `https://cdn.discordapp.com/avatars/${userId}/${avatarHash}.${format}`;
};

const buildGuildIconURL = (guildId: string, iconHash: string) => {
  const isGif = iconHash.startsWith("a_");
  const format = isGif ? "gif" : "png";
  return `https://cdn.discordapp.com/icons/${guildId}/${iconHash}.${format}`;
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

export const getGuildInfo = async (guildId: string) => {
  const response = await fetch(`https://discord.com/api/v10/guilds/${guildId}`, {
    headers: {
      Authorization: `Bot ${process.env.BOT_TOKEN}`
    },
    next: {
      revalidate: 3600 // Cache for 1 hour
    }
  });

  if (!response.ok) {
    throw new Error("Failed to fetch guild info");
  }

  const data = await response.json();

  const guildInfo = {
    id: data.id,
    name: data.name,
    iconURL: data.icon ? buildGuildIconURL(data.id, data.icon) : null,
    memberCount: data.approximate_member_count,
    description: data.description,
    features: data.features
  };
  return guildInfo;
};
