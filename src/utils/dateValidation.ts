const MIN_WAR_DATE = "1941-01-01";
const MAX_WAR_DATE = "1945-12-31";

export const validateWarDate = (dateStr: string): string => {
  if (!dateStr) return "";
  const date = new Date(dateStr);
  const year = date.getFullYear();
  
  if (isNaN(date.getTime())) return "";
  if (year < 1941) return MIN_WAR_DATE;
  if (year > 1945) return MAX_WAR_DATE;
  return dateStr;
};

export const validateDateRange = (start: string, end: string) => {
  let validStart = validateWarDate(start);
  let validEnd = validateWarDate(end);

  // Если дата начала больше даты конца — приравниваем их
  if (validStart && validEnd && new Date(validStart) > new Date(validEnd)) {
    validEnd = validStart;
  }

  return { startDate: validStart, endDate: validEnd };
};