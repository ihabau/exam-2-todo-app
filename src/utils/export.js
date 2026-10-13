import Papa from "papaparse";
import { Capacitor } from "@capacitor/core";
import { Filesystem, Directory, Encoding } from "@capacitor/filesystem";
import { Share } from "@capacitor/share";
import { formatRepeat, todayKey } from "./date";

const COLUMNS = [
  "id",
  "text",
  "done",
  "dueDate",
  "dueTime",
  "remind",
  "repeat",
  "color",
  "items",
  "timeStart",
  "timeEnd",
  "timeDeleted",
];

function itemsText(todo) {
  if (!todo.items || todo.items.length === 0) return "";
  return todo.items
    .map((item) => (item.amount ? `${item.text} (${item.amount})` : item.text))
    .join("; ");
}

function toRow(todo) {
  return {
    id: todo.id,
    text: todo.text,
    done: todo.done ? "yes" : "no",
    dueDate: todo.dueDate || "",
    dueTime: todo.dueTime || "",
    remind: todo.remind ? "yes" : "no",
    repeat: todo.repeat ? formatRepeat(todo) : "",
    color: todo.color || "",
    items: itemsText(todo),
    timeStart: todo.timeStart || "",
    timeEnd: todo.timeEnd || "",
    timeDeleted: todo.timeDeleted || "",
  };
}

async function deliverFile(content, filename) {
  if (!Capacitor.isNativePlatform()) {
    const blob = new Blob([content], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
    return;
  }

  const written = await Filesystem.writeFile({
    path: filename,
    data: content,
    directory: Directory.Cache,
    encoding: Encoding.UTF8,
  });

  await Share.share({
    title: filename,
    files: [written.uri],
  });
}

export async function exportCsv(todos, filename) {
  const csv = "\uFEFF" + Papa.unparse(todos.map(toRow), { columns: COLUMNS });
  await deliverFile(csv, filename);
}

export function tasksFilename() {
  return `todo-tasks-${todayKey()}.csv`;
}

export function historyFilename() {
  return `todo-history-${todayKey()}.csv`;
}

function parseYes(value) {
  const text = String(value ?? "").trim().toLowerCase();
  return text === "yes" || text === "true" || text === "1";
}

function parseItems(value) {
  if (!value) return [];
  return String(value)
    .split(";")
    .map((part) => part.trim())
    .filter(Boolean)
    .map((part, index) => {
      const match = part.match(/^(.*?)\s*\(([^)]*)\)$/);
      return {
        id: index + 1,
        text: match ? match[1].trim() : part,
        amount: match ? match[2].trim() : "",
        done: false,
      };
    });
}

function rowToTodo(row) {
  const items = parseItems(row.items);
  return {
    text: String(row.text ?? "").trim(),
    done: parseYes(row.done),
    dueDate: row.dueDate || "",
    dueTime: row.dueTime || "",
    remind: parseYes(row.remind),
    color: row.color || "",
    repeat: null,
    completedDates: [],
    timeStart: row.timeStart || new Date().toLocaleString(),
    timeEnd: row.timeEnd || "",
    timeDeleted: row.timeDeleted || "",
    ...(items.length ? { kind: "list", items } : {}),
  };
}

export function parseTasksCsv(content) {
  const clean = String(content).replace(/^\uFEFF/, "");
  const { data } = Papa.parse(clean, { header: true, skipEmptyLines: true });
  return data.map(rowToTodo).filter((todo) => todo.text !== "");
}
