class ThreeCXService {
  async dialNumber(phoneNumber, userId) {
    console.log(`Dialing ${phoneNumber} for user ${userId}`);
    return {
      success: true,
      callId: `call_${Date.now()}`,
      message: 'Call initiated successfully'
    };
  }
}

module.exports = new ThreeCXService();
