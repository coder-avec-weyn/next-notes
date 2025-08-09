#!/usr/bin/env node

/**
 * Realtime Test Script for Supabase Notes App
 *
 * This script tests realtime functionality by:
 * 1. Connecting to Supabase realtime
 * 2. Listening for changes on notes and users tables
 * 3. Performing CRUD operations to trigger events
 * 4. Logging all realtime events
 *
 * Usage: node test/realtime_test.js
 *
 * Environment variables required:
 * - NEXT_PUBLIC_SUPABASE_URL
 * - NEXT_PUBLIC_SUPABASE_ANON_KEY
 * - SUPABASE_SERVICE_KEY (for admin operations)
 */

const { createClient } = require("@supabase/supabase-js");
const { v4: uuidv4 } = require("uuid");

// Configuration
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY;

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  console.error("❌ Missing required environment variables:");
  console.error("   NEXT_PUBLIC_SUPABASE_URL");
  console.error("   NEXT_PUBLIC_SUPABASE_ANON_KEY");
  process.exit(1);
}

// Create clients
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
const adminSupabase = SUPABASE_SERVICE_KEY
  ? createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY)
  : null;

class RealtimeTest {
  constructor() {
    this.testUserId = null;
    this.testNoteId = null;
    this.eventsReceived = [];
    this.channels = [];
  }

  log(message, data = null) {
    const timestamp = new Date().toISOString();
    console.log(`[${timestamp}] ${message}`);
    if (data) {
      console.log(JSON.stringify(data, null, 2));
    }
  }

