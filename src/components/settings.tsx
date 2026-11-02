"use client";
import { useRef, useState } from "react";
import {
  Download,
  Upload,
  Sun,
  Moon,
  Check,
  HardDrive,
  ShieldCheck,
  RotateCcw,
  Palette,
  UserRound,
  Database,
  Settings2,
} from "lucide-react";
import { toast } from "sonner";
import { useVault } from "@/lib/store";
import { backupSchema, type Backup } from "@/lib/data";
import { Button } from "./ui/button";
import { Modal } from "./ui/dialog";
export function SettingsPage() {
  const { records, activities, settings, settingsUpdate, importData, reset } =
    useVault();
  const [name, setName] = useState(settings.name);
  const [pending, setPending] = useState<Backup | null>(null);
  const [resetOpen, setResetOpen] = useState(false);
  const [reading, setReading] = useState(false);
  const input = useRef<HTMLInputElement>(null);
  function exportData() {
    try {
      const blob = new Blob(
        [
          JSON.stringify(
            { version: 1, records, activities, settings },
            null,
            2,
          ),
        ],
        { type: "application/json" },
      );
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `devvault-backup-${new Date().toISOString().slice(0, 10)}.json`;
      a.click();
      setTimeout(() => URL.revokeObjectURL(url), 1000);
      toast.success("Backup exported");
    } catch {
      toast.error("Could not export your backup. Please try again.");
    }
  }
  async function readFile(file?: File) {
    if (!file) return;
    setReading(true);
    try {
      if (file.size > 10 * 1024 * 1024)
        throw new Error("File must be smaller than 10 MB.");
      const data = JSON.parse(await file.text());
      const result = backupSchema.safeParse(data);
      if (!result.success)
        throw new Error(
          "Invalid DevVault backup. Check its format, version, and record fields.",
        );
      setPending(result.data);
    } catch (e) {
      toast.error(
        e instanceof SyntaxError
          ? "This file is not valid JSON."
          : e instanceof Error
            ? e.message
            : "Could not read this file.",
      );
    } finally {
      setReading(false);
      if (input.current) input.current.value = "";
    }
  }
  return (
    <>
      <div className="page-heading">
        <div>
          <div className="eyebrow">MAKE YOURSELF AT HOME</div>
          <h1>Settings</h1>
          <p>A workspace that works the way you do.</p>
        </div>
        <span className="page-symbol">
          <Settings2 size={24} />
        </span>
      </div>
      <div className="settings-layout">
        <div className="settings-section">
          <div className="settings-label">
            <UserRound size={19} />
            <div>
              <h2>Personal profile</h2>
              <p>A little introduction to your workspace.</p>
            </div>
          </div>
          <div className="settings-card panel">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (!name.trim()) return;
                settingsUpdate({ name: name.trim() });
                toast.success("Profile updated");
              }}
            >
              <div className="profile-settings">
                <span className="large-avatar">
                  {settings.name[0].toUpperCase()}
                </span>
                <div>
                  <strong>{settings.name}&apos;s workspace</strong>
                  <p>Personal account · Local storage</p>
                </div>
              </div>
              <label>
                Display name
                <input
                  required
                  maxLength={50}
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </label>
              <div className="settings-card-footer">
                <p>This name appears in your dashboard.</p>
                <Button type="submit" size="sm">
                  Save changes
                </Button>
              </div>
            </form>
          </div>
        </div>
        <div className="settings-section">
          <div className="settings-label">
            <Palette size={19} />
            <div>
              <h2>Appearance</h2>
              <p>Your space, your style.</p>
            </div>
          </div>
          <div className="settings-card panel">
            <h3>Interface theme</h3>
            <p className="muted">Choose the look that helps you focus.</p>
            <div className="theme-options">
              {(["dark", "light"] as const).map((theme) => (
                <button
                  key={theme}
                  className={`theme-option ${settings.theme === theme ? "selected" : ""}`}
                  onClick={() => {
                    settingsUpdate({ theme });
                    toast.success(
                      `${theme === "dark" ? "Dark" : "Light"} theme enabled`,
                    );
                  }}
                >
                  <span className={`theme-preview preview-${theme}`}>
                    <span />
                    <span>
                      <i />
                      <i />
                      <i />
                    </span>
                  </span>
                  <span>
                    {theme === "dark" ? <Moon size={15} /> : <Sun size={15} />}{" "}
                    {theme === "dark" ? "Dark" : "Light"}
                    {settings.theme === theme && <Check size={15} />}
                  </span>
                </button>
              ))}
            </div>
            <div className="setting-switch-row">
              <div>
                <strong>Compact layout</strong>
                <p>Fit a little more into your workspace.</p>
              </div>
              <button
                role="switch"
                aria-checked={settings.compact}
                aria-label="Compact layout"
                className={`switch ${settings.compact ? "on" : ""}`}
                onClick={() => settingsUpdate({ compact: !settings.compact })}
              >
                <span />
              </button>
            </div>
          </div>
        </div>
        <div className="settings-section">
          <div className="settings-label">
            <Database size={19} />
            <div>
              <h2>Data & backups</h2>
              <p>Keep your work safe and portable.</p>
            </div>
          </div>
          <div className="settings-card panel">
            <div className="storage-summary">
              <span className="record-icon violet">
                <HardDrive size={20} />
              </span>
              <div>
                <strong>Your data stays with you</strong>
                <p>{records.length} records · Stored in this browser</p>
              </div>
              <ShieldCheck size={20} />
            </div>
            <p className="data-note">
              DevVault saves to localStorage on this device. Export a backup
              before clearing your browser data or moving to another device.
            </p>
            <div className="backup-actions">
              <div>
                <h3>Export workspace</h3>
                <p>Download all records and settings as JSON.</p>
              </div>
              <Button variant="outline" onClick={exportData}>
                <Download size={15} />
                Export JSON
              </Button>
            </div>
            <div className="backup-actions">
              <div>
                <h3>Import workspace</h3>
                <p>Restore a previously exported DevVault backup.</p>
              </div>
              <Button
                variant="outline"
                disabled={reading}
                onClick={() => input.current?.click()}
              >
                <Upload size={15} />
                {reading ? "Reading…" : "Import JSON"}
              </Button>
              <input
                ref={input}
                type="file"
                accept=".json,application/json"
                className="sr-only"
                aria-label="Import JSON backup"
                onChange={(e) => void readFile(e.target.files?.[0])}
              />
            </div>
          </div>
        </div>
        <div className="settings-section">
          <div className="settings-label">
            <RotateCcw size={19} />
            <div>
              <h2>Fresh start</h2>
              <p>Return to a little inspiration.</p>
            </div>
          </div>
          <div className="settings-card panel reset-card">
            <div>
              <h3>Restore demo workspace</h3>
              <p>Replace your current workspace with the starter records.</p>
            </div>
            <Button variant="outline" onClick={() => setResetOpen(true)}>
              Restore demo
            </Button>
          </div>
        </div>
      </div>
      <Modal
        open={!!pending}
        onOpenChange={(v) => !v && setPending(null)}
        title="Replace your workspace?"
        description={`This backup contains ${pending?.records.length || 0} records. Importing replaces your current records and settings. Export a backup first if you want to keep them.`}
      >
        <div className="modal-footer">
          <Button variant="outline" onClick={() => setPending(null)}>
            Cancel
          </Button>
          <Button
            onClick={() => {
              if (pending) {
                importData(pending);
                setName(pending.settings.name);
                setPending(null);
              }
            }}
          >
            Import workspace
          </Button>
        </div>
      </Modal>
      <Modal
        open={resetOpen}
        onOpenChange={setResetOpen}
        title="Restore demo workspace?"
        description="Your current records will be replaced with demo data. Export a backup first to keep your work."
      >
        <div className="modal-footer">
          <Button variant="outline" onClick={() => setResetOpen(false)}>
            Cancel
          </Button>
          <Button
            variant="destructive"
            onClick={() => {
              reset();
              setName("Alex");
              setResetOpen(false);
            }}
          >
            Restore demo
          </Button>
        </div>
      </Modal>
    </>
  );
}
