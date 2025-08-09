import { renderHook, act } from "@testing-library/react-hooks";
import { useNotes } from "../src/hooks/use-notes";

// Mock the fetch function
global.fetch = jest.fn();

// Mock the createClient function
jest.mock("../supabase/client", () => ({
  createClient: jest.fn(() => ({
    channel: jest.fn(() => ({
      on: jest.fn().mockReturnThis(),
      subscribe: jest.fn().mockImplementation((callback) => {
        callback("SUBSCRIBED");
        return {
          unsubscribe: jest.fn(),
        };
      }),
    })),
    removeChannel: jest.fn(),
  })),
}));

// Mock BroadcastChannel
global.BroadcastChannel = jest.fn(() => ({
  postMessage: jest.fn(),
  close: jest.fn(),
  onmessage: jest.fn(),
}));

describe("useNotes hook", () => {
  beforeEach(() => {
    jest.clearAllMocks();

    // Mock successful fetch response
    fetch.mockImplementation(() =>
      Promise.resolve({
        ok: true,
        json: () =>
          Promise.resolve({
            data: [
              {
                id: "note1",
                title: "Test Note",
                content: "Test content",
                tags: [],
                category: "general",
                color: "#ffffff",
                is_favorite: false,
                is_pinned: false,
                is_archived: false,
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString(),
              },
            ],
          }),
      }),
    );
  });

  it("should fetch notes on initialization", async () => {
    const { result, waitForNextUpdate } = renderHook(() => useNotes());

    expect(result.current.loading).toBe(true);

    await waitForNextUpdate();

    expect(result.current.loading).toBe(false);
    expect(result.current.notes).toHaveLength(1);
    expect(result.current.notes[0].title).toBe("Test Note");
    expect(fetch).toHaveBeenCalledWith("/api/notes");
  });

  it("should create a note with optimistic update", async () => {
    const { result, waitForNextUpdate } = renderHook(() => useNotes());

    await waitForNextUpdate();

    const newNote = {
      title: "New Note",
      content: "New content",
      category: "work",
      tags: ["test"],
      color: "#f0f0f0",
    };

    // Mock the response for creating a note
    fetch.mockImplementationOnce(() =>
      Promise.resolve({
        ok: true,
        json: () =>
          Promise.resolve({
            data: {
              id: "new-note-id",
              ...newNote,
              is_favorite: false,
              is_pinned: false,
              is_archived: false,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
            },
          }),
      }),
    );

    // Create the note
    act(() => {
      result.current.createNote(newNote);
    });

    // Check optimistic update
    expect(result.current.notes).toHaveLength(2);
    expect(result.current.notes[0].title).toBe("New Note");
    expect(result.current.notes[0]._isOptimistic).toBe(true);

    await waitForNextUpdate();

    // Check final state after server response
    expect(result.current.notes).toHaveLength(2);
    expect(result.current.notes[0].id).toBe("new-note-id");
    expect(result.current.notes[0]._isOptimistic).toBeUndefined();
  });

  it("should update a note with optimistic update", async () => {
    const { result, waitForNextUpdate } = renderHook(() => useNotes());

    await waitForNextUpdate();

    const noteId = result.current.notes[0].id;
    const updates = {
      title: "Updated Title",
      content: "Updated content",
    };

    // Mock the response for updating a note
    fetch.mockImplementationOnce(() =>
      Promise.resolve({
        ok: true,
        json: () =>
          Promise.resolve({
            data: {
              ...result.current.notes[0],
              ...updates,
              updated_at: new Date().toISOString(),
            },
          }),
      }),
    );

    // Update the note
    act(() => {
      result.current.updateNote(noteId, updates);
    });

    // Check optimistic update
    expect(result.current.notes[0].title).toBe("Updated Title");
    expect(result.current.notes[0]._isOptimistic).toBe(true);

    await waitForNextUpdate();

    // Check final state after server response
    expect(result.current.notes[0].title).toBe("Updated Title");
    expect(result.current.notes[0]._isOptimistic).toBeUndefined();
  });

  it("should delete a note with optimistic update", async () => {
    const { result, waitForNextUpdate } = renderHook(() => useNotes());

    await waitForNextUpdate();

    const noteId = result.current.notes[0].id;

    // Mock the response for deleting a note
    fetch.mockImplementationOnce(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ success: true }),
      }),
    );

    // Delete the note
    act(() => {
      result.current.deleteNote(noteId);
    });

    // Check optimistic update
    expect(result.current.notes).toHaveLength(0);

    await waitForNextUpdate();

    // Check final state after server response
    expect(result.current.notes).toHaveLength(0);
  });

  it("should handle errors when creating a note", async () => {
    const { result, waitForNextUpdate } = renderHook(() => useNotes());

    await waitForNextUpdate();

    // Mock an error response
    fetch.mockImplementationOnce(() =>
      Promise.resolve({
        ok: false,
        json: () => Promise.resolve({ error: "Failed to create note" }),
      }),
    );

    // Try to create a note
    act(() => {
      result.current.createNote({ title: "Error Note" });
    });

    // Check optimistic update
    expect(result.current.notes).toHaveLength(2);

    await waitForNextUpdate();

    // Check rollback after error
    expect(result.current.notes).toHaveLength(1);
    expect(result.current.error).toBe("Failed to create note");
  });
});
