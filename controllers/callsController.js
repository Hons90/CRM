const prisma = require('../prisma/client');
const threeCXService = require('../services/threecx');

exports.dialNumber = async (req, res, next) => {
  try {
    const { poolId, phoneNumber } = req.body;
    const userId = req.user.id;

    const callResult = await threeCXService.dialNumber(phoneNumber, userId);

    const callLog = await prisma.callLog.create({
      data: {
        userId,
        poolId: poolId ? parseInt(poolId) : null,
        phoneNumber,
        status: 'initiated',
        duration: 0,
        callTime: new Date()
      }
    });

    if (poolId) {
      await prisma.dialerNumber.updateMany({
        where: { poolId: parseInt(poolId), phoneNumber },
        data: { isCalled: true }
      });
    }

    res.json({ callLog, callResult });
  } catch (err) {
    console.error('Error dialing number:', err);
    next(err);
  }
};

exports.qualifyCall = async (req, res, next) => {
  try {
    const callId = parseInt(req.params.id);
    const { status, outcome, duration, notes } = req.body;

    const updatedCall = await prisma.callLog.update({
      where: { id: callId },
      data: {
        status: status || undefined,
        outcome: outcome || undefined,
        duration: duration ? parseInt(duration) : undefined,
        notes: notes || undefined
      }
    });

    res.json(updatedCall);
  } catch (err) {
    console.error('Error qualifying call:', err);
    next(err);
  }
};

exports.getCallLogs = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { poolId } = req.query;

    const where = { userId };
    if (poolId) where.poolId = parseInt(poolId);

    const callLogs = await prisma.callLog.findMany({
      where,
      include: {
        pool: true
      },
      orderBy: { callTime: 'desc' }
    });

    res.json(callLogs);
  } catch (err) {
    console.error('Error fetching call logs:', err);
    next(err);
  }
};
