import { Page, expect } from "@playwright/test";
import { CREATE_TASK_SELECTORS, NAVBAR_SELECTORS, TASKS_TABLE_SELECTORS } from "@selectors";
import { COMMON_TEXTS, DASHBOARD_TEXTS } from "@texts";

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

export default class TaskPage {

  constructor(private page: Page){}

  createTaskAndVerify = async ({ taskName, userName =  COMMON_TEXTS.defaultUserName }: CreateTaskDetails): Promise<void> => {

    // locating the navar todo button
    await this.page.getByTestId(NAVBAR_SELECTORS.addTodoButton).click();

    // filling taskName
    await this.page.getByTestId(CREATE_TASK_SELECTORS.taskTitleField).fill(taskName);

    // clicking the outer container
    await this.page.locator(CREATE_TASK_SELECTORS.memberSelectContainer).click();

    // find the specific text userName and click
    await this.page.locator(CREATE_TASK_SELECTORS.memberOptionField).getByText(userName).click();

    // submit button click
    await this.page.getByTestId(CREATE_TASK_SELECTORS.createTaskButton).click()

    // instead of searching in whole page , search in tasks-pending-table by row
    // the purpose of i is to make it case-insensitive
    const taskInBoard = this.getTask({ type: DASHBOARD_TEXTS.pending , taskName: new RegExp(taskName, "i") });

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
    await expect(this.page.getByRole("heading", { name: DASHBOARD_TEXTS.loading })).toBeHidden();
    await this.getTask({ type: DASHBOARD_TEXTS.pending, taskName }).getByRole("checkbox").click();
    const completedTaskInDashboard = this.getTask({ type: DASHBOARD_TEXTS.completed, taskName });
    const isTaskCompleted = await completedTaskInDashboard.count();
    if (!isTaskCompleted) return;
    await completedTaskInDashboard.scrollIntoViewIfNeeded();
    await expect(completedTaskInDashboard).toBeVisible();
  };


  // deleting completed task and verifying
  deleteCompletedTaskAndVerify = async ({ taskName }: TaskDetails): Promise<void> => {
    const completedTaskInDashboard = this.getTask({ type: DASHBOARD_TEXTS.completed, taskName });
    await completedTaskInDashboard.getByTestId(TASKS_TABLE_SELECTORS.deleteTaskButton).click();
    await expect(completedTaskInDashboard).toBeHidden();
    await expect(this.getTask({ type: DASHBOARD_TEXTS.pending, taskName })).toBeHidden();
  };

  // starring pending task and verifying
  starTaskAndVerify = async ({ taskName }: TaskDetails): Promise<void> => {
    const starIcon = this.getStarIcon({ taskName })
    await starIcon.click();
    await expect(starIcon).toHaveClass(DASHBOARD_TEXTS.starredTaskClass);
    // for concurrency this one preferred
    // await expect(this.getTask({ type: 'pending' }).filter({ hasText: taskName })).toBeVisible();
    // it is preferred if backend actually sorted task and moved to top
    // according to our backend and test we need it to be on top that's why using nth
    await expect(this.getTask({ type: DASHBOARD_TEXTS.pending }).nth(1)).toContainText(taskName);
  }

  // un-starring pending task and verifying
  unstarTaskAndVerify = async ({ taskName }: TaskDetails) => {
    const starIcon = this.getStarIcon({ taskName });
    await starIcon.click();
    await expect(starIcon).toHaveClass(DASHBOARD_TEXTS.unStarredTaskClass);
  }

  openTask = async ({ taskName }: TaskDetails) => {
    const taskRow = this.getTask({ type: DASHBOARD_TEXTS.pending , taskName });
    await taskRow.getByText(new RegExp(taskName, "i")).click();
  }

  verifyTaskDoesNotExist = async ({ taskName }: TaskDetails) => {
    const taskInPendingBoard = this.getTask({ type: DASHBOARD_TEXTS.pending, taskName: new RegExp(taskName, "i") });
    await expect(taskInPendingBoard).toBeHidden();
    const taskInCompletedBoard = this.getTask({ type: DASHBOARD_TEXTS.completed, taskName: new RegExp(taskName, "i") });
    await expect(taskInCompletedBoard).toBeHidden();
  }


  // helper private methods
  private getStarIcon = ({ taskName }: TaskDetails) => {
    return this.getTask({ type: DASHBOARD_TEXTS.pending, taskName }).getByTestId(TASKS_TABLE_SELECTORS.starUnstarButton);
  }

  private getTask = ({ type, taskName }: DashboardTaskDetails) => {
    const table = this.getTaskDashboard(type);
    return taskName ? table.getByRole("row", { name: taskName }) : table.getByRole("row");
  }

  private getTaskDashboard = (type: string) => {
    return this.page.getByTestId(type === DASHBOARD_TEXTS.pending ? TASKS_TABLE_SELECTORS.pendingTasksTable : TASKS_TABLE_SELECTORS.completedTasksTable);
  }
}
