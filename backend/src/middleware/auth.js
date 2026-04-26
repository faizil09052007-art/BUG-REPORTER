import jwt from 'jsonwebtoken';
import User from '../modules/user/user.model.js';
import { config } from '../config/env.js';

export const protect = async (req, res, next) => {
  try {
    let token;

    // Check for token in headers
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    } 
    // Fallback to checking cookies for accessToken (if implemented that way)
    else if (req.cookies.accessToken) {
      token = req.cookies.accessToken;
    }

    if (!token) {
      return res.status(401).json({ message: 'Not authorized, no token' });
    }

    // Verify token
    const decoded = jwt.verify(token, config.jwtAccessSecret);

    // Fetch full user so name/avatar are available downstream
    const user = await User.findById(decoded.id).select('name email role avatar');
    if (!user) return res.status(401).json({ message: 'User not found' });

    req.user = { id: decoded.id, role: decoded.role, name: user.name, avatar: user.avatar };
    next();
  } catch (error) {
    console.error(error);
    res.status(401).json({ message: 'Not authorized, token failed' });
  }
};

export const authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ 
        message: `User role '${req.user.role}' is not authorized to access this route` 
      });
    }
    next();
  };
};
