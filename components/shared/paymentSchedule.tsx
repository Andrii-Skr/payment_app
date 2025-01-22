"use client"

import { PaymentTable } from "@/components/shared";
import React from "react";


type Props = {
  className?: string;
};

export const PaymentSchedule: React.FC<Props> = ({ className }) => {
  return (
      <div><aside></aside>
      <PaymentTable partnerNameFilter={""} onlyActive={false}/></div>
  )
}
