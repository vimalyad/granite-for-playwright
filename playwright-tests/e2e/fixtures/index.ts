import { test as base } from "@playwright/test";
import LoginPage from "../poms/login";
import { TaskPage } from "@poms/tasks";
import { CommentPage } from "@poms/comments";

interface ExtendedFixtures {
  loginPage: LoginPage;
  taskPage: TaskPage;
  commentPage: CommentPage
}

export const test = base.extend<ExtendedFixtures>({
  loginPage: async ({ page }, use) => {
    const loginPage = new LoginPage(page);
    await use(loginPage); // the page is marked as in use and until the complete test completes it waits
  },

  taskPage: async ({ page }, use) => {
    const taskPage = new TaskPage(page);
    await use(taskPage); // same here
  },

  // overriding so that the window which we get is always at our website
  page: async ({ page }, use) => {
    await page.goto("/")
    await use(page)
  },

  commentPage: async({taskPage , page} , use) => {
    const commentPage = new CommentPage(page);
    await use(commentPage)
  }
});

// the same reference of page is being passed
// the page is always active only fixtures is paused

// flow
// playwright (fixture 0 (parent))
//     - initializes new page using browser.newContext() ->
//     - await use(page) -> paused
//     loginPage: fixture 1
//            - new LoginPage(page)
//            - await use(loginPage)  -> paused
//              taskPage: fixture 2
//                 - new TaskPage(loginPage)
//                 - await use(taskPage) -> paused
//                      : test completes
//                 - after logic of taskPage runs (if context destruction needed)
//            - after logic of loginPage runs (if context destruction needed)
//     - page is destroyed by playwright
