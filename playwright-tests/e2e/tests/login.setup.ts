import { test } from "@fixtures";
import { STORAGE_STATE } from "../../playwright.config";
import { COMMON_TEXTS } from "@texts";

test.describe("Login page", () => {
  test("should login with the correct credentials", async ({
    page,
    loginPage,
  }) => {
    await loginPage.loginAndVerifyUser({
      email: process.env.ADMIN_EMAIL!,
      password: process.env.ADMIN_PASSWORD!,
      username: COMMON_TEXTS.defaultUserName,
    });

    await page.context().storageState({ path: STORAGE_STATE });
    // it takes all the Cookie currently sitting in that browser context
    // it takes all browser's Local Storage and Session Storage
    // it compiles all of that data into a massive JSON object
    // it writes that to the specified path
  });
});
