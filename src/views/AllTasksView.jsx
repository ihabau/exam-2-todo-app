import TodoItem from "../components/TodoItem";
import { occurrenceFor, isRecurring } from "../utils/date";

function AllTasksView({ app }) {
  const active = app.todos.filter((todo) => !todo.done).length;
  const done = app.todos.length - active;

  return (
    <div className="view tasks-view">
      <section className="event-schema">
        <div className="section-header">
          <h2>All tasks</h2>
          <div className="section-actions">
            {app.canUndoClear && (
              <button type="button" onClick={app.undoClear}>
                Undo clear
              </button>
            )}
            {app.todos.length > 0 && (
              <button type="button" onClick={app.clearTodos}>
                Clear
              </button>
            )}
          </div>
        </div>

        {app.todos.length > 0 && (
          <p className="task-count">
            {active} active · {done} done
          </p>
        )}

        <div className="schedule-grid">
          {app.todos.length === 0 && (
            <p className="empty">No tasks yet. Add one on the Tasks tab.</p>
          )}
          {app.todos
            .filter((todo) => {
              if (app.hideCompletedAll && todo.done && todo.kind !== "list") return false;
              if (app.hideCompletedListsAll && todo.kind === "list") {
                const items = todo.items || [];
                if (items.length > 0 && items.every((item) => item.done) && todo.done) return false;
              }
              return true;
            })
            .map((todo) => (
            <TodoItem
              key={todo.id}
              todo={isRecurring(todo) ? occurrenceFor(todo, todo.dueDate) : todo}
              editing={app.editing}
              editText={app.editText}
              editDate={app.editDate}
              editTime={app.editTime}
              editRemind={app.editRemind}
              editRepeat={app.editRepeat}
              onToggle={app.toggleTodo}
              onRemove={app.removeTodo}
              onStartEdit={app.startEditTodo}
              onCancelEdit={app.cancelEdit}
              onSaveEdit={app.saveEditTodo}
              onEditTextChange={app.setEditText}
              onEditDateChange={app.setEditDate}
              onEditTimeChange={app.setEditTime}
              onEditRemindChange={app.setEditRemind}
              onEditRepeatChange={app.setEditRepeat}
              onToggleItem={app.toggleItem}
              onEditList={app.startListEdit}
            />
          ))}
        </div>
      </section>
    </div>
  );
}

export default AllTasksView;
