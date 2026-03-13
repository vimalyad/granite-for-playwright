import { test } from "@fixtures";
import { faker } from "@faker-js/faker";
import { BrowserContext, expect, Page } from "@playwright/test";
import { COMMON_TEXTS } from "@texts";
import { TaskPage, LoginPage } from "@poms";
import CommentPage from "@poms/comments";

test.describe("Comments page", () => {
  let taskName: string;
  let comment: string;

  // assignee pointers
  let assigneeContext: BrowserContext;
  let assigneePage: Page;
  let assigneeTaskPage: TaskPage;
  let assigneeCommentPage: CommentPage;

  test.beforeEach(async ({ taskPage, browser }) => {
    taskName = faker.word.words({ count: 5 });
    comment = faker.word.words({ count: 5 });

    // creator creates and opens the task
    await test.step("Setup: Creator creates and opens the task", async () => {
      await taskPage.createTaskAndVerify({ taskName, userName: COMMON_TEXTS.standardUserName });
      await taskPage.openTask({ taskName });
    });

    // assignee opens a new page and opens the task
    await test.step("Assignee logs in and opens the task", async () => {

      // create assignees context
      assigneeContext = await browser.newContext({
        storageState: {
          cookies: [],
          origins: []
        }
      });

      // create page
      assigneePage = await assigneeContext.newPage();

      // go to website
      await test.step("Step 1: Visit Login Page", () => assigneePage.goto("/"));

      // create fixtures
      const assigneeLoginPage = new LoginPage(assigneePage);
      assigneeTaskPage = new TaskPage(assigneePage);
      assigneeCommentPage = new CommentPage(assigneePage);

      // login as assignee
      await test.step("Step 2: Log in and assert logged in", () => assigneeLoginPage.loginAndVerifyUser({
        email: process.env.STANDARD_EMAIL!,
        password: process.env.STANDARD_PASSWORD!,
        username: COMMON_TEXTS.standardUserName
      }));

      // open task in assignee browser page
      await assigneeTaskPage.openTask({ taskName });

    })
  });


  // cleanup
  test.afterEach(async ({ taskPage, commentPage }) => {
    await test.step("Teardown: Close contexts and delete task", async () => {
      await assigneePage.close();
      await assigneeContext.close();
    });

    await test.step("deleted created task", () => commentPage.deleteTask());
    await test.step("assert task is deleted", () => taskPage.verifyTaskDoesNotExist({ taskName }));
  });


  test("Create a comment as a creator of task and verify assignee receives it", async ({ commentPage }) => {

    // comment created by creator and verifies present in ui and total comment count to be 1
    await test.step("Creator adds a comment", async () => {
      await test.step("create comment and assert it is created", () => commentPage.createCommentAndVerify({ comment }));

      await test.step("assert count of comment increased", async () => expect(await commentPage.getCommentCount()).toBe(1));
    });

    // assignee reloads page , verifies comment and total count of comment should be 1
    await test.step("Assignee syncs and verifies the comment", async () => {
      await test.step("reload assignee page", () => assigneePage.reload());
      await assigneeCommentPage.verifyComment({ comment });

      expect(await assigneeCommentPage.getCommentCount()).toBe(1);
    });
  });


  test("Assignee add a comment and Creator receives it", async ({ page, commentPage }) => {

    // comment created by assignee and verifies present in ui and total comment count to be 1
    await test.step("Assignee adds a comment", async () => {
      await assigneeCommentPage.createCommentAndVerify({ comment });
      expect(await assigneeCommentPage.getCommentCount()).toBe(1);
    });

    // creator reloads page , verifies comment and total count of comment should be 1
    await test.step("Creator syncs and verifies the comment", async () => {
      await test.step("reload creator page", () => page.reload());

      await test.step("assert comment in creator page", () => commentPage.verifyComment({ comment }));

      await test.step("assert count of comment increased", async () => expect(await commentPage.getCommentCount()).toBe(1));
    });
  });

});
