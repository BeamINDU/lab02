import { format, isValid, parseISO } from 'date-fns';
import { enUS } from 'date-fns/locale';

type DateInput = string | number | Date | null | undefined;

const toValidDate = (raw: DateInput): Date | null => {
  if (!raw) return null;

  const date = typeof raw === 'string' ? parseISO(raw) : new Date(raw);
  return isValid(date) ? date : null;
};

export const formatDateTime = (value: DateInput, formatStr: string = 'yyyy-MM-dd HH:mm:ss'): string => {
  const date = toValidDate(value);
  return date ? format(date, formatStr, { locale: enUS }) : '';
};

export const formatDate = (value: DateInput, formatStr: string = 'yyyy-MM-dd'): string => {
  const date = toValidDate(value);
  return date ? format(date, formatStr, { locale: enUS }) : '';
};

export const formatTime = (value: DateInput, formatStr: string = 'HH:mm'): string => {
  const date = toValidDate(value);
  return date ? format(date, formatStr, { locale: enUS }) : '';
};
