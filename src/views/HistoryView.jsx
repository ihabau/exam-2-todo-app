function HistoryView({ app }) {
  return (
    <div className="view history-view">
      <section className="event-schema">
        <div className="section-header">
          <h2>History</h2>
          {app.history.length > 0 && (
            <button type="button" onClick={app.clearHistory}>
              Clear
            </button>
          )}
        </div>
        <div className="schedule-grid">
          {app.history.length === 0 && (
            <p className="empty">Nothing deleted yet.</p>
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
                borderLeft: todo.color ? `10px solid ${todo.color}` : "",
              }}
            >
              <label className="check">
                <span className="task-id">#{todo.id}</span>
              </label>
              <h3>{todo.text}</h3>
              <p className="timestamps">
                Created: {todo.timeStart}
                <br />
                {todo.done ? "Done: " + todo.timeEnd : "Pending"}
                {todo.timeDeleted && " · Deleted: " + todo.timeDeleted}
              </p>
              <div className="row-actions">
                {!todo.done && (
                  <button type="button" onClick={() => app.restoreTodo(index)}>
                    restore
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
    </div>
  );
}

export default HistoryView;
