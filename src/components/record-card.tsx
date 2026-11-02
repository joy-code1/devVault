"use client";
import { useEffect, useState } from "react";
import {
  Star,
  Pencil,
  Trash2,
  Copy,
  ArrowUpRight,
  Code2,
  Folder,
  Link as LinkIcon,
} from "lucide-react";
import Prism from "prismjs";
import "prismjs/components/prism-typescript";
import "prismjs/components/prism-python";
import "prismjs/components/prism-bash";
import "prismjs/components/prism-sql";
import { type VaultRecord, progress } from "@/lib/data";
import { useVault } from "@/lib/store";
import { relativeDate } from "@/lib/utils";
import { Button } from "./ui/button";
import { copyCode } from "./record-editor";
export const kindIcons = {
  snippet: Code2,
  bookmark: LinkIcon,
  project: Folder,
};
export function Code({ code, language }: { code: string; language: string }) {
  const [html, setHtml] = useState("");
  useEffect(() => {
    const key = (
      {
        TypeScript: "typescript",
        JavaScript: "javascript",
        Python: "python",
        CSS: "css",
        HTML: "markup",
        JSON: "javascript",
        Bash: "bash",
        SQL: "sql",
      } as Record<string, string>
    )[language];
    setHtml(
      Prism.highlight(
        code,
        Prism.languages[key] || Prism.languages.plain || {},
        key,
      ),
    );
  }, [code, language]);
  return (
    <pre className="code-block">
      <code>
        {html ? <span dangerouslySetInnerHTML={{ __html: html }} /> : code}
      </code>
    </pre>
  );
}
export function RecordCard({
  record,
  onEdit,
  onDelete,
  onView,
}: {
  record: VaultRecord;
  onEdit: (r: VaultRecord) => void;
  onDelete: (r: VaultRecord) => void;
  onView: (r: VaultRecord) => void;
}) {
  const favorite = useVault((s) => s.favorite);
  const save = useVault((s) => s.save);
  const Icon = kindIcons[record.kind];
  return (
    <article className={`record-card ${record.kind}-card`}>
      <div className="card-top">
        <span
          className={`record-icon ${record.kind === "project" ? record.color : record.kind === "snippet" ? "violet" : "blue"}`}
        >
          <Icon size={18} />
        </span>
        <div className="card-actions">
          <Button
            variant="ghost"
            size="icon"
            aria-label={
              record.favorite ? "Remove from favorites" : "Add to favorites"
            }
            onClick={() => favorite(record.id)}
          >
            <Star size={15} className={record.favorite ? "is-favorite" : ""} />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            aria-label={`Edit ${record.title}`}
            onClick={() => onEdit(record)}
          >
            <Pencil size={14} />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            aria-label={`Delete ${record.title}`}
            onClick={() => onDelete(record)}
          >
            <Trash2 size={14} />
          </Button>
        </div>
      </div>
      <button className="card-title" onClick={() => onView(record)}>
        {record.title}
        {record.kind === "bookmark" && <ArrowUpRight size={15} />}
      </button>
      <p className="card-description">
        {record.description || "No description yet."}
      </p>
      {record.kind === "snippet" && (
        <button
          className="code-preview"
          onClick={() => onView(record)}
          aria-label={`View ${record.title}`}
        >
          <Code code={record.code} language={record.language} />
        </button>
      )}
      {record.kind === "bookmark" && (
        <a
          className="bookmark-url"
          href={record.url}
          target="_blank"
          rel="noopener noreferrer"
        >
          {new URL(record.url).hostname}
          <ArrowUpRight size={13} />
        </a>
      )}
      {record.kind === "project" && (
        <>
          <div className="progress-meta">
            <span>Progress</span>
            <span>{progress(record)}%</span>
          </div>
          <div className={`progress-track ${record.color}`}>
            <span style={{ width: `${progress(record)}%` }} />
          </div>
          <div className="project-task-preview">
            {record.tasks.slice(0, 2).map((t) => (
              <label key={t.id} className={t.done ? "task-done" : ""}>
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
                {t.title}
              </label>
            ))}
          </div>
        </>
      )}
      {"tags" in record && (
        <div className="tags">
          {record.tags.map((t) => (
            <span key={t}>#{t}</span>
          ))}
        </div>
      )}
      <div className="card-bottom">
        <span>
          {record.kind === "snippet" ? (
            <>
              <span
                className={`language-dot ${record.language.toLowerCase()}`}
              />
              {record.language}
            </>
          ) : record.kind === "bookmark" ? (
            record.category
          ) : (
            <>
              <span
                className={`status-dot ${record.status === "Completed" ? "green" : record.status === "In progress" ? "violet" : ""}`}
              />
              {record.status}
            </>
          )}
        </span>
        {record.kind === "snippet" ? (
          <Button
            size="icon"
            variant="ghost"
            aria-label="Copy code"
            onClick={() => copyCode(record.code)}
          >
            <Copy size={14} />
          </Button>
        ) : (
          <span>
            {record.kind === "project"
              ? `${record.tasks.filter((t) => t.done).length}/${record.tasks.length} tasks`
              : relativeDate(record.updatedAt)}
          </span>
        )}
      </div>
    </article>
  );
}
