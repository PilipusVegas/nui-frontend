export const getDefaultPeriod = () => {
    const today = new Date();
    const year = today.getFullYear();
    const month = today.getMonth();
    const date = today.getDate();
    let start, end;
    if (date >= 22) {
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