const jwt = require('jsonwebtoken');
const JWT_SECRET = process.env.JWT_SECRET || 'changeme';

module.exports = function authMiddleware(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader)
    return res.status(401).json({ message: 'Missing Authorization header' });

  const token = authHeader.split(' ')[1];
  if (!token)
    return res.status(401).json({ message: 'Malformed Authorization header' });

  try {
    const payload = jwt.verify(token, JWT_SECRET);
    req.user = { id: payload.userId, ...payload };   // attach { id, userId, role, email } to req.user
    next();
  } catch (err) {
    return res.status(401).json({ message: 'Invalid or expired token' });
  }
};  