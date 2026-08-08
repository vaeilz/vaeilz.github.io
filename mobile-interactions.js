(function (root, factory) {
  const api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  root.MobileInteractions = api;
})(typeof globalThis !== 'undefined' ? globalThis : this, function () {
  const namesByDay = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];

  function clampIndex(index, length) {
    if (!Number.isFinite(length) || length <= 0) return 0;
    const safeIndex = Number.isFinite(index) ? Math.trunc(index) : 0;
    return Math.min(Math.max(safeIndex, 0), length - 1);
  }

  function moveIndex(index, delta, length) {
    return clampIndex((Number(index) || 0) + (Number(delta) || 0), length);
  }

  function upcomingDays(days, today, limit) {
    if (!Array.isArray(days) || days.length === 0) return [];
    const todayName = namesByDay[clampIndex(today, namesByDay.length)];
    const start = Math.max(0, days.findIndex((day) => day && day.name === todayName));
    const ordered = [...days.slice(start), ...days.slice(0, start)];
    return ordered.slice(0, Math.max(0, Math.min(Number(limit) || 0, ordered.length)));
  }

  return { clampIndex, moveIndex, upcomingDays };
});
