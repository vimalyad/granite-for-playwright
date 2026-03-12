import { expect, type Page } from "@playwright/test";

// custom implementation of LoginPage

export interface LoginDetails {
  email: string;
  password: string;
  username: string;
}

export const createLoginPage = (page: Page) => {

  const emailInput = page.getByTestId("login-email-field");
  const passwordInput = page.getByTestId("login-password-field");
  const submitButton = page.getByTestId("login-submit-button");
  const usernameLabel = page.getByTestId("navbar-username-label");
  const logoutLink = page.getByTestId("navbar-logout-link");

  return {
    loginAndVerifyUser: async ({ email, password, username }: LoginDetails): Promise<void> => {

      await emailInput.fill(email);
      await passwordInput.fill(password);
      await submitButton.click();

      await expect(usernameLabel).toContainText(username);
      await expect(logoutLink).toBeVisible();
    }
  };
};
