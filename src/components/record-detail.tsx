"use client";
import { Copy, ExternalLink, Plus, Trash2 } from "lucide-react";
import { useState } from "react";
import { type VaultRecord, progress } from "@/lib/data";
import { useVault } from "@/lib/store";
import { Button } from "./ui/button";
import { Modal } from "./ui/dialog";
import { Code } from "./record-card";
import { copyCode } from "./record-editor";
export function RecordDetail({
  id,
  onClose,
  onEdit,
}: {
  id: string;
  onClose: () => void;
  onEdit: (r: VaultRecord) => void;
}) {
  const record = useVault((s) => s.records.find((r) => r.id === id));
  const save = useVault((s) => s.save);
  const [task, setTask] = useState("");
  if (!record) return null;
  return (
    <Modal
      open
      onOpenChange={(v) => !v && onClose()}
      title={record.title}
      description={record.description || `Your ${record.kind} details.`}
      wide={record.kind === "snippet"}
    >
      {record.kind === "snippet" && (
        <>
          <div className="detail-toolbar">
            <span className="badge">{record.language}</span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => copyCode(record.code)}
            >
              <Copy size={14} />
              Copy code
            </Button>
          </div>
          <div className="detail-code">
            <Code code={record.code} language={record.language} />
          </div>
        </>
      )}
      {record.kind === "bookmark" && (
        <div className="bookmark-detail">
          <p className="muted">{record.url}</p>
          <Button asChild>
            <a href={record.url} target="_blank" rel="noopener noreferrer">
              Open website
              <ExternalLink size={15} />
            </a>
          </Button>
        </div>
      )}
      {record.kind === "project" && (
        <>
          <div className="progress-meta">
            <span>{record.status}</span>
            <span>{progress(record)}% complete</span>
          </div>
          <div className={`progress-track ${record.color}`}>
            <span style={{ width: `${progress(record)}%` }} />
          </div>
          <div className="detail-tasks">
            {record.tasks.length === 0 && (
              <p className="muted">
                Break your project into a few small steps.
              </p>
            )}
            {record.tasks.map((t) => (
              <div className="task-line" key={t.id}>
                <input
                  type="checkbox"
                  checked={t.done}
                  onChange={() =>
                    save({
                      ...record,
                      updatedAt: new Date().toISOString(),
                      tasks: record.tasks.map((x) =>
                        x.id === t.id ? { ...x, done: !x.done } : x,
                      ),
                    })
                  }
                />
                <span className={t.done ? "task-done" : ""}>{t.title}</span>
                <Button
                  variant="ghost"
                  size="icon"
                  aria-label="Delete task"
                  onClick={() =>
                    save({
                      ...record,
                      updatedAt: new Date().toISOString(),
                      tasks: record.tasks.filter((x) => x.id !== t.id),
                    })
                  }
                >
                  <Trash2 size={14} />
                </Button>
              </div>
            ))}
          </div>
          <form
            className="inline-input"
            onSubmit={(e) => {
              e.preventDefault();
              if (!task.trim()) return;
              save({
                ...record,
                updatedAt: new Date().toISOString(),
                tasks: [
                  ...record.tasks,
                  { id: crypto.randomUUID(), title: task.trim(), done: false },
                ],
              });
              setTask("");
            }}
          >
            <input
              aria-label="New task"
              maxLength={200}
              placeholder="Add a new task…"
              value={task}
              onChange={(e) => setTask(e.target.value)}
            />
            <Button type="submit" size="icon" aria-label="Add task">
              <Plus size={16} />
            </Button>
          </form>
        </>
      )}
      {"tags" in record && (
        <div className="tags detail-tags">
          {record.tags.map((t) => (
            <span key={t}>#{t}</span>
          ))}
        </div>
      )}
      <div className="modal-footer">
        <Button variant="outline" onClick={onClose}>
          Close
        </Button>
        <Button onClick={() => onEdit(record)}>Edit {record.kind}</Button>
      </div>
    </Modal>
  );
}
