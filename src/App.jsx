import { useState } from "react";
import "./index.css";

const initialTodos = [];

function App() {
  console.log("app started");
  const [todos, setTodos] = useState(initialTodos);
  const [text, setText] = useState("");

  function addTodo(e) {
    e.preventDefault();
    const message = e.target.firstChild.value;
    if (message.trim() === "") return;

    const timeStamp = Date.now();
    const now = new Date(timeStamp);
    const time = now.getHours() + ":" + now.getMinutes();

    const newTodo = {
      id: todos.length + 1,
      timeStart: time,
      text: message,
      done: false,
      timeEnde: "",
    };
    console.log(todos.length);
    setTodos([...todos, newTodo]);
    setText("");

    console.log(newTodo);
  }

  function removeTodo(id) {
    setTodos(todos.filter((todo) => todo.id !== id));
  }

  function toggleTodo(id) {
    const idItem = ".todo-item-" + id;
    const e = document.querySelector(idItem);
    console.log("E: ", e);

    const todo = todos.find((todo) => todo.id == id);

    if (!todo.done) {
      e.style.textDecoration = "line-through";
      const now2 = new Date(Date.now());
      todo.timeEnd = "finished at " + now2.getHours() + ":" + now2.getMinutes();
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

  return (
    <main>
      <h1>ToDo App</h1>
      <form onSubmit={addTodo}>
        <input
          value={text}
          type="text"
          placeholder="Add a task"
          onChange={(e) => setText(e.target.value)}
        />
        <button type="submit">Add</button>
      </form>

      <ul>
        {todos.map((todo) => (
          // changing format after all basics are done
          <li
            onClick={() => toggleTodo(todo.id)}
            role="checkbox"
            class={`todo-item-${todo.id}`}
            key={todo.id}
          >
            {"    time created:"}
            {todo.timeStart} {"    message:"}
            {todo.text}
            <button onClick={() => removeTodo(todo.id)}>remove</button>
            {todo.done ? "" : "Pending"}
            {todo.timeEnd}
          </li>
        ))}
      </ul>
    </main>
  );
}

export default App;
