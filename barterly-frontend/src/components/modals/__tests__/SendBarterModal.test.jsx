import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { describe, test, expect, vi, beforeEach } from "vitest";
import SendBarterModal from "../SendBarterModal";
import skillService from "../../../services/skillService";
import barterService from "../../../services/barterService";

// Mock the services
vi.mock("../../../services/skillService", () => ({
  default: {
    getMySkills: vi.fn(),
  },
}));

vi.mock("../../../services/barterService", () => ({
  default: {
    createBarterRequest: vi.fn(),
  },
}));

// Mock window.alert
const mockAlert = vi.spyOn(window, "alert").mockImplementation(() => {});

describe("SendBarterModal Component", () => {
  const requestedSkill = {
    _id: "skill-id-123",
    title: "React Programming",
    offeredBy: {
      _id: "user-id-456",
      name: "Sarah Jones",
    },
  };

  const defaultProps = {
    isOpen: true,
    onClose: vi.fn(),
    requestedSkill,
  };

  beforeEach(() => {
    vi.clearAllMocks();
    mockAlert.mockClear();
  });

  test("does not render when isOpen is false", () => {
    const { container } = render(<SendBarterModal {...defaultProps} isOpen={false} />);
    expect(container.firstChild).toBeNull();
  });

  test("renders modal with requested skill title when open", async () => {
    skillService.getMySkills.mockResolvedValueOnce({ data: [] });
    render(<SendBarterModal {...defaultProps} />);

    expect(screen.getByText("Send Barter Request")).toBeInTheDocument();
    expect(screen.getByText("React Programming")).toBeInTheDocument();
  });

  test("fetches and displays user's active skills", async () => {
    const mockSkills = [
      { _id: "my-skill-1", title: "Graphic Design", isActive: true, category: { name: "Design" } },
      { _id: "my-skill-2", title: "Inactive Skill", isActive: false },
    ];
    skillService.getMySkills.mockResolvedValueOnce({ data: mockSkills });

    render(<SendBarterModal {...defaultProps} />);

    // Wait for loading to finish
    await waitFor(() => {
      expect(screen.getByText("Graphic Design • Design")).toBeInTheDocument();
    });

    // Inactive skill should be filtered out
    expect(screen.queryByText(/Inactive Skill/)).toBeNull();
  });

  test("displays error message when user has no active skills", async () => {
    skillService.getMySkills.mockResolvedValueOnce({ data: [] });

    render(<SendBarterModal {...defaultProps} />);

    await waitFor(() => {
      expect(
        screen.getByText("You don't have any active skills to offer. Please create a skill first.")
      ).toBeInTheDocument();
    });
  });

  test("calls createBarterRequest on successful form submission", async () => {
    const mockSkills = [
      { _id: "my-skill-1", title: "Graphic Design", isActive: true, category: { name: "Design" } },
    ];
    skillService.getMySkills.mockResolvedValueOnce({ data: mockSkills });
    barterService.createBarterRequest.mockResolvedValueOnce({ data: { success: true } });

    render(<SendBarterModal {...defaultProps} />);

    // Wait for skills to load
    await waitFor(() => {
      expect(screen.getByLabelText(/You Offer:/i)).toBeInTheDocument();
    });

    // Select skill
    fireEvent.change(screen.getByLabelText(/You Offer:/i), {
      target: { value: "my-skill-1" },
    });

    // Input message
    fireEvent.change(screen.getByLabelText(/Add a Message:/i), {
      target: { value: "Let's swap!" },
    });

    // Submit form
    fireEvent.submit(screen.getByRole("button", { name: /Send Request/i }));

    await waitFor(() => {
      expect(barterService.createBarterRequest).toHaveBeenCalledWith({
        receiverId: "user-id-456",
        offeredSkillId: "my-skill-1",
        requestedSkillId: "skill-id-123",
        message: "Let's swap!",
      });
      expect(mockAlert).toHaveBeenCalledWith("Barter request sent successfully!");
      expect(defaultProps.onClose).toHaveBeenCalled();
    });
  });

  test("matches snapshot when open", async () => {
    skillService.getMySkills.mockResolvedValueOnce({ data: [] });
    const { asFragment } = render(<SendBarterModal {...defaultProps} />);
    expect(asFragment()).toMatchSnapshot();
  });
});
