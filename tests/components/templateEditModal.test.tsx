/** @jest-environment jsdom */

import "@testing-library/jest-dom";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { TemplateEditModal } from "@/components/add-info/sections/templateEditModal";
import { apiClient } from "@/services/api-client";

jest.mock("@/services/api-client", () => ({
  apiClient: {
    partners: {
      getByEdrpou: jest.fn(),
    },
    templates: {
      update: jest.fn(),
    },
  },
}));

jest.mock("@/lib/hooks/use-toast", () => ({
  toast: {
    success: jest.fn(),
    error: jest.fn(),
  },
}));

const mockedGetByEdrpou = apiClient.partners.getByEdrpou as jest.Mock;
const mockedUpdate = apiClient.templates.update as jest.Mock;

const template = {
  id: 10,
  name: "Template name",
  date: new Date("2026-07-07"),
  account_number: "INV-77",
  partner_account_number_id: 5,
  account_sum: 1200,
  account_sum_expression: "",
  vat_type: true,
  vat_percent: 20,
  purpose_of_payment: "Назначение",
  is_auto_purpose_of_payment: false,
  note: "Примечание",
  edrpou: "12345678",
  entity_id: 1,
  partner_id: 2,
  partner: {
    short_name: "Partner",
    full_name: "Partner Full",
  },
  partner_account_number: {
    bank_account: "UA123456789012345678901234567",
    bank_name: "Mono",
    mfo: "305299",
  },
} as any;

describe("TemplateEditModal", () => {
  beforeAll(() => {
    class ResizeObserverMock {
      observe() {}
      unobserve() {}
      disconnect() {}
    }

    Object.defineProperty(window, "ResizeObserver", {
      writable: true,
      configurable: true,
      value: ResizeObserverMock,
    });
  });

  beforeEach(() => {
    jest.clearAllMocks();
    mockedGetByEdrpou.mockResolvedValue({
      partner_account_number: [
        {
          id: 5,
          bank_account: "UA123456789012345678901234567",
          bank_name: "Mono",
          is_default: true,
          is_deleted: false,
          is_visible: true,
        },
      ],
    });
    mockedUpdate.mockResolvedValue({ success: true, message: "ok" });
  });

  it("initializes checkbox from template.is_auto_purpose_of_payment", async () => {
    render(<TemplateEditModal template={template} open onOpenChange={jest.fn()} onSaved={jest.fn()} />);

    const checkbox = await screen.findByRole("checkbox");

    expect(checkbox).toHaveAttribute("data-state", "unchecked");
  });

  it("submits explicit is_auto_purpose_of_payment=false when checkbox is unchecked", async () => {
    const onSaved = jest.fn();
    const onOpenChange = jest.fn();

    render(<TemplateEditModal template={template} open onOpenChange={onOpenChange} onSaved={onSaved} />);

    await waitFor(() => expect(mockedGetByEdrpou).toHaveBeenCalledWith("12345678", 1));

    const checkbox = screen.getByRole("checkbox");
    expect(checkbox).toHaveAttribute("data-state", "unchecked");

    await userEvent.click(screen.getByRole("button", { name: "Сохранить" }));

    await waitFor(() => expect(mockedUpdate).toHaveBeenCalled());

    expect(mockedUpdate).toHaveBeenCalledWith(
      10,
      expect.objectContaining({
        is_auto_purpose_of_payment: false,
      }),
    );
    expect(onSaved).toHaveBeenCalled();
    expect(onOpenChange).toHaveBeenCalledWith(false);
  });
});
