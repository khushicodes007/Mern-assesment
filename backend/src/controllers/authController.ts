import type { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import User from '../models/user.js';
import { verifyGoogleToken } from '../services/authService.js';

export const googleLogin = async (req: Request, res: Response): Promise<void> => {
  try {
    const { token } = req.body;

    if (!token) {
      res.status(400).json({ message: 'Google token is required' });
      return;
    }

    // Verify Google token
    const googleUser = await verifyGoogleToken(token);

    // Find or create user
    let user = await User.findOne({ email: googleUser.email });

    if (!user) {
      user = await User.create({
        name: googleUser.name,
        email: googleUser.email,
        googleId: googleUser.googleId,
        role: 'editor',
        isActive: true,
      });
    }

    // Generate JWT
    const jwtToken = jwt.sign(
      { id: user._id, email: user.email },
      process.env.JWT_SECRET as string,
      { expiresIn: '1h' }
    );

    res.json({
      token: jwtToken,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    res.status(500).json({ message: 'Authentication failed', error });
  }
};