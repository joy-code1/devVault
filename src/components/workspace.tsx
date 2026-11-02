"use client";
import { useEffect, useState, type ReactNode } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  Code2,
  Bookmark,
  FolderKanban,
  Settings,
  Search,
  Command,
  ChevronDown,
  Plus,
  ArrowUpRight,
  Menu,
  Sun,
  Moon,
  ShieldCheck,
  Layers,
  ChevronRight,
  AlertTriangle,
} from "lucide-react";
import { Toaster } from "sonner";
import { useVault } from "@/lib/store";
import { type VaultRecord } from "@/lib/data";
import { Modal } from "./ui/dialog";
import { Button } from "./ui/button";
import { RecordEditor } from "./record-editor";
import { RecordDetail } from "./record-detail";
import { kindIcons } from "./record-card";
const nav = [
  { href: "/", label: "Overview", icon: LayoutDashboard },
  { href: "/snippets", label: "Snippets", icon: Code2 },
  { href: "/bookmarks", label: "Bookmarks", icon: Bookmark },
  { href: "/projects", label: "Projects", icon: FolderKanban },
];
export function Workspace({ children }: { children: ReactNode }) {
  const path = usePathname();
  const router = useRouter();
  const { ready, hydrate, records, settings, settingsUpdate, storageError } =
    useVault();
  const [searchOpen, setSearchOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [mobile, setMobile] = useState(false);
  const [create, setCreate] = useState<VaultRecord["kind"] | null>(null);
  const [view, setView] = useState<string | null>(null);
  const [edit, setEdit] = useState<VaultRecord | null>(null);
  const [newOpen, setNewOpen] = useState(false);
  useEffect(() => hydrate(), [hydrate]);
  useEffect(() => {
    document.documentElement.dataset.theme = settings.theme;
    document.documentElement.classList.toggle("compact", settings.compact);
  }, [settings]);
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setSearchOpen((v) => !v);
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);
  useEffect(() => setMobile(false), [path]);
  const results = records
    .filter((r) =>
      [
        r.title,
        r.description,
        ...("tags" in r ? r.tags : []),
        ...(r.kind === "snippet"
          ? [r.code, r.language]
          : r.kind === "bookmark"
            ? [r.url, r.category]
            : r.tasks.map((t) => t.title)),
      ]
        .join(" ")
        .toLowerCase()
        .includes(query.toLowerCase()),
    )
    .slice(0, 20);
  return (
    <div className="app-shell">
      <aside className={`sidebar ${mobile ? "sidebar-open" : ""}`}>
        <Link href="/" className="brand">
          <span className="brand-mark">
            <Layers size={21} strokeWidth={2.5} />
          </span>
          devvault<span className="brand-period">.</span>
        </Link>
        <button
          className="workspace-switch"
          onClick={() => router.push("/settings")}
        >
          <span className="workspace-avatar">
            {settings.name.charAt(0).toUpperCase()}
          </span>
          <span>
            <strong>Personal workspace</strong>
            <small>Free plan</small>
          </span>
          <ChevronDown size={14} />
        </button>
        <button
          className="sidebar-search"
          onClick={() => {
            setSearchOpen(true);
            setQuery("");
          }}
        >
          <Search size={15} />
          <span>Search anything…</span>
          <kbd>⌘ K</kbd>
        </button>
        <span className="nav-label">WORKSPACE</span>
        <nav>
          {nav.map(({ href, label, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              className={`nav-link ${path === href ? "active" : ""}`}
            >
              <Icon size={18} />
              <span>{label}</span>
              {href !== "/" && (
                <span className="nav-count">
                  {
                    records.filter(
                      (r) =>
                        r.kind ===
                        (
                          {
                            "/snippets": "snippet",
                            "/bookmarks": "bookmark",
                            "/projects": "project",
                          } as Record<string, string>
                        )[href],
                    ).length
                  }
                </span>
              )}
            </Link>
          ))}
        </nav>
        <div className="sidebar-favorites">
          <div className="nav-label">
            FAVORITES
            <StarTiny />
          </div>
          {records
            .filter((r) => r.favorite)
            .slice(0, 4)
            .map((r) => {
              const Icon = kindIcons[r.kind];
              return (
                <button
                  key={r.id}
                  onClick={() => {
                    setView(r.id);
                    setMobile(false);
                  }}
                >
                  <Icon size={14} />
                  <span>{r.title}</span>
                </button>
              );
            })}
          {!records.some((r) => r.favorite) && (
            <p className="muted">Star items to keep them close.</p>
          )}
        </div>
        <div className="sidebar-bottom">
          <div className="local-note">
            <span className="local-dot" />
            <span>
              {storageError
                ? "Storage needs attention"
                : "All changes saved locally"}
            </span>
            <ShieldCheck size={13} />
          </div>
          <Link
            href="/settings"
            className={`nav-link ${path === "/settings" ? "active" : ""}`}
          >
            <Settings size={18} />
            <span>Settings</span>
          </Link>
          <button className="profile" onClick={() => router.push("/settings")}>
            <span className="profile-avatar">
              {settings.name.charAt(0).toUpperCase()}
            </span>
            <span>
              <strong>{settings.name}</strong>
              <small>Personal account</small>
            </span>
            <ChevronRight size={15} />
          </button>
        </div>
      </aside>
      {mobile && (
        <button
          className="sidebar-backdrop"
          onClick={() => setMobile(false)}
          aria-label="Close navigation"
        />
      )}
      <div className="main-shell">
        <header className="topbar">
          <div className="breadcrumb">
            <Button
              variant="ghost"
              size="icon"
              className="mobile-menu"
              aria-label="Open navigation"
              onClick={() => setMobile(true)}
            >
              <Menu size={20} />
            </Button>
            <span className="breadcrumb-workspace">Workspace</span>
            <span className="slash">/</span>
            <span>
              {path === "/settings"
                ? "Settings"
                : nav.find((n) => n.href === path)?.label || "Overview"}
            </span>
          </div>
          <div className="topbar-right">
            <span className="local-badge">
              <span className="local-dot" /> Local workspace
            </span>
            <Button
              variant="ghost"
              size="icon"
              aria-label={`Switch to ${settings.theme === "dark" ? "light" : "dark"} theme`}
              onClick={() =>
                settingsUpdate({
                  theme: settings.theme === "dark" ? "light" : "dark",
                })
              }
            >
              {settings.theme === "dark" ? (
                <Sun size={17} />
              ) : (
                <Moon size={17} />
              )}
            </Button>
            <button
              className="top-avatar"
              onClick={() => router.push("/settings")}
              aria-label="Open account settings"
            >
              {settings.name.charAt(0).toUpperCase()}
            </button>
          </div>
        </header>
        <main className="main-content">
          {storageError && (
            <div className="storage-alert" role="alert">
              <AlertTriangle size={17} />
              {storageError}
              <Link href="/settings">Open settings</Link>
            </div>
          )}
          {ready ? (
            children
          ) : (
            <div className="loading-state" aria-busy="true">
              <div className="skeleton skeleton-heading" />
              <div className="stat-grid">
                {[0, 1, 2, 3].map((i) => (
                  <div key={i} className="skeleton skeleton-card" />
                ))}
              </div>
              <div className="skeleton skeleton-body" />
              <span className="muted">Opening your vault…</span>
            </div>
          )}
        </main>
        <footer className="app-footer">
          <span>Your ideas. Organized.</span>
          <span>
            Built for the way you work.<span className="footer-dot">✦</span>
          </span>
        </footer>
      </div>
      <Toaster
        theme={settings.theme}
        position="bottom-right"
        richColors
        closeButton
      />
      <Modal
        open={searchOpen}
        onOpenChange={setSearchOpen}
        title="Search your vault"
        description="Find snippets, bookmarks, projects, and tasks."
        wide
      >
        <div className="command-input">
          <Search size={20} />
          <input
            autoFocus
            placeholder="What are you looking for?"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          <kbd>ESC</kbd>
        </div>
        <div className="command-results">
          {results.length === 0 ? (
            <div className="empty-state">
              <Search />
              <h3>No results found</h3>
              <p>Try another keyword or create something new.</p>
            </div>
          ) : (
            results.map((r) => {
              const Icon = kindIcons[r.kind];
              return (
                <button
                  key={r.id}
                  onClick={() => {
                    setSearchOpen(false);
                    setView(r.id);
                  }}
                >
                  <span className="record-icon violet">
                    <Icon size={17} />
                  </span>
                  <span>
                    <strong>{r.title}</strong>
                    <small>
                      {r.kind} · {r.description}
                    </small>
                  </span>
                  <ArrowUpRight size={16} />
                </button>
              );
            })
          )}
        </div>
        <div className="command-footer">
          <span>{results.length} results</span>
          <span>
            <Command size={12} /> K to toggle search
          </span>
        </div>
      </Modal>
      <Modal
        open={newOpen}
        onOpenChange={setNewOpen}
        title="Create something new"
        description="One place for everything you build."
      >
        <div className="create-options">
          {(["snippet", "bookmark", "project"] as const).map((kind) => {
            const Icon = kindIcons[kind];
            return (
              <button
                key={kind}
                onClick={() => {
                  setNewOpen(false);
                  setCreate(kind);
                }}
              >
                <Icon size={23} />
                <span>
                  <strong>New {kind}</strong>
                  <small>
                    {kind === "snippet"
                      ? "Save a useful piece of code"
                      : kind === "bookmark"
                        ? "Keep a resource within reach"
                        : "Turn an idea into a plan"}
                  </small>
                </span>
                <Plus size={18} />
              </button>
            );
          })}
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
    </div>
  );
}
function StarTiny() {
  return <span className="tiny-star">✧</span>;
}
