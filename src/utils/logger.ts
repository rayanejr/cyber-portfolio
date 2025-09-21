import { format } from 'date-fns';
import { formatInTimeZone } from 'date-fns-tz';
import { fr } from 'date-fns/locale';

const TIMEZONE = 'Europe/Paris';

interface LogContext {
  component?: string;
  action?: string;
  userId?: string;
  [key: string]: any;
}

export const logger = {
  info: (message: string, context?: LogContext) => {
    const timestamp = formatInTimeZone(new Date(), TIMEZONE, 'dd/MM/yyyy à HH:mm:ss', { locale: fr });
    const prefix = context?.component ? `[${context.component}]` : '[App]';
    console.log(`${prefix} ${timestamp} - INFO: ${message}`, context ? { ...context } : '');
  },

  error: (message: string, error?: Error | any, context?: LogContext) => {
    const timestamp = formatInTimeZone(new Date(), TIMEZONE, 'dd/MM/yyyy à HH:mm:ss', { locale: fr });
    const prefix = context?.component ? `[${context.component}]` : '[App]';
    console.error(`${prefix} ${timestamp} - ERREUR: ${message}`, error, context ? { ...context } : '');
  },

  warn: (message: string, context?: LogContext) => {
    const timestamp = formatInTimeZone(new Date(), TIMEZONE, 'dd/MM/yyyy à HH:mm:ss', { locale: fr });
    const prefix = context?.component ? `[${context.component}]` : '[App]';
    console.warn(`${prefix} ${timestamp} - ATTENTION: ${message}`, context ? { ...context } : '');
  },

  debug: (message: string, data?: any, context?: LogContext) => {
    if (process.env.NODE_ENV === 'development') {
      const timestamp = formatInTimeZone(new Date(), TIMEZONE, 'dd/MM/yyyy à HH:mm:ss', { locale: fr });
      const prefix = context?.component ? `[${context.component}]` : '[App]';
      console.debug(`${prefix} ${timestamp} - DEBUG: ${message}`, data, context ? { ...context } : '');
    }
  }
};

export default logger;