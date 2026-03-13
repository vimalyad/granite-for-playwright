import { test } from "@fixtures";
import { faker } from "@faker-js/faker";
import LoginPage from "@poms/login";
import { expect } from "@playwright/test";

test.describe("Tasks page", () => {
  let taskName: string;

  // here we are creating random name for each tests
  test.beforeEach(async ({taskPage}, testInfo) => {
    taskName = faker.word.words({ count: 5 });
    if(testInfo.title.includes("[SKIP_SETUP]")) return;
    await taskPage.createTaskAndVerify({taskName});
  });


  // cleanup
  test.afterEach(async ({ taskPage }) => {
    await taskPage.markTaskAsCompletedAndVerify({ taskName });
    await taskPage.deleteCompletedTaskAndVerify({ taskName });
  })

  test("should create a new task with creator as the assignee", () => {});

  test("should be able to mark a task as completed", async ({ taskPage }) => {
    await taskPage.markTaskAsCompletedAndVerify({ taskName });
  });

  test.describe("Starring tasks feature", () => {
    test.describe.configure({ mode: "serial" });

    test("should be able to star a pending task", async ({ taskPage }) => {
      await taskPage.starTaskAndVerify({ taskName })
    });

    test('should be able to un-star a pending task', async ({ taskPage }) => {
      await taskPage.unstarTaskAndVerify({ taskName })
    })
  });

  test("should create a new task with a different user as the assignee [SKIP_SETUP]", async ({
    browser,
    taskPage
  }) => {

    // here we are creating a task from Oliver's dashboard and assigning to Sam
    await taskPage.createTaskAndVerify({ taskName, userName: "Sam Smith" });

    // creating new browser context
    const newUserContext = await browser.newContext({
      storageState: { cookies: [], origins: [] }
    });

    // creating the page
    const newUserPage = await newUserContext.newPage();
    await newUserPage.goto("/");

    // creating loginPage
    const loginPage = new LoginPage(newUserPage);

    // logging in by Sam Smith
    await loginPage.loginAndVerifyUser({
      email: "sam@example.com",
      password: "welcome",
      username: "Sam Smith"
    });

    // checking that Sam has that task which is assigned by Oliver
    await expect(
      newUserPage
        .getByTestId("tasks-pending-table")
        .getByRole("row", { name: taskName })
    ).toBeVisible();

    // close the pages
    await newUserPage.close();
    // close the context
    await newUserContext.close();

  })
})
