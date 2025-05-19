"use client";

import React from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { apiClient } from "@/services/api-client";
import { TransformedObject } from "@/lib/transformData/doc";
import { toast } from "@/lib/hooks/use-toast";
import { useDocumentsStore } from "@/store/documentsListStore";

import type { entity } from "@prisma/client";
import { FormValues } from "@/types/formTypes";
import { TemplateWithBankDetails } from "@api/templates/[id]/route";
import { AxiosError } from "axios";

export function usePaymentFormLogic({
  reset,
  setValue,
  getValues,
  defaultValues,
}: {
  reset: (values: FormValues) => void;
  setValue: (name: keyof FormValues, value: any) => void;
  getValues: () => FormValues;
  defaultValues: FormValues;
}) {
  const { entity_id } = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const docIdQuery = searchParams.get("doc_id");
  const entityIdNum = Number(entity_id);

  const [entity, setEntity] = React.useState<entity | null>(null);
  const [templatesList, setTemplatesList] = React.useState<
    TemplateWithBankDetails[]
  >([]);
  const [isTemplateDialogOpen, setTemplateDialogOpen] = React.useState(false);
  const [isReplaceDialogOpen, setIsReplaceDialogOpen] = React.useState(false);
  const [selectedTemplate, setSelectedTemplate] =
    React.useState<TemplateWithBankDetails | null>(null);

  // Zustand store for documents
  const { docs, fetchDocs } = useDocumentsStore();

  React.useEffect(() => {
    if (entityIdNum) {
      apiClient.entities.getById(entityIdNum).then(setEntity);
      apiClient.templates.getTemplateById(entityIdNum).then(setTemplatesList);
      fetchDocs(entityIdNum); // 💡 загружаем список документов из стора
    }
  }, [entityIdNum]);

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
  try {
    if (!data.doc_id) {
      await apiClient.documents.create(data);
      await fetchDocs(entityIdNum);
      toast.success("Документ создан успешно.");
    } else {
      await apiClient.documents.update(data);
      await fetchDocs(entityIdNum);
      toast.success("Документ обновлён.");
      router.push(`/create/payment-form/${entityIdNum}`);
    }

    reset({ ...defaultValues, entity_id: entityIdNum });
  } catch (error) {
    const err = error as AxiosError;

    if (err.response?.status === 409) {
      toast.error("Документ с такими номермом и датой уже существует.");
    } else {
      toast.error("Ошибка при сохранении документа.");
    }

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
  };
}
