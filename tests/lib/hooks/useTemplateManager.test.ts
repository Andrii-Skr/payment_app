import { useTemplateManager } from "@/lib/hooks/useTemplateManager";
import { TemplateWithBankDetails } from "@api/templates/[id]/route";

describe("confirmTemplateReplace", () => {
  it("keeps selectedAccount from template", () => {
    const tpl = {
      id: 1,
      entity_id: 1,
      name: "tpl",
      partner_id: 2,
      account_number: "",
      account_sum: 0,
      account_sum_expression: null,
      date: null,
      vat_type: true,
      vat_percent: 20,
      purpose_of_payment: "purpose",
      note: "",
      edrpou: "12345",
      partner_account_number_id: 2,
      partner: { short_name: "short", full_name: "full" },
      partner_account_number: {
        bank_account: "2222",
        mfo: "222",
        bank_name: "Bank2",
      },
      is_deleted: false,
      is_visible: true,
      created_at: new Date(),
      updated_at: new Date(),
    } as unknown as TemplateWithBankDetails;

    const { confirmTemplateReplace } = useTemplateManager({
      reset: jest.fn(),
      getValues: jest.fn(),
      entityIdNum: 1,
      setTemplatesList: jest.fn(),
    });

    const values = confirmTemplateReplace(tpl);
    expect(values.selectedAccount).toBe("2222");
    expect(values.partner_account_number_id).toBe(2);
  });
});

/** Helper replicating AccountsCombobox effect */
function applyAccountEffect(params: {
  edrpou: string;
  short_name: string;
  selectedAccountValue: string | null;
  selectedId: number | null | undefined;
  accounts: { id: number; bank_account: string; is_default: boolean; mfo?: string | null; bank_name?: string | null }[];
}) {
  const { edrpou, short_name, selectedAccountValue, selectedId, accounts } = params;
  const result = {
    partner_account_number_id: selectedId ?? null,
    selectedAccount: selectedAccountValue ?? "",
  };

  if (!edrpou && !short_name) {
    return { partner_account_number_id: null, selectedAccount: "" };
  }

  if (selectedAccountValue !== "" && selectedAccountValue !== null) {
    return result;
  }

  if (
    selectedId !== undefined &&
    selectedId !== null &&
    accounts.some((a) => a.id === selectedId)
  ) {
    return result;
  }

  const defaultAccount = accounts.find((a) => a.is_default);
  if (defaultAccount) {
    return {
      partner_account_number_id: defaultAccount.id,
      selectedAccount: defaultAccount.bank_account,
    };
  }
  return { partner_account_number_id: null, selectedAccount: "" };
}

describe("applyAccountEffect", () => {
  it("does not overwrite selectedAccount when not empty", () => {
    const accounts = [
      { id: 1, bank_account: "3333", is_default: true },
      { id: 2, bank_account: "2222", is_default: false },
    ];

    const res = applyAccountEffect({
      edrpou: "123",
      short_name: "name",
      selectedAccountValue: "2222",
      selectedId: 2,
      accounts,
    });

    expect(res.selectedAccount).toBe("2222");
    expect(res.partner_account_number_id).toBe(2);
  });
});
