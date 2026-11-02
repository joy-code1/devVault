import { z } from "zod";
export const languages = [
  "TypeScript",
  "JavaScript",
  "Python",
  "CSS",
  "HTML",
  "JSON",
  "Bash",
  "SQL",
] as const;
const base = {
  id: z.string().min(1),
  title: z.string().trim().min(1).max(120),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
  favorite: z.boolean(),
};
export const snippetSchema = z.object({
  ...base,
  kind: z.literal("snippet"),
  description: z.string().max(1000),
  language: z.enum(languages),
  code: z.string().min(1).max(100000),
  tags: z.array(z.string().max(40)).max(20),
});
export const bookmarkSchema = z.object({
  ...base,
  kind: z.literal("bookmark"),
  description: z.string().max(1000),
  url: z
    .url()
    .refine((v) => /^https?:\/\//i.test(v), "Use an HTTP or HTTPS URL"),
  category: z.string().min(1).max(50),
  tags: z.array(z.string().max(40)).max(20),
});
export const taskSchema = z.object({
  id: z.string().min(1),
  title: z.string().trim().min(1).max(200),
  done: z.boolean(),
});
export const projectSchema = z.object({
  ...base,
  kind: z.literal("project"),
  description: z.string().max(1000),
  status: z.enum(["Planned", "In progress", "Completed"]),
  color: z.enum(["violet", "blue", "green", "amber"]),
  tasks: z.array(taskSchema).max(1000),
});
export const recordSchema = z.discriminatedUnion("kind", [
  snippetSchema,
  bookmarkSchema,
  projectSchema,
]);
export type VaultRecord = z.infer<typeof recordSchema>;
export type Snippet = z.infer<typeof snippetSchema>;
export type Bookmark = z.infer<typeof bookmarkSchema>;
export type Project = z.infer<typeof projectSchema>;
export const activitySchema = z.object({
  id: z.string(),
  title: z.string(),
  action: z.enum(["Created", "Updated", "Deleted"]),
  kind: z.enum(["snippet", "bookmark", "project"]),
  date: z.string().datetime(),
});
export type Activity = z.infer<typeof activitySchema>;
export const backupSchema = z
  .object({
    version: z.literal(1),
    records: z.array(recordSchema).max(10000),
    activities: z.array(activitySchema).max(100),
    settings: z.object({
      name: z.string().trim().min(1).max(50),
      theme: z.enum(["dark", "light"]),
      compact: z.boolean(),
    }),
  })
  .superRefine((data, ctx) => {
    const ids = data.records.map((r) => r.id);
    if (new Set(ids).size !== ids.length)
      ctx.addIssue({ code: "custom", message: "Duplicate record IDs" });
    for (const record of data.records)
      if (
        record.kind === "project" &&
        new Set(record.tasks.map((t) => t.id)).size !== record.tasks.length
      )
        ctx.addIssue({ code: "custom", message: "Duplicate task IDs" });
  });
export type Backup = z.infer<typeof backupSchema>;
const date = (days: number) =>
  new Date(Date.now() - days * 86400000).toISOString();
const common = (id: string, title: string, days: number, favorite = false) => ({
  id,
  title,
  createdAt: date(days + 5),
  updatedAt: date(days),
  favorite,
});
export function demoData(): Backup {
  const records: VaultRecord[] = [
    {
      ...common("s1", "useLocalStorage hook", 0, true),
      kind: "snippet",
      description: "A type-safe hook to persist state across sessions.",
      language: "TypeScript",
      tags: ["react", "hooks"],
      code: 'import { useState, useEffect } from "react";\n\nexport function useLocalStorage<T>(key: string, initial: T) {\n  const [value, setValue] = useState<T>(initial);\n\n  useEffect(() => {\n    const saved = localStorage.getItem(key);\n    if (saved) setValue(JSON.parse(saved));\n  }, [key]);\n\n  const save = (next: T) => {\n    setValue(next);\n    localStorage.setItem(key, JSON.stringify(next));\n  };\n\n  return [value, save] as const;\n}',
    },
    {
      ...common("s2", "Debounce utility", 1, true),
      kind: "snippet",
      description: "Keep expensive operations in check.",
      language: "JavaScript",
      tags: ["utilities", "performance"],
      code: "export function debounce(fn, delay = 300) {\n  let timeout;\n  return (...args) => {\n    clearTimeout(timeout);\n    timeout = setTimeout(() => fn(...args), delay);\n  };\n}",
    },
    {
      ...common("s3", "API error handler", 2),
      kind: "snippet",
      description: "Consistent error responses for your API.",
      language: "TypeScript",
      tags: ["api", "backend"],
      code: "type ApiError = { message: string; status: number };\n\nexport async function fetchJson<T>(url: string): Promise<T> {\n  const response = await fetch(url);\n  if (!response.ok) {\n    throw { message: response.statusText, status: response.status };\n  }\n  return response.json();\n}",
    },
    {
      ...common("s4", "CSS grid auto-fit", 4),
      kind: "snippet",
      description: "A responsive layout without media queries.",
      language: "CSS",
      tags: ["css", "layout"],
      code: ".grid {\n  display: grid;\n  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));\n  gap: 1.5rem;\n}",
    },
    {
      ...common("b1", "shadcn/ui", 0, true),
      kind: "bookmark",
      description:
        "Beautifully designed components that you can copy and paste.",
      url: "https://ui.shadcn.com",
      category: "Design",
      tags: ["components", "react"],
    },
    {
      ...common("b2", "Next.js documentation", 1, true),
      kind: "bookmark",
      description:
        "The React framework for building full-stack web applications.",
      url: "https://nextjs.org/docs",
      category: "Documentation",
      tags: ["nextjs", "react"],
    },
    {
      ...common("b3", "Lucide icons", 3),
      kind: "bookmark",
      description: "Beautiful & consistent open-source icons.",
      url: "https://lucide.dev",
      category: "Resources",
      tags: ["icons", "design"],
    },
    {
      ...common("b4", "Tailwind CSS", 5),
      kind: "bookmark",
      description: "Rapidly build modern websites with utility-first CSS.",
      url: "https://tailwindcss.com/docs",
      category: "Documentation",
      tags: ["css", "styling"],
    },
    {
      ...common("p1", "DevVault", 0, true),
      kind: "project",
      description:
        "Your personal developer workspace. Everything in one place.",
      status: "In progress",
      color: "violet",
      tasks: [
        { id: "t1", title: "Design the dashboard", done: true },
        { id: "t2", title: "Build snippet library", done: true },
        { id: "t3", title: "Add global search", done: true },
        { id: "t4", title: "Write documentation", done: false },
        { id: "t5", title: "Ship to production", done: false },
      ],
    },
    {
      ...common("p2", "Portfolio website", 2),
      kind: "project",
      description: "A new home for selected work and side projects.",
      status: "In progress",
      color: "blue",
      tasks: [
        { id: "t6", title: "Create wireframes", done: true },
        { id: "t7", title: "Build project pages", done: false },
        { id: "t8", title: "Add animations", done: false },
        { id: "t9", title: "Launch website", done: false },
      ],
    },
    {
      ...common("p3", "CLI toolkit", 4),
      kind: "project",
      description:
        "Small tools that make everyday development a little easier.",
      status: "Planned",
      color: "green",
      tasks: [
        { id: "t10", title: "Plan commands", done: false },
        { id: "t11", title: "Initialize package", done: false },
      ],
    },
  ];
  return {
    version: 1,
    records,
    activities: records.slice(0, 6).map((r, i) => ({
      id: `a${i}`,
      title: r.title,
      action: i % 2 ? "Created" : "Updated",
      kind: r.kind,
      date: r.updatedAt,
    })),
    settings: { name: "Alex", theme: "dark", compact: false },
  };
}
export function progress(project: Project) {
  return project.tasks.length
    ? Math.round(
        (project.tasks.filter((t) => t.done).length / project.tasks.length) *
          100,
      )
    : 0;
}
