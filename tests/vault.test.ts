import { test } from "node:test";
import assert from "node:assert/strict";
import { backupSchema, demoData, progress } from "../src/lib/data";

test("demo workspace is valid and survives a JSON round trip", () => {
  const demo = demoData();
  const parsed = backupSchema.parse(JSON.parse(JSON.stringify(demo)));
  assert.equal(parsed.records.length, 11);
  assert.deepEqual(parsed, demo);
});
test("backup rejects unsafe links, invalid records, duplicate IDs, and unsupported versions", () => {
  const demo = demoData();
  assert.equal(backupSchema.safeParse({ ...demo, version: 2 }).success, false);
  assert.equal(
    backupSchema.safeParse({
      ...demo,
      records: [demo.records[0], demo.records[0]],
    }).success,
    false,
  );
  const bookmark = demo.records.find((r) => r.kind === "bookmark")!;
  for (const url of [
    "javascript:alert(1)",
    "file:///etc/passwd",
    "not-a-url",
  ]) {
    assert.equal(
      backupSchema.safeParse({ ...demo, records: [{ ...bookmark, url }] })
        .success,
      false,
    );
  }
  assert.equal(
    backupSchema.safeParse({
      ...demo,
      records: [{ ...demo.records[0], title: "   " }],
    }).success,
    false,
  );
});
test("progress follows completed tasks and handles empty projects", () => {
  const project = demoData().records.find((r) => r.kind === "project")!;
  if (project.kind !== "project") throw new Error("Missing project");
  assert.equal(progress(project), 60);
  assert.equal(progress({ ...project, tasks: [] }), 0);
  assert.equal(
    progress({
      ...project,
      tasks: project.tasks.map((t) => ({ ...t, done: true })),
    }),
    100,
  );
});

test("store persists CRUD, favorites, tasks, settings and restores backups", async () => {
  const memory = new Map<string, string>();
  Object.defineProperty(globalThis, "localStorage", {
    configurable: true,
    value: {
      getItem: (key: string) => memory.get(key) ?? null,
      setItem: (key: string, value: string) => memory.set(key, value),
    },
  });
  const { useVault } = await import("../src/lib/store");
  useVault.getState().hydrate();
  assert.equal(useVault.getState().ready, true);
  const record = {
    ...demoData().records[0],
    id: "test-record",
    title: "Unique test record",
  };
  useVault.getState().save(record);
  let saved = backupSchema.parse(JSON.parse(memory.get("devvault-v1")!));
  assert.ok(saved.records.some((r) => r.id === record.id));
  assert.equal(saved.activities[0].action, "Created");
  useVault.getState().save({ ...record, title: "Edited record" });
  useVault.getState().favorite(record.id);
  saved = backupSchema.parse(JSON.parse(memory.get("devvault-v1")!));
  assert.equal(
    saved.records.find((r) => r.id === record.id)?.title,
    "Edited record",
  );
  assert.equal(
    saved.records.find((r) => r.id === record.id)?.favorite,
    !record.favorite,
  );
  useVault.getState().settingsUpdate({ theme: "light", compact: true });
  useVault.setState({ ready: false, records: [] });
  useVault.getState().hydrate();
  assert.equal(useVault.getState().settings.theme, "light");
  assert.ok(useVault.getState().records.some((r) => r.id === record.id));
  const project = useVault
    .getState()
    .records.find((r) => r.kind === "project")!;
  if (project.kind === "project") {
    useVault.getState().save({
      ...project,
      tasks: [
        ...project.tasks,
        { id: "new-task", title: "Ship it", done: true },
      ],
    });
    const persisted = backupSchema
      .parse(JSON.parse(memory.get("devvault-v1")!))
      .records.find((r) => r.id === project.id);
    assert.ok(
      persisted?.kind === "project" &&
        persisted.tasks.some((t) => t.id === "new-task" && t.done),
    );
  }
  useVault.getState().remove(record.id);
  assert.equal(
    useVault.getState().records.some((r) => r.id === record.id),
    false,
  );
  assert.throws(() => useVault.getState().importData({ version: 99 }));
  useVault.getState().importData(saved);
  assert.ok(useVault.getState().records.some((r) => r.id === record.id));
  useVault.getState().reset();
  assert.equal(useVault.getState().records.length, 11);
  assert.equal(useVault.getState().settings.theme, "dark");
});

test("corrupt storage is preserved and write errors remain recoverable", async () => {
  const { useVault } = await import("../src/lib/store");
  let raw = "not json";
  Object.defineProperty(globalThis, "localStorage", {
    configurable: true,
    value: {
      getItem: () => raw,
      setItem: () => {
        throw new Error("Quota exceeded");
      },
    },
  });
  useVault.setState({ ready: false });
  useVault.getState().hydrate();
  assert.equal(raw, "not json");
  assert.match(useVault.getState().storageError!, /could not be read/);
  useVault.getState().save({ ...demoData().records[0], id: "recoverable" });
  assert.ok(useVault.getState().records.some((r) => r.id === "recoverable"));
  assert.match(useVault.getState().storageError!, /unavailable or full/);
});
