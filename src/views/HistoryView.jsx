import { useTranslation } from "react-i18next";

function HistoryView({ app }) {
  const { t } = useTranslation();
  return (
    <div className="view history-view">
      <section className="event-schema">
        <div className="section-header">
          <h2>{t("history.title")}</h2>
          {app.history.length > 0 && (
            <button type="button" onClick={app.clearHistory}>
              {t("common.clear")}
            </button>
          )}
        </div>
        <div className="schedule-grid">
          {app.history.length === 0 && (
            <p className="empty">{t("history.empty")}</p>
          )}
          {app.history
            .filter((todo) => {
              if (app.hideCompletedHistory && todo.done && todo.kind !== "list") return false;
              if (app.hideCompletedListsHistory && todo.kind === "list") {
                const items = todo.items || [];
                if (items.length > 0 && items.every((item) => item.done) && todo.done) return false;
              }
              return true;
            })
            .map((todo, index) => (
            <div
              className="schedule-item"
              key={index}
              style={{
                borderInlineStart: todo.color ? `10px solid ${todo.color}` : "",
              }}
            >
              <label className="check">
                <span className="task-id">#{todo.id}</span>
              </label>
              <h3>{todo.text}</h3>
              <p className="timestamps">
                {t("common.created")}: {todo.timeStart}
                <br />
                {todo.done ? t("common.done") + ": " + todo.timeEnd : t("common.pending")}
                {todo.timeDeleted && " · " + t("common.deleted") + ": " + todo.timeDeleted}
              </p>
              <div className="row-actions">
                {!todo.done && (
                  <button type="button" onClick={() => app.restoreTodo(index)}>
                    {t("common.restore")}
                  </button>
                )}
              </div>
              {todo.kind === "list" && (
                <div className="shopping-body">
                  <ul>
                    {todo.items.map((item) => (
                      <li key={item.id}>
                        <span className={item.done ? "item-done" : ""}>
                          {item.text}
                        </span>
                        {item.amount && (
                          <span>
                            {t("common.qty")}: {item.amount}
                          </span>
                        )}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

export default HistoryView;
