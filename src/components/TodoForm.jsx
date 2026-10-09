const FLAG_SETS = [
  ["#e5484d", "#f76b15", "#f5a524", "#ffd60a"],
  ["#a3e635", "#30a46c", "#12a594", "#00a2c7"],
  ["#3e63dd", "#5b5bd6", "#8e4ec6", "#c026d3"],
  ["#e93d82", "#78716c", "#0f172a", "#64748b"],
];

function TodoForm({
  text,
  onTextChange,
  onAdd,
  onAddList,
  newColor,
  onPickColor,
  onToggleHistory,
}) {
  return (
    <div className="form-bar">
      <form onSubmit={onAdd}>
        <input
          value={text}
          type="text"
          placeholder="Add a task"
          onChange={(e) => onTextChange(e.target.value)}
        />
        <div className="flags">
          {FLAG_SETS.map((set, i) => (
            <div className="flag-set" key={i}>
              {set.map((color) => (
                <button
                  type="button"
                  key={color}
                  className={"flag" + (newColor === color ? " active" : "")}
                  style={{ backgroundColor: color }}
                  aria-label={"flag " + color}
                  onClick={() => onPickColor(color)}
                />
              ))}
            </div>
          ))}
        </div>
        <button type="submit">Add</button>
        <button type="button" onClick={onAddList}>
          Add list
        </button>
      </form>

      <button type="button" className="history-btn" onClick={onToggleHistory}>
        Show history
      </button>
    </div>
  );
}

export default TodoForm;
