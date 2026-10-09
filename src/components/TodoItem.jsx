function TodoItem({
  todo,
  editing,
  editText,
  editAmount,
  onToggle,
  onRemove,
  onStartEdit,
  onCancelEdit,
  onSaveEdit,
  onEditTextChange,
  onEditAmountChange,
  onAddItem,
  onToggleItem,
  onRemoveItem,
  onClearItems,
  onStartEditItem,
  onSaveEditItem,
}) {
  const isEditing = editing && editing.todoId === todo.id;
  const isEditingItem = (itemId) =>
    editing && editing.listId === todo.id && editing.itemId === itemId;

  return (
    <div
      className="schedule-item"
      style={{ borderLeft: todo.color ? `10px solid ${todo.color}` : "" }}
    >
      <label>
        <input
          type="checkbox"
          checked={todo.done}
          onChange={() => onToggle(todo.id)}
        />
        #{todo.id}
      </label>
      {isEditing ? (
        <input
          className="edit-input"
          value={editText}
          onChange={(e) => onEditTextChange(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") onSaveEdit(todo.id);
            if (e.key === "Escape") onCancelEdit();
          }}
        />
      ) : (
        <h3 className={`todo-item-${todo.id}`}>{todo.text}</h3>
      )}
      <p>
        Created: {todo.timeStart}
        <br />
        {todo.done ? "Done: " + todo.timeEnd : "Pending"}
      </p>
      <div className="row-actions">
        {isEditing ? (
          <>
            <button type="button" onClick={() => onSaveEdit(todo.id)}>
              save
            </button>
            <button type="button" onClick={onCancelEdit}>
              cancel
            </button>
          </>
        ) : (
          <>
            {!todo.done && (
              <button type="button" onClick={() => onStartEdit(todo)}>
                edit
              </button>
            )}
            <button type="button" onClick={() => onRemove(todo.id)}>
              remove
            </button>
          </>
        )}
      </div>
      {todo.kind === "list" && (
        <div className="shopping-body">
          <form onSubmit={(e) => onAddItem(todo.id, e)}>
            <input name="text" type="text" placeholder="Add an item" />
            <input name="amount" type="number" min="1" placeholder="Qty" />
            <button type="submit">Add</button>
          </form>
          <ul>
            {todo.items.map((item) => (
              <li key={item.id}>
                <label>
                  <input
                    type="checkbox"
                    checked={item.done}
                    onChange={() => onToggleItem(todo.id, item.id)}
                  />
                </label>
                {isEditingItem(item.id) ? (
                  <input
                    className="edit-input"
                    value={editText}
                    onChange={(e) => onEditTextChange(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") onSaveEditItem(todo.id, item.id);
                      if (e.key === "Escape") onCancelEdit();
                    }}
                  />
                ) : (
                  <span className={item.done ? "item-done" : ""}>
                    {item.text}
                  </span>
                )}
                {isEditingItem(item.id) ? (
                  <input
                    className="edit-input"
                    type="number"
                    min="1"
                    placeholder="Qty"
                    value={editAmount}
                    onChange={(e) => onEditAmountChange(e.target.value)}
                  />
                ) : (
                  item.amount && <span>Qty: {item.amount}</span>
                )}
                <div className="item-actions">
                  {isEditingItem(item.id) ? (
                    <>
                      <button
                        type="button"
                        onClick={() => onSaveEditItem(todo.id, item.id)}
                      >
                        save
                      </button>
                      <button type="button" onClick={onCancelEdit}>
                        cancel
                      </button>
                    </>
                  ) : (
                    <>
                      {!item.done && (
                        <button
                          type="button"
                          onClick={() => onStartEditItem(todo.id, item)}
                        >
                          edit
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={() => onRemoveItem(todo.id, item.id)}
                      >
                        remove
                      </button>
                    </>
                  )}
                </div>
              </li>
            ))}
          </ul>
          {todo.items.length > 0 && (
            <button type="button" onClick={() => onClearItems(todo.id)}>
              clear items
            </button>
          )}
        </div>
      )}
    </div>
  );
}

export default TodoItem;
