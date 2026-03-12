import { test } from "@fixtures";
import { expect } from "@playwright/test";
import { faker } from "@faker-js/faker";

test.describe("Tasks page", () => {
  let taskName: string;

  // here we are creating random name for each tests
  test.beforeEach(async ({ page }) => {
    taskName = faker.word.words({ count: 5 });
    await page.goto("/")
  });

  test("should create a new task with creator as the assignee", async ({ loginPage, page, taskPage }) => {
    await taskPage.createTaskAndVerify({ taskName });
  });

  test("should be able to mark a test as completed", async ({
    page,
    loginPage,
    taskPage
  }) => {
    await taskPage.createTaskAndVerify({ taskName });

    await page
      .getByTestId('tasks-pending-table')
      .getByRole("row", { name: taskName })
      .getByRole("checkbox")
      .click();

    const completedTakInDashboard = page
      .getByTestId("tasks-completed-table")
      .getByRole("row", { name: taskName });

    await completedTakInDashboard.scrollIntoViewIfNeeded();

    await expect(completedTakInDashboard).toBeVisible();

  })
})
