import React from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { apiClient } from "@/services/api-client";
import { TransformedObject } from "@/lib/transformData/doc";
import type { entity, template } from "@prisma/client";
import { DocumentWithPartner } from "@/app/api/(v1)/(protected)/documents/payments-list/[id]/route";
import { FormValues } from "@/types/formTypes";
import { toast } from "@/lib/hooks/use-toast";
import { TemplateWithBankDetails } from "@api/templates/[id]/route";

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
  const [docs, setDocs] = React.useState<DocumentWithPartner[]>([]);

  const [isTemplateDialogOpen, setTemplateDialogOpen] = React.useState(false);
  const [isReplaceDialogOpen, setIsReplaceDialogOpen] = React.useState(false);
  const [selectedTemplate, setSelectedTemplate] =
    React.useState<TemplateWithBankDetails | null>(null);

  React.useEffect(() => {
    if (entityIdNum) {
      apiClient.entities.getEntityById(entityIdNum).then(setEntity);
      apiClient.templates.getTemplateById(entityIdNum).then(setTemplatesList);
      apiClient.documents.getByEntity(entityIdNum).then(setDocs);
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
        reset(TransformedObject(data!));
      }
    };

    fetchDocument();
  }, [docIdQuery, reset]);

  const onSubmit = async (data: FormValues) => {
    try {
      if (!data.doc_id) {
        await apiClient.documents.create(data);
        const updatedDocs = await apiClient.documents.getByEntity(entityIdNum);
        if (updatedDocs) setDocs(updatedDocs);
        toast.success("Документ создан успешно.");
      } else {
        console.log("Обновление документа:", data);
        await apiClient.documents.update(data);
        toast.success("Документ обновлён.");
        router.push(`/create/payment-form/${entityIdNum}`);
      }

      reset({ ...defaultValues, entity_id: entityIdNum });
    } catch (error) {
      console.error("Ошибка при сохранении документа:", error);
      toast.error("Ошибка при сохранении документа.");
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
