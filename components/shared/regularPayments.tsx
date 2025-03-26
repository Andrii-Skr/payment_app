import { apiClient } from '@/services/api-client';
import React from 'react'

export const regularPayments = () => {
    const [autoPayments, setAutoPayments] = React.useState([]);

    React.useEffect(() => {
        apiClient.autoPayment.get().then((data:any) => {
          if (!data) return;
        setAutoPayments(data);
      });
    }, []);

    console.log(autoPayments);

  return (
    <div>regularPayments</div>
  )
}

