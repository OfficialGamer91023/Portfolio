import dotenv from 'dotenv';
import http from 'http';

/**
 * One-time helper to obtain a Strava REFRESH TOKEN.
 *
 * You only ever run this once (or again if you revoke access). It:
 *   1. Prints the Strava authorize URL for you to open in a browser and click "Authorize".
 *   2. Catches the redirect back to http://localhost:8721/callback and reads the ?code=.
 *   3. Exchanges that code for a refresh token and prints it.
 *
 * Then paste the printed value into STRAVA_REFRESH_TOKEN (locally in backend/.env, and in
 * your host's env for production). The refresh token is long-lived; the daily sync uses it
 * to mint short-lived access tokens on its own.
 *
 * Prerequisites — in your Strava API app settings (https://www.strava.com/settings/api):
 *   - "Authorization Callback Domain" must be exactly:  localhost
 *   - STRAVA_CLIENT_ID and STRAVA_CLIENT_SECRET must be set in backend/.env
 *
 * Run:  npm run strava:auth
 */
dotenv.config();

const PORT = 8721;
const REDIRECT_URI = `http://localhost:${PORT}/callback`;
const SCOPE = 'activity:read_all';

function requireEnv(name: string): string {
  const value = process.env[name];
  if (!value) {
    console.error(`Missing ${name}. Set it in backend/.env first.`);
    process.exit(1);
  }
  return value;
}

async function exchangeCode(code: string): Promise<void> {
  const res = await fetch('https://www.strava.com/oauth/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      client_id: requireEnv('STRAVA_CLIENT_ID'),
      client_secret: requireEnv('STRAVA_CLIENT_SECRET'),
      code,
      grant_type: 'authorization_code',
    }),
  });
  const json = (await res.json()) as {
    refresh_token?: string;
    athlete?: { firstname?: string; lastname?: string };
  };
  if (!res.ok || !json.refresh_token) {
    console.error('Token exchange failed:', JSON.stringify(json, null, 2));
    process.exit(1);
  }
  const who = json.athlete ? `${json.athlete.firstname ?? ''} ${json.athlete.lastname ?? ''}`.trim() : '';
  console.log('\n============================================================');
  console.log(`Authorized${who ? ` as ${who}` : ''}. Add this to your env:\n`);
  console.log(`STRAVA_REFRESH_TOKEN="${json.refresh_token}"`);
  console.log('============================================================\n');
}

function main(): void {
  const clientId = requireEnv('STRAVA_CLIENT_ID');
  const authorizeUrl =
    'https://www.strava.com/oauth/authorize?' +
    new URLSearchParams({
      client_id: clientId,
      response_type: 'code',
      redirect_uri: REDIRECT_URI,
      approval_prompt: 'force',
      scope: SCOPE,
    }).toString();

  const server = http.createServer((req, res) => {
    if (!req.url || !req.url.startsWith('/callback')) {
      res.writeHead(404).end();
      return;
    }
    const url = new URL(req.url, `http://localhost:${PORT}`);
    const code = url.searchParams.get('code');
    const error = url.searchParams.get('error');

    if (error || !code) {
      res.writeHead(400, { 'Content-Type': 'text/plain' });
      res.end(`Authorization failed: ${error ?? 'no code returned'}`);
      console.error('Authorization failed:', error ?? 'no code returned');
      server.close();
      process.exit(1);
      return;
    }

    res.writeHead(200, { 'Content-Type': 'text/plain' });
    res.end('Strava authorized. You can close this tab and return to the terminal.');
    server.close();
    void exchangeCode(code).then(() => process.exit(0));
  });

  server.listen(PORT, () => {
    console.log('\nOpen this URL in your browser and click "Authorize":\n');
    console.log(authorizeUrl);
    console.log(`\nWaiting for the redirect to ${REDIRECT_URI} ...\n`);
  });
}

main();
