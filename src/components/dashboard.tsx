"use client";
import { useState } from "react";
import Link from "next/link";
import {
  Plus,
  ArrowUpRight,
  ArrowRight,
  Code2,
  Bookmark,
  FolderKanban,
  CheckCircle2,
  Activity,
  Sparkles,
  ChevronRight,
  Layers,
  Terminal,
} from "lucide-react";
import { useVault } from "@/lib/store";
import { type VaultRecord, type Project, progress } from "@/lib/data";
import { relativeDate } from "@/lib/utils";
import { Button } from "./ui/button";
import { RecordEditor, DeleteDialog } from "./record-editor";
import { RecordDetail } from "./record-detail";
import { RecordCard, kindIcons } from "./record-card";
import { Modal } from "./ui/dialog";
export function Dashboard() {
  const { records, activities, settings } = useVault();
  const [create, setCreate] = useState<VaultRecord["kind"] | null>(null);
  const [newOpen, setNewOpen] = useState(false);
  const [edit, setEdit] = useState<VaultRecord | null>(null);
  const [view, setView] = useState<string | null>(null);
  const [deleting, setDeleting] = useState<VaultRecord | null>(null);
  const [activityOpen, setActivityOpen] = useState(false);
  const snippets = records.filter((r) => r.kind === "snippet");
  const bookmarks = records.filter((r) => r.kind === "bookmark");
  const projects = records.filter((r): r is Project => r.kind === "project");
  const tasks = projects.flatMap((p) => p.tasks);
  const completed = tasks.filter((t) => t.done).length;
  const stats = [
    {
      title: "Total snippets",
      value: snippets.length,
      icon: Code2,
      color: "violet",
      note: `${new Set(snippets.map((s) => (s.kind === "snippet" ? s.language : ""))).size} languages in your library`,
      href: "/snippets",
    },
    {
      title: "Saved bookmarks",
      value: bookmarks.length,
      icon: Bookmark,
      color: "blue",
      note: "Your corner of the internet",
      href: "/bookmarks",
    },
    {
      title: "Active projects",
      value: projects.filter((p) => p.status === "In progress").length,
      icon: FolderKanban,
      color: "amber",
      note: `${projects.length} projects in your workspace`,
      href: "/projects",
    },
    {
      title: "Tasks completed",
      value: completed,
      icon: CheckCircle2,
      color: "green",
      note: `${tasks.length ? Math.round((completed / tasks.length) * 100) : 0}% of all tasks completed`,
      href: "/projects",
    },
  ];
  const recent = [...records]
    .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt))
    .filter((r) => r.kind === "snippet")
    .slice(0, 2);
  return (
    <>
      <div className="page-heading dashboard-heading">
        <div>
          <div className="eyebrow">
            <span className="local-dot" /> A LITTLE MORE ORGANIZED. A LOT MORE
            FOCUSED.
          </div>
          <h1>
            Welcome back, {settings.name}
            <Sparkles className="wave" size={26} aria-hidden="true" />
          </h1>
          <p>Here’s what’s happening in your developer workspace.</p>
        </div>
        <Button onClick={() => setNewOpen(true)}>
          <Plus size={16} />
          Create new
          <ChevronRight size={14} />
        </Button>
      </div>
      <div className="stat-grid">
        {stats.map(({ title, value, icon: Icon, color, note, href }) => (
          <Link href={href} className="stat-card" key={title}>
            <div className="stat-top">
              <span>{title}</span>
              <span className={`stat-icon ${color}`}>
                <Icon size={17} />
              </span>
            </div>
            <div className="stat-value">
              {value}
              <ArrowUpRight size={17} />
            </div>
            <p>
              <span className={`mini-dot ${color}`} />
              {note}
            </p>
          </Link>
        ))}
      </div>
      <section className="quick-access panel">
        <div className="quick-intro">
          <span className="quick-icon">
            <Sparkles size={20} />
          </span>
          <div>
            <h3>A place for your next idea.</h3>
            <p>Capture it now. Find it when it matters.</p>
          </div>
        </div>
        <div className="quick-buttons">
          <Button variant="outline" onClick={() => setCreate("snippet")}>
            <Code2 size={15} />
            New snippet
            <Plus size={13} />
          </Button>
          <Button variant="outline" onClick={() => setCreate("bookmark")}>
            <Bookmark size={15} />
            Add bookmark
            <Plus size={13} />
          </Button>
          <Button variant="outline" onClick={() => setCreate("project")}>
            <FolderKanban size={15} />
            New project
            <Plus size={13} />
          </Button>
        </div>
      </section>
      <div className="dashboard-columns">
        <div className="dashboard-left">
          <section>
            <div className="section-heading">
              <h2>
                <Code2 size={18} />
                Recent snippets
                <span className="subtle-count">{snippets.length}</span>
              </h2>
              <Link href="/snippets">
                View all
                <ArrowRight size={14} />
              </Link>
            </div>
            <div className="recent-snippets">
              {recent.map((r) => (
                <RecordCard
                  key={r.id}
                  record={r}
                  onEdit={setEdit}
                  onDelete={setDeleting}
                  onView={(r) => setView(r.id)}
                />
              ))}
              {recent.length === 0 && (
                <div className="empty-state panel">
                  <Code2 />
                  <h3>Start your code collection</h3>
                  <p>Keep your most useful snippets close.</p>
                  <Button onClick={() => setCreate("snippet")}>
                    New snippet
                  </Button>
                </div>
              )}
            </div>
          </section>
          <section className="projects-section">
            <div className="section-heading">
              <h2>
                <FolderKanban size={18} />
                Your projects
              </h2>
              <Link href="/projects">
                View all
                <ArrowRight size={14} />
              </Link>
            </div>
            <div className="project-list panel">
              {projects.slice(0, 3).map((p) => (
                <button
                  key={p.id}
                  className="project-row"
                  onClick={() => setView(p.id)}
                >
                  <span className={`project-logo ${p.color}`}>
                    {p.title === "DevVault" ? (
                      <Layers size={21} />
                    ) : p.title === "CLI toolkit" ? (
                      <Terminal size={21} />
                    ) : (
                      <Code2 size={21} />
                    )}
                  </span>
                  <span className="project-row-title">
                    <strong>{p.title}</strong>
                    <small>
                      {p.tasks.filter((t) => t.done).length} of {p.tasks.length}{" "}
                      tasks completed
                    </small>
                  </span>
                  <span
                    className={`badge status-badge ${p.status === "In progress" ? "violet" : p.status === "Completed" ? "green" : ""}`}
                  >
                    <span className="status-dot" />
                    {p.status}
                  </span>
                  <span className="project-row-progress">
                    <span className={`progress-track ${p.color}`}>
                      <span style={{ width: `${progress(p)}%` }} />
                    </span>
                    <small>{progress(p)}%</small>
                  </span>
                  <ChevronRight size={15} />
                </button>
              ))}
              {projects.length === 0 && (
                <div className="empty-state">
                  <FolderKanban />
                  <h3>Big ideas start small</h3>
                  <Button onClick={() => setCreate("project")}>
                    New project
                  </Button>
                </div>
              )}
            </div>
          </section>
        </div>
        <div className="dashboard-right">
          <section>
            <div className="section-heading">
              <h2>
                <Activity size={18} />
                Recent activity
              </h2>
              <button
                className="text-button"
                onClick={() => setActivityOpen(true)}
              >
                View all
                <ArrowRight size={14} />
              </button>
            </div>
            <div className="activity-panel panel">
              <div className="activity-date">LATEST IN YOUR WORKSPACE</div>
              {activities.slice(0, 5).map((a) => {
                const Icon = kindIcons[a.kind];
                return (
                  <div className="activity-item" key={a.id}>
                    <span
                      className={`activity-icon ${a.kind === "snippet" ? "violet" : a.kind === "bookmark" ? "blue" : "amber"}`}
                    >
                      <Icon size={14} />
                    </span>
                    <div>
                      <p>
                        {a.action} {a.kind}
                      </p>
                      <button
                        onClick={() => {
                          const r = records.find(
                            (r) => r.title === a.title && r.kind === a.kind,
                          );
                          if (r) setView(r.id);
                          else setActivityOpen(true);
                        }}
                      >
                        {a.title}
                      </button>
                      <small>{relativeDate(a.date)}</small>
                    </div>
                  </div>
                );
              })}
              {activities.length === 0 && (
                <p className="muted">Your workspace story starts here.</p>
              )}
              <div className="activity-end">
                <span className="local-dot" /> All caught up. Keep building.
              </div>
            </div>
          </section>
          <section className="bookmarks-section">
            <div className="section-heading">
              <h2>
                <Bookmark size={18} />
                On your radar
              </h2>
              <Link href="/bookmarks" aria-label="View all bookmarks">
                <ArrowUpRight size={17} />
              </Link>
            </div>
            <div className="radar-list panel">
              {bookmarks.slice(0, 3).map(
                (b, i) =>
                  b.kind === "bookmark" && (
                    <a
                      key={b.id}
                      href={b.url}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <span className={`site-logo site-${i}`}>
                        {b.title === "shadcn/ui"
                          ? "∕"
                          : b.title.startsWith("Next")
                            ? "N"
                            : "⌘"}
                      </span>
                      <span>
                        <strong>{b.title}</strong>
                        <small>{new URL(b.url).hostname}</small>
                      </span>
                      <ArrowUpRight size={15} />
                    </a>
                  ),
              )}
              {bookmarks.length === 0 && (
                <div className="empty-state">
                  <Bookmark />
                  <p>Save a resource for later.</p>
                  <Button onClick={() => setCreate("bookmark")}>
                    Add bookmark
                  </Button>
                </div>
              )}
            </div>
          </section>
          <div className="keyboard-tip">
            <span className="tip-icon">⌘</span>
            <div>
              <strong>Less clicking. More creating.</strong>
              <p>
                Press <kbd>⌘</kbd> <kbd>K</kbd> or <kbd>Ctrl K</kbd> to find
                anything.
              </p>
            </div>
          </div>
        </div>
      </div>
      <Modal
        open={newOpen}
        onOpenChange={setNewOpen}
        title="Create something new"
        description="Capture an idea, a resource, or your next project."
      >
        <div className="create-options">
          {(["snippet", "bookmark", "project"] as const).map((k) => {
            const Icon = kindIcons[k];
            return (
              <button
                key={k}
                onClick={() => {
                  setNewOpen(false);
                  setCreate(k);
                }}
              >
                <Icon size={22} />
                <span>
                  <strong>New {k}</strong>
                  <small>
                    {k === "snippet"
                      ? "A useful piece of code"
                      : k === "bookmark"
                        ? "A link worth keeping"
                        : "Something worth building"}
                  </small>
                </span>
                <Plus size={18} />
              </button>
            );
          })}
        </div>
      </Modal>
      <Modal
        open={activityOpen}
        onOpenChange={setActivityOpen}
        title="Workspace activity"
        description="Your latest 100 changes, saved locally."
      >
        <div className="full-activity">
          {activities.length ? (
            activities.map((a) => (
              <div key={a.id}>
                <span className="badge">{a.action}</span>
                <strong>{a.title}</strong>
                <small>{relativeDate(a.date)}</small>
              </div>
            ))
          ) : (
            <p className="muted">No activity yet.</p>
          )}
        </div>
      </Modal>
      {create && <RecordEditor kind={create} onClose={() => setCreate(null)} />}{" "}
      {edit && (
        <RecordEditor
          key={edit.id}
          kind={edit.kind}
          record={edit}
          onClose={() => setEdit(null)}
        />
      )}{" "}
      {deleting && (
        <DeleteDialog record={deleting} onClose={() => setDeleting(null)} />
      )}{" "}
      {view && (
        <RecordDetail
          id={view}
          onClose={() => setView(null)}
          onEdit={(r) => {
            setView(null);
            setEdit(r);
          }}
        />
      )}
    </>
  );
}
