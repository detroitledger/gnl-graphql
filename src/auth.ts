import * as config from 'config';
import { OAuth2Client } from 'google-auth-library';

import { Db } from './db/models';

export async function verifyToken(idToken, client: OAuth2Client) {
  const ticket = await client.verifyIdToken({
    idToken,
    audience: config.get('google.client_id'),
  });
  const payload = ticket && ticket.getPayload();
  return payload;
}

export const authenticateGoogleUser = async (user, db) => {
  const dbUser = await db.User.findOne({ where: { email: user.email } });
  return dbUser;
};

export const authenticatedOnly = (
  handler,
  client: OAuth2Client,
  db: Db
) => async (req, res) => {
  if (req.headers['x-auth-token']) {
    try {
      const user = await verifyToken(req.headers['x-auth-token'], client);

      req.user = user;

      if (await authenticateGoogleUser(user, db)) {
        handler(req, res);
      } else {
        res.status(401).json({ error: 'Not on the list' });
      }
    } catch (e) {
      if (e.message && e.message.includes('Token used too late')) {
        res.status(412).json({ error: 'Token expired' });
      } else {
        res.status(401).json({ error: 'Unauthorized' });
      }
    }
  } else {
    res.status(400).json({ error: 'Missing token' });
  }
};

export const getTokenFromReq = req => req.headers['x-auth-token'];

export const getUserFromToken = async (
  token: string,
  client: OAuth2Client,
  db: Db
) => {
  if (token) {
    try {
      const user = await verifyToken(token, client);
      const dbUser = await authenticateGoogleUser(user, db);
      return dbUser;
    } catch (e) {
      // tough!
    }
  }

  return null;
};
