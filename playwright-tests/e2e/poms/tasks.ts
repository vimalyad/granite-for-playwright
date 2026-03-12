import { Page, expect } from "@playwright/test";

export class TaskPage {

  page: Page;

  constructor(page: Page) {
    this.page = page;
  }

  createTaskAndVerify = async ({ taskName }: { taskName: string }): Promise<void> => {

    // locating the navar todo button
    await this.page.getByTestId("navbar-add-todo-link").click();

    // filling taskName
    await this.page.getByTestId("form-title-field").fill(taskName);

    // clicking the outer container
    await this.page.locator(".css-2b097c-container").click();

    // find the specific text Oliver Smith and click
    await this.page.locator('.css-26l3qy-menu').getByText("Oliver Smith").click();

    // submit button click
    await this.page.getByTestId('form-submit-button').click()

    // instead of searching in whole page , search in tasks-pending-table by row
    const taskInBoard = this.page
      .getByTestId('tasks-pending-table')
      .getByRole("row", {
        // the purpose of i is to make it case-insensitive
        name: new RegExp(taskName, "i"),
      });

    // the above is not any action it is just for locating the element and keeping a pointer action is performed later

    // if the table is too long then it might need to scroll
    // it may be that task may be at last and due to infinite scroll it may not be added to DOM so we need to scroll
    // it makes sure that under headed/ui mode we can see that task
    await taskInBoard.scrollIntoViewIfNeeded();

    // makes sure that it is visible
    await expect(taskInBoard).toBeVisible();
  }
}
