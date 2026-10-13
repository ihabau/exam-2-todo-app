import { useTranslation } from "react-i18next";
import { formatWhen, formatRepeat } from "../utils/date";
import TimeField from "./TimeField";
import RepeatField from "./RepeatField";

const MAX_NAME = 30;

function TodoItem({
  todo,
  editing,
  editText,
  editDate,
  editTime,
  editRemind,
  editRepeat,
  onToggle,
  onRemove,
  onStartEdit,
  onCancelEdit,
  onSaveEdit,
  onEditTextChange,
  onEditDateChange,
  onEditTimeChange,
  onEditRemindChange,
  onEditRepeatChange,
  onToggleItem,
  onEditList,
}) {
  const { t } = useTranslation();
  const isList = todo.kind === "list";
  const isEditing = !isList && editing && editing.todoId === todo.id;

  return (
    <div
      className={
        "schedule-item task-card" +
        (todo.done ? " is-done" : "") +
        (isEditing ? " is-editing" : "")
      }
      style={{ borderInlineStart: todo.color ? `10px solid ${todo.color}` : "" }}
    >
      <label className="check">
        <input
          type="checkbox"
          checked={todo.done}
          onChange={() => onToggle(todo.id, todo.occurrenceDate)}
        />
        <span className="task-id">#{todo.id}</span>
      </label>
      {isEditing ? (
        <input
          className="edit-input"
          value={editText}
          maxLength={MAX_NAME}
          onChange={(e) => onEditTextChange(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") onSaveEdit(todo.id);
            if (e.key === "Escape") onCancelEdit();
          }}
        />
      ) : (
        <h3 className={`todo-item-${todo.id}`}>{todo.text}</h3>
      )}

      {isEditing ? (
        <div className="edit-schedule">
          <input
            type="date"
            value={editDate}
            onChange={(e) => onEditDateChange(e.target.value)}
          />
          <TimeField
            value={editTime}
            onChange={onEditTimeChange}
            ariaLabel={t("form.pickTime")}
          />
          <label className="remind-toggle">
            <input
              type="checkbox"
              checked={editRemind}
              onChange={(e) => onEditRemindChange(e.target.checked)}
            />
            <span>{t("common.remind")}</span>
          </label>
          <RepeatField
            value={editRepeat}
            dueDate={editDate}
            onChange={onEditRepeatChange}
          />
        </div>
      ) : (
        <p className={"when" + (todo.dueDate ? "" : " muted")}>
          {formatWhen(todo)}
          {formatRepeat(todo) && (
            <span className="repeat-badge">
              <svg
                viewBox="0 0 24 24"
                width="12"
                height="12"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <path d="M17 2l4 4-4 4" />
                <path d="M3 11v-1a4 4 0 0 1 4-4h14" />
                <path d="M7 22l-4-4 4-4" />
                <path d="M21 13v1a4 4 0 0 1-4 4H3" />
              </svg>
              {formatRepeat(todo)}
            </span>
          )}
        </p>
      )}

      <p className="ts-created">{t("common.created")}: {todo.timeStart}</p>
      <p className="ts-status">
        {todo.done ? t("common.done") + ": " + todo.timeEnd : t("common.pending")}
      </p>
      <div className="row-actions">
        {isEditing ? (
          <>
            <button type="button" onClick={() => onSaveEdit(todo.id)}>
              {t("common.save")}
            </button>
            <button type="button" onClick={onCancelEdit}>
              {t("common.cancel")}
            </button>
          </>
        ) : (
          <>
            {!todo.done &&
              (isList ? (
                <button type="button" onClick={() => onEditList(todo.id)}>
                  {t("common.edit")}
                </button>
              ) : (
                <button type="button" onClick={() => onStartEdit(todo)}>
                  {t("common.edit")}
                </button>
              ))}
            <button type="button" onClick={() => onRemove(todo.id)}>
              {t("common.remove")}
            </button>
          </>
        )}
      </div>

      {isList && (
        <ul className="list-items">
          {todo.items.length === 0 && (
            <li className="empty">{t("list.emptyItems")}</li>
          )}
          {todo.items.map((item) => (
            <li key={item.id}>
              <label className="item-check">
                <input
                  type="checkbox"
                  checked={item.done}
                  onChange={() => onToggleItem(todo.id, item.id)}
                />
              </label>
              <span className={item.done ? "item-done" : ""}>{item.text}</span>
              {item.amount && (
                <span className="item-qty">
                  {t("common.qty")}: {item.amount}
                </span>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default TodoItem;
