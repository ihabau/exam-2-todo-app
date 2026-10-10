import { useEffect, useRef, useState } from "react";
import { Capacitor } from "@capacitor/core";
import { App as CapacitorApp } from "@capacitor/app";
import { StatusBar, Style } from "@capacitor/status-bar";
import "./index.css";
import TabBar from "./components/TabBar";
import TasksView from "./views/TasksView";
import AllTasksView from "./views/AllTasksView";
import CalendarView from "./views/CalendarView";
import ScheduleView from "./views/ScheduleView";
import HistoryView from "./views/HistoryView";
import SettingsView from "./views/SettingsView";
import { syncReminders } from "./utils/notifications";

const STATUS_BAR_COLORS = {
  slate: "#334155",
  dark: "#0b1220",
  indigo: "#1e3a8a",
  teal: "#0f766e",
  plum: "#6d28d9",
};

function normalizeTodo(todo) {
  return {
    dueDate: "",
    dueTime: "",
    remind: false,
    timeEnd: "",
    timeDeleted: "",
    color: "",
    repeat: null,
    completedDates: [],
    ...todo,
  };
}

function loadHistory() {
  try {
    return JSON.parse(localStorage.getItem("history") || "[]").map(normalizeTodo);
  } catch {
    return [];
  }
}

const history = loadHistory();

function renumber(todos) {
  return todos.map((todo, index) => ({ ...todo, id: index + 1 }));
}

function nextId(todos) {
  return todos.reduce((max, todo) => Math.max(max, todo.id), 0) + 1;
}

