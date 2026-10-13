import Calendar from "react-calendar";
import { useTranslation } from "react-i18next";
import TodoItem from "../components/TodoItem";
import { toDateKey, tasksForDay } from "../utils/date";

function CalendarView({ app }) {
  const { t, i18n } = useTranslation();
  const lang = (i18n.resolvedLanguage || i18n.language || "en").split("-")[0];
  const selectedKey = toDateKey(app.selectedDate);
  const dayTasks = tasksForDay(app.todos, selectedKey);

  function renderTile({ date, view }) {
    if (view !== "month") return null;
    const count = tasksForDay(app.todos, toDateKey(date)).length;
    if (!count) return null;
    return (
      <span
        className="tile-dot"
        aria-label={t("calendar.tasksCount", { count })}
      />
    );
  }

  return (
    <div className="view calendar-view">
      <section className="panel">
        <Calendar
          value={app.selectedDate}
          onChange={app.setSelectedDate}
          tileContent={renderTile}
          locale={lang === "ar" ? "ar" : "en-GB"}
        />
      </section>

      <section className="event-schema">
        <div className="section-header">
          <h2>
            {app.selectedDate.toLocaleDateString(lang === "ar" ? "ar" : undefined, {
              weekday: "long",
              month: "short",
              day: "numeric",
            })}
          </h2>
        </div>
        <div className="schedule-grid">
          {dayTasks.length === 0 && (
            <p className="empty">{t("calendar.empty")}</p>
          )}
          {dayTasks.map((todo) => (
            <TodoItem
              key={todo.id}
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
          ))}
        </div>
      </section>
    </div>
  );
}

export default CalendarView;
