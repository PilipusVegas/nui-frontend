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


// Periode default: Sabtu sampai Jumat
export const getDefaultPeriodWeek = () => {
  const today = new Date();
  const dayOfWeek = today.getDay(); // 0 = Minggu, 6 = Sabtu

  const SATURDAY = 6;

  // Jarak mundur ke Sabtu terakhir
  const distanceToSaturday = (dayOfWeek - SATURDAY + 7) % 7;

  const start = new Date(today);
  start.setDate(today.getDate() - distanceToSaturday);

  const end = new Date(start);
  end.setDate(start.getDate() + 6); // Sabtu → Jumat

  const toInputDate = (date) => date.toISOString().split("T")[0];

  return {
    start: toInputDate(start),
    end: toInputDate(end),
  };
};


