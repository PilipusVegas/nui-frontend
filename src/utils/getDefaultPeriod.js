export const getDefaultPeriod = () => {
    const today = new Date();
    const year = today.getFullYear();
    const month = today.getMonth();
    const date = today.getDate();
    let start, end;
    if (date >= 25) {
      start = new Date(year, month, 22);
      end = new Date(year, month + 1, 21);
    } else {
      start = new Date(year, month - 1, 22);
      end = new Date(year, month, 21);
    }
    const toInputDate = (date) => date.toISOString().split("T")[0];
    return {
      start: toInputDate(start),
      end: toInputDate(end),
    };
};


// utils/getDefaultPeriod.js
// Periode default: Jumat sampai Kamis
export const getDefaultPeriodWeek = () => {
  const today = new Date();
  const dayOfWeek = today.getDay(); // 0 = Minggu, 5 = Jumat

  const FRIDAY = 5;

  // Jarak mundur ke Jumat terakhir
  const distanceToFriday = (dayOfWeek - FRIDAY + 7) % 7;

  const start = new Date(today);
  start.setDate(today.getDate() - distanceToFriday);

  const end = new Date(start);
  end.setDate(start.getDate() + 6); // Jumat → Kamis

  const toInputDate = (date) => date.toISOString().split("T")[0];

  return {
    start: toInputDate(start),
    end: toInputDate(end),
  };
};
