const fs = require('fs');
const path = require('path');
const moment = require('moment');

// Function to log messages
function log(message) {
  // Get current timestamp
  const today = moment().format('YYYY-MM-DD');
  const now = moment().format('YYYY-MM-DD HH:mm:ss');
  const logEntry = `${now} - ${message}\n`;
  // Path to log directory
  const logDirPath = path.join(process.cwd(), 'log');  
  const logFilePath = path.join(logDirPath, `sys-logs_${today}.txt`);

  // Ensure log directory exists, or create it
  if (!fs.existsSync(logDirPath)) {
      fs.mkdirSync(logDirPath, { recursive: true });
  }

  console.log(logFilePath);

  // Append log entry to log file
  // Check if log file exists
  fs.stat(logFilePath, (err, stats) => {
    if (err && err.code === 'ENOENT') {
      // If file does not exist, create it
      fs.writeFile(logFilePath, '', (err) => {
        if (err) {
          console.error('Error creating log file:', err);
        } else {
          appendToLogFile(logFilePath, logEntry);
          console.log(logEntry)
        }
      });
    } else if (!err) {
      // If file exists, append log entry
      appendToLogFile(logFilePath, logEntry);
      console.log(logEntry)
    } else {
      console.error('Error checking log file status:', err);
    }
  });
}

// Function to append to log file
function appendToLogFile(logFilePath, logEntry) {
  fs.appendFile(logFilePath, logEntry, (err) => {
    if (err) {
      console.error('Error writing to log file:', err);
    }
  });
}

// Export the log function
module.exports = log;
