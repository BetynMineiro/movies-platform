import { fireEvent, render, screen } from "@testing-library/react";
import AddRatingModal from "../../components/ratings/AddRatingModal";

describe("AddRatingModal", () => {
  it("does not render when closed", () => {
    render(
      <AddRatingModal isOpen={false} onSave={jest.fn()} onCancel={jest.fn()} />,
    );

    expect(screen.queryByText(/Add rating/)).not.toBeInTheDocument();
  });

  it("renders and saves when form is valid", () => {
    const onSave = jest.fn();

    render(
      <AddRatingModal
        isOpen
        movieTitle="Inception"
        onSave={onSave}
        onCancel={jest.fn()}
      />,
    );

    fireEvent.change(screen.getByPlaceholderText("Nome do avaliador"), {
      target: { value: "Maria" },
    });
    fireEvent.change(screen.getByPlaceholderText("Descricao do rating"), {
      target: { value: "Muito bom" },
    });
    fireEvent.change(screen.getByPlaceholderText("0-10"), {
      target: { value: "8" },
    });

    fireEvent.click(screen.getByRole("button", { name: "Save" }));

    expect(onSave).toHaveBeenCalledWith({
      reviewer: "Maria",
      comment: "Muito bom",
      rating: 8,
    });
  });

  it("calls onCancel when cancel is clicked", () => {
    const onCancel = jest.fn();

    render(<AddRatingModal isOpen onSave={jest.fn()} onCancel={onCancel} />);

    fireEvent.click(screen.getByRole("button", { name: "Cancel" }));

    expect(onCancel).toHaveBeenCalled();
  });

  it("does not allow score outside 0-10", () => {
    const onSave = jest.fn();

    render(<AddRatingModal isOpen onSave={onSave} onCancel={jest.fn()} />);

    fireEvent.change(screen.getByPlaceholderText("Nome do avaliador"), {
      target: { value: "Maria" },
    });
    fireEvent.change(screen.getByPlaceholderText("Descricao do rating"), {
      target: { value: "Muito bom" },
    });
    fireEvent.change(screen.getByPlaceholderText("0-10"), {
      target: { value: "11" },
    });

    fireEvent.click(screen.getByRole("button", { name: "Save" }));

    expect(onSave).not.toHaveBeenCalled();
  });
});
