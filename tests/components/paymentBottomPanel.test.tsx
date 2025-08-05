/** @jest-environment jsdom */

import React from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { PaymentBottomPanel } from "@/components/payment-schedule/paymentBottomPanel";
import { usePaymentStore } from "@/store/paymentStore";
import { PaymentDetail } from "@/types/types";
import "@testing-library/jest-dom";

const samplePayment: PaymentDetail = {
  doc_id: 1,
  entity_id: 1,
  spec_doc_id: 1,
  partner_id: 1,
  partner_name: "Partner",
  partner_edrpou: "12345678",
  partner_account_number: "acc1",
  account_number: "acc2",
  purpose_of_payment: "purpose",
  dead_line_date: null,
  date: new Date(),
  pay_sum: 100,
  is_paid: false,
  is_auto_purpose_of_payment: false,
  vat_type: false,
  vat_percent: null,
};

describe("PaymentBottomPanel", () => {
  beforeEach(() => {
    usePaymentStore.setState({
      pendingPayments: [samplePayment],
      isPaymentPanelExpanded: true,
    });
  });

  afterEach(() => {
    usePaymentStore.setState({
      pendingPayments: [],
      isPaymentPanelExpanded: false,
    });
  });

  it("renders clear button and clears store on click", async () => {
    render(
      <PaymentBottomPanel
        pendingPayments={[samplePayment]}
        groupedPayments={{}}
        overallTotal={100}
        onFinalize={jest.fn()}
        onGroupedFinalize={jest.fn()}
        onPay={jest.fn()}
      />
    );

    const clearButton = screen.getByRole("button", { name: "Сбросить выбор" });
    expect(clearButton).toBeInTheDocument();

    await userEvent.click(clearButton);

    expect(usePaymentStore.getState().pendingPayments).toEqual([]);
  });
});

