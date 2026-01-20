"use client";

import { useState } from "react";
import { useGetAllOrdersQuery, useUpdateOrderMutation, useGetOrderQuery } from "@/app/store/apis/OrderApi";
import CustomLoader from "@/app/components/feedback/CustomLoader";
import { Package, Edit, Check, X } from "lucide-react";
import useFormatPrice from "@/app/hooks/ui/useFormatPrice";
import formatDate from "@/app/utils/formatDate";
import Image from "next/image";

const AdminOrdersPage = () => {
    const { data, isLoading, error } = useGetAllOrdersQuery(undefined);
    const [updateOrder] = useUpdateOrderMutation();
    const formatPrice = useFormatPrice();

    const [editingOrderId, setEditingOrderId] = useState<string | null>(null);
    const [viewingOrderId, setViewingOrderId] = useState<string | null>(null);
    const [newStatus, setNewStatus] = useState("");

    const { data: orderDetailData } = useGetOrderQuery(viewingOrderId || "", {
        skip: !viewingOrderId,
    });

    const orders = data?.orders || [];
    const orderDetail = orderDetailData?.order;

    const handleUpdateStatus = async (orderId: string) => {
        try {
            await updateOrder({ orderId, status: newStatus }).unwrap();
            setEditingOrderId(null);
            setNewStatus("");
        } catch (error) {
            console.error("Failed to update order:", error);
            alert("Failed to update order status");
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case "PENDING":
                return "bg-yellow-100 text-yellow-800";
            case "PROCESSING":
                return "bg-blue-100 text-blue-800";
            case "SHIPPED":
                return "bg-indigo-100 text-indigo-800";
            case "DELIVERED":
                return "bg-green-100 text-green-800";
            case "CANCELED":
                return "bg-red-100 text-red-800";
            default:
                return "bg-gray-100 text-gray-800";
        }
    };

    if (isLoading) return <CustomLoader />;
    if (error) return <div className="p-6 text-red-600">Error loading orders</div>;

    return (
        <div className="p-6">
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                    <Package className="w-8 h-8 text-indigo-600" />
                    <h1 className="text-2xl font-bold text-gray-800">Order Management</h1>
                </div>
                <div className="text-sm text-gray-600">
                    Total Orders: <span className="font-semibold">{orders.length}</span>
                </div>
            </div>

            <div className="bg-white rounded-lg shadow overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Order ID
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Customer
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Date
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Items
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Amount
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Status
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Actions
                                </th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {orders.map((order: any) => (
                                <tr
                                    key={order.id}
                                    className="hover:bg-gray-50 cursor-pointer"
                                    onClick={() => setViewingOrderId(order.id)}
                                >
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                        {order.id.slice(0, 8)}...
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        User #{order.userId.slice(0, 8)}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        {formatDate(order.orderDate)}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        {order.orderItems?.length || 0} items
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900">
                                        {formatPrice(order.amount)}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        {editingOrderId === order.id ? (
                                            <select
                                                value={newStatus}
                                                onChange={(e) => {
                                                    e.stopPropagation();
                                                    setNewStatus(e.target.value);
                                                }}
                                                onClick={(e) => e.stopPropagation()}
                                                className="text-sm border border-gray-300 rounded px-2 py-1"
                                            >
                                                <option value="">Select Status</option>
                                                <option value="PENDING">Pending</option>
                                                <option value="PROCESSING">Processing</option>
                                                <option value="SHIPPED">Shipped</option>
                                                <option value="DELIVERED">Delivered</option>
                                                <option value="CANCELED">Canceled</option>
                                            </select>
                                        ) : (
                                            <span
                                                className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(
                                                    order.status
                                                )}`}
                                            >
                                                {order.status}
                                            </span>
                                        )}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                        {editingOrderId === order.id ? (
                                            <div className="flex gap-2" onClick={(e) => e.stopPropagation()}>
                                                <button
                                                    onClick={() => handleUpdateStatus(order.id)}
                                                    className="text-green-600 hover:text-green-900"
                                                    disabled={!newStatus}
                                                >
                                                    <Check className="w-5 h-5" />
                                                </button>
                                                <button
                                                    onClick={() => {
                                                        setEditingOrderId(null);
                                                        setNewStatus("");
                                                    }}
                                                    className="text-red-600 hover:text-red-900"
                                                >
                                                    <X className="w-5 h-5" />
                                                </button>
                                            </div>
                                        ) : (
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    setEditingOrderId(order.id);
                                                    setNewStatus(order.status);
                                                }}
                                                className="text-indigo-600 hover:text-indigo-900 flex items-center gap-1"
                                            >
                                                <Edit className="w-4 h-4" />
                                                Edit
                                            </button>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {orders.length === 0 && (
                    <div className="text-center py-12">
                        <Package className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                        <p className="text-gray-500">No orders found</p>
                    </div>
                )}
            </div>

            {/* Order Detail Modal */}
            {viewingOrderId && orderDetail && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
                        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center">
                            <h2 className="text-xl font-bold text-gray-800">Order Details</h2>
                            <button
                                onClick={() => setViewingOrderId(null)}
                                className="text-gray-500 hover:text-gray-700"
                            >
                                <X className="w-6 h-6" />
                            </button>
                        </div>

                        <div className="p-6 space-y-6">
                            {/* Order Info */}
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <p className="text-sm text-gray-500">Order ID</p>
                                    <p className="font-mono text-sm">{orderDetail.id}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-500">Date</p>
                                    <p className="text-sm">{formatDate(orderDetail.orderDate)}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-500">Status</p>
                                    <span className={`px-2 py-1 rounded-full text-xs font-semibold ${getStatusColor(orderDetail.status)}`}>
                                        {orderDetail.status}
                                    </span>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-500">Total Amount</p>
                                    <p className="text-lg font-bold">{formatPrice(orderDetail.amount)}</p>
                                </div>
                            </div>

                            {/* Order Items */}
                            <div>
                                <h3 className="font-semibold text-gray-800 mb-4">Order Items</h3>
                                <div className="space-y-4">
                                    {orderDetail.orderItems?.map((item: any) => (
                                        <div key={item.id} className="flex items-center gap-4 p-4 border border-gray-200 rounded-lg">
                                            <div className="w-16 h-16 bg-gray-100 rounded flex-shrink-0 overflow-hidden">
                                                <Image
                                                    src={item.variant?.images?.[0] || "/placeholder-product.png"}
                                                    alt={item.variant?.product?.name || "Product"}
                                                    width={64}
                                                    height={64}
                                                    className="object-cover w-full h-full"
                                                />
                                            </div>
                                            <div className="flex-1">
                                                <p className="font-semibold text-gray-800">{item.variant?.product?.name}</p>
                                                <p className="text-sm text-gray-500">SKU: {item.variant?.sku}</p>
                                                <p className="text-sm text-gray-500">Quantity: {item.quantity}</p>
                                            </div>
                                            <div className="text-right">
                                                <p className="font-semibold">{formatPrice(item.price * item.quantity)}</p>
                                                <p className="text-sm text-gray-500">{formatPrice(item.price)} each</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminOrdersPage;