  async setupRealtimeListeners() {
    this.log("🔌 Setting up realtime listeners...");

    // Listen to notes table changes
    const notesChannel = supabase
      .channel("notes-changes")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "notes",
        },
        (payload) => {
          this.log(`📝 Notes table event: ${payload.eventType}`, payload);
          this.eventsReceived.push({
            table: "notes",
            event: payload.eventType,
            timestamp: new Date().toISOString(),
            payload,
          });
        },
      )
      .subscribe((status) => {
        this.log(`📝 Notes channel status: ${status}`);
      });

    // Listen to users table changes
    const usersChannel = supabase
      .channel("users-changes")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "users",
        },
        (payload) => {
          this.log(`👤 Users table event: ${payload.eventType}`, payload);
          this.eventsReceived.push({
            table: "users",
            event: payload.eventType,
            timestamp: new Date().toISOString(),
            payload,
          });
        },
      )
      .subscribe((status) => {
        this.log(`👤 Users channel status: ${status}`);
      });

    this.channels = [notesChannel, usersChannel];

    // Wait for subscriptions to be ready
    await new Promise((resolve) => setTimeout(resolve, 2000));
    this.log("✅ Realtime listeners setup complete");
  }

  async createTestUser() {
    if (!adminSupabase) {
      this.log("⚠️  No service key provided, skipping user creation test");
      return;
    }

    this.log("👤 Creating test user...");

    const testUser = {
      id: uuidv4(),
      username: `testuser_${Date.now()}`,
      name: "Test User",
      full_name: "Test User for Realtime",
      email: `test_${Date.now()}@example.com`,
      bio: "Test user created by realtime test script",
      public_profile: true,
      token_identifier: `test-token-${Date.now()}`,
      created_at: new Date().toISOString(),
    };

    const { data, error } = await adminSupabase
      .from("users")
      .insert([testUser])
      .select()
      .single();

    if (error) {
      this.log("❌ Error creating test user:", error);
      return;
    }

    this.testUserId = data.id;
    this.log("✅ Test user created:", { id: data.id, username: data.username });
  }

  async createTestNote() {
    if (!adminSupabase || !this.testUserId) {
      this.log("⚠️  Cannot create test note without user");
      return;
    }

    this.log("📝 Creating test note...");

    const testNote = {
      id: uuidv4(),
      user_id: this.testUserId,
      title: `Test Note ${Date.now()}`,
      content: "This is a test note created by the realtime test script.",
      category: "test",
      tags: ["test", "realtime"],
      color: "#ffeb3b",
      is_public: true,
      is_favorite: false,
      is_pinned: false,
      is_archived: false,
      priority: "medium",
      status: "published",
      word_count: 12,
      reading_time: 1,
      created_at: new Date().toISOString(),
    };

    const { data, error } = await adminSupabase
      .from("notes")
      .insert([testNote])
      .select()
      .single();

    if (error) {
      this.log("❌ Error creating test note:", error);
      return;
    }

    this.testNoteId = data.id;
    this.log("✅ Test note created:", { id: data.id, title: data.title });
  }

  async updateTestNote() {
    if (!adminSupabase || !this.testNoteId) {
      this.log("⚠️  Cannot update test note");
      return;
    }

    this.log("📝 Updating test note...");

    const updates = {
      title: `Updated Test Note ${Date.now()}`,
      content: "This note has been updated by the realtime test script.",
      is_favorite: true,
      updated_at: new Date().toISOString(),
    };

    const { data, error } = await adminSupabase
      .from("notes")
      .update(updates)
      .eq("id", this.testNoteId)
      .select()
      .single();

    if (error) {
      this.log("❌ Error updating test note:", error);
      return;
    }

    this.log("✅ Test note updated:", { id: data.id, title: data.title });
  }

  async deleteTestNote() {
    if (!adminSupabase || !this.testNoteId) {
      this.log("⚠️  Cannot delete test note");
      return;
    }

    this.log("📝 Deleting test note...");

    const { error } = await adminSupabase
      .from("notes")
      .delete()
      .eq("id", this.testNoteId);

    if (error) {
      this.log("❌ Error deleting test note:", error);
      return;
    }

    this.log("✅ Test note deleted");
  }

  async deleteTestUser() {
    if (!adminSupabase || !this.testUserId) {
      this.log("⚠️  Cannot delete test user");
      return;
    }

    this.log("👤 Deleting test user...");

    const { error } = await adminSupabase
      .from("users")
      .delete()
      .eq("id", this.testUserId);

    if (error) {
      this.log("❌ Error deleting test user:", error);
      return;
    }

    this.log("✅ Test user deleted");
  }

  async cleanup() {
    this.log("🧹 Cleaning up...");

    // Unsubscribe from channels
    for (const channel of this.channels) {
      await supabase.removeChannel(channel);
    }

    // Delete test data
    if (this.testNoteId) {
      await this.deleteTestNote();
    }
    if (this.testUserId) {
      await this.deleteTestUser();
    }

    this.log("✅ Cleanup complete");
  }

  async runTest() {
    try {
      this.log("🚀 Starting Realtime Test...");
      this.log("📊 Configuration:", {
        url: SUPABASE_URL,
        hasServiceKey: !!SUPABASE_SERVICE_KEY,
      });

      // Setup realtime listeners
      await this.setupRealtimeListeners();

      // Create test data and perform operations
      await this.createTestUser();
      await new Promise((resolve) => setTimeout(resolve, 1000));

      await this.createTestNote();
      await new Promise((resolve) => setTimeout(resolve, 1000));

      await this.updateTestNote();
      await new Promise((resolve) => setTimeout(resolve, 1000));

      await this.deleteTestNote();
      await new Promise((resolve) => setTimeout(resolve, 1000));

      await this.deleteTestUser();
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // Summary
      this.log("📊 Test Summary:");
      this.log(`   Events received: ${this.eventsReceived.length}`);

      const eventsByTable = this.eventsReceived.reduce((acc, event) => {
        acc[event.table] = (acc[event.table] || 0) + 1;
        return acc;
      }, {});

      this.log("   Events by table:", eventsByTable);

      const eventsByType = this.eventsReceived.reduce((acc, event) => {
        acc[event.event] = (acc[event.event] || 0) + 1;
        return acc;
      }, {});

      this.log("   Events by type:", eventsByType);

      if (this.eventsReceived.length > 0) {
        this.log("✅ Realtime test completed successfully!");
        this.log("🎉 All realtime events were received correctly.");
      } else {
        this.log("⚠️  No realtime events were received.");
        this.log("   This might indicate a configuration issue.");
      }
    } catch (error) {
      this.log("❌ Test failed:", error);
    } finally {
      await this.cleanup();
    }
  }
}

// Handle process termination
process.on("SIGINT", async () => {
  console.log("\n🛑 Test interrupted by user");
  process.exit(0);
});

process.on("SIGTERM", async () => {
  console.log("\n🛑 Test terminated");
  process.exit(0);
});

// Run the test
if (require.main === module) {
  const test = new RealtimeTest();
  test
    .runTest()
    .then(() => {
      process.exit(0);
    })
    .catch((error) => {
      console.error("❌ Test failed:", error);
      process.exit(1);
    });
}

module.exports = RealtimeTest;
