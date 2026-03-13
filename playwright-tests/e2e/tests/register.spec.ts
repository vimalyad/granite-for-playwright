import { test } from "@fixtures";
import { faker } from "@faker-js/faker";
import { LOGIN_SELECTORS, SIGNUP_SELECTORS } from "@selectors";

test.describe("Register page", () => {
  test("should register a new user", async ({ page, loginPage }) => {
    const username = faker.person.fullName();
    const email = faker.internet.email();
    const password = faker.internet.password();

    await test.step("Visit register page", async () => page.getByTestId(LOGIN_SELECTORS.registerButton).click())

    await test.step("Fill user details and credentials", async () => {
      await page.getByTestId(SIGNUP_SELECTORS.nameField).fill(username);
      await page.getByTestId(SIGNUP_SELECTORS.emailField).fill(email);
      await page.getByTestId(SIGNUP_SELECTORS.passwordField).fill(password);
      await page.getByTestId(SIGNUP_SELECTORS.passwordConfirmationField).fill(password);
      await page.getByTestId(SIGNUP_SELECTORS.signupButton).click();
    })

    await test.step("Verify newly created user", async () => loginPage.loginAndVerifyUser({ email, password, username }))
  });
});
