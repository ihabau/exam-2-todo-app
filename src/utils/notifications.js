import { Capacitor } from "@capacitor/core";
import { LocalNotifications } from "@capacitor/local-notifications";
import { isCompleted, isRecurring, nextOccurrences, toDateKey } from "./date";

const CHANNEL_ID = "task-reminders";
const LEAD_MINUTES = 10;
const UPCOMING = 10;
let channelReady = false;

function fireAt(dateKey, time) {
  if (!dateKey) return null;
  const [y, m, d] = dateKey.split("-").map(Number);
  if (!y || !m || !d) return null;
  const [hh, mm] = (time || "09:00").split(":").map(Number);
  const at = new Date(y, m - 1, d, hh || 0, mm || 0, 0, 0);
  at.setMinutes(at.getMinutes() - LEAD_MINUTES);
  return at;
}

function occurrenceKeys(todo) {
  if (isRecurring(todo)) {
    return nextOccurrences(todo, new Date(), UPCOMING).map(toDateKey);
  }
  if (todo.done || !todo.dueDate) return [];
  return [todo.dueDate];
}

export async function initNotifications() {
  if (!Capacitor.isNativePlatform()) return false;
  try {
    let perm = await LocalNotifications.checkPermissions();
    if (perm.display !== "granted") {
      perm = await LocalNotifications.requestPermissions();
    }
    if (perm.display !== "granted") return false;

    if (!channelReady) {
      await LocalNotifications.createChannel({
        id: CHANNEL_ID,
        name: "Task reminders",
        description: "Reminders for scheduled tasks",
        importance: 4,
        visibility: 1,
      });
      channelReady = true;
    }
    return true;
  } catch {
    return false;
  }
}

export async function syncReminders(todos) {
  if (!Capacitor.isNativePlatform()) return;
  try {
    const granted = await initNotifications();
    if (!granted) return;

    const pending = await LocalNotifications.getPending();
    if (pending.notifications.length) {
      await LocalNotifications.cancel({
        notifications: pending.notifications.map((n) => ({ id: n.id })),
      });
    }

    const now = Date.now();
    const notifications = [];
    let notificationId = 1;
    for (const todo of todos) {
      if (!todo.remind || !todo.dueDate) continue;
      for (const dateKey of occurrenceKeys(todo)) {
        if (isCompleted(todo, dateKey)) continue;
        const at = fireAt(dateKey, todo.dueTime);
        if (!at || at.getTime() <= now) continue;
        notifications.push({
          id: notificationId++,
          title: "Task reminder",
          body: todo.text,
          channelId: CHANNEL_ID,
          smallIcon: "ic_stat_icon_config_sample",
          schedule: { at, allowWhileIdle: true },
          isExactNotification: false,
        });
      }
    }

    if (notifications.length) {
      await LocalNotifications.schedule({ notifications });
    }
  } catch {
    // reminders are best-effort; never break the UI over them
  }
}
