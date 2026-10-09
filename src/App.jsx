import { useState } from "react";
import "./index.css";

const history = [];

function App() {
  console.log("app started");
  const [todos, setTodos] = useState([]);
  const [text, setText] = useState();

  function addTodo(e) {
    e.preventDefault();
    const message = e.target.firstChild.value;
    if (message.trim() === "") return;

    const timeStart = new Date(Date.now()).toLocaleString();

    const newTodo = {
      id: todos.length + 1,
      timeStart: timeStart,
      text: message,
      done: false,
      timeEnd: "",
      timeDeleted: "",
    };
    setTodos([...todos, newTodo]);
    setText("");
  }

  function addList() {
    const timeStart = new Date(Date.now()).toLocaleString();
    const name = (text || "").trim();

    const newList = {
      id: todos.length + 1,
      timeStart: timeStart,
      text: name === "" ? "New list" : name,
      done: false,
      timeEnd: "",
      timeDeleted: "",
      kind: "list",
      items: [],
    };
    setTodos([...todos, newList]);
    setText("");
  }

  function removeTodo(id) {
    const todo = todos.find((todo) => todo.id === id);

    if (todo.kind === "list" && todo.items.length === 0) {
      setTodos(todos.filter((todo) => todo.id !== id));
      return;
    }

    const now = new Date(Date.now()).toLocaleString();
    todo.timeDeleted = now;
    history.push(todo);
    setTodos(todos.filter((todo) => todo.id !== id));
  }

  function toggleTodo(id) {
    const idItem = ".todo-item-" + id;
    const e = document.querySelector(idItem);

    const todo = todos.find((todo) => todo.id == id);

    if (!todo.done) {
      e.style.textDecoration = "line-through";
      todo.timeEnd = new Date(Date.now()).toLocaleString();
    } else {
      e.style.textDecoration = "none";
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

  return (
    <>
      <header>
        <h1>ToDo App</h1>
      </header>

      <main>
        <div className="form-bar">
          <form onSubmit={addTodo}>
            <input
              value={text}
              type="text"
              placeholder="Add a task"
              onChange={(e) => setText(e.target.value)}
            />
            <button type="submit">Add</button>
            <button type="button" onClick={addList}>
              Add list
            </button>
          </form>

          <button
            type="button"
            className="history-btn"
            onClick={toggleHistory}
          >
            Show history
          </button>
        </div>

        <section className="event-schema">
          <div className="section-header">
            <h2>Active tasks</h2>
            <button type="button" onClick={clearTodos}>
              Clear
            </button>
          </div>
          <div className="schedule-grid">
            {todos.map((todo) => (
              <div className="schedule-item" key={todo.id}>
                <label>
                  <input
                    type="checkbox"
                    checked={todo.done}
                    onChange={() => toggleTodo(todo.id)}
                  />
                  #{todo.id}
                </label>
                <h3 className={`todo-item-${todo.id}`}>{todo.text}</h3>
                <p>
                  Created: {todo.timeStart}
                  <br />
                  {todo.done ? "Done: " + todo.timeEnd : "Pending"}
                </p>
                <button type="button" onClick={() => removeTodo(todo.id)}>
                  remove
                </button>
                {todo.kind === "list" && (
                  <div className="shopping-body">
                    <form onSubmit={(e) => addItem(todo.id, e)}>
                      <input name="text" type="text" placeholder="Add an item" />
                      <input
                        name="amount"
                        type="number"
                        min="1"
                        placeholder="Qty"
                      />
                      <button type="submit">Add</button>
                    </form>
                    <ul>
                      {todo.items.map((item) => (
                        <li key={item.id}>
                          <label>
                            <input
                              type="checkbox"
                              checked={item.done}
                              onChange={() => toggleItem(todo.id, item.id)}
                            />
                            <span className={item.done ? "item-done" : ""}>
                              {item.text}
                            </span>
                          </label>
                          <span>Qty: {item.amount || 1}</span>
                          <button
                            type="button"
                            onClick={() => removeItem(todo.id, item.id)}
                          >
                            remove
                          </button>
                        </li>
                      ))}
                    </ul>
                    {todo.items.length > 0 && (
                      <button type="button" onClick={() => clearItems(todo.id)}>
                        clear items
                      </button>
                    )}
                  </div>
                )}
              </div>
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
              <div className="schedule-item" key={todo.id}>
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
                          <span>Qty: {item.amount || 1}</span>
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
