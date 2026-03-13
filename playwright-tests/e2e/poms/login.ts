import { Page, expect } from "@playwright/test";
import { LOGIN_SELECTORS , NAVBAR_SELECTORS } from "@selectors";

interface LoginDetails {
  email: string,
  password: string,
  username: string
}

export default class LoginPage {
  
  constructor(private page: Page) {this.page = page;}

  loginAndVerifyUser = async ({
    email,
    password,
    username
  }: LoginDetails): Promise<void> => {
    await this.page.getByTestId(LOGIN_SELECTORS.emailField).fill(email);
    await this.page.getByTestId(LOGIN_SELECTORS.passwordField).fill(password);
    await this.page.getByTestId(LOGIN_SELECTORS.loginButton).click();
    await expect(this.page.getByTestId(NAVBAR_SELECTORS.userNameLabel)).toContainText(username);
    await expect(this.page.getByTestId(NAVBAR_SELECTORS.logoutButton)).toBeVisible();
  }
}
