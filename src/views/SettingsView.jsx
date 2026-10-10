import { useState } from "react";

function SettingsView({ app }) {
  const [subpage, setSubpage] = useState(null);

  if (subpage === "appearance") {
    return (
      <div className="settings-view settings-subpage">
        <div className="settings-header">
          <button type="button" className="back-btn" onClick={() => setSubpage(null)}>
            ← Back
          </button>
          <h2 className="view-title">Appearance</h2>
        </div>
        <section className="settings-section">
          <div className="settings-row">
            <label htmlFor="theme-select">Theme</label>
            <select
              id="theme-select"
              className="theme-select"
              value={app.theme}
              onChange={(e) => app.changeTheme(e.target.value)}
            >
              <option value="slate">Slate</option>
              <option value="dark">Dark</option>
              <option value="indigo">Indigo</option>
              <option value="teal">Teal</option>
              <option value="plum">Plum</option>
            </select>
          </div>
          <div className="settings-row">
            <label htmlFor="auto-toggle">Auto day/night</label>
            <button
              id="auto-toggle"
              type="button"
              className={"day-night" + (app.autoTheme ? " active" : "")}
              onClick={app.toggleAuto}
            >
              {app.autoTheme ? "Auto" : "Manual"}
            </button>
          </div>
        </section>
      </div>
    );
  }

  if (subpage === "lists") {
    return (
      <div className="settings-view settings-subpage">
        <div className="settings-header">
          <button type="button" className="back-btn" onClick={() => setSubpage(null)}>
            ← Back
          </button>
          <h2 className="view-title">Lists & Tasks</h2>
        </div>
        <section className="settings-section">
          <div className="settings-row">
            <label htmlFor="hide-completed-all">Hide completed tasks (All)</label>
            <input
              id="hide-completed-all"
              type="checkbox"
              checked={app.hideCompletedAll}
              onChange={(e) => app.setHideCompletedAll(e.target.checked)}
            />
          </div>
          <div className="settings-row">
            <label htmlFor="hide-completed-lists-all">Hide completed lists (All)</label>
            <input
              id="hide-completed-lists-all"
              type="checkbox"
              checked={app.hideCompletedListsAll}
              onChange={(e) => app.setHideCompletedListsAll(e.target.checked)}
            />
          </div>
          <div className="settings-row">
            <label htmlFor="hide-completed-hist">Hide completed tasks (History)</label>
            <input
              id="hide-completed-hist"
              type="checkbox"
              checked={app.hideCompletedHistory}
              onChange={(e) => app.setHideCompletedHistory(e.target.checked)}
            />
          </div>
          <div className="settings-row">
            <label htmlFor="hide-completed-lists-hist">Hide completed lists (History)</label>
            <input
              id="hide-completed-lists-hist"
              type="checkbox"
              checked={app.hideCompletedListsHistory}
              onChange={(e) => app.setHideCompletedListsHistory(e.target.checked)}
            />
          </div>
        </section>
      </div>
    );
  }

  return (
    <div className="settings-view">
      <h2 className="view-title">Settings</h2>
      <ul className="settings-list">
        <li>
          <button type="button" className="settings-item" onClick={() => setSubpage("appearance")}>
            <span className="settings-item-icon">🎨</span>
            <span className="settings-item-label">Appearance</span>
            <span className="settings-item-arrow">›</span>
          </button>
        </li>
        <li>
          <button type="button" className="settings-item" onClick={() => setSubpage("lists")}>
            <span className="settings-item-icon">📋</span>
            <span className="settings-item-label">Lists & Tasks</span>
            <span className="settings-item-arrow">›</span>
          </button>
        </li>
        <li>
          <button type="button" className="settings-item" disabled>
            <span className="settings-item-icon">🌐</span>
            <span className="settings-item-label">Language</span>
            <span className="settings-item-arrow">English</span>
          </button>
        </li>
      </ul>
    </div>
  );
}

export default SettingsView;
