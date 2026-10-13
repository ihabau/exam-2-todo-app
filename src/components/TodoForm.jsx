import { useState } from "react";
import { useTranslation } from "react-i18next";
import TimeField from "./TimeField";
import RepeatField from "./RepeatField";

const MAX_NAME = 30;
const MAX_ITEM_NAME = 30;

const FLAG_SETS = [
  ["#e5484d", "#f87171", "#b91c1c", "#dc2626"],
  ["#f76b15", "#fb923c", "#c2410c", "#ea580c"],
  ["#f5a524", "#ffd60a", "#a3e635", "#65a30d"],
  ["#30a46c", "#34d399", "#16a34a", "#0d9488"],
  ["#00a2c7", "#38bdf8", "#0284c7", "#3b82f6"],
  ["#3e63dd", "#6366f1", "#5b5bd6", "#8b5cf6"],
  ["#8e4ec6", "#c026d3", "#e93d82", "#ec4899"],
];

function TodoForm({
  text,
  onTextChange,
  onAdd,
  newColor,
  onPickColor,
  dueDate,
  dueTime,
  remind,
  repeat,
  listItems,
  onStageItem,
  onUpdateStagedItem,
  onRemoveStagedItem,
  isEditingList,
  onCancel,
  onDueDateChange,
  onDueTimeChange,
  onRemindChange,
  onRepeatChange,
}) {
  const { t } = useTranslation();
  const [itemText, setItemText] = useState("");
  const [itemAmount, setItemAmount] = useState("");

  function stageItem() {
    if (itemText.trim() === "") return;
    onStageItem(itemText, itemAmount);
    setItemText("");
    setItemAmount("");
  }

  return (
    <div className="form-bar">
      <form onSubmit={onAdd}>
        <div className="input-row">
          <input
            value={text}
            type="text"
            placeholder={isEditingList ? t("form.listPlaceholder") : t("form.taskPlaceholder")}
            maxLength={MAX_NAME}
            onChange={(e) => onTextChange(e.target.value)}
          />
          <button type="submit" className="primary">
            {isEditingList ? t("common.save") : t("common.add")}
          </button>
          {isEditingList && (
            <button type="button" className="cancel" onClick={onCancel}>
              {t("common.cancel")}
            </button>
          )}
        </div>

        <div className="item-row">
          <input
            type="text"
            value={itemText}
            placeholder={t("form.addItemPlaceholder")}
            maxLength={MAX_ITEM_NAME}
            onChange={(e) => setItemText(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                stageItem();
              }
            }}
          />
          <input
            type="number"
            min="1"
            value={itemAmount}
            placeholder={t("form.qtyPlaceholder")}
            onChange={(e) => setItemAmount(e.target.value)}
          />
          <button type="button" onClick={stageItem}>
            {t("form.addItem")}
          </button>
        </div>

        <div className="flags">
          {FLAG_SETS.map((set, i) => (
            <div className="flag-set" key={i}>
              {set.map((color) => (
                <button
                  type="button"
                  key={color}
                  className={"flag" + (newColor === color ? " active" : "")}
                  style={{ backgroundColor: color }}
                  aria-label={t("form.flag", { color })}
                  onClick={() => onPickColor(color)}
                />
              ))}
            </div>
          ))}
        </div>

        <div className="schedule-fields">
          <div className="field">
            <span className="field-label">
              <svg
                viewBox="0 0 24 24"
                width="14"
                height="14"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <rect x="3" y="4" width="18" height="17" rx="2" />
                <path d="M3 9h18M8 2v4M16 2v4" />
              </svg>
              {t("common.date")}
            </span>
            <input
              type="date"
              value={dueDate}
              onChange={(e) => onDueDateChange(e.target.value)}
            />
          </div>
          <div className="field">
            <span className="field-label">
              <svg
                viewBox="0 0 24 24"
                width="14"
                height="14"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <circle cx="12" cy="12" r="9" />
                <path d="M12 7v5l3 2" />
              </svg>
              {t("common.time")}
            </span>
            <TimeField
              value={dueTime}
              onChange={onDueTimeChange}
              ariaLabel={t("form.pickTime")}
            />
          </div>
          <label className="remind-toggle">
            <input
              type="checkbox"
              checked={remind}
              onChange={(e) => onRemindChange(e.target.checked)}
            />
            <span>{t("common.remindMe")}</span>
          </label>
        </div>

        <RepeatField
          value={repeat}
          dueDate={dueDate}
          onChange={onRepeatChange}
        />

        {(isEditingList || listItems.length > 0) && (
          <div className="staged-items">
            {listItems.map((item) => (
              <div
                className="staged-item"
                key={item.id}
                style={{ borderInlineStart: newColor ? `10px solid ${newColor}` : "" }}
              >
                <input
                  className="staged-text"
                  type="text"
                  value={item.text}
                  aria-label={t("form.itemName")}
                  maxLength={MAX_ITEM_NAME}
                  onChange={(e) =>
                    onUpdateStagedItem(item.id, { text: e.target.value })
                  }
                />
                <input
                  className="staged-amount"
                  type="number"
                  min="1"
                  value={item.amount}
                  placeholder={t("form.qtyPlaceholder")}
                  aria-label={t("form.itemQuantity")}
                  onChange={(e) =>
                    onUpdateStagedItem(item.id, { amount: e.target.value })
                  }
                />
                <button
                  type="button"
                  aria-label={t("form.removeItem", { name: item.text })}
                  onClick={() => onRemoveStagedItem(item.id)}
                >
                  ×
                </button>
              </div>
            ))}
            <span className="staged-hint">
              {isEditingList ? t("form.stagedEdit") : t("form.stagedAdd")}
            </span>
          </div>
        )}
      </form>
    </div>
  );
}

export default TodoForm;
