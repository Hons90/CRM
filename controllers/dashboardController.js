const prisma = require('../prisma/client');

exports.getDashboard = async (req, res, next) => {
  try {
    // Leaderboard: total sales by user
    const leaderboard = await prisma.sale.groupBy({
      by: ['userId'],
      _sum: { amount: true },
      orderBy: { _sum: { amount: 'desc' } },
    });

    // Populate leaderboard with user info
    const leaderboardWithUsers = await Promise.all(
      leaderboard.map(async (entry) => {
        const user = await prisma.user.findUnique({
          where: { id: entry.userId },
          select: { id: true, name: true, email: true }
        });
        return { ...entry, user };
      })
    );

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
