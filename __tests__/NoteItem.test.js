import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { NoteItem } from "../src/components/note-item";
import { useNotes } from "../src/hooks/use-notes";

// Mock the useNotes hook
jest.mock("../src/hooks/use-notes", () => ({
  useNotes: jest.fn(),
}));

// Mock the useToast hook
jest.mock("../src/components/ui/use-toast", () => ({
  useToast: () => ({
    toast: jest.fn(),
  }),
}));

// Mock framer-motion
jest.mock("framer-motion", () => ({
  motion: {
    div: ({ children, ...props }) => <div {...props}>{children}</div>,
  },
  AnimatePresence: ({ children }) => <>{children}</>,
}));

describe("NoteItem component", () => {
  const mockNote = {
    id: "note1",
    title: "Test Note",
    content: "This is a test note content",
    tags: ["test", "react"],
    category: "general",
    color: "#ffffff",
    is_favorite: false,
    is_pinned: false,
    is_archived: false,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  const mockFunctions = {
    toggleFavorite: jest.fn(),
    togglePin: jest.fn(),
    toggleArchive: jest.fn(),
    deleteNote: jest.fn(),
    duplicateNote: jest.fn(),
    exportNotes: jest.fn(),
  };

  beforeEach(() => {
    useNotes.mockReturnValue(mockFunctions);
  });

  it("renders note content correctly", () => {
    render(<NoteItem note={mockNote} viewMode="grid" onEdit={() => {}} />);

    expect(screen.getByText("Test Note")).toBeInTheDocument();
    expect(screen.getByText("This is a test note content")).toBeInTheDocument();
    expect(screen.getByText("test")).toBeInTheDocument();
    expect(screen.getByText("react")).toBeInTheDocument();
  });

  it("calls onEdit when clicked", () => {
    const onEditMock = jest.fn();
    render(<NoteItem note={mockNote} viewMode="grid" onEdit={onEditMock} />);

    fireEvent.click(screen.getByText("Test Note"));
    expect(onEditMock).toHaveBeenCalled();
  });

  it("toggles favorite status when favorite button is clicked", () => {
    render(<NoteItem note={mockNote} viewMode="grid" onEdit={() => {}} />);

    fireEvent.click(screen.getByRole("button", { name: /star/i }));
    expect(mockFunctions.toggleFavorite).toHaveBeenCalledWith("note1", true);
  });

  it("toggles pin status when pin button is clicked", () => {
    render(<NoteItem note={mockNote} viewMode="grid" onEdit={() => {}} />);

    // Open dropdown menu first
    fireEvent.click(screen.getByRole("button", { name: /more vertical/i }));

    // Click the pin option
    fireEvent.click(screen.getByText("Pin"));
    expect(mockFunctions.togglePin).toHaveBeenCalledWith("note1", true);
  });

  it("toggles archive status when archive button is clicked", () => {
    render(<NoteItem note={mockNote} viewMode="grid" onEdit={() => {}} />);

    // Open dropdown menu first
    fireEvent.click(screen.getByRole("button", { name: /more vertical/i }));

    // Click the archive option
    fireEvent.click(screen.getByText("Archive"));
    expect(mockFunctions.toggleArchive).toHaveBeenCalledWith("note1", true);
  });

  it("supports keyboard navigation", () => {
    const onEditMock = jest.fn();
    render(<NoteItem note={mockNote} viewMode="grid" onEdit={onEditMock} />);

    const noteElement = screen.getByRole("article");

    // Test Enter key
    fireEvent.keyDown(noteElement, { key: "Enter" });
    expect(onEditMock).toHaveBeenCalled();

    // Test Space key
    onEditMock.mockClear();
    fireEvent.keyDown(noteElement, { key: " " });
    expect(onEditMock).toHaveBeenCalled();
  });
});
