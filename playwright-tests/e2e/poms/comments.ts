import { expect, Page } from "@playwright/test";

interface CommentDetails {
  comment: string
}

export default class CommentPage {

  page: Page;

  constructor(page: Page) {
    this.page = page;
  }

  createCommentAndVerify = async ({ comment }: CommentDetails) => {

    // create comment
    await this.page.getByTestId('comments-text-field').fill(comment);
    await this.page.getByTestId('comments-submit-button').click();

    // comment should be visible
    await this.verifyComment({comment});
  };

  verifyComment = async({comment}: CommentDetails) => {
    const commentsList = this.page.getByTestId('task-comment');
    await expect(commentsList.filter({hasText: comment})).toBeVisible();
  }

  getCommentCount = async () => {
    const commentsList = this.page.getByTestId('task-comment');
    return await commentsList.count();
  }

  deleteTask = async() => {
    await this.page.locator('i').nth(2).click();
  }
}

