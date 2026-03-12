import {defineConfig, devices} from "@playwright/test";

// file to store the session details
export const STORAGE_STATE = "./auth/user.json";

export default defineConfig({
  testDir: "./e2e",
  // folder containing all tests

  fullyParallel: true,
  // by default playwright runs different test files in parallel but tests inside the same file sequentially
  // setting this it to true so that Playwright run every single test block simultaneously , regardless of what file it is in

  forbidOnly: !!process.env.CI,
  // if false it allows us to use test.only() annotation

  retries: process.env.CI ? 2 : 0,
  // the number of times Playwright will retry test if it fails

  workers: process.env.CI ? 1 : undefined,
  // if undefined , Playwright uses half of CPU cores , but it is recommended to keep it 1 so that server doesn't get overloaded

  reporter: "html",
  // generates clickable HTML report after the test finishes

  use: {
    // traces are heavy files containing screenshots , network logs , DOM snapshots
    // by keeping it on-first-retry , Playwright will only record heavy-data if the test fails the first time and has to run again
    trace: "on-first-retry",
    // baseURL we will be using for our testing
    baseURL: "http://localhost:3000",
  },

  // mainly used to test different browsers
  projects: [
    // here it is for execution pipeline
    {
      // this phase is for logging of the user and store the cookies into storage file
      name: "login",
      use: {
        ...devices["Desktop Chrome"]
      },
      testMatch: "**/login.setup.ts",
    },

    {
      name: "teardown",
      use: {
        ...devices["Desktop Chrome"]
      },
      testMatch: "**/global.teardown.ts",
    },

    // main tests to run
    {
      name: "Logged In tests",
      use: {
        ...devices["Desktop Chrome"],
        // storageState to use
        storageState: STORAGE_STATE,
      },
      // by setting login dependencies , Playwright waits until phase 1 project completes
      dependencies: ["login"],
      teardown: "teardown",
      testMatch: "**/*.spec.ts",
      testIgnore: "**/register.spec.ts"
    },
    {

      // isolated tests like here register tests
      name: "Logged out tests",
      use: {
        ...devices["Desktop Chrome"]
      },
      testMatch: "**/register.spec.ts",
    },
  ]
})
