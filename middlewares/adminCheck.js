module.exports = (req, res, next) => {
  // Simulate admin check. In real use, check req.user.role === 'admin'
  // For now, allow all requests to pass as admin
  next();
}; 