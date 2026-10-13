import { useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { LANGUAGES } from "../i18n";
import { exportCsv, parseTasksCsv, tasksFilename, historyFilename } from "../utils/export";

const THEMES = [
  { value: "slate", key: "settings.themeSlate" },
  { value: "dark", key: "settings.themeDark" },
  { value: "indigo", key: "settings.themeIndigo" },
  { value: "teal", key: "settings.themeTeal" },
  { value: "plum", key: "settings.themePlum" },
];

function SettingsView({ app }) {
  const { t, i18n } = useTranslation();
  const [subpage, setSubpage] = useState(null);
  const [notice, setNotice] = useState("");
  const fileInputRef = useRef(null);
  const lang = (i18n.resolvedLanguage || i18n.language || "en").split("-")[0];
  const currentLanguage = LANGUAGES.find((item) => item.code === lang);
  const backArrow = lang === "ar" ? "→" : "←";

  async function runExport(items, filename) {
    setNotice("");
    try {
      await exportCsv(items, filename);
      setNotice(t("settings.exportDone"));
    } catch {
      setNotice(t("settings.exportFailed"));
    }
  }

  async function handleImportFile(event) {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;
    setNotice("");
    try {
      const rows = parseTasksCsv(await file.text());
      if (rows.length === 0) {
        setNotice(t("settings.importEmpty"));
        return;
      }
      app.importTodos(rows);
      setNotice(t("settings.importDone", { count: rows.length }));
    } catch {
      setNotice(t("settings.importFailed"));
    }
  }

  if (subpage === "appearance") {
    return (
      <div className="settings-view settings-subpage">
        <div className="settings-header">
          <button type="button" className="back-btn" onClick={() => setSubpage(null)}>
            {backArrow} {t("common.back")}
          </button>
          <h2 className="view-title">{t("settings.appearance")}</h2>
        </div>
        <section className="settings-section">
          <div className="settings-row">
            <label htmlFor="theme-select">{t("settings.theme")}</label>
            <select
              id="theme-select"
              className="theme-select"
              value={app.theme}
              onChange={(e) => app.changeTheme(e.target.value)}
            >
              {THEMES.map((theme) => (
                <option key={theme.value} value={theme.value}>
                  {t(theme.key)}
                </option>
              ))}
            </select>
          </div>
          <div className="settings-row">
            <label htmlFor="auto-toggle">{t("settings.autoDayNight")}</label>
            <button
              id="auto-toggle"
              type="button"
              className={"day-night" + (app.autoTheme ? " active" : "")}
              onClick={app.toggleAuto}
            >
              {app.autoTheme ? t("settings.auto") : t("settings.manual")}
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
            {backArrow} {t("common.back")}
          </button>
          <h2 className="view-title">{t("settings.lists")}</h2>
        </div>
        <section className="settings-section">
          <div className="settings-row">
            <label htmlFor="hide-completed-all">{t("settings.hideCompletedAll")}</label>
            <input
              id="hide-completed-all"
              type="checkbox"
              checked={app.hideCompletedAll}
              onChange={(e) => app.setHideCompletedAll(e.target.checked)}
            />
          </div>
          <div className="settings-row">
            <label htmlFor="hide-completed-lists-all">{t("settings.hideCompletedListsAll")}</label>
            <input
              id="hide-completed-lists-all"
              type="checkbox"
              checked={app.hideCompletedListsAll}
              onChange={(e) => app.setHideCompletedListsAll(e.target.checked)}
            />
          </div>
          <div className="settings-row">
            <label htmlFor="hide-completed-hist">{t("settings.hideCompletedHistory")}</label>
            <input
              id="hide-completed-hist"
              type="checkbox"
              checked={app.hideCompletedHistory}
              onChange={(e) => app.setHideCompletedHistory(e.target.checked)}
            />
          </div>
          <div className="settings-row">
            <label htmlFor="hide-completed-lists-hist">{t("settings.hideCompletedListsHistory")}</label>
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

  if (subpage === "language") {
    return (
      <div className="settings-view settings-subpage">
        <div className="settings-header">
          <button type="button" className="back-btn" onClick={() => setSubpage(null)}>
            {backArrow} {t("common.back")}
          </button>
          <h2 className="view-title">{t("settings.language")}</h2>
        </div>
        <ul className="settings-list">
          {LANGUAGES.map((item) => (
            <li key={item.code}>
              <button
                type="button"
                className={"settings-item" + (lang === item.code ? " active" : "")}
                aria-current={lang === item.code ? "true" : undefined}
                onClick={() => i18n.changeLanguage(item.code)}
              >
                <span className="settings-item-icon">🌐</span>
                <span className="settings-item-label">{t(item.key)}</span>
                {lang === item.code && <span className="settings-item-arrow">✓</span>}
              </button>
            </li>
          ))}
        </ul>
      </div>
    );
  }

  if (subpage === "export") {
    return (
      <div className="settings-view settings-subpage">
        <div className="settings-header">
          <button type="button" className="back-btn" onClick={() => setSubpage(null)}>
            {backArrow} {t("common.back")}
          </button>
          <h2 className="view-title">{t("settings.export")}</h2>
        </div>
        <section className="settings-section">
          <button
            type="button"
            className="settings-item"
            disabled={app.todos.length === 0}
            onClick={() => runExport(app.todos, tasksFilename())}
          >
            <span className="settings-item-icon">📄</span>
            <span className="settings-item-label">{t("settings.exportTasks")}</span>
          </button>
          <button
            type="button"
            className="settings-item"
            disabled={app.history.length === 0}
            onClick={() => runExport(app.history, historyFilename())}
          >
            <span className="settings-item-icon">🗂️</span>
            <span className="settings-item-label">{t("settings.exportHistory")}</span>
          </button>
          <button
            type="button"
            className="settings-item"
            onClick={() => fileInputRef.current?.click()}
          >
            <span className="settings-item-icon">📥</span>
            <span className="settings-item-label">{t("settings.importTasks")}</span>
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept=".csv,text/csv"
            hidden
            onChange={handleImportFile}
          />
          {notice && <p className="settings-note">{notice}</p>}
        </section>
      </div>
    );
  }

  return (
    <div className="settings-view">
      <h2 className="view-title">{t("settings.title")}</h2>
      <ul className="settings-list">
        <li>
          <button type="button" className="settings-item" onClick={() => setSubpage("appearance")}>
            <span className="settings-item-icon">🎨</span>
            <span className="settings-item-label">{t("settings.appearance")}</span>
            <span className="settings-item-arrow">›</span>
          </button>
        </li>
        <li>
          <button type="button" className="settings-item" onClick={() => setSubpage("lists")}>
            <span className="settings-item-icon">📋</span>
            <span className="settings-item-label">{t("settings.lists")}</span>
            <span className="settings-item-arrow">›</span>
          </button>
        </li>
        <li>
          <button type="button" className="settings-item" onClick={() => setSubpage("language")}>
            <span className="settings-item-icon">🌐</span>
            <span className="settings-item-label">{t("settings.language")}</span>
            <span className="settings-item-arrow">
              {currentLanguage ? t(currentLanguage.key) : ""}
            </span>
          </button>
        </li>
        <li>
          <button type="button" className="settings-item" onClick={() => setSubpage("export")}>
            <span className="settings-item-icon">📤</span>
            <span className="settings-item-label">{t("settings.export")}</span>
            <span className="settings-item-arrow">›</span>
          </button>
        </li>
      </ul>
    </div>
  );
}

export default SettingsView;
