const prisma = require('../prisma/client');

exports.getDashboard = async (req, res, next) => {
  try {
    // Leaderboard: total sales by user
    const leaderboard = await prisma.sale.groupBy({
      by: ['userId'],
      _sum: { amount: true },
      orderBy: { _sum: { amount: 'desc' } },
    });

    const userIds = leaderboard.map(entry => entry.userId);
    
    const users = await prisma.user.findMany({
      where: { id: { in: userIds } },
      select: { id: true, name: true, email: true }
    });

    const userMap = users.reduce((map, user) => {
      map[user.id] = user;
      return map;
    }, {});

    const leaderboardWithUsers = leaderboard.map(entry => ({
      ...entry,
      user: userMap[entry.userId]
    }));

    // Appointments today
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);

    const appointmentsToday = await prisma.appointment.findMany({
      where: {
        startTime: { gte: today, lt: tomorrow },
        isDeleted: false
      },
      include: { user: true, contact: true },
      orderBy: { startTime: 'asc' }
    });

    // Call stats
    const answered = await prisma.callLog.count({ where: { status: 'answered' } });
    const missed = await prisma.callLog.count({ where: { status: 'missed' } });

    res.json({
      leaderboard: leaderboardWithUsers,
      appointmentsToday,
      callStats: { answered, missed }
    });
  } catch (err) {
    console.error('Error in dashboard:', err);
    next(err);
  }
};
