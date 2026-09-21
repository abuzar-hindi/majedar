"use client";

import { useState, createContext, useContext, useCallback } from "react";

// ── Search icon SVG ───────────────────────────────────────────────────────────
function SearchIcon() {
  return (
    <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
    </svg>
  );
}

function CloseIcon({ size = 16 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M6 18L18 6M6 6l12 12" />
    </svg>
  );
}

function InboxIcon() {
  return (
    <svg width={22} height={22} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
    </svg>
  );
}

function UploadIcon() {
  return (
    <svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M4 16l4-4m0 0l4 4m-4-4v12M20 16V8a2 2 0 00-2-2H6a2 2 0 00-2 2v2" />
    </svg>
  );
}

// ── Components ────────────────────────────────────────────────────────────────
export function PageHeader({ eyebrow, title, description, action, children }) {
  return (
    <div className="page-header">
      <div>
        {eyebrow && <p className="eyebrow">{eyebrow}</p>}
        <h1>{title}</h1>
        {description && <p className="page-description">{description}</p>}
      </div>
      <div className="page-actions">
        {action}
        {children}
      </div>
    </div>
  );
}

export function StatusBadge({ children, tone }) {
  const value = String(children).toLowerCase().replaceAll(" ", "-");
  return (
    <span className={`status-badge ${tone || value}`}>{children}</span>
  );
}

export function SearchInput({ placeholder = "Search...", value, onChange }) {
  return (
    <label className="search-input">
      <SearchIcon />
      <input
        type="search"
        placeholder={placeholder}
        value={value}
        onChange={onChange}
      />
    </label>
  );
}

export function SelectFilter({ label, options, value, onChange }) {
  return (
    <label className="filter-select">
      <span>{label}</span>
      <select value={value} onChange={onChange} defaultValue="all">
        <option value="all">All</option>
        {options.map((option) => (
          <option value={option} key={option}>
            {option}
          </option>
        ))}
      </select>
    </label>
  );
}

export function Table({ columns, rows, renderRow, empty = "No records found" }) {
  return (
    <div className="table-wrap">
      <table>
        <thead>
          <tr>
            {columns.map((column) => (
              <th key={column}>{column}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.length ? (
            rows.map(renderRow)
          ) : (
            <tr>
              <td colSpan={columns.length}>
                <EmptyState title={empty} compact />
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}

export function EmptyState({
  title = "Nothing here yet",
  description = "New records will appear here when they are added.",
  compact = false,
}) {
  return (
    <div className={`empty-state ${compact ? "empty-compact" : ""}`}>
      <span className="empty-icon">
        <InboxIcon />
      </span>
      <strong>{title}</strong>
      {!compact && <p>{description}</p>}
    </div>
  );
}

export function Button({ children, variant = "primary", href, type = "button", ...props }) {
  const className = `button button-${variant}`;
  if (href) return <a href={href} className={className}>{children}</a>;
  return (
    <button className={className} type={type} {...props}>
      {children}
    </button>
  );
}

export function Field({ label, type = "text", placeholder, value, defaultValue, className = "", children, ...rest }) {
  return (
    <label className={`form-field ${className}`}>
      <span>{label}</span>
      {children || (
        <input
          type={type}
          placeholder={placeholder}
          defaultValue={defaultValue ?? value}
          {...rest}
        />
      )}
    </label>
  );
}

export function TextAreaField({ label, placeholder, value, rows = 4 }) {
  return (
    <label className="form-field">
      <span>{label}</span>
      <textarea placeholder={placeholder} defaultValue={value} rows={rows} />
    </label>
  );
}

export function ImageUpload() {
  return (
    <div className="upload-box">
      <div className="upload-icon">
        <UploadIcon />
      </div>
      <strong>Drop an image here</strong>
      <span>or browse from your device</span>
      <small>JPG, PNG or WEBP · max 5 MB</small>
    </div>
  );
}

export function Modal({ title, children, onClose }) {
  return (
    <div className="modal-backdrop" role="presentation">
      <section className="modal" role="dialog" aria-modal="true" aria-label={title}>
        <div className="modal-head">
          <h2>{title}</h2>
          <button className="icon-button" onClick={onClose} aria-label="Close">
            <CloseIcon />
          </button>
        </div>
        {children}
      </section>
    </div>
  );
}

export function FilterBar({ children, onSearch }) {
  return (
    <div className="filter-bar">
      <SearchInput placeholder="Search..." onChange={onSearch} />
      {children}
    </div>
  );
}

export function Toggle({ on, onToggle, label }) {
  return (
    <button
      className={`toggle ${on ? "on" : ""}`}
      aria-label={label}
      onClick={onToggle}
      type="button"
    />
  );
}

// ── Toast ─────────────────────────────────────────────────────────────────────
const ToastContext = createContext(() => {});

export function useToast() {
  const context = useContext(ToastContext);
  return context || (() => {});
}

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const showToast = useCallback((message, type = "success") => {
    const id = Date.now() + Math.random();
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3500);
  }, []);

  return (
    <ToastContext.Provider value={showToast}>
      {children}
      {toasts.length > 0 && (
        <div className="toast-container">
          {toasts.map((t) => (
            <div key={t.id} className={`toast ${t.type}`}>
              {t.message}
            </div>
          ))}
        </div>
      )}
    </ToastContext.Provider>
  );
}