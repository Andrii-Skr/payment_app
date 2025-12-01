/** @jest-environment node */

import { useTemplateManager } from "@/lib/hooks/useTemplateManager";

describe("confirmTemplateReplace", () => {
  it("устанавливает selectedAccount как null, если счёт отсутствует", () => {
    const { confirmTemplateReplace } = useTemplateManager({
      getValues: jest.fn(),
      entityIdNum: 1,
      setTemplatesList: jest.fn(),
    });

    const tpl: any = {
      name: "tpl",
      entity_id: 1,
      partner_id: 2,
      account_number: "",
      account_sum: null,
      account_sum_expression: null,
      date: null,
      vat_type: true,
      vat_percent: 20,
      purpose_of_payment: "",
      note: "",
      edrpou: "",
      partner_account_number: null,
      partner_account_number_id: null,
      partner: { full_name: "full", short_name: "short" },
    };

    const result = confirmTemplateReplace(tpl);

    expect(result.selectedAccount).toBeNull();
  });
});
