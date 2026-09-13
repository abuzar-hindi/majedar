"use client";

import { useState } from "react";
import { messages } from "@/lib/mock-data";
import { Modal, PageHeader, StatusBadge, Table } from "@/components/ui";

const TYPE_COLORS = {
  "Order help": "preparing",
  "Feedback": "confirmed",
  "Complaint": "cancelled",
};

export default function MessagesPage() {
  const [selected, setSelected] = useState(null);

  return (
    <>
      <PageHeader
        eyebrow="Operations"
        title="Messages"
        description="Help requests, complaints and contact messages from customers."
      />
      <div className="filter-bar">
        <label className="search-input">
          <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
          <input type="search" placeholder="Search messages..." />
        </label>
        <label className="filter-select">
          <span>Status</span>
          <select defaultValue="all">
            <option value="all">All</option>
            {["New","Read","Resolved"].map((s) => <option key={s} value={s}>{s}</option>)}
          </select>
        </label>
      </div>
      <section className="surface data-surface">
        <Table
          columns={["Name", "Contact", "Type", "Message", "Date", "Status", ""]}
          rows={messages}
          renderRow={(msg) => (
            <tr key={msg.id}>
              <td><strong>{msg.name}</strong></td>
              <td className="muted">{msg.contact}</td>
              <td><StatusBadge tone={TYPE_COLORS[msg.type] || "read"}>{msg.type}</StatusBadge></td>
              <td className="muted" style={{ maxWidth: 220, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{msg.preview}</td>
              <td className="muted">{msg.date}</td>
              <td><StatusBadge>{msg.status}</StatusBadge></td>
              <td>
                <button className="row-action" onClick={() => setSelected(msg)}>View</button>
              </td>
            </tr>
          )}
        />
      </section>

      {selected && (
        <Modal title={`Message from ${selected.name}`} onClose={() => setSelected(null)}>
          <div style={{ marginBottom: 16 }}>
            <div style={{ display: "flex", gap: 10, marginBottom: 12, flexWrap: "wrap" }}>
              <StatusBadge>{selected.status}</StatusBadge>
              <StatusBadge tone={TYPE_COLORS[selected.type] || "read"}>{selected.type}</StatusBadge>
            </div>
            <div style={{ display: "grid", gap: 10, marginBottom: 16 }}>
              <div>
                <span className="detail-label">From</span>
                <span className="detail-value">{selected.name}</span>
              </div>
              <div>
                <span className="detail-label">Contact</span>
                <span className="detail-value">{selected.contact}</span>
              </div>
              <div>
                <span className="detail-label">Received</span>
                <span className="detail-value">{selected.date}</span>
              </div>
            </div>
            <p style={{ background: "var(--cream)", border: "1px solid var(--line)", fontSize: "12.5px", lineHeight: 1.7, padding: "14px 16px" }}>
              {selected.full}
            </p>
          </div>
          <div style={{ display: "flex", gap: 10, justifyContent: "flex-end", paddingTop: 14, borderTop: "1px solid var(--line-soft)" }}>
            <button className="button button-secondary" onClick={() => setSelected(null)}>Close</button>
            <button className="button button-primary" onClick={() => setSelected(null)}>Mark as Resolved</button>
          </div>
        </Modal>
      )}
    </>
  );
}