/**
 * Logger-Utility für konsistentes Logging im gesamten Projekt.
 * 
 * - `logger.log`, `logger.warn`, `logger.debug` sind nur im Development-Modus aktiv
 * - `logger.error` loggt immer (auch in Production)
 * - Verhindert console.log-Spam in Produktions-Builds
 * 
 * @example
 * import { logger } from '../utils/logger';
 * logger.log('Element erstellt:', element);
 * logger.warn('Deprecated Funktion verwendet');
 * logger.error('Kritischer Fehler:', error);
 * logger.debug('Debug-Info:', data);
 */

const isDev = process.env.NODE_ENV === 'development';

export const logger = {
  /** Allgemeines Logging — nur im Development-Modus */
  log: (...args: unknown[]): void => {
    if (isDev) console.log(...args);
  },

  /** Warnungen — nur im Development-Modus */
  warn: (...args: unknown[]): void => {
    if (isDev) console.warn(...args);
  },

  /** Fehler — werden IMMER geloggt (auch in Production) */
  error: (...args: unknown[]): void => {
    console.error(...args);
  },

  /** Debug-Informationen — nur im Development-Modus */
  debug: (...args: unknown[]): void => {
    if (isDev) console.debug(...args);
  },
};
