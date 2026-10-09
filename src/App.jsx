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
    console.log(todos.length);
    setTodos([...todos, newTodo]);
    setText("");

    console.log(newTodo);
  }

  function removeTodo(id) {
    const todo = todos.find((todo) => todo.id === id);
    const now = new Date(Date.now()).toLocaleString();
    todo.timeDeleted = now;
    history.push(todo);
    setTodos(todos.filter((todo) => todo.id !== id));
  }

  function toggleTodo(id) {
    const idItem = ".todo-item-" + id;
    const e = document.querySelector(idItem);
    console.log("E: ", e);

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
        todo.id === id ? { ...todo, done: !todo.done } : todo,
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

  return (
    <main>
      <header>
        <h1>ToDo App</h1>
      </header>

      <form onSubmit={addTodo}>
        <input
          value={text}
          type="text"
          placeholder="Add a task"
          onChange={(e) => setText(e.target.value)}
        />
        <button type="submit">Add</button>
        <button type="button" onClick={toggleHistory}>
          Show history
        </button>
      </form>

      <section className="history" style={{ visibility: "hidden" }}>
        <h2>History</h2>
        <ul>
          {history.map((todo) => (
            <li key={todo.id}>
              {"    time created:"}
              {todo.timeStart} {"    message:"}
              {todo.text}
              {todo.done ? "" : "Pending "}
              {todo.timeEnd}
              {todo.timeDeleted}
            </li>
          ))}
        </ul>
      </section>

      <section>
        <h2>Active tasks</h2>
        <ul>
          {todos.map((todo) => (
            <li className={`todo-item-${todo.id}`} key={todo.id}>
              <label>
                <input
                  type="checkbox"
                  checked={todo.done}
                  onChange={() => toggleTodo(todo.id)}
                />
                {todo.id}
                {"    time created:"}
                {todo.timeStart} {"    message:"}
                {todo.text}
                {todo.done ? "" : "Pending"}
                {todo.timeEnd}
              </label>
              <button type="button" onClick={() => removeTodo(todo.id)}>
                remove
              </button>
            </li>
          ))}
        </ul>
      </section>
    </main>
  );
}

export default App;
