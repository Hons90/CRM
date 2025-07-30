const prisma = require('../prisma/client');
const bcrypt = require('bcryptjs');

exports.getAllUsers = async (req, res, next) => {
  try {
    const users = await prisma.user.findMany({
      where: { isDeleted: false },
      select: { 
        id: true, 
        name: true, 
        email: true, 
        role: true, 
        createdAt: true 
      },
      orderBy: { createdAt: 'desc' }
    });
    res.json(users);
  } catch (err) {
    console.error('Error fetching users:', err);
    next(err);
  }
};

exports.createUser = async (req, res, next) => {
  try {
    const { name, email, password, role } = req.body;
    
    if (!name || !email || !password) {
      return res.status(400).json({ error: 'Name, email, and password are required' });
    }

    const existingUser = await prisma.user.findUnique({
      where: { email }
    });

    if (existingUser) {
      return res.status(400).json({ error: 'User with this email already exists' });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    
    const user = await prisma.user.create({
      data: { 
        name, 
        email, 
        passwordHash, 
        role: role || 'employee' 
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true
      }
    });
    
    res.status(201).json(user);
  } catch (err) {
    console.error('Error creating user:', err);
    next(err);
  }
};

exports.updateUser = async (req, res, next) => {
  try {
    const userId = parseInt(req.params.id);
    const { name, email, role, password } = req.body;
    
    const updateData = {};
    if (name) updateData.name = name;
    if (email) updateData.email = email;
    if (role) updateData.role = role;
    if (password) updateData.passwordHash = await bcrypt.hash(password, 10);

    const user = await prisma.user.update({
      where: { id: userId },
      data: updateData,
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true
      }
    });
    
    res.json(user);
  } catch (err) {
    console.error('Error updating user:', err);
    next(err);
  }
};

exports.deleteUser = async (req, res, next) => {
  try {
    const userId = parseInt(req.params.id);
    
    if (userId === req.user.id) {
      return res.status(400).json({ error: 'Cannot delete your own account' });
    }

    await prisma.user.update({
      where: { id: userId },
      data: { isDeleted: true }
    });
    
    res.json({ message: 'User deleted successfully' });
  } catch (err) {
    console.error('Error deleting user:', err);
    next(err);
  }
};
