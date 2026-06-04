export function discordAuthorizeUrl() {
  const redirectUri = import.meta.env.VITE_DISCORD_REDIRECT_URI || `${window.location.origin}/login`;
  const params = new URLSearchParams({
    client_id: import.meta.env.VITE_DISCORD_CLIENT_ID,
    redirect_uri: redirectUri,
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
