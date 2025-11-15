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


//untuk tunjangan
export const getDefaultPeriodWeek = () => {
  const today = new Date();

  // Tentukan indeks hari (0 = Minggu, 1 = Senin, dst.)
  const dayOfWeek = today.getDay();

  // Hitung jarak ke Senin dan Minggu
  const distanceToMonday = (dayOfWeek + 6) % 7; // shift supaya Senin = 0
  const distanceToSunday = 7 - distanceToMonday - 1;

  // Tentukan tanggal mulai (Senin) dan akhir (Minggu)
  const start = new Date(today);
  start.setDate(today.getDate() - distanceToMonday);

  const end = new Date(today);
  end.setDate(today.getDate() + distanceToSunday);

  // Format ke yyyy-mm-dd (HTML date input friendly)
  const toInputDate = (date) => date.toISOString().split("T")[0];

  return {
    start: toInputDate(start),
    end: toInputDate(end),
  };
};
