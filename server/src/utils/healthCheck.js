import mongoose from 'mongoose';

export const healthCheck = async (req, res) => {
  try {
    const dbStatus = mongoose.connection.readyState;
    const dbStates = {
      0: 'disconnected',
      1: 'connected',
      2: 'connecting',
      3: 'disconnecting',
    };

    res.json({
      status: 'ok',
      timestamp: new Date().toISOString(),
      database: dbStates[dbStatus] || 'unknown',
    });
  } catch (error) {
    res.status(503).json({
      status: 'error',
      timestamp: new Date().toISOString(),
      error: error.message,
    });
  }
};
