import TodoItem from "../components/TodoItem";
import {
  toDateKey,
  tasksForDay,
  unscheduled,
  addDays,
  pad,
} from "../utils/date";

const HOURS = Array.from({ length: 24 }, (_, i) => i);

function TaskCard({ todo, app }) {
  return (
    <TodoItem
      todo={todo}
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
  );
}

function ScheduleView({ app }) {
  const dayKey = toDateKey(app.selectedDate);
  const dayTasks = tasksForDay(app.todos, dayKey);
  const allDay = dayTasks.filter((todo) => !todo.dueTime);
  const noDate = unscheduled(app.todos);

  function isToday() {
    return dayKey === toDateKey(new Date());
  }

  return (
    <div className="view schedule-view">
      <section className="event-schema">
        <div className="section-header day-nav">
          <button
            type="button"
            onClick={() => app.setSelectedDate(addDays(app.selectedDate, -1))}
            aria-label="Previous day"
          >
            ‹
          </button>
          <h2>
            {app.selectedDate.toLocaleDateString(undefined, {
              weekday: "short",
              month: "short",
              day: "numeric",
            })}
            {isToday() && <span className="today-badge">Today</span>}
          </h2>
          <button
            type="button"
            onClick={() => app.setSelectedDate(addDays(app.selectedDate, 1))}
            aria-label="Next day"
          >
            ›
          </button>
        </div>

        {allDay.length > 0 && (
          <div className="all-day">
            <span className="slot-label">All day</span>
            <div className="schedule-grid">
              {allDay.map((todo) => (
                <TaskCard key={todo.id} todo={todo} app={app} />
              ))}
            </div>
          </div>
        )}

        <div className="timeline">
          {HOURS.map((hour) => {
            const slot = dayTasks.filter(
              (todo) => todo.dueTime && Number(todo.dueTime.slice(0, 2)) === hour,
            );
            return (
              <div className="time-slot" key={hour}>
                <span className="slot-label">{pad(hour)}:00</span>
                <div className="slot-body">
                  {slot.map((todo) => (
                    <TaskCard key={todo.id} todo={todo} app={app} />
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </section>

      <section className="event-schema">
        <div className="section-header">
          <h2>Unscheduled</h2>
        </div>
        <div className="schedule-grid">
          {noDate.length === 0 && (
            <p className="empty">Everything has a date.</p>
          )}
          {noDate.map((todo) => (
            <TaskCard key={todo.id} todo={todo} app={app} />
          ))}
        </div>
      </section>
    </div>
  );
}

export default ScheduleView;
