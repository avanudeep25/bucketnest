
import { format, getWeek, getYear, startOfWeek, endOfWeek } from "date-fns";

export const generateMonthOptions = () => {
  const months = [];
  const currentDate = new Date();
  const currentYear = currentDate.getFullYear();
  const currentMonth = currentDate.getMonth();

  for (let year = currentYear; year <= currentYear + 2; year++) {
    const startMonth = year === currentYear ? currentMonth : 0;
    for (let month = startMonth; month < 12; month++) {
      const date = new Date(year, month, 1);
      months.push({
        value: `${year}-${String(month + 1).padStart(2, '0')}`,
        label: format(date, 'MMMM yyyy')
      });
    }
  }

  return months;
};

export const generateWeekOptions = () => {
  const weeks = [];
  const currentDate = new Date();
  let tempDate = new Date(currentDate);

  for (let i = 0; i < 26; i++) {
    const year = getYear(tempDate);
    const weekNum = getWeek(tempDate);
    const weekStart = new Date(tempDate);
    const weekEnd = new Date(tempDate);
    weekEnd.setDate(weekEnd.getDate() + 6);

    weeks.push({
      value: `${year}-${String(weekNum).padStart(2, '0')}`,
      label: `Week ${weekNum}: ${format(weekStart, 'MMM d')} - ${format(weekEnd, 'MMM d, yyyy')}`
    });

    tempDate.setDate(tempDate.getDate() + 7);
  }

  return weeks;
};

export const getWeekStringFromDate = (date: Date) => {
  const year = getYear(date);
  const weekNum = getWeek(date);
  return `${year}-${String(weekNum).padStart(2, '0')}`;
};

export const getSelectedWeekText = (date: Date) => {
  const weekStart = startOfWeek(date);
  const weekEnd = endOfWeek(date);
  return `Week ${getWeek(date)}: ${format(weekStart, 'MMM d')} - ${format(weekEnd, 'MMM d, yyyy')}`;
};
