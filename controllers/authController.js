const prisma = require('../prisma/client');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

exports.login = async (req, res, next) => {
  console.log("Login endpoint hit"); // Debug log

  try {
    const { email, password } = req.body;
    console.log("Login attempt with email:", email);

    // Validate input
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    // Look up the user in the database
    const user = await prisma.user.findUnique({ where: { email } });
    console.log("User found:", user);

    // If no user or wrong password
    const isValidPassword = user ? await bcrypt.compare(password, user.passwordHash) : false;
    if (!user || !isValidPassword) {
      console.log("Invalid login credentials");
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    // Generate a JWT token
    const token = jwt.sign(
      { userId: user.id, email: user.email, role: user.role },
      process.env.JWT_SECRET || 'karus-secret',
      { expiresIn: '1h' }
    );

    console.log("Login successful for user:", user.email);

    // Return response
    return res.json({
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });

  } catch (err) {
    console.error("Login error:", err);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

exports.updateMe = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { name, currentPassword, newPassword } = req.body;
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) return res.status(404).json({ error: 'User not found.' });

    // If changing password, verify current password
    if (newPassword) {
      if (!currentPassword) {
        return res.status(400).json({ error: 'Current password required.' });
      }
      const match = await bcrypt.compare(currentPassword, user.passwordHash);
      if (!match) {
        return res.status(400).json({ error: 'Current password is incorrect.' });
      }
    }

    const updateData = {};
    if (name) updateData.name = name;
    if (newPassword) {
      const hash = await bcrypt.hash(newPassword, 10);
      updateData.passwordHash = hash;
    }

    const updated = await prisma.user.update({
      where: { id: userId },
      data: updateData
    });
    res.json({ id: updated.id, name: updated.name, email: updated.email, role: updated.role });
  } catch (err) {
    next(err);
  }
};

exports.refresh = async (req, res, next) => {
  try {
    const { refreshToken } = req.body;
    
    if (!refreshToken) {
      return res.status(401).json({ error: 'Refresh token required' });
    }

    const decoded = jwt.verify(refreshToken, process.env.JWT_SECRET);
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId }
    });

    if (!user) {
      return res.status(401).json({ error: 'Invalid refresh token' });
    }

    const newAccessToken = jwt.sign(
      { userId: user.id, email: user.email, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );

    const newRefreshToken = jwt.sign(
      { userId: user.id },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({
      accessToken: newAccessToken,
      refreshToken: newRefreshToken,
      user: { id: user.id, name: user.name, email: user.email, role: user.role }
    });
  } catch (err) {
    console.error('Token refresh error:', err);
    res.status(401).json({ error: 'Invalid refresh token' });
  }
};

exports.logout = async (req, res, next) => {
  try {
    res.json({ message: 'Logged out successfully' });
  } catch (err) {
    console.error('Logout error:', err);
    next(err);
  }
};
