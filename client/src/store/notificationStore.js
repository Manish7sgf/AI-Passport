import { create } from "zustand";

const useNotificationStore = create((set, get) => ({
  notifications: [],

  // Add a notification
  add: (message, type = "info", persist = false) => {
    const id = Date.now() + Math.random();
    const note = { id, message, type, read: false, createdAt: new Date() };
    set((s) => ({ notifications: [note, ...s.notifications].slice(0, 20) }));
    // Auto-dismiss toasts (non-persistent)
    if (!persist) {
      setTimeout(() => get().dismiss(id), 5000);
    }
    return id;
  },

  // Mark one as read
  markRead: (id) =>
    set((s) => ({
      notifications: s.notifications.map((n) => n.id === id ? { ...n, read: true } : n)
    })),

  // Dismiss (remove)
  dismiss: (id) =>
    set((s) => ({ notifications: s.notifications.filter((n) => n.id !== id) })),

  // Mark all read
  markAllRead: () =>
    set((s) => ({ notifications: s.notifications.map((n) => ({ ...n, read: true })) })),

  unreadCount: () => get().notifications.filter((n) => !n.read).length,

  // Check score change and notify
  checkScoreChange: (prevScore, newScore) => {
    if (prevScore === null || prevScore === undefined) return;
    const diff = newScore - prevScore;
    if (diff === 0) return;
    if (diff > 0) {
      const label = newScore >= 70 && prevScore < 70 ? " You've reached Advanced level! 🎉"
                  : newScore >= 40 && prevScore < 40 ? " You've reached Intermediate level!"
                  : "";
      get().add(`Score increased by ${diff} points → ${newScore}/100.${label}`, "success", true);
    } else {
      get().add(`Score decreased by ${Math.abs(diff)} points → ${newScore}/100. Add more projects to recover.`, "warning", true);
    }
  },

  // Check skill gap widening
  checkGapChange: (prevGap, newGap) => {
    if (prevGap === null || prevGap === undefined) return;
    const diff = newGap - prevGap;
    if (diff >= 5) {
      get().add(`Skill gap widened by ${diff}%. Consider adding new skills to your passport.`, "warning", true);
    }
  }
}));

export default useNotificationStore;
