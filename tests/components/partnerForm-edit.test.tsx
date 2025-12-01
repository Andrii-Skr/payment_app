/** @jest-environment jsdom */

import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { PartnerForm } from "@/components/add-info/sections/partnerForm";
import { apiClient } from "@/services/api-client";

jest.mock("@/services/api-client", () => ({
  apiClient: {
    partners: {
      updatePartner: jest.fn(),
    },
  },
}));

const mockedUpdate = apiClient.partners.updatePartner as jest.Mock;

describe("PartnerForm edit", () => {
  beforeEach(() => {
    mockedUpdate.mockResolvedValue(undefined);
  });

  it("submits without bank_account field", async () => {
    const onSaved = jest.fn();

    render(
      <PartnerForm
        mode="edit"
        entityId={1}
        initialValues={{ id: 5, full_name: "Name", short_name: "S", edrpou: "12345678" }}
        onSaved={onSaved}
      />,
    );

    await userEvent.clear(screen.getByLabelText("Полное имя"));
    await userEvent.type(screen.getByLabelText("Полное имя"), "New Name");
    await userEvent.clear(screen.getByLabelText("Короткое имя"));
    await userEvent.type(screen.getByLabelText("Короткое имя"), "NNN");

    await userEvent.click(screen.getByRole("button", { name: "Сохранить" }));

    await waitFor(() => expect(mockedUpdate).toHaveBeenCalled());
    expect(mockedUpdate).toHaveBeenCalledWith(5, { full_name: "New Name", short_name: "NNN" });
    expect(onSaved).toHaveBeenCalled();
  });
});
