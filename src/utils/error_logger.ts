import * as fs from 'fs';
import * as path from 'path';

export function logError(error: unknown, functionName: string = ''): void {
  try {
    const logFilePath = path.join(__dirname, '..', '..', 'logs', 'error.log');

    // Ensure logs directory exists
    const logDir = path.dirname(logFilePath);
    if (!fs.existsSync(logDir)) {
      fs.mkdirSync(logDir, { recursive: true });
    }

    const timestamp = new Date().toLocaleString('en-US', {
      timeZone: 'Asia/Tashkent',
      hour12: false,
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });

    const errorName = error instanceof Error ? error.name : 'UnknownException';
    const errorMessage = error instanceof Error ? error.message : String(error);
    const errorStack =
      error instanceof Error
        ? error.stack || 'No stack trace'
        : 'No stack trace';

    const functionLabel = functionName ? `Function: ${functionName}\n` : '';

    const logMessage = `
[${timestamp}] PID: ${process.pid}
${errorName}: ${errorMessage}
${functionLabel}Stack: ${errorStack}
${'='.repeat(80)}
`;

    fs.appendFileSync(logFilePath, logMessage, 'utf8');
  } catch (loggingError) {
    // Fallback to console if file logging fails
    console.error('Failed to write to log file:', loggingError);
    console.error('Original error:', error);
  }
}
