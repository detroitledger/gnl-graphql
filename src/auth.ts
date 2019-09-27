import * as config from 'config';
import { OAuth2Client } from 'google-auth-library';

export async function verifyToken(idToken, client: OAuth2Client) {
  const ticket = await client.verifyIdToken({
    idToken,
    audience: config.get('google.client_id'),
  });
  const payload = ticket && ticket.getPayload();
  return payload;
}

export const authenticateGoogleUser = user =>
  config
    .get('auth.allowed_emails')
    .toString()
    .split(' ')
    .includes(user.email);

export const authenticatedOnly = (handler, client: OAuth2Client) => (
  req,
  res
) => {
  if (req.headers['x-auth-token']) {
    try {
      verifyToken(req.headers['x-auth-token'], client)
        .then(user => {
          req.user = user;
          if (authenticateGoogleUser(user)) {
            handler(req, res);
          } else {
            res.status(401).json({ error: 'Not on the list' });
          }
        })
        .catch(e => {
          if (e.message && e.message.includes('Token used too late')) {
            res.status(412).json({ error: 'Token expired' });
          } else {
            res.status(401).json({ error: 'Unauthorized' });
          }
        });
    } catch (e) {
      res.status(500).json({ error: 'Unknown error' });
    }
  } else {
    res.status(400).json({ error: 'Missing token' });
  }
};

export const getTokenFromReq = req => req.headers['x-auth-token'];

export const getUserFromToken = async (tok: string, client: OAuth2Client) => {
  if (tok) {
    try {
      const user = await verifyToken(tok, client);
      if (authenticateGoogleUser(user)) {
        return user;
      }
    } catch (e) {
      // tough!
    }
  }

  return null;
};
