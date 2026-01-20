"use client";
import React, { useState } from "react";
import {
    useGetAllVendorRequestsQuery,
    useUpdateVendorRequestStatusMutation,
} from "@/app/store/apis/VendorRequestApi";
import { useAppDispatch } from "@/app/store/hooks";
import { addToast } from "@/app/store/slices/ToastSlice";
import {
    CheckCircle,
    XCircle,
    Clock,
    User,
    Store,
    MessageSquare,
    ChevronLeft,
    ChevronRight,
    Search,
    Filter,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const VendorRequestManager = () => {
    const [page, setPage] = useState(1);
    const [statusFilter, setStatusFilter] = useState("");
    const { data, isLoading } = useGetAllVendorRequestsQuery({
        page,
        status: statusFilter || undefined,
    });
    const [updateStatus, { isLoading: isUpdating }] =
        useUpdateVendorRequestStatusMutation();
    const dispatch = useAppDispatch();

    const handleUpdateStatus = async (
        id: string,
        status: "APPROVED" | "REJECTED"
    ) => {
        const adminNotes = window.prompt(`Enter admin notes for this ${status.toLowerCase()} (optional):`);

        try {
            await updateStatus({ id, status, adminNotes }).unwrap();
            dispatch(
                addToast({
                    message: `Request ${status.toLowerCase()} successfully`,
                    type: "success",
                })
            );
        } catch (err: any) {
            dispatch(
                addToast({
                    message: err?.data?.message || `Failed to ${status.toLowerCase()} request`,
                    type: "error",
                })
            );
        }
    };

    const getStatusIcon = (status: string) => {
        switch (status) {
            case "APPROVED":
                return <CheckCircle className="w-5 h-5 text-green-500" />;
            case "REJECTED":
                return <XCircle className="w-5 h-5 text-red-500" />;
            default:
                return <Clock className="w-5 h-5 text-amber-500" />;
        }
    };

    const getStatusBg = (status: string) => {
        switch (status) {
            case "APPROVED":
                return "bg-green-100 text-green-800 border-green-200";
            case "REJECTED":
                return "bg-red-100 text-red-800 border-red-200";
            default:
                return "bg-amber-100 text-amber-800 border-amber-200";
        }
    };

    return (
        <div className="p-4 sm:p-8 space-y-8 min-h-screen bg-gray-50/50">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Vendor Requests</h1>
                    <p className="text-gray-500 mt-1">Review and manage shop applications from users.</p>
                </div>

                <div className="flex items-center space-x-3">
                    <div className="relative">
                        <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <select
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                            className="pl-10 pr-4 py-2 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none appearance-none transition-all duration-200"
                        >
                            <option value="">All Statuses</option>
                            <option value="PENDING">Pending</option>
                            <option value="APPROVED">Approved</option>
                            <option value="REJECTED">Rejected</option>
                        </select>
                    </div>
                </div>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="bg-gray-50/80 border-b border-gray-100">
                                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">User</th>
                                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Shop Details</th>
                                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Created At</th>
                                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            <AnimatePresence mode="popLayout">
                                {isLoading ? (
                                    [...Array(5)].map((_, i) => (
                                        <tr key={i} className="animate-pulse">
                                            <td colSpan={5} className="px-6 py-8"><div className="h-4 bg-gray-100 rounded w-full"></div></td>
                                        </tr>
                                    ))
                                ) : data?.requests?.length > 0 ? (
                                    data.requests.map((request: any) => (
                                        <motion.tr
                                            key={request.id}
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: 1 }}
                                            exit={{ opacity: 0 }}
                                            className="hover:bg-gray-50/50 transition-colors duration-200"
                                        >
                                            <td className="px-6 py-4">
                                                <div className="flex items-center space-x-3">
                                                    <div className="w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center">
                                                        <User className="w-5 h-5 text-indigo-600" />
                                                    </div>
                                                    <div>
                                                        <p className="font-medium text-gray-900">{request.user.name}</p>
                                                        <p className="text-xs text-gray-500">{request.user.email}</p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="space-y-1 max-w-xs">
                                                    <div className="flex items-center space-x-2">
                                                        <Store className="w-4 h-4 text-amber-500" />
                                                        <p className="font-medium text-gray-900">{request.shopName}</p>
                                                    </div>
                                                    <p className="text-xs text-gray-500 line-clamp-1">{request.shopDescription}</p>
                                                    <div className="flex flex-wrap gap-1 mt-1">
                                                        {request.city && <span className="text-[10px] bg-gray-100 px-1.5 py-0.5 rounded-md text-gray-600">{request.city}</span>}
                                                        {request.country && <span className="text-[10px] bg-blue-50 px-1.5 py-0.5 rounded-md text-blue-600">{request.country}</span>}
                                                        {request.phone && <span className="text-[10px] bg-green-50 px-1.5 py-0.5 rounded-md text-green-600">{request.phone}</span>}
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className={`inline-flex items-center space-x-1.5 px-3 py-1 rounded-full text-xs font-medium border ${getStatusBg(request.status)}`}>
                                                    {getStatusIcon(request.status)}
                                                    <span>{request.status.charAt(0) + request.status.slice(1).toLowerCase()}</span>
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-sm text-gray-500">
                                                {new Date(request.createdAt).toLocaleDateString()}
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                {request.status === "PENDING" && (
                                                    <div className="flex items-center justify-end space-x-2">
                                                        <button
                                                            onClick={() => handleUpdateStatus(request.id, "APPROVED")}
                                                            disabled={isUpdating}
                                                            className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors duration-200"
                                                            title="Approve"
                                                        >
                                                            <CheckCircle className="w-5 h-5" />
                                                        </button>
                                                        <button
                                                            onClick={() => handleUpdateStatus(request.id, "REJECTED")}
                                                            disabled={isUpdating}
                                                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors duration-200"
                                                            title="Reject"
                                                        >
                                                            <XCircle className="w-5 h-5" />
                                                        </button>
                                                    </div>
                                                )}
                                                {request.adminNotes && (
                                                    <button
                                                        className="p-2 text-gray-400 hover:bg-gray-100 rounded-lg transition-colors duration-200"
                                                        title={`Notes: ${request.adminNotes}`}
                                                        onClick={() => alert(`Admin Notes: ${request.adminNotes}`)}
                                                    >
                                                        <MessageSquare className="w-5 h-5" />
                                                    </button>
                                                )}
                                            </td>
                                        </motion.tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan={5} className="px-6 py-12 text-center">
                                            <div className="max-w-xs mx-auto">
                                                <Clock className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                                                <p className="text-lg font-medium text-gray-900">No requests found</p>
                                                <p className="text-gray-500 mt-1">When users apply to become vendors, they'll appear here.</p>
                                            </div>
                                        </td>
                                    </tr>
                                )}
                            </AnimatePresence>
                        </tbody>
                    </table>
                </div>

                {data?.totalPages > 1 && (
                    <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 flex items-center justify-between">
                        <p className="text-sm text-gray-600">
                            Showing page <span className="font-medium">{page}</span> of <span className="font-medium">{data.totalPages}</span>
                        </p>
                        <div className="flex items-center space-x-2">
                            <button
                                onClick={() => setPage(p => Math.max(1, p - 1))}
                                disabled={page === 1}
                                className="p-2 bg-white border border-gray-200 rounded-lg disabled:opacity-50 hover:bg-gray-50 transition-colors"
                            >
                                <ChevronLeft className="w-4 h-4" />
                            </button>
                            <button
                                onClick={() => setPage(p => Math.min(data.totalPages, p + 1))}
                                disabled={page === data.totalPages}
                                className="p-2 bg-white border border-gray-200 rounded-lg disabled:opacity-50 hover:bg-gray-50 transition-colors"
                            >
                                <ChevronRight className="w-4 h-4" />
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default VendorRequestManager;
