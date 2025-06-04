
const DATE_PRESETS = {
  custom: "custom",
  last_28_days: "Last 28 Days",
  this_month: "This Month",
  last_month: "Last Month",
  this_week: "This Week",
  last_week: "Last Week",
};

const toDateTimeLocal = (date) => {
  const pad = (n) => n.toString().padStart(2, '0');

  const yyyy = date.getFullYear();
  const MM = pad(date.getMonth() + 1);
  const dd = pad(date.getDate());
  const hh = pad(date.getHours());
  const mm = pad(date.getMinutes());

  return `${yyyy}-${MM}-${dd}T${hh}:${mm}`;
};
const getDateRange = (preset) => {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate()); // midnight today
  let startAt, endAt;

  switch (preset) {
    case DATE_PRESETS.last_28_days:
      startAt = new Date(today);
      startAt.setDate(startAt.getDate() - 28);
      startAt.setHours(0, 0, 0, 0);

      endAt = new Date(now); // current time
      break;

    case DATE_PRESETS.this_month:
      startAt = new Date(today.getFullYear(), today.getMonth(), 1);
      startAt.setHours(0, 0, 0, 0);

      endAt = new Date(now);
      break;

    case DATE_PRESETS.last_month:
      startAt = new Date(today.getFullYear(), today.getMonth() - 1, 1);
      startAt.setHours(0, 0, 0, 0);

      endAt = new Date(today.getFullYear(), today.getMonth(), 0);
      endAt.setHours(23, 59, 59, 999);
      break;

    case DATE_PRESETS.this_week: {
      const day = today.getDay(); // Sunday = 0
      const diff = day === 0 ? 6 : day - 1; // Monday start
      startAt = new Date(today);
      startAt.setDate(startAt.getDate() - diff);
      startAt.setHours(0, 0, 0, 0);

      endAt = new Date(now);
      break;
    }

    case DATE_PRESETS.last_week: {
      const day = today.getDay();
      const diff = day === 0 ? 6 : day - 1;

      endAt = new Date(today);
      endAt.setDate(endAt.getDate() - diff - 1);
      endAt.setHours(23, 59, 59, 999);

      startAt = new Date(endAt);
      startAt.setDate(startAt.getDate() - 6);
      startAt.setHours(0, 0, 0, 0);
      break;
    }
    default: {
        break;
    }
  }

  return { startAt, endAt };
};


export { DATE_PRESETS, getDateRange, toDateTimeLocal };