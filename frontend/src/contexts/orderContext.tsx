"use client";

import { createContext, useContext, useState } from "react";

export interface Order {
  order?: string | null;
  sort?: "asc" | "desc";
}

interface OrderContextData {
  order: Order | null;
  setOrder: (order: Order | null) => void;
  clearOrder: () => void;
}

const OrderContext = createContext<OrderContextData>({} as OrderContextData);

export function OrderProvider({ children }: { children: React.ReactNode }) {
  const [order, setOrder] = useState<Order | null>(null);

  function clearOrder() {
    setOrder({
      order: undefined,
      sort: undefined,
    });
  }

  return (
    <OrderContext.Provider value={{ order, setOrder, clearOrder }}>
      {children}
    </OrderContext.Provider>
  );
}

export function useOrder() {
  return useContext(OrderContext);
}
