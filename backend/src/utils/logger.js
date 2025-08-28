const fs = require('fs');
const path = require('path');

// Create logs directory if it doesn't exist
const logsDir = path.join(__dirname, '../../logs');
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir, { recursive: true });
}

const logger = {
  info: (message, data = null) => {
    const timestamp = new Date().toISOString();
    const logMessage = `[${timestamp}] INFO: ${message}${data ? ` | Data: ${JSON.stringify(data)}` : ''}\n`;
    
    console.log(logMessage.trim());
    
    if (process.env.NODE_ENV === 'production') {
      fs.appendFileSync(path.join(logsDir, 'info.log'), logMessage);
    }
  },

  error: (message, error = null) => {
    const timestamp = new Date().toISOString();
    const errorDetails = error ? {
      message: error.message,
      stack: error.stack,
      name: error.name
    } : null;
    
    const logMessage = `[${timestamp}] ERROR: ${message}${errorDetails ? ` | Error: ${JSON.stringify(errorDetails)}` : ''}\n`;
    
    console.error(logMessage.trim());
    
    if (process.env.NODE_ENV === 'production') {
      fs.appendFileSync(path.join(logsDir, 'error.log'), logMessage);
    }
  },

  warn: (message, data = null) => {
    const timestamp = new Date().toISOString();
    const logMessage = `[${timestamp}] WARN: ${message}${data ? ` | Data: ${JSON.stringify(data)}` : ''}\n`;
    
    console.warn(logMessage.trim());
    
    if (process.env.NODE_ENV === 'production') {
      fs.appendFileSync(path.join(logsDir, 'warn.log'), logMessage);
    }
  },

  debug: (message, data = null) => {
    if (process.env.NODE_ENV === 'development') {
      const timestamp = new Date().toISOString();
      const logMessage = `[${timestamp}] DEBUG: ${message}${data ? ` | Data: ${JSON.stringify(data)}` : ''}`;
      console.log(logMessage);
    }
  }
};

module.exports = logger;