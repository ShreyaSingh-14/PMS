const jwt = require('jsonwebtoken');
const User = require('../models/User');

const protect = async (req, res, next) => {
  let token;
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      token = req.headers.authorization.split(' ')[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret123');
      req.user = await User.findById(decoded.id).select('-password');
      next();
    } catch (error) {
      res.status(401).json({ message: 'Not authorized, token failed' });
    }
  }
  if (!token) {
    res.status(401).json({ message: 'Not authorized, no token' });
  }
};

const admin = (req, res, next) => {
  if (req.user && req.user.role === 'Admin') {
    next();
  } else {
    res.status(403).json({ message: 'Not authorized as an admin' });
  }
};

const manager = (req, res, next) => {
  const role = req.user?.role?.toLowerCase();
  if (req.user && (role === 'manager' || role === 'admin')) {
    next();
  } else {
    console.warn(`AUTH_DENIED: User ${req.user?.email} attempted manager-only action with role ${req.user?.role}`);
    res.status(403).json({ message: 'Not authorized as a manager' });
  }
};

module.exports = { protect, admin, manager };
