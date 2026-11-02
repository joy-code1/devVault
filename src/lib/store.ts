"use client";
import { create } from "zustand";
import { toast } from "sonner";
import { backupSchema, demoData, type Backup, type VaultRecord } from "./data";
const KEY = "devvault-v1";
interface Store extends Backup {
  ready: boolean;
  storageError: string | null;
  hydrate: () => void;
  save: (record: VaultRecord) => void;
  remove: (id: string) => void;
  favorite: (id: string) => void;
  settingsUpdate: (settings: Partial<Backup["settings"]>) => void;
  importData: (input: unknown) => void;
  reset: () => void;
}
function persist(data: Backup) {
  try {
    localStorage.setItem(
      KEY,
      JSON.stringify({
        version: 1,
        records: data.records,
        activities: data.activities,
        settings: data.settings,
      }),
    );
    return null;
  } catch {
    toast.error(
      "Could not save locally. Export a backup to keep your changes.",
    );
    return "Browser storage is unavailable or full. Export a backup to preserve your changes.";
  }
}
export const useVault = create<Store>((set, get) => ({
  ...demoData(),
  ready: false,
  storageError: null,
  hydrate: () => {
    if (get().ready) return;
    try {
      const raw = localStorage.getItem(KEY);
      const data = raw ? backupSchema.parse(JSON.parse(raw)) : demoData();
      set({ ...data, ready: true, storageError: raw ? null : persist(data) });
    } catch {
      set({
        ...demoData(),
        ready: true,
        storageError:
          "Saved data could not be read. Demo data is displayed; the original storage has not been overwritten.",
      });
      toast.error(
        "Could not load saved data. You can restore a JSON backup in Settings.",
      );
    }
  },
  save: (record) => {
    const state = get();
    const exists = state.records.some((r) => r.id === record.id);
    const next = {
      ...state,
      records: exists
        ? state.records.map((r) => (r.id === record.id ? record : r))
        : [record, ...state.records],
      activities: [
        {
          id: crypto.randomUUID(),
          title: record.title,
          action: exists ? ("Updated" as const) : ("Created" as const),
          kind: record.kind,
          date: new Date().toISOString(),
        },
        ...state.activities,
      ].slice(0, 100),
    };
    set({ ...next, storageError: persist(next) });
    toast.success(
      `${record.kind[0].toUpperCase() + record.kind.slice(1)} ${exists ? "updated" : "created"}`,
    );
  },
  remove: (id) => {
    const state = get();
    const record = state.records.find((r) => r.id === id);
    if (!record) return;
    const next = {
      ...state,
      records: state.records.filter((r) => r.id !== id),
      activities: [
        {
          id: crypto.randomUUID(),
          title: record.title,
          action: "Deleted" as const,
          kind: record.kind,
          date: new Date().toISOString(),
        },
        ...state.activities,
      ].slice(0, 100),
    };
    set({ ...next, storageError: persist(next) });
    toast.success("Deleted successfully");
  },
  favorite: (id) => {
    const state = get();
    const next = {
      ...state,
      records: state.records.map((r) =>
        r.id === id ? { ...r, favorite: !r.favorite } : r,
      ),
    };
    set({ ...next, storageError: persist(next) });
  },
  settingsUpdate: (settings) => {
    const next = { ...get(), settings: { ...get().settings, ...settings } };
    set({ ...next, storageError: persist(next) });
  },
  importData: (input) => {
    const data = backupSchema.parse(input);
    set({ ...data, storageError: persist(data) });
    toast.success("Backup imported successfully");
  },
  reset: () => {
    const data = demoData();
    set({ ...data, storageError: persist(data) });
    toast.success("Demo workspace restored");
  },
}));
