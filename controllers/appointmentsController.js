const prisma = require('../prisma/client');

exports.createAppointment = async (req, res, next) => {
  try {
    const { userId, contactId, title, description, startTime, endTime, status } = req.body;

    if (!userId || !contactId || !title || !startTime || !endTime) {
      return res.status(400).json({ error: 'Missing required fields.' });
    }

    const appointment = await prisma.appointment.create({
      data: {
        userId,
        contactId,
        title,
        description: description || null,
        startTime: new Date(startTime),
        endTime: new Date(endTime),
        status: status || 'pending'
      }
    });

    res.status(201).json(appointment);
  } catch (err) {
    console.error('Error creating appointment:', err);
    next(err);
  }
};

exports.getUserAppointments = async (req, res, next) => {
  try {
    const { userId, filter } = req.query;
    const where = { isDeleted: false };

    if (userId) where.userId = parseInt(userId);

    // Filter by date (today, week, month)
    const now = new Date();
    if (filter === 'today') {
      const startOfDay = new Date(now.setHours(0, 0, 0, 0));
      const endOfDay = new Date(now.setHours(23, 59, 59, 999));
      where.startTime = { gte: startOfDay, lt: endOfDay };
    } else if (filter === 'week') {
      const startOfWeek = new Date();
      startOfWeek.setDate(now.getDate() - now.getDay());
      const endOfWeek = new Date(startOfWeek);
      endOfWeek.setDate(startOfWeek.getDate() + 7);
      where.startTime = { gte: startOfWeek, lt: endOfWeek };
    } else if (filter === 'month') {
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1);
      where.startTime = { gte: startOfMonth, lt: endOfMonth };
    }

    const appointments = await prisma.appointment.findMany({
      where,
      include: {
        contact: true,
        user: true
      },
      orderBy: { startTime: 'asc' }
    });

    res.json(appointments);
  } catch (err) {
    console.error('Error fetching appointments:', err);
    next(err);
  }
};

exports.getAllAppointments = async (req, res, next) => {
  try {
    const appointments = await prisma.appointment.findMany({
      where: { isDeleted: false },
      include: {
        contact: true,
        user: true
      },
      orderBy: { startTime: 'asc' }
    });

    res.json(appointments);
  } catch (err) {
    console.error('Error fetching all appointments:', err);
    next(err);
  }
};

exports.updateAppointment = async (req, res, next) => {
  try {
    const id = parseInt(req.params.id);
    const { title, description, startTime, endTime, status } = req.body;

    const updatedAppointment = await prisma.appointment.update({
      where: { id },
      data: {
        title: title || undefined,
        description: description || undefined,
        startTime: startTime ? new Date(startTime) : undefined,
        endTime: endTime ? new Date(endTime) : undefined,
        status: status || undefined
      }
    });

    res.json(updatedAppointment);
  } catch (err) {
    console.error('Error updating appointment:', err);
    next(err);
  }
};

exports.deleteAppointment = async (req, res, next) => {
  try {
    const id = parseInt(req.params.id);

    await prisma.appointment.update({
      where: { id },
      data: { isDeleted: true }
    });

    res.json({ message: 'Appointment soft-deleted successfully.' });
  } catch (err) {
    console.error('Error deleting appointment:', err);
    next(err);
  }
};
