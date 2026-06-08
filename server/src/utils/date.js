export const addDays = (dateValue, days) => {
  const date = new Date(dateValue);
  date.setDate(date.getDate() + Number(days || 0));
  return date;
};

export const isPastDate = (dateValue) => {
  if (!dateValue) return false;
  const date = new Date(dateValue);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return date < today;
};

