import jwt from 'jsonwebtoken';

export const auth = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'No token provided, authorization denied' });
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'supersecretkeyforfishmart');
    req.user = decoded; // Contains id, role, email, name
    next();
  } catch (err) {
    return res.status(401).json({ message: 'Token is not valid' });
  }
};

export const sellerAuth = (req, res, next) => {
  auth(req, res, () => {
    if (req.user.role !== 'seller') {
      return res.status(403).json({ message: 'Access denied. Sellers only.' });
    }
    next();
  });
};
