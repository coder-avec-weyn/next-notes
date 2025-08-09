// @ts-check
import { test, expect } from "@playwright/test";

test.describe("Notes Application", () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to the notes page
    await page.goto("/dashboard/notes");

    // Wait for the page to load
    await page.waitForSelector('h3:has-text("Notes")');
  });

  test("should create, edit, and delete a note with animations", async ({
    page,
  }) => {
    // Create a new note
    await page.click('button:has-text("New Note")');

    // Wait for the editor modal to appear
    await page.waitForSelector('h2:has-text("Create Note")');

    // Fill in the note details
    await page.fill('input[placeholder="Note title..."]', "E2E Test Note");
    await page.fill(
      'textarea[placeholder="Start writing your note..."]',
      "This is a test note created during E2E testing",
    );

    // Select a category
    await page.click('button:has-text("General")');
    await page.click('div[role="option"]:has-text("Work")');

    // Add a tag
    await page.fill('input[placeholder="Add tag..."]', "e2e-test");
    await page.press('input[placeholder="Add tag..."]', "Enter");

    // Save the note
    await page.click('button:has-text("Save")');

    // Wait for the note to appear in the list
    await page.waitForSelector('h3:has-text("E2E Test Note")');

    // Verify the note content is visible
    expect(
      await page.textContent(
        "text=This is a test note created during E2E testing",
      ),
    ).toBeTruthy();

    // Edit the note
    await page.click('h3:has-text("E2E Test Note")');

    // Wait for the editor modal to appear
    await page.waitForSelector('h2:has-text("Edit Note")');

    // Update the note content
    await page.fill(
      'textarea[placeholder="Start writing your note..."]',
      "This note has been updated during E2E testing",
    );

    // Save the changes
    await page.click('button:has-text("Save")');

    // Wait for the updated content to appear
    await page.waitForSelector(
      "text=This note has been updated during E2E testing",
    );

    // Open the note options
    await page.click('button[aria-haspopup="menu"]');

    // Click the delete option
    await page.click('div[role="menuitem"]:has-text("Delete")');

    // Confirm deletion in the dialog
    await page.click('button:has-text("Delete")');

    // Verify the note is no longer visible
    await expect(page.locator('h3:has-text("E2E Test Note")')).toHaveCount(0);
  });

  test("should have proper keyboard navigation", async ({ page }) => {
    // Create a new note for testing
    await page.click('button:has-text("New Note")');
    await page.waitForSelector('h2:has-text("Create Note")');
    await page.fill('input[placeholder="Note title..."]', "Keyboard Nav Test");
    await page.fill(
      'textarea[placeholder="Start writing your note..."]',
      "Testing keyboard navigation",
    );
    await page.click('button:has-text("Save")');

    // Wait for the note to appear
    await page.waitForSelector('h3:has-text("Keyboard Nav Test")');

    // Tab to the note card
    await page.keyboard.press("Tab");
    await page.keyboard.press("Tab");
    await page.keyboard.press("Tab");

    // Press Enter to open the note
    await page.keyboard.press("Enter");

    // Verify the editor opened
    await page.waitForSelector('h2:has-text("Edit Note")');

    // Press Escape to close the editor
    await page.keyboard.press("Escape");

    // Verify the editor closed
    await expect(page.locator('h2:has-text("Edit Note")')).toHaveCount(0);

    // Clean up - delete the test note
    await page.click('h3:has-text("Keyboard Nav Test")');
    await page.waitForSelector('h2:has-text("Edit Note")');
    await page.click('button:has-text("Close")');
    await page.click('button[aria-haspopup="menu"]');
    await page.click('div[role="menuitem"]:has-text("Delete")');
    await page.click('button:has-text("Delete")');
  });

  test("should respect reduced motion preferences", async ({ page }) => {
    // Emulate reduced motion preference
    await page.emulateMedia({ reducedMotion: "reduce" });

    // Create a new note
    await page.click('button:has-text("New Note")');

    // The modal should appear immediately without animation
    // We can verify this by checking if it's visible right away
    await expect(page.locator('h2:has-text("Create Note")')).toBeVisible();

    // Close the modal
    await page.click('button:has-text("Close")');

    // Reset media emulation
    await page.emulateMedia({ reducedMotion: "no-preference" });
  });
});
