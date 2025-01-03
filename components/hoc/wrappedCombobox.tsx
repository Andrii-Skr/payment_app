"use client";

import { apiClient } from "@/services/api-client";
import { PartnersWithAccounts } from "@/services/partners";
import React from "react";

export function withDataFetching<T>(WrappedComponent: React.ComponentType<T>) {
  return (props: T & { id: number | undefined , onChange: (partner: PartnersWithAccounts) => void}) => {
    const { id, ...rest } = props;
    const [partnersList, setPartnersList] = React.useState<
      PartnersWithAccounts[]
    >([]);
    const [list, setList] = React.useState<{ key: string; value: string }[]>(
      []
    );

    React.useEffect(() => {
      if (!id) return;
      apiClient.partners.partnersService(id).then((data) => {
        setList(
          data
            ? data.map((e) => {
                return { key: String(e.id), value: e.edrpou };
              })
            : []
        );
        setPartnersList(data ? data : []);
        console.log("Fetched data:", data);
      });
    }, [id]);

    const onChange = (i: number) => {
      const partner = partnersList[i];
      props.onChange(partner);
    };
    return (
      <WrappedComponent {...(rest as T)} list={list} onChange={onChange} />
    );
  };
}
