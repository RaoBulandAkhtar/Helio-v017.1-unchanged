import { parse, isValid, startOfDay, endOfDay } from 'date-fns';

interface ParsedDateRange {
  startDate: Date | null;
  endDate: Date | null;
  isRange: boolean;
}

const monthNames: { [key: string]: number } = {
  january: 0, jan: 0,
  february: 1, feb: 1,
  march: 2, mar: 2,
  april: 3, apr: 3,
  may: 4,
  june: 5, jun: 5,
  july: 6, jul: 6,
  august: 7, aug: 7,
  september: 8, sep: 8, sept: 8,
  october: 9, oct: 9,
  november: 10, nov: 10,
  december: 11, dec: 11,
};

const dayNames: { [key: string]: number } = {
  monday: 1, mon: 1,
  tuesday: 2, tue: 2,
  wednesday: 3, wed: 3,
  thursday: 4, thu: 4,
  friday: 5, fri: 5,
  saturday: 6, sat: 6,
  sunday: 0, sun: 0,
};

function parseMonthFromString(str: string): number | null {
  const lower = str.toLowerCase().trim();
  return monthNames[lower] ?? null;
}

function parseNumericDate(parts: string[]): Date | null {
  const year = new Date().getFullYear();
  let month: number | null = null;
  let day: number | null = null;
  let year_part: number | null = null;

  if (parts.length === 2) {
    const [p1, p2] = parts.map(p => parseInt(p, 10));
    if (isNaN(p1) || isNaN(p2)) return null;

    if (p1 > 12 && p2 <= 12) {
      day = p1;
      month = p2 - 1;
    } else if (p2 > 12 && p1 <= 12) {
      month = p1 - 1;
      day = p2;
    } else if (p1 <= 31 && p2 <= 31) {
      month = p1 - 1;
      day = p2;
    } else {
      return null;
    }
  } else if (parts.length === 3) {
    const [p1, p2, p3] = parts.map(p => parseInt(p, 10));
    if (isNaN(p1) || isNaN(p2) || isNaN(p3)) return null;

    if (p3 > 1900) {
      year_part = p3;
      if (p1 > 12 && p2 <= 12) {
        day = p1;
        month = p2 - 1;
      } else if (p2 > 12 && p1 <= 12) {
        month = p1 - 1;
        day = p2;
      } else if (p1 <= 31 && p2 <= 31) {
        month = p1 - 1;
        day = p2;
      }
    } else if (p1 > 1900) {
      year_part = p1;
      if (p2 > 12 && p3 <= 12) {
        day = p2;
        month = p3 - 1;
      } else if (p3 > 12 && p2 <= 12) {
        month = p2 - 1;
        day = p3;
      }
    } else {
      return null;
    }
  }

  if (month === null || day === null) return null;

  const date = new Date(year_part || year, month, day);
  if (!isValid(date) || date.getMonth() !== month || date.getDate() !== day) {
    return null;
  }

  if (date < new Date()) {
    date.setFullYear(year_part || year + 1);
  }

  return date;
}

function parseMixedDate(parts: string[]): Date | null {
  const year = new Date().getFullYear();

  if (parts.length === 2) {
    const [p1, p2] = parts;
    const num1 = parseInt(p1, 10);
    const month1 = parseMonthFromString(p1);
    const num2 = parseInt(p2, 10);
    const month2 = parseMonthFromString(p2);

    if (!isNaN(num1) && month2 !== null) {
      const date = new Date(year, month2, num1);
      if (isValid(date) && date.getDate() === num1) {
        if (date < new Date()) {
          date.setFullYear(year + 1);
        }
        return date;
      }
    }

    if (month1 !== null && !isNaN(num2)) {
      const date = new Date(year, month1, num2);
      if (isValid(date) && date.getDate() === num2) {
        if (date < new Date()) {
          date.setFullYear(year + 1);
        }
        return date;
      }
    }
  } else if (parts.length === 3) {
    const [p1, p2, p3] = parts;
    const num1 = parseInt(p1, 10);
    const num3 = parseInt(p3, 10);
    const month2 = parseMonthFromString(p2);

    if (!isNaN(num1) && month2 !== null && !isNaN(num3)) {
      const year_to_use = num3 > 1900 ? num3 : year;
      const date = new Date(year_to_use, month2, num1);
      if (isValid(date) && date.getDate() === num1) {
        return date;
      }
    }

    const month1 = parseMonthFromString(p1);
    if (month1 !== null && !isNaN(num1)) {
      const year_to_use = num3 > 1900 ? num3 : year;
      const date = new Date(year_to_use, month1, num1);
      if (isValid(date) && date.getDate() === num1) {
        return date;
      }
    }
  }

  return null;
}

export function parseFlexibleDate(input: string): ParsedDateRange {
  const result: ParsedDateRange = {
    startDate: null,
    endDate: null,
    isRange: false,
  };

  if (!input || !input.trim()) {
    return result;
  }

  const rangeMatch = input.match(/^(.+?)\s*(?:to|-|–)\s*(.+)$/i);
  if (rangeMatch) {
    const startStr = rangeMatch[1].trim();
    const endStr = rangeMatch[2].trim();

    const startDate = parseSingleFlexibleDate(startStr);
    const endDate = parseSingleFlexibleDate(endStr);

    if (startDate && endDate) {
      result.startDate = startDate;
      result.endDate = endDate;
      result.isRange = true;
      return result;
    }
  }

  const singleDate = parseSingleFlexibleDate(input);
  if (singleDate) {
    result.startDate = singleDate;
    result.endDate = singleDate;
    result.isRange = false;
  }

  return result;
}

function parseSingleFlexibleDate(input: string): Date | null {
  const trimmed = input.trim();
  if (!trimmed) return null;

  const year = new Date().getFullYear();

  const parts = trimmed.split(/[\s/\-.,]+/).filter(p => p.length > 0);

  if (parts.length === 0) return null;

  const numericDate = parseNumericDate(parts);
  if (numericDate) return numericDate;

  const mixedDate = parseMixedDate(parts);
  if (mixedDate) return mixedDate;

  const standardFormats = [
    'MMM dd, yyyy',
    'MMM dd yyyy',
    'MMM dd',
    'MMMM dd, yyyy',
    'MMMM dd yyyy',
    'MMMM dd',
    'yyyy-MM-dd',
    'MM/dd/yyyy',
    'MM-dd-yyyy',
    'dd/MM/yyyy',
    'dd-MM-yyyy',
  ];

  for (const fmt of standardFormats) {
    const parsed = parse(trimmed, fmt, new Date());
    if (isValid(parsed)) {
      if (parsed < new Date() && !trimmed.match(/\d{4}/)) {
        parsed.setFullYear(year + 1);
      }
      return parsed;
    }
  }

  return null;
}

export function formatDateRange(startDate: Date | null, endDate: Date | null): string {
  if (!startDate && !endDate) {
    return '';
  }

  if (startDate && endDate) {
    if (startDate.getTime() === endDate.getTime()) {
      return new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric' }).format(startDate);
    }
    const start = new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric' }).format(startDate);
    const end = new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric' }).format(endDate);
    return `${start} - ${end}`;
  }

  if (startDate) {
    return new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric' }).format(startDate);
  }

  return '';
}
