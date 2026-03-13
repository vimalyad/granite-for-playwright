import { test } from "@fixtures";
import { faker } from "@faker-js/faker";
import LoginPage from "@poms/login";
import { expect } from "@playwright/test";
import { COMMON_TEXTS } from "@texts";
import { TASKS_TABLE_SELECTORS } from "@selectors";

test.describe("Tasks page", () => {
  let taskName: string;

  // here we are creating random name for each tests
  test.beforeEach(async ({ taskPage }, testInfo) => {
    taskName = faker.word.words({ count: 5 });
    if (testInfo.title.includes(COMMON_TEXTS.skipSetup)) return;
    await taskPage.createTaskAndVerify({ taskName });
  });


  // cleanup
  test.afterEach(async ({ taskPage }) => {
    await test.step("Mark task as completed and assert it is marked", () => taskPage.markTaskAsCompletedAndVerify({ taskName }));
    await test.step("Deleted completed task and assert it is deleted", () => taskPage.deleteCompletedTaskAndVerify({ taskName }));
  })

  test("should create a new task with creator as the assignee", () => { });

  test("should be able to mark a task as completed", async ({ taskPage }) => {
    await taskPage.markTaskAsCompletedAndVerify({ taskName });
  });

  test("Starring tasks feature", async ({ taskPage }) => {
    await test.step("should star a pending task and assert it is starred", () => taskPage.starTaskAndVerify({ taskName }))
    await test.step("should un-star a pending task and assert it is un-starred", () => taskPage.unstarTaskAndVerify({ taskName }));
  });

  test(`should create a new task with a different user as the assignee ${COMMON_TEXTS.skipSetup}`, async ({
    browser,
    taskPage
  }) => {

    // here we are creating a task from Oliver's dashboard and assigning to Sam
    await taskPage.createTaskAndVerify({ taskName, userName: COMMON_TEXTS.standardUserName });

    // creating new browser context
    const newUserContext = await browser.newContext({
      storageState: { cookies: [], origins: [] }
    });

    // creating the page
    const newUserPage = await newUserContext.newPage();
    await test.step("Step 1: Visit login page", () => newUserPage.goto("/"));

    // creating loginPage
    const loginPage = new LoginPage(newUserPage);

    // logging in by standard user
    await test.step("Step 2: Login as standard user", () => loginPage.loginAndVerifyUser({
      email: process.env.STANDARD_EMAIL,
      password: process.env.STANDARD_PASSWORD,
      username: COMMON_TEXTS.standardUserName
    }))

    // checking that Sam has that task which is assigned by Oliver
    await test.step("Step 3: Assert assigned task is visible for standard user", () => expect(
      newUserPage
        .getByTestId(TASKS_TABLE_SELECTORS.pendingTasksTable)
        .getByRole("row", { name: taskName })
    ).toBeVisible())

    // close the pages
    await newUserPage.close();
    // close the context
    await newUserContext.close();

  })
})
