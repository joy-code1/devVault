"use client";
import { useState } from "react";
import { Plus, Search, Grid2X2, List, Star } from "lucide-react";
import { type VaultRecord } from "@/lib/data";
import { useVault } from "@/lib/store";
import { relativeDate } from "@/lib/utils";
import { Button } from "./ui/button";
import { RecordEditor, DeleteDialog } from "./record-editor";
import { RecordCard, kindIcons } from "./record-card";
import { RecordDetail } from "./record-detail";
const content = {
  snippet: {
    title: "Snippets",
    description:
      "Good code deserves to be kept. Your personal snippet library.",
    filter: "All languages",
  },
  bookmark: {
    title: "Bookmarks",
    description: "A little less searching. A lot more building.",
    filter: "All categories",
  },
  project: {
    title: "Projects",
    description:
      "From the first spark to the final commit. Make progress here.",
    filter: "All statuses",
  },
};
export function Library({ kind }: { kind: VaultRecord["kind"] }) {
  const records = useVault((s) => s.records).filter((r) => r.kind === kind);
  const favorite = useVault((s) => s.favorite);
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState("all");
  const [tab, setTab] = useState("all");
  const [sort, setSort] = useState("recent");
  const [layout, setLayout] = useState("grid");
  const [editing, setEditing] = useState<VaultRecord | undefined>();
  const [creating, setCreating] = useState(false);
  const [deleting, setDeleting] = useState<VaultRecord | null>(null);
  const [view, setView] = useState<string | null>(null);
  const options = [
    ...new Set(
      records.map((r) =>
        r.kind === "snippet"
          ? r.language
          : r.kind === "bookmark"
            ? r.category
            : r.status,
      ),
    ),
  ];
  const visible = records
    .filter(
      (r) =>
        (tab !== "favorites" || r.favorite) &&
        (filter === "all" ||
          (r.kind === "snippet"
            ? r.language
            : r.kind === "bookmark"
              ? r.category
              : r.status) === filter) &&
        [
          r.title,
          r.description,
          ...("tags" in r ? r.tags : []),
          ...(r.kind === "snippet"
            ? [r.code]
            : r.kind === "bookmark"
              ? [r.url]
              : r.tasks.map((t) => t.title)),
        ]
          .join(" ")
          .toLowerCase()
          .includes(query.toLowerCase()),
    )
    .sort((a, b) =>
      sort === "name"
        ? a.title.localeCompare(b.title)
        : sort === "oldest"
          ? a.createdAt.localeCompare(b.createdAt)
          : b.updatedAt.localeCompare(a.updatedAt),
    );
  const info = content[kind];
  const Icon = kindIcons[kind];
  return (
    <>
      <div className="page-heading">
        <div>
          <div className="eyebrow">YOUR WORKSPACE, ORGANIZED</div>
          <h1>
            {info.title}
            <span className="heading-count">{records.length}</span>
          </h1>
          <p>{info.description}</p>
        </div>
        <Button onClick={() => setCreating(true)}>
          <Plus size={16} />
          New {kind}
        </Button>
      </div>
      <div className="library-tabs">
        <button
          className={tab === "all" ? "selected" : ""}
          onClick={() => setTab("all")}
        >
          All {info.title.toLowerCase()}
          <span>{records.length}</span>
        </button>
        <button
          className={tab === "favorites" ? "selected" : ""}
          onClick={() => setTab("favorites")}
        >
          <Star size={14} />
          Favorites<span>{records.filter((r) => r.favorite).length}</span>
        </button>
      </div>
      <div className="library-toolbar">
        <div className="filter-search">
          <Search size={16} />
          <input
            aria-label={`Search ${info.title}`}
            placeholder={`Search ${info.title.toLowerCase()}…`}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>
        <select
          aria-label={info.filter}
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
        >
          <option value="all">{info.filter}</option>
          {options.map((o) => (
            <option key={o}>{o}</option>
          ))}
        </select>
        <select
          aria-label="Sort records"
          value={sort}
          onChange={(e) => setSort(e.target.value)}
        >
          <option value="recent">Last updated</option>
          <option value="name">Name A–Z</option>
          <option value="oldest">Oldest first</option>
        </select>
        <div className="layout-toggle">
          <Button
            size="icon"
            variant="ghost"
            className={layout === "grid" ? "selected" : ""}
            aria-label="Grid view"
            aria-pressed={layout === "grid"}
            onClick={() => setLayout("grid")}
          >
            <Grid2X2 size={16} />
          </Button>
          <Button
            size="icon"
            variant="ghost"
            className={layout === "list" ? "selected" : ""}
            aria-label="List view"
            aria-pressed={layout === "list"}
            onClick={() => setLayout("list")}
          >
            <List size={17} />
          </Button>
        </div>
      </div>
      <div className="results-caption">
        {visible.length} {kind}
        {visible.length === 1 ? "" : "s"}
        <span>Everything you need, right where you left it.</span>
      </div>
      {!visible.length ? (
        <div className="empty-state panel">
          <Icon size={34} />
          <h3>
            {records.length
              ? "No matches this time"
              : `Your first ${kind} starts here`}
          </h3>
          <p>
            {records.length
              ? "Try a different search or filter."
              : `Add a ${kind} and start making this space yours.`}
          </p>
          <Button
            onClick={() => {
              if (records.length) {
                setQuery("");
                setFilter("all");
                setTab("all");
              } else setCreating(true);
            }}
          >
            {records.length ? "Clear filters" : `Create ${kind}`}
          </Button>
        </div>
      ) : layout === "grid" ? (
        <div className="record-grid">
          {visible.map((r) => (
            <RecordCard
              key={r.id}
              record={r}
              onEdit={setEditing}
              onDelete={setDeleting}
              onView={(r) => setView(r.id)}
            />
          ))}
        </div>
      ) : (
        <div className="table-panel">
          <table>
            <thead>
              <tr>
                <th>Name</th>
                <th>
                  {kind === "snippet"
                    ? "Language"
                    : kind === "bookmark"
                      ? "Category"
                      : "Status"}
                </th>
                <th>Updated</th>
                <th>
                  <span className="sr-only">Actions</span>
                </th>
              </tr>
            </thead>
            <tbody>
              {visible.map((r) => (
                <tr key={r.id}>
                  <td>
                    <button
                      className="table-title"
                      onClick={() => setView(r.id)}
                    >
                      <span className="record-icon violet">
                        <Icon size={16} />
                      </span>
                      {r.title}
                    </button>
                  </td>
                  <td>
                    <span className="badge">
                      {r.kind === "snippet"
                        ? r.language
                        : r.kind === "bookmark"
                          ? r.category
                          : r.status}
                    </span>
                  </td>
                  <td className="muted">{relativeDate(r.updatedAt)}</td>
                  <td>
                    <div className="table-actions">
                      <Button
                        size="icon"
                        variant="ghost"
                        aria-label="Toggle favorite"
                        onClick={() => favorite(r.id)}
                      >
                        <Star
                          size={14}
                          className={r.favorite ? "is-favorite" : ""}
                        />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setEditing(r)}
                      >
                        Edit
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setDeleting(r)}
                      >
                        Delete
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      {(creating || editing) && (
        <RecordEditor
          key={editing?.id || "new"}
          kind={kind}
          record={editing}
          onClose={() => {
            setCreating(false);
            setEditing(undefined);
          }}
        />
      )}
      {deleting && (
        <DeleteDialog record={deleting} onClose={() => setDeleting(null)} />
      )}{" "}
      {view && (
        <RecordDetail
          id={view}
          onClose={() => setView(null)}
          onEdit={(r) => {
            setView(null);
            setEditing(r);
          }}
        />
      )}
    </>
  );
}
