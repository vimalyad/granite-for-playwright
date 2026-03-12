import { test } from "@fixtures";
import { STORAGE_STATE } from "../../playwright.config";

test.describe("Login page", () => {
  test("should login with the correct credentials", async ({
    page,
    loginPage,
  }) => {
    await page.goto("/");
    await loginPage.loginAndVerifyUser({
      email: "oliver@example.com",
      password: "welcome",
      username: "Oliver Smith",
    });

    await page.context().storageState({ path: STORAGE_STATE });
    // it takes all the Cookie currently sitting in that browser context
    // it takes all browser's Local Storage and Session Storage
    // it compiles all of that data into a massive JSON object
    // it writes that to the specified path
  });
});
