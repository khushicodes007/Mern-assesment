import { OAuth2Client } from 'google-auth-library';

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

interface GoogleUserInfo {
  name: string;
  email: string;
  googleId: string;
}

export const verifyGoogleToken = async (token: string): Promise<GoogleUserInfo> => {
  try {
    const ticket = await client.verifyIdToken({
      idToken: token,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();
    
    if (!payload) {
      throw new Error('Invalid token payload');
    }

    return {
      name: payload.name || '',
      email: payload.email || '',
      googleId: payload.sub,
    };
  } catch (error) {
    throw new Error('Google token verification failed');
  }
};