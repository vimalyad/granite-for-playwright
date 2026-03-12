import { Page, expect } from "@playwright/test";

interface LoginDetails {
  email: string,
  password: string,
  username: string
}

export default class LoginPage {
  page: Page;

  constructor(page: Page) {
    this.page = page;
  }

  loginAndVerifyUser = async ({
    email,
    password,
    username
  }: LoginDetails): Promise<void> => {
    await this.page.getByTestId("login-email-field").fill(email);
    await this.page.getByTestId("login-password-field").fill(password);
    await this.page.getByTestId("login-submit-button").click();
    await expect(this.page.getByTestId("navbar-username-label")).toContainText(
      username
    );
    await expect(this.page.getByTestId("navbar-logout-link")).toBeVisible();
  }
}
