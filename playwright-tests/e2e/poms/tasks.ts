import { Locator, Page, expect } from "@playwright/test";

interface TaskDetails {
  taskName: string
}

interface CreateTaskDetails extends TaskDetails {
  userName?: string
}

interface DashboardTaskDetails {
  taskName?: string | RegExp
  type: string
}

export class TaskPage {

  page: Page;

  constructor(page: Page) {
    this.page = page;
  }

  createTaskAndVerify = async ({ taskName, userName = "Oliver Smith" }: CreateTaskDetails): Promise<void> => {

    // locating the navar todo button
    await this.page.getByTestId("navbar-add-todo-link").click();

    // filling taskName
    await this.page.getByTestId("form-title-field").fill(taskName);

    // clicking the outer container
    await this.page.locator(".css-2b097c-container").click();

    // find the specific text Oliver Smith and click
    await this.page.locator('.css-26l3qy-menu').getByText(userName).click();

    // submit button click
    await this.page.getByTestId('form-submit-button').click()

    // instead of searching in whole page , search in tasks-pending-table by row
    // the purpose of i is to make it case-insensitive
    const taskInBoard = this.getTask({ type: 'pending', taskName: new RegExp(taskName, "i") });

    // the above is not any action it is just for locating the element and keeping a pointer action is performed later

    // if the table is too long then it might need to scroll
    // it may be that task may be at last and due to infinite scroll it may not be added to DOM so we need to scroll
    // it makes sure that under headed/ui mode we can see that task
    await taskInBoard.scrollIntoViewIfNeeded();

    // makes sure that it is visible
    await expect(taskInBoard).toBeVisible();
  }


  // marking task as completed and verifying
  markTaskAsCompletedAndVerify = async ({ taskName }: TaskDetails): Promise<void> => {
    await this.getTask({ type: 'pending', taskName }).getByRole("checkbox").click();
    const completedTaskInDashboard = this.getTask({ type: 'completed', taskName });
    await completedTaskInDashboard.scrollIntoViewIfNeeded();
    await expect(completedTaskInDashboard).toBeVisible();
  };


  // deleting completed task and verifying
  deleteCompletedTaskAndVerify = async ({ taskName }: TaskDetails): Promise<void> => {
    const completedTaskInDashboard = this.getTask({ type: 'completed', taskName });
    await completedTaskInDashboard.getByTestId("completed-task-delete-link").click();
    await expect(completedTaskInDashboard).toBeHidden();
    await expect(this.getTask({ type: 'pending', taskName })).toBeHidden();
  };

  // starring pending task and verifying
  starTaskAndVerify = async ({ taskName }: TaskDetails): Promise<void> => {
    const starIcon = this.getStarIcon({ taskName })
    await starIcon.click();
    await expect(starIcon).toHaveClass(/ri-star-fill/i);
    await expect(this.getTask({ type: 'pending' }).nth(1)).toContainText(taskName);
  }

  // un-starring pending task and verifying
  unstarTaskAndVerify = async ({ taskName }: TaskDetails) => {
    const starIcon = this.getStarIcon({ taskName });
    await starIcon.click();
    await expect(starIcon).toHaveClass(/ri-star-line/);
  }


  // helper private methods
  private getStarIcon = ({ taskName }: TaskDetails) => {
    return this.getTask({ type: 'pending', taskName }).getByTestId("pending-task-star-or-unstar-link");
  }

  private getTask = ({ type, taskName }: DashboardTaskDetails) => {
    const table = this.getTaskDashboard(type);
    return taskName ? table.getByRole("row", { name: taskName }) : table.getByRole("row");
  }

  private getTaskDashboard = (type: string) => {
    return this.page.getByTestId(`tasks-${type}-table`);
  }
}
