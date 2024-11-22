"use client";

import { apiClient } from "@/services/api-client";
import { PartnersWithAccounts } from "@/services/partners";
import React, { useEffect } from "react";

export function withDataFetching<T>(WrappedComponent: React.ComponentType<T>) {
  return (props: T & { id: number | undefined }) => {
    const { id, ...rest } = props;
    const [partnersList, setPartnersList] = React.useState<PartnersWithAccounts[] | undefined>([]);

    useEffect(() => {
      if (!id) return;
      apiClient.partners.partnersService(id).then((data) => {
        setPartnersList(data);
        console.log("Fetched data:", data);
      });
    }, [id]);

    return <WrappedComponent {...(rest as T)} partnersList={partnersList} />;
  };
}
