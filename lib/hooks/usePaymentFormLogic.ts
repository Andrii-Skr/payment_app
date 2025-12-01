"use client";

import type { TemplateWithBankDetails } from "@api/templates/[id]/route";
import type { entity } from "@prisma/client";
import type { AxiosError } from "axios";
import { format } from "date-fns";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import React from "react";
import { toast } from "@/lib/hooks/use-toast";
import { TransformedObject } from "@/lib/transformData/doc";
import { apiClient } from "@/services/api-client";
import type { CreateDocumentPayload } from "@/services/documents";
import { useAccountListStore } from "@/store/accountListStore";
import { useDocumentsStore } from "@/store/documentsListStore";
import type { FormValues } from "@/types/formTypes";

type DuplicateCheckResponse = {
  success: false;
  message: string;
  allowDuplicate?: boolean;
};

export function usePaymentFormLogic({
  reset,
  setValue,
  defaultValues,
}: {
  reset: (values: FormValues) => void;
  setValue: (name: keyof FormValues, value: any) => void;
  defaultValues: FormValues;
}) {
  const { entity_id } = useParams();
  const router = useRouter();
  const updateAccountList = useAccountListStore((s) => s.updateAccountList);
  const searchParams = useSearchParams();
  const docIdQuery = searchParams.get("doc_id");
  const entityIdNum = Number(entity_id);

  const [isDuplicateDialogOpen, setDuplicateDialogOpen] = React.useState(false);
  const [pendingDocData, setPendingDocData] = React.useState<CreateDocumentPayload | null>(null);

  const [entity, setEntity] = React.useState<entity | null>(null);
  const [templatesList, setTemplatesList] = React.useState<TemplateWithBankDetails[]>([]);
  const [isTemplateDialogOpen, setTemplateDialogOpen] = React.useState(false);
  const [isReplaceDialogOpen, setIsReplaceDialogOpen] = React.useState(false);
  const [selectedTemplate, setSelectedTemplate] = React.useState<TemplateWithBankDetails | null>(null);

  // Zustand store for documents
  const { docs, fetchDocs } = useDocumentsStore();

  React.useEffect(() => {
    if (entityIdNum) {
      apiClient.entities.getById(entityIdNum).then(setEntity);
      apiClient.templates.getById(entityIdNum).then(setTemplatesList);
      fetchDocs(entityIdNum); // 💡 загружаем список документов из стора
    }
  }, [entityIdNum, fetchDocs]);

  React.useEffect(() => {
    setValue("entity_id", entityIdNum);
  }, [entityIdNum, setValue]);

  React.useEffect(() => {
    const fetchDocument = async () => {
      if (!docIdQuery) return;

      const data = await apiClient.documents.getById(Number(docIdQuery));
      if (data != null) {
        reset(TransformedObject(data));
      }
    };

    fetchDocument();
  }, [docIdQuery, reset]);

  const onSubmit = async (data: FormValues) => {
    if (!data.date) {
      toast.error("Пожалуйста, выберите дату");
      return;
    }

    const payload: CreateDocumentPayload = {
      ...data,
      date: format(data.date, "yyyy-MM-dd"),
    };

    try {
      if (!data.doc_id) {
        await apiClient.documents.create(payload);
        await fetchDocs(entityIdNum);
        toast.success("Документ создан успешно.");

        // 👇 Проверка и автоматическое включение видимости партнёра
        if (data.partner_id) {
          const { is_visible } = await apiClient.partners.getPartnerVisibility(data.partner_id, entityIdNum);
          if (is_visible === false) {
            await apiClient.partners.togglePartnerVisibility(data.partner_id, true, entityIdNum);
          }
        }
      } else {
        await apiClient.documents.update(payload);
        if (data.is_auto_payment && data.doc_id) {
          await apiClient.autoPayments.updatePurpose(data.doc_id);
        }
        await fetchDocs(entityIdNum);
        toast.success("Документ обновлён.");
        router.push(`/create/payment-form/${entityIdNum}`);
      }

      reset({
        ...defaultValues,
        entity_id: entityIdNum,
        partner_account_number_id: undefined,
      });

      updateAccountList([]);
    } catch (error) {
      const err = error as AxiosError<DuplicateCheckResponse>;

      if (err.response?.status === 409) {
        if (err.response.data?.allowDuplicate) {
          setPendingDocData(payload);
          setDuplicateDialogOpen(true);
          return;
        }

        toast.error(err.response.data?.message || "Документ уже существует.");
        return;
      }

      toast.error("Ошибка при сохранении документа.");
      console.error("Ошибка при сохранении документа:", err);
    }
  };

  return {
    entity,
    templatesList,
    docs,
    entityIdNum,
    selectedTemplate,
    isTemplateDialogOpen,
    isReplaceDialogOpen,
    setTemplateDialogOpen,
    setIsReplaceDialogOpen,
    setSelectedTemplate,
    setTemplatesList,
    onSubmit,
    isDuplicateDialogOpen,
    setDuplicateDialogOpen,
    pendingDocData,
    setPendingDocData,
    fetchDocs,
  };
}
