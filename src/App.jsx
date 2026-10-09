import { useEffect, useState } from "react";
import "./index.css";
import TodoForm from "./components/TodoForm";
import TodoItem from "./components/TodoItem";

function loadHistory() {
  try {
    return JSON.parse(localStorage.getItem("history") || "[]");
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
  console.log("app started");
  const [todos, setTodos] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("todos") || "[]");
    } catch {
      return [];
    }
  });
  const [text, setText] = useState("");
  const [newColor, setNewColor] = useState("");
  const [editing, setEditing] = useState(null);
  const [editText, setEditText] = useState("");
  const [editAmount, setEditAmount] = useState("");
  const [now, setNow] = useState(new Date());
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
    localStorage.setItem("todos", JSON.stringify(todos));
    localStorage.setItem("history", JSON.stringify(history));
  }, [todos]);

  useEffect(() => {
    if (!autoTheme) return;
    const hour = now.getHours();
    const isNight = hour < 6 || hour >= 18;
    setTheme(isNight ? "dark" : lastTheme);
  }, [autoTheme, now, lastTheme]);

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

  function addTodo(e) {
    e.preventDefault();
    const message = e.target.firstChild.value;
    if (message.trim() === "") return;

    const timeStart = new Date(Date.now()).toLocaleString();

    const newTodo = {
      id: nextId(todos),
      timeStart: timeStart,
      text: message,
      done: false,
      timeEnd: "",
      timeDeleted: "",
      color: newColor,
    };
    setTodos([...todos, newTodo]);
    setText("");
    setNewColor("");
  }

  function addList() {
    const timeStart = new Date(Date.now()).toLocaleString();
    const name = (text || "").trim();

    const newList = {
      id: nextId(todos),
      timeStart: timeStart,
      text: name === "" ? "New list" : name,
      done: false,
      timeEnd: "",
      timeDeleted: "",
      color: newColor,
      kind: "list",
      items: [],
    };
    setTodos([...todos, newList]);
    setText("");
    setNewColor("");
  }

  function removeTodo(id) {
    const todo = todos.find((todo) => todo.id === id);

    if (todo.kind === "list" && todo.items.length === 0) {
      setTodos(renumber(todos.filter((todo) => todo.id !== id)));
      return;
    }

    const now = new Date(Date.now()).toLocaleString();
    todo.timeDeleted = now;
    history.push(todo);
    setTodos(renumber(todos.filter((todo) => todo.id !== id)));
  }

  function toggleTodo(id) {
    const idItem = ".todo-item-" + id;
    const e = document.querySelector(idItem);

    const todo = todos.find((todo) => todo.id == id);

    if (!todo.done) {
      if (e) e.style.textDecoration = "line-through";
      todo.timeEnd = new Date(Date.now()).toLocaleString();
    } else {
      if (e) e.style.textDecoration = "none";
      todo.timeEnd = "";
    }

    setTodos(
      todos.map((todo) =>
        todo.id === id
          ? {
              ...todo,
              done: !todo.done,
              items: todo.items
                ? todo.items.map((item) => ({ ...item, done: !todo.done }))
                : todo.items,
            }
          : todo,
      ),
    );
  }

  function toggleHistory() {
    const e = document.querySelector(".history");
    if (e.style.visibility === "hidden") {
      e.style.visibility = "visible";
    } else {
      e.style.visibility = "hidden";
    }
  }

  function clearTodos() {
    const now = new Date(Date.now()).toLocaleString();
    todos.forEach((todo) => {
      if (todo.kind === "list" && todo.items.length === 0) return;
      todo.timeDeleted = now;
      history.push(todo);
    });
    setTodos([]);
  }

  function clearHistory() {
    history.length = 0;
    setTodos([...todos]);
  }

  function restoreTodo(index) {
    const [todo] = history.splice(index, 1);
    todo.timeDeleted = "";
    todo.id = nextId(todos);
    setTodos([...todos, todo]);
  }

  function addItem(listId, e) {
    e.preventDefault();
    const text = e.target.elements.text.value;
    const amount = e.target.elements.amount.value;
    if (text.trim() === "") return;

    setTodos(
      todos.map((todo) =>
        todo.id === listId
          ? {
              ...todo,
              items: [
                ...todo.items,
                {
                  id: todo.items.length + 1,
                  text: text,
                  amount: amount,
                  done: false,
                },
              ],
            }
          : todo,
      ),
    );
    e.target.reset();
  }

  function toggleItem(listId, itemId) {
    const list = todos.find((todo) => todo.id === listId);
    const items = list.items.map((item) =>
      item.id === itemId ? { ...item, done: !item.done } : item,
    );
    const allDone = items.length > 0 && items.every((item) => item.done);

    const el = document.querySelector(".todo-item-" + listId);
    if (el) el.style.textDecoration = allDone ? "line-through" : "none";

    setTodos(
      todos.map((todo) =>
        todo.id === listId
          ? {
              ...todo,
              items: items,
              done: allDone,
              timeEnd: allDone ? new Date(Date.now()).toLocaleString() : "",
            }
          : todo,
      ),
    );
  }

  function removeItem(listId, itemId) {
    setTodos(
      todos.map((todo) =>
        todo.id === listId
          ? { ...todo, items: todo.items.filter((item) => item.id !== itemId) }
          : todo,
      ),
    );
  }

  function clearItems(listId) {
    setTodos(
      todos.map((todo) =>
        todo.id === listId ? { ...todo, items: [] } : todo,
      ),
    );
  }

  function startEditTodo(todo) {
    setEditing({ todoId: todo.id });
    setEditText(todo.text);
  }

  function startEditItem(listId, item) {
    setEditing({ listId: listId, itemId: item.id });
    setEditText(item.text);
    setEditAmount(item.amount || "");
  }

  function cancelEdit() {
    setEditing(null);
    setEditText("");
    setEditAmount("");
  }

  function saveEditTodo(id) {
    const value = editText.trim();
    if (value === "") return;
    setTodos(
      todos.map((todo) => (todo.id === id ? { ...todo, text: value } : todo)),
    );
    cancelEdit();
  }

  function saveEditItem(listId, itemId) {
    const value = editText.trim();
    if (value === "") return;
    setTodos(
      todos.map((todo) =>
        todo.id === listId
          ? {
              ...todo,
              items: todo.items.map((item) =>
                item.id === itemId
                  ? { ...item, text: value, amount: editAmount }
                  : item,
              ),
            }
          : todo,
      ),
    );
    cancelEdit();
  }

  return (
    <>
      <header>
        <div className="theme-controls">
          <select
            className="theme-select"
            value={theme}
            onChange={(e) => changeTheme(e.target.value)}
          >
            <option value="slate">Slate</option>
            <option value="dark">Dark</option>
            <option value="indigo">Indigo</option>
            <option value="teal">Teal</option>
            <option value="plum">Plum</option>
          </select>
          <button
            type="button"
            className={"day-night" + (autoTheme ? " active" : "")}
            onClick={toggleAuto}
            aria-label="Auto day or night theme"
          >
            {autoTheme ? "Auto" : "Manual"}
          </button>
        </div>
        <h1>ToDo App</h1>
        <p className="clock">
          {now.toLocaleDateString()} {now.toLocaleTimeString()}
        </p>
      </header>

      <main>
        <TodoForm
          text={text}
          onTextChange={setText}
          onAdd={addTodo}
          onAddList={addList}
          newColor={newColor}
          onPickColor={pickColor}
          onToggleHistory={toggleHistory}
        />

        <section className="event-schema">
          <div className="section-header">
            <h2>Active tasks</h2>
            <button type="button" onClick={clearTodos}>
              Clear
            </button>
          </div>
          <div className="schedule-grid">
            {todos.map((todo) => (
              <TodoItem
                key={todo.id}
                todo={todo}
                editing={editing}
                editText={editText}
                editAmount={editAmount}
                onToggle={toggleTodo}
                onRemove={removeTodo}
                onStartEdit={startEditTodo}
                onCancelEdit={cancelEdit}
                onSaveEdit={saveEditTodo}
                onEditTextChange={setEditText}
                onEditAmountChange={setEditAmount}
                onAddItem={addItem}
                onToggleItem={toggleItem}
                onRemoveItem={removeItem}
                onClearItems={clearItems}
                onStartEditItem={startEditItem}
                onSaveEditItem={saveEditItem}
              />
            ))}
          </div>
        </section>

        <section
          className="history event-schema"
          style={{ visibility: "hidden" }}
        >
          <div className="section-header">
            <h2>History</h2>
            <button type="button" onClick={clearHistory}>
              Clear
            </button>
          </div>
          <div className="schedule-grid">
            {history.map((todo, index) => (
              <div
                className="schedule-item"
                key={index}
                style={{ borderLeft: todo.color ? `10px solid ${todo.color}` : "" }}
              >
                <p>#{todo.id}</p>
                <h3>{todo.text}</h3>
                <p>Created: {todo.timeStart}</p>
                <p>
                  {todo.done ? "Done: " + todo.timeEnd : "Pending"}
                  {todo.timeDeleted && " · Deleted: " + todo.timeDeleted}
                </p>
                {!todo.done && (
                  <button type="button" onClick={() => restoreTodo(index)}>
                    restore
                  </button>
                )}
                {todo.kind === "list" && (
                  <div className="shopping-body">
                    <ul>
                      {todo.items.map((item) => (
                        <li key={item.id}>
                          <span className={item.done ? "item-done" : ""}>
                            {item.text}
                          </span>
                          {item.amount && <span>Qty: {item.amount}</span>}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            ))}
          </div>
        </section>
      </main>
    </>
  );
}

export default App;
