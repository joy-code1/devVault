"use client";
import { useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import {
  languages,
  recordSchema,
  type VaultRecord,
  type Project,
} from "@/lib/data";
import { useVault } from "@/lib/store";
import { Button } from "./ui/button";
import { Modal } from "./ui/dialog";
export function RecordEditor({
  kind,
  record,
  onClose,
}: {
  kind: VaultRecord["kind"];
  record?: VaultRecord;
  onClose: () => void;
}) {
  const save = useVault((s) => s.save);
  const [title, setTitle] = useState(record?.title || "");
  const [description, setDescription] = useState(record?.description || "");
  const [tags, setTags] = useState(
    record && "tags" in record ? record.tags.join(", ") : "",
  );
  const [language, setLanguage] = useState(
    record?.kind === "snippet" ? record.language : "TypeScript",
  );
  const [code, setCode] = useState(
    record?.kind === "snippet" ? record.code : "",
  );
  const [url, setUrl] = useState(record?.kind === "bookmark" ? record.url : "");
  const [category, setCategory] = useState(
    record?.kind === "bookmark" ? record.category : "Resources",
  );
  const [status, setStatus] = useState<Project["status"]>(
    record?.kind === "project" ? record.status : "Planned",
  );
  const [color, setColor] = useState<Project["color"]>(
    record?.kind === "project" ? record.color : "violet",
  );
  const [tasks, setTasks] = useState(
    record?.kind === "project" ? record.tasks : [],
  );
  const [task, setTask] = useState("");
  const [error, setError] = useState("");
  function addTask() {
    if (!task.trim()) return;
    setTasks([
      ...tasks,
      { id: crypto.randomUUID(), title: task.trim(), done: false },
    ]);
    setTask("");
  }
  function submit(e: React.FormEvent) {
    e.preventDefault();
    const base = {
      id: record?.id || crypto.randomUUID(),
      title,
      description,
      favorite: record?.favorite || false,
      createdAt: record?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    const list = [
      ...new Set(
        tags
          .split(",")
          .map((t) => t.trim())
          .filter(Boolean),
      ),
    ];
    const parsed = recordSchema.safeParse(
      kind === "snippet"
        ? { ...base, kind, language, code, tags: list }
        : kind === "bookmark"
          ? { ...base, kind, url, category, tags: list }
          : {
              ...base,
              kind,
              status,
              color,
              tasks: task.trim()
                ? [
                    ...tasks,
                    {
                      id: crypto.randomUUID(),
                      title: task.trim(),
                      done: false,
                    },
                  ]
                : tasks,
            },
    );
    if (!parsed.success) {
      setError(parsed.error.issues[0].message);
      return;
    }
    save(parsed.data);
    onClose();
  }
  return (
    <Modal
      open
      onOpenChange={(v) => !v && onClose()}
      title={`${record ? "Edit" : "New"} ${kind}`}
      description={`Give your ${kind} a home in your vault.`}
      wide={kind === "snippet"}
    >
      <form onSubmit={submit} className="editor-form">
        <label>
          Title
          <input
            autoFocus
            required
            maxLength={120}
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder={
              kind === "snippet"
                ? "e.g. Fetch with retry"
                : kind === "bookmark"
                  ? "e.g. React documentation"
                  : "e.g. Portfolio website"
            }
          />
        </label>
        <label>
          Description
          <textarea
            rows={2}
            maxLength={1000}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="A little context for your future self…"
          />
        </label>
        {kind === "snippet" && (
          <>
            <label>
              Language
              <select
                value={language}
                onChange={(e) => setLanguage(e.target.value as typeof language)}
              >
                {languages.map((l) => (
                  <option key={l}>{l}</option>
                ))}
              </select>
            </label>
            <label>
              Code
              <textarea
                className="code-input"
                required
                rows={12}
                spellCheck={false}
                value={code}
                onChange={(e) => setCode(e.target.value)}
                placeholder="// Your next great idea starts here"
              />
            </label>
          </>
        )}
        {kind === "bookmark" && (
          <>
            <label>
              URL
              <input
                type="url"
                required
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="https://example.com"
              />
            </label>
            <label>
              Category
              <input
                required
                maxLength={50}
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                list="categories"
              />
            </label>
            <datalist id="categories">
              <option>Resources</option>
              <option>Documentation</option>
              <option>Design</option>
              <option>Tools</option>
              <option>Learning</option>
            </datalist>
          </>
        )}
        {kind !== "project" && (
          <label>
            Tags <span className="muted">(comma separated)</span>
            <input
              value={tags}
              onChange={(e) => setTags(e.target.value)}
              placeholder="react, utilities, inspiration"
            />
          </label>
        )}
        {kind === "project" && (
          <>
            <div className="form-row">
              <label>
                Status
                <select
                  value={status}
                  onChange={(e) =>
                    setStatus(e.target.value as Project["status"])
                  }
                >
                  <option>Planned</option>
                  <option>In progress</option>
                  <option>Completed</option>
                </select>
              </label>
              <label>
                Color
                <select
                  value={color}
                  onChange={(e) => setColor(e.target.value as Project["color"])}
                >
                  <option value="violet">Violet</option>
                  <option value="blue">Blue</option>
                  <option value="green">Green</option>
                  <option value="amber">Amber</option>
                </select>
              </label>
            </div>
            <label>Tasks</label>
            <div className="task-editor">
              {tasks.map((t) => (
                <div className="task-line" key={t.id}>
                  <input
                    type="checkbox"
                    checked={t.done}
                    onChange={() =>
                      setTasks(
                        tasks.map((x) =>
                          x.id === t.id ? { ...x, done: !x.done } : x,
                        ),
                      )
                    }
                  />
                  <input
                    aria-label="Task title"
                    maxLength={200}
                    required
                    value={t.title}
                    onChange={(e) =>
                      setTasks(
                        tasks.map((x) =>
                          x.id === t.id ? { ...x, title: e.target.value } : x,
                        ),
                      )
                    }
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    aria-label="Remove task"
                    onClick={() => setTasks(tasks.filter((x) => x.id !== t.id))}
                  >
                    <Trash2 size={15} />
                  </Button>
                </div>
              ))}
              <div className="inline-input">
                <input
                  value={task}
                  maxLength={200}
                  onChange={(e) => setTask(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      addTask();
                    }
                  }}
                  placeholder="Add a task…"
                />
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  aria-label="Add task"
                  onClick={addTask}
                >
                  <Plus size={16} />
                </Button>
              </div>
            </div>
          </>
        )}
        {error && (
          <p role="alert" className="error-text">
            {error}
          </p>
        )}
        <div className="modal-footer">
          <Button type="button" variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit">
            {record ? "Save changes" : `Create ${kind}`}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
export function DeleteDialog({
  record,
  onClose,
}: {
  record: VaultRecord;
  onClose: () => void;
}) {
  const remove = useVault((s) => s.remove);
  return (
    <Modal
      open
      onOpenChange={(v) => !v && onClose()}
      title={`Delete ${record.kind}?`}
      description={`“${record.title}” will be permanently removed from this browser.`}
    >
      <div className="modal-footer">
        <Button variant="outline" onClick={onClose}>
          Cancel
        </Button>
        <Button
          variant="destructive"
          onClick={() => {
            remove(record.id);
            onClose();
          }}
        >
          Delete {record.kind}
        </Button>
      </div>
    </Modal>
  );
}
export async function copyCode(code: string) {
  try {
    await navigator.clipboard.writeText(code);
    toast.success("Code copied to clipboard");
  } catch {
    toast.error(
      "Clipboard is unavailable. Select the code and copy it manually.",
    );
  }
}
