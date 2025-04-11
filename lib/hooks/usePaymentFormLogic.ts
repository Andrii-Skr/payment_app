// hooks/usePaymentFormLogic.ts
import { useEffect, useState } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { apiClient } from "@/services/api-client";
import { TransformedObject } from "@/lib/transformData/doc";
import type { entity, template } from "@prisma/client";
import { DocumentWithPartner } from "@/app/api/document/entity/[entity_id]/route";
import { FormValues } from "@/types/formTypes";

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

  const [entity, setEntity] = useState<entity | null>(null);
  const [templatesList, setTemplatesList] = useState<template[]>([]);
  const [docs, setDocs] = useState<DocumentWithPartner[]>([]);

  const [isTemplateDialogOpen, setTemplateDialogOpen] = useState(false);
  const [isReplaceDialogOpen, setIsReplaceDialogOpen] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<template | null>(null);

  useEffect(() => {
    if (entityIdNum) {
      apiClient.entity.getEntityById(entityIdNum).then(setEntity);
      apiClient.document.getTemplateById(entityIdNum).then(setTemplatesList);
      apiClient.document.getByEntity(entityIdNum).then(setDocs);
    }
  }, [entityIdNum]);

  useEffect(() => {
    setValue("entity_id", entityIdNum);
  }, [entityIdNum, setValue]);

  useEffect(() => {
    if (docIdQuery) {
      apiClient.document.getById(Number(docIdQuery)).then((data) => {
        if (data) reset(TransformedObject(data));
      });
    }
  }, [docIdQuery, reset]);

  const onSubmit = async (data: FormValues) => {
    if (!data.doc_id) {
      await apiClient.document.create(data);
      const updatedDocs = await apiClient.document.getByEntity(entityIdNum);
      if (updatedDocs) setDocs(updatedDocs);
    } else {
      await apiClient.document.update(data);
      router.push(`/create/payment-form/${entityIdNum}`);
    }
    reset({ ...defaultValues, entity_id: entityIdNum });
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