function App() {
  const [todos, setTodos] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("todos") || "[]").map(normalizeTodo);
    } catch {
      return [];
    }
  });
  const [text, setText] = useState("");
  const [newColor, setNewColor] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [dueTime, setDueTime] = useState("");
  const [remind, setRemind] = useState(false);
  const [repeat, setRepeat] = useState(null);
  const [editing, setEditing] = useState(null);
  const [editText, setEditText] = useState("");
  const [editDate, setEditDate] = useState("");
  const [editTime, setEditTime] = useState("");
  const [editRemind, setEditRemind] = useState(false);
  const [editRepeat, setEditRepeat] = useState(null);
  const [editingListId, setEditingListId] = useState(null);
  const [listItems, setListItems] = useState([]);
  const [lastClear, setLastClear] = useState(null);
  const [now, setNow] = useState(new Date());
  const [hideCompletedAll, setHideCompletedAll] = useState(
    () => localStorage.getItem("hideCompletedAll") === "true",
  );
  const [hideCompletedListsAll, setHideCompletedListsAll] = useState(
    () => localStorage.getItem("hideCompletedListsAll") === "true",
  );
  const [hideCompletedHistory, setHideCompletedHistory] = useState(
    () => localStorage.getItem("hideCompletedHistory") === "true",
  );
  const [hideCompletedListsHistory, setHideCompletedListsHistory] = useState(
    () => localStorage.getItem("hideCompletedListsHistory") === "true",
  );
  const [activeTab, setActiveTab] = useState(
    () => localStorage.getItem("activeTab") || "all",
  );
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [autoTheme, setAutoTheme] = useState(
    () => localStorage.getItem("autoTheme") === "true",
  );
  const [theme, setTheme] = useState(() => {
    const saved = localStorage.getItem("theme");
    const base = !saved || saved === "light" ? "slate" : saved;
    if (localStorage.getItem("autoTheme") === "true") {
      const hour = new Date().getHours();
      return hour < 6 || hour >= 18
        ? "dark"
        : localStorage.getItem("lastTheme") || "slate";
    }
    return base;
  });
  const [lastTheme, setLastTheme] = useState(
    () => localStorage.getItem("lastTheme") || "slate",
  );
  const activeTabRef = useRef(activeTab);
  const stagedIdRef = useRef(0);

  useEffect(() => {
    activeTabRef.current = activeTab;
  }, [activeTab]);

  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem("theme", theme);
  }, [theme]);

  useEffect(() => {
    localStorage.setItem("lastTheme", lastTheme);
  }, [lastTheme]);

  useEffect(() => {
    localStorage.setItem("autoTheme", autoTheme);
  }, [autoTheme]);

  useEffect(() => {
    localStorage.setItem("activeTab", activeTab);
  }, [activeTab]);
  useEffect(() => {
    localStorage.setItem("hideCompletedAll", hideCompletedAll);
  }, [hideCompletedAll]);
  useEffect(() => {
    localStorage.setItem("hideCompletedListsAll", hideCompletedListsAll);
  }, [hideCompletedListsAll]);
  useEffect(() => {
    localStorage.setItem("hideCompletedHistory", hideCompletedHistory);
  }, [hideCompletedHistory]);
  useEffect(() => {
    localStorage.setItem("hideCompletedListsHistory", hideCompletedListsHistory);
  }, [hideCompletedListsHistory]);

  useEffect(() => {
    localStorage.setItem("todos", JSON.stringify(todos));
    localStorage.setItem("history", JSON.stringify(history));
  }, [todos]);

  useEffect(() => {
    syncReminders(todos);
  }, [todos]);

  useEffect(() => {
    if (!autoTheme) return;
    const hour = now.getHours();
    const isNight = hour < 6 || hour >= 18;
    setTheme(isNight ? "dark" : lastTheme);
  }, [autoTheme, now, lastTheme]);

  useEffect(() => {
    if (!Capacitor.isNativePlatform()) return;
    StatusBar.setStyle({ style: Style.Dark }).catch(() => {});
    StatusBar.setBackgroundColor({
      color: STATUS_BAR_COLORS[theme] || STATUS_BAR_COLORS.slate,
    }).catch(() => {});
  }, [theme]);

  useEffect(() => {
    if (!Capacitor.isNativePlatform()) return;
    let handle;
    let removed = false;
    CapacitorApp.addListener("backButton", () => {
      if (activeTabRef.current !== "all") {
        setActiveTab("all");
      } else {
        CapacitorApp.exitApp();
      }
    }).then((h) => {
      if (removed) h.remove();
      else handle = h;
    });
    return () => {
      removed = true;
      if (handle) handle.remove();
    };
  }, []);

  function changeTheme(next) {
    setAutoTheme(false);
    setTheme(next);
    if (next !== "dark") setLastTheme(next);
  }

  function toggleAuto() {
    if (autoTheme) {
      setTheme(lastTheme);
      setAutoTheme(false);
    } else {
      setAutoTheme(true);
    }
  }

  function pickColor(color) {
    setNewColor(newColor === color ? "" : color);
  }

  function resetForm() {
    setText("");
    setNewColor("");
    setDueDate("");
    setDueTime("");
    setRemind(false);
    setRepeat(null);
    setListItems([]);
    setEditingListId(null);
  }

  function stageItem(itemText, amount) {
    const value = (itemText || "").trim();
    if (value === "") return;
    stagedIdRef.current += 1;
    setListItems([
      ...listItems,
      { id: stagedIdRef.current, text: value, amount: amount || "" },
    ]);
  }

  function updateStagedItem(id, patch) {
    setListItems(
      listItems.map((item) => (item.id === id ? { ...item, ...patch } : item)),
    );
  }

  function removeStagedItem(id) {
    setListItems(listItems.filter((item) => item.id !== id));
  }

  function startListEdit(id) {
    const list = todos.find((todo) => todo.id === id);
    if (!list) return;
    setEditingListId(id);
    setText(list.text);
    setNewColor(list.color || "");
    setDueDate(list.dueDate || "");
    setDueTime(list.dueTime || "");
    setRemind(Boolean(list.remind));
    setRepeat(list.repeat || null);
    let counter = 0;
    setListItems(
      (list.items || []).map((item) => {
        counter += 1;
        return { id: counter, text: item.text, amount: item.amount || "" };
      }),
    );
    stagedIdRef.current = counter;
    setActiveTab("tasks");
  }

  function cancelListEdit() {
    resetForm();
  }

  function addTodo(e) {
    e.preventDefault();
    const message = text.trim();

    if (editingListId != null) {
      setTodos(
        todos.map((todo) => {
          if (todo.id !== editingListId) return todo;
          const items = listItems.map((item, index) => {
            const match = (todo.items || []).find(
              (existing) => existing.text === item.text,
            );
            return {
              id: index + 1,
              text: item.text,
              amount: item.amount || "",
              done: match ? match.done : false,
            };
          });
          return {
            ...todo,
            text: message === "" ? todo.text : message,
            color: newColor,
            dueDate,
            dueTime: dueTime || "",
            remind: remind && Boolean(dueDate),
            repeat: repeat || null,
            items,
          };
        }),
      );
      resetForm();
      return;
    }

    if (listItems.length > 0) {
      const id = nextId(todos);
      setTodos([
        ...todos,
        {
          id,
          timeStart: new Date(Date.now()).toLocaleString(),
          text: message === "" ? "New list" : message,
          done: false,
          timeEnd: "",
          timeDeleted: "",
          color: newColor,
          dueDate,
          dueTime: dueTime || "",
          remind: remind && Boolean(dueDate),
          repeat: repeat || null,
          completedDates: [],
          kind: "list",
          items: listItems.map((item, index) => ({
            id: index + 1,
            text: item.text,
            amount: item.amount,
            done: false,
          })),
        },
      ]);
      resetForm();
      return;
    }

    if (message === "") return;
    setTodos([
      ...todos,
      {
        id: nextId(todos),
        timeStart: new Date(Date.now()).toLocaleString(),
        text: message,
        done: false,
        timeEnd: "",
        timeDeleted: "",
        color: newColor,
        dueDate,
        dueTime: dueTime || "",
        remind: remind && Boolean(dueDate),
        repeat: repeat || null,
        completedDates: [],
      },
    ]);
    resetForm();
  }

  function removeTodo(id) {
    const todo = todos.find((todo) => todo.id === id);
    if (!todo) return;

    if (todo.kind === "list" && todo.items.length === 0) {
      setTodos(renumber(todos.filter((item) => item.id !== id)));
      return;
    }

    const deletedAt = new Date(Date.now()).toLocaleString();
    history.push({ ...todo, timeDeleted: deletedAt });
    setLastClear(null);
    setTodos(renumber(todos.filter((item) => item.id !== id)));
  }

  function toggleTodo(id, dateKey) {
    setTodos(
      todos.map((todo) => {
        if (todo.id !== id) return todo;

        if (todo.repeat && todo.repeat.freq) {
          const key = dateKey || todo.dueDate;
          if (!key) return todo;
          const dates = todo.completedDates || [];
          const completedDates = dates.includes(key)
            ? dates.filter((item) => item !== key)
            : [...dates, key];
          return { ...todo, completedDates };
        }

        return {
          ...todo,
          done: !todo.done,
          timeEnd: !todo.done ? new Date(Date.now()).toLocaleString() : "",
          items: todo.items
            ? todo.items.map((item) => ({ ...item, done: !todo.done }))
            : todo.items,
        };
      }),
    );
  }

  function clearTodos() {
    if (todos.length === 0) return;
    const deletedAt = new Date(Date.now()).toLocaleString();
    let pushed = 0;
    todos.forEach((todo) => {
      if (todo.kind === "list" && todo.items.length === 0) return;
      history.push({ ...todo, timeDeleted: deletedAt });
      pushed += 1;
    });
    setLastClear({ todos, pushed });
    setTodos([]);
  }

  function undoClear() {
    if (!lastClear) return;
    if (lastClear.pushed > 0) {
      history.splice(Math.max(0, history.length - lastClear.pushed));
    }
    setTodos(renumber([...todos, ...lastClear.todos]));
    setLastClear(null);
  }

  function clearHistory() {
    history.length = 0;
    setLastClear(null);
    setTodos([...todos]);
  }

  function restoreTodo(index) {
    const [todo] = history.splice(index, 1);
    todo.timeDeleted = "";
    todo.id = nextId(todos);
    setLastClear(null);
    setTodos([...todos, todo]);
  }

  function toggleItem(listId, itemId) {
    const list = todos.find((todo) => todo.id === listId);
    const items = list.items.map((item) =>
      item.id === itemId ? { ...item, done: !item.done } : item,
    );
    const allDone = items.length > 0 && items.every((item) => item.done);

    setTodos(
      todos.map((todo) =>
        todo.id === listId
          ? {
              ...todo,
              items,
              done: allDone,
              timeEnd: allDone ? new Date(Date.now()).toLocaleString() : "",
            }
          : todo,
      ),
    );
  }

  function startEditTodo(todo) {
    setEditing({ todoId: todo.id });
    setEditText(todo.text);
    setEditDate(todo.seriesStart || todo.dueDate || "");
    setEditTime(todo.dueTime || "");
    setEditRemind(Boolean(todo.remind));
    setEditRepeat(todo.repeat || null);
  }

  function cancelEdit() {
    setEditing(null);
    setEditText("");
    setEditDate("");
    setEditTime("");
    setEditRemind(false);
    setEditRepeat(null);
  }

  function saveEditTodo(id) {
    const value = editText.trim();
    if (value === "") return;
    setTodos(
      todos.map((todo) => {
        if (todo.id !== id) return todo;
        const dateChanged = editDate !== todo.dueDate;
        return {
          ...todo,
          text: value,
          dueDate: editDate,
          dueTime: editTime || "",
          remind: editRemind && Boolean(editDate),
          repeat: editRepeat || null,
          completedDates: dateChanged ? [] : todo.completedDates || [],
        };
      }),
    );
    cancelEdit();
  }

  const app = {
    todos,
    history,
    text,
    setText,
    newColor,
    pickColor,
    dueDate,
    setDueDate,
    dueTime,
    setDueTime,
    remind,
    setRemind,
    repeat,
    setRepeat,
    listItems,
    stageItem,
    updateStagedItem,
    removeStagedItem,
    editingListId,
    isEditingList: editingListId != null,
    startListEdit,
    cancelListEdit,
    editRepeat,
    setEditRepeat,
    editing,
    editText,
    setEditText,
    editDate,
    setEditDate,
    editTime,
    setEditTime,
    editRemind,
    setEditRemind,
    selectedDate,
    setSelectedDate,
    addTodo,
    removeTodo,
    toggleTodo,
    clearTodos,
    undoClear,
    canUndoClear: Boolean(lastClear),
    clearHistory,
    restoreTodo,
    toggleItem,
    startEditTodo,
    cancelEdit,
    saveEditTodo,
    theme,
    lastTheme,
    autoTheme,
    changeTheme,
    toggleAuto,
    hideCompletedAll,
    setHideCompletedAll,
    hideCompletedListsAll,
    setHideCompletedListsAll,
    hideCompletedHistory,
    setHideCompletedHistory,
    hideCompletedListsHistory,
    setHideCompletedListsHistory,
  };

  return (
    <div className={"app"}>
      <header>
        <h1>ToDo App</h1>
        <p className="clock">
          {now.toLocaleDateString()} {now.toLocaleTimeString()}
        </p>
      </header>

      <main className="app-body">
        {activeTab === "tasks" && <TasksView app={app} />}
        {activeTab === "all" && <AllTasksView app={app} />}
        {activeTab === "calendar" && <CalendarView app={app} />}
        {activeTab === "schedule" && <ScheduleView app={app} />}
        {activeTab === "history" && <HistoryView app={app} />}
        {activeTab === "settings" && <SettingsView app={app} />}
      </main>

      <TabBar active={activeTab} onChange={setActiveTab} />
    </div>
  );
}

export default App;
