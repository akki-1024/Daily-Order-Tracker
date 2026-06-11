import React, { createContext, useContext, useState, useCallback } from "react";
import { ordersAPI } from "../api";
import toast from "react-hot-toast";

const OrderContext = createContext();

export const OrderProvider = ({ children }) => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchOrders = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await ordersAPI.getAll();
      setOrders(data);
    } catch {
      toast.error("Failed to load orders");
    } finally {
      setLoading(false);
    }
  }, []);

  const createOrder = async (orderData) => {
    const { data } = await ordersAPI.create(orderData);
    setOrders((prev) => [data, ...prev]);
    return data;
  };

  const deleteOrder = async (id) => {
    await ordersAPI.delete(id);
    setOrders((prev) => prev.filter((o) => o._id !== id));
    toast.success("Order deleted");
  };

  const markPayment = async (orderId, personId, paid, upiRef) => {
    const { data } = await ordersAPI.markPayment(orderId, personId, {
      paid,
      upiRef,
    });
    setOrders((prev) => prev.map((o) => (o._id === orderId ? data : o)));
    return data;
  };

  return (
    <OrderContext.Provider
      value={{ orders, loading, fetchOrders, createOrder, deleteOrder, markPayment }}
    >
      {children}
    </OrderContext.Provider>
  );
};

export const useOrders = () => useContext(OrderContext);
