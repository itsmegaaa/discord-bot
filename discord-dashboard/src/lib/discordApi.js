export function discordAuthorizeUrl() {
  const params = new URLSearchParams({
    client_id: import.meta.env.VITE_DISCORD_CLIENT_ID,
    redirect_uri: `${window.location.origin}/login`,
    response_type: 'token',
    scope: 'identify guilds',
  });
  return `https://discord.com/oauth2/authorize?${params.toString()}`;
}

export function parseDiscordTokenFromHash(hash) {
  const params = new URLSearchParams(hash.replace(/^#/, ''));
  return {
    accessToken: params.get('access_token'),
    expiresIn: params.get('expires_in'),
  };
}
