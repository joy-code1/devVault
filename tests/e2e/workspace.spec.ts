import { test, expect } from "@playwright/test";

test("complete developer workspace, persistence, search, tasks and backups", async ({
  page,
}) => {
  const errors: string[] = [];
  page.on("pageerror", (e) => errors.push(e.message));
  await page.goto("/");
  await expect(
    page.getByRole("heading", { name: "Welcome back, Alex" }),
  ).toBeVisible();
  await page.screenshot({
    path: "public/screenshots/dashboard-dark.png",
    fullPage: true,
  });
  await page
    .getByRole("link", { name: /Snippets/ })
    .first()
    .click();
  await page.getByRole("button", { name: "New snippet", exact: true }).click();
  const dialog = page.getByRole("dialog");
  await dialog.getByLabel("Title", { exact: true }).fill("Browser QA snippet");
  await dialog
    .getByLabel("Description", { exact: true })
    .fill("Persistence test");
  await dialog
    .getByLabel("Code", { exact: true })
    .fill("const answer: number = 42;");
  await dialog
    .getByRole("button", { name: "Create snippet", exact: true })
    .click();
  await expect(
    page.getByRole("button", { name: "Browser QA snippet", exact: true }),
  ).toBeVisible();
  await page.reload();
  await expect(
    page.getByRole("button", { name: "Browser QA snippet", exact: true }),
  ).toBeVisible();
  await page
    .getByRole("button", { name: "Edit Browser QA snippet", exact: true })
    .click();
  await dialog.getByLabel("Title", { exact: true }).fill("Edited QA snippet");
  await dialog.getByRole("button", { name: "Save changes" }).click();
  await page.screenshot({
    path: "public/screenshots/snippets.png",
    fullPage: true,
  });
  await page.keyboard.press("Control+k");
  await expect(
    dialog.getByRole("heading", { name: "Search your vault" }),
  ).toBeVisible();
  await dialog.getByPlaceholder("What are you looking for?").fill("Edited QA");
  await dialog.getByRole("button", { name: /Edited QA snippet/ }).click();
  await expect(
    dialog.getByRole("heading", { name: "Edited QA snippet" }),
  ).toBeVisible();
  await page.keyboard.press("Escape");
  await page.getByRole("button", { name: "Delete Edited QA snippet" }).click();
  await dialog
    .getByRole("button", { name: "Delete snippet", exact: true })
    .click();
  await expect(
    page.getByRole("button", { name: "Edited QA snippet", exact: true }),
  ).toHaveCount(0);
  await page
    .getByRole("link", { name: /Bookmarks/ })
    .first()
    .click();
  await page.getByRole("button", { name: "New bookmark", exact: true }).click();
  await dialog.getByLabel("Title", { exact: true }).fill("QA resource");
  await dialog.getByLabel("URL", { exact: true }).fill("https://example.com");
  await dialog.getByLabel("Category", { exact: true }).fill("Learning");
  await dialog.getByRole("button", { name: "Create bookmark" }).click();
  await page
    .getByRole("combobox", { name: "All categories" })
    .selectOption("Learning");
  await expect(
    page.getByRole("button", { name: "QA resource", exact: true }),
  ).toBeVisible();
  await expect(
    page
      .getByRole("main")
      .getByRole("button", { name: "shadcn/ui", exact: true }),
  ).toHaveCount(0);
  await page.getByRole("button", { name: "List view" }).click();
  await expect(page.getByRole("table")).toBeVisible();
  await page
    .getByRole("link", { name: /Projects/ })
    .first()
    .click();
  await page.getByRole("button", { name: "New project", exact: true }).click();
  await dialog.getByLabel("Title", { exact: true }).fill("QA project");
  await dialog.getByPlaceholder("Add a task…").fill("QA task");
  await dialog.getByRole("button", { name: "Add task", exact: true }).click();
  await dialog.getByRole("button", { name: "Create project" }).click();
  await page.getByRole("button", { name: "QA project", exact: true }).click();
  await dialog.getByRole("checkbox").check();
  await expect(dialog.getByText("100% complete")).toBeVisible();
  await dialog.getByRole("textbox", { name: "New task" }).fill("Second task");
  await dialog.getByRole("button", { name: "Add task", exact: true }).click();
  await expect(dialog.getByText("50% complete")).toBeVisible();
  await page.screenshot({
    path: "public/screenshots/project-detail.png",
    fullPage: true,
  });
  await page.keyboard.press("Escape");
  await page.getByRole("link", { name: "Settings", exact: true }).click();
  await page.getByRole("button", { name: "Light", exact: true }).click();
  await expect(page.locator("html")).toHaveAttribute("data-theme", "light");
  await page.getByRole("textbox", { name: "Display name" }).fill("Taylor");
  await page.getByRole("button", { name: "Save changes" }).click();
  const downloadEvent = page.waitForEvent("download");
  await page.getByRole("button", { name: "Export JSON" }).click();
  const download = await downloadEvent;
  const file = await download.path();
  expect(file).toBeTruthy();
  await page.getByRole("button", { name: "Restore demo", exact: true }).click();
  await dialog
    .getByRole("button", { name: "Restore demo", exact: true })
    .click();
  await expect(page.locator("html")).toHaveAttribute("data-theme", "dark");
  await page.locator("input[type=file]").setInputFiles(file!);
  await dialog.getByRole("button", { name: "Import workspace" }).click();
  await expect(page.locator("html")).toHaveAttribute("data-theme", "light");
  await page.getByRole("link", { name: "Overview", exact: true }).click();
  await expect(
    page.getByRole("heading", { name: "Welcome back, Taylor" }),
  ).toBeVisible();
  await page.screenshot({
    path: "public/screenshots/dashboard-light.png",
    fullPage: true,
  });
  await page.reload();
  await expect(
    page.getByRole("heading", { name: "Welcome back, Taylor" }),
  ).toBeVisible();
  expect(errors).toEqual([]);
});
test("mobile navigation, responsive layout and empty states", async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/");
  await expect(
    page.getByRole("heading", { name: "Welcome back, Alex" }),
  ).toBeVisible();
  await page.screenshot({
    path: "public/screenshots/mobile.png",
    fullPage: true,
  });
  expect(
    await page.evaluate(() => document.documentElement.scrollWidth),
  ).toBeLessThanOrEqual(390);
  await page.getByRole("button", { name: "Open navigation" }).click();
  await page
    .getByRole("link", { name: /Bookmarks/ })
    .first()
    .click();
  await page
    .getByRole("textbox", { name: "Search Bookmarks" })
    .fill("no-such-resource");
  await expect(
    page.getByRole("heading", { name: "No matches this time" }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Clear filters" }).click();
  await expect(
    page
      .getByRole("main")
      .getByRole("button", { name: "shadcn/ui", exact: true }),
  ).toBeVisible();
  await page.getByRole("button", { name: "New bookmark", exact: true }).click();
  await expect(page.getByRole("dialog")).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(page.getByRole("dialog")).toHaveCount(0);
});

test("clean screenshots and theme persistence", async ({ page }) => {
  await page.goto("/");
  await expect(
    page.getByRole("heading", { name: "Welcome back, Alex" }),
  ).toBeVisible();
  await page.screenshot({
    path: "public/screenshots/dashboard-dark.png",
    fullPage: true,
  });
  await page
    .getByRole("link", { name: /Snippets/ })
    .first()
    .click();
  await expect(page.getByRole("heading", { level: 1 })).toHaveText(/Snippets/);
  await expect(
    page
      .getByRole("main")
      .getByRole("button", { name: "useLocalStorage hook", exact: true }),
  ).toBeVisible();
  await page.screenshot({
    path: "public/screenshots/snippets.png",
    fullPage: true,
  });
  await page
    .getByRole("link", { name: /Projects/ })
    .first()
    .click();
  await expect(page.getByRole("heading", { level: 1 })).toHaveText(/Projects/);
  await page
    .getByRole("main")
    .getByRole("button", { name: "DevVault", exact: true })
    .click();
  await expect(
    page.getByRole("dialog").getByText("60% complete"),
  ).toBeVisible();
  await page.screenshot({
    path: "public/screenshots/project-detail.png",
    fullPage: true,
  });
  await page.keyboard.press("Escape");
  await page.getByRole("link", { name: "Overview", exact: true }).click();
  await page.getByRole("button", { name: "Switch to light theme" }).click();
  await expect(page.locator("html")).toHaveAttribute("data-theme", "light");
  await page.reload();
  await expect(page.locator("html")).toHaveAttribute("data-theme", "light");
  await expect(
    page.getByRole("heading", { name: "Welcome back, Alex" }),
  ).toBeVisible();
  await page.screenshot({
    path: "public/screenshots/dashboard-light.png",
    fullPage: true,
  });
  await page.getByRole("button", { name: "Switch to dark theme" }).click();
  await page.setViewportSize({ width: 390, height: 844 });
  await page.screenshot({
    path: "public/screenshots/mobile.png",
    fullPage: true,
  });
});
