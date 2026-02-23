import { render, screen } from "@testing-library/react";
import { Footer } from "../../components/home";

describe("Footer", () => {
  it("renders the footer content", () => {
    render(<Footer />);

    expect(screen.getByText("Movies Platform Assessment")).toBeInTheDocument();
  });
});
