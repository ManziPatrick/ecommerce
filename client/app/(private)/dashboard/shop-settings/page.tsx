"use client";
import React, { useState, useEffect } from "react";
import {
    useGetMyShopQuery,
    useUpdateShopMutation,
} from "@/app/store/apis/ShopApi";
import { useAppDispatch } from "@/app/store/hooks";
import { addToast } from "@/app/store/slices/ToastSlice";
import {
    Store,
    Save,
    Loader2,
    MapPin,
    Phone,
    Mail,
    Globe,
    Navigation,
    Info,
} from "lucide-react";
import { motion } from "framer-motion";
import MainLayout from "@/app/components/templates/MainLayout";

const ShopSettings = () => {
    const { data, isLoading: isFetching } = useGetMyShopQuery(undefined);
    const [updateShop, { isLoading: isUpdating }] = useUpdateShopMutation();
    const [formData, setFormData] = useState({
        name: "",
        description: "",
        email: "",
        phone: "",
        country: "",
        city: "",
        village: "",
        street: "",
        placeName: "",
        latitude: "" as string | number,
        longitude: "" as string | number,
    });

    const [isLocating, setIsLocating] = useState(false);
    const dispatch = useAppDispatch();

    useEffect(() => {
        if (data?.shop) {
            setFormData({
                name: data.shop.name || "",
                description: data.shop.description || "",
                email: data.shop.email || "",
                phone: data.shop.phone || "",
                country: data.shop.country || "",
                city: data.shop.city || "",
                village: data.shop.village || "",
                street: data.shop.street || "",
                placeName: data.shop.placeName || "",
                latitude: data.shop.latitude || "",
                longitude: data.shop.longitude || "",
            });
        }
    }, [data]);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleAutoFindLocation = () => {
        if (!navigator.geolocation) {
            dispatch(addToast({ message: "Geolocation is not supported", type: "error" }));
            return;
        }

        setIsLocating(true);
        navigator.geolocation.getCurrentPosition(
            (position) => {
                setFormData((prev) => ({
                    ...prev,
                    latitude: position.coords.latitude,
                    longitude: position.coords.longitude,
                }));
                setIsLocating(false);
                dispatch(addToast({ message: "Coordinates updated!", type: "success" }));
            },
            () => {
                setIsLocating(false);
                dispatch(addToast({ message: "Unable to find location", type: "error" }));
            }
        );
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!data?.shop?.id) return;

        try {
            const dataToSubmit = {
                ...formData,
                latitude: formData.latitude !== "" ? Number(formData.latitude) : undefined,
                longitude: formData.longitude !== "" ? Number(formData.longitude) : undefined,
            };

            await updateShop({ id: data.shop.id, data: dataToSubmit }).unwrap();
            dispatch(addToast({ message: "Shop settings updated successfully!", type: "success" }));
        } catch (err: any) {
            dispatch(addToast({ message: err?.data?.message || "Failed to update shop", type: "error" }));
        }
    };

    if (isFetching) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <Loader2 className="w-8 h-8 animate-spin text-amber-600" />
            </div>
        );
    }

    return (
        <div className="p-4 sm:p-8 max-w-4xl mx-auto space-y-8 min-h-screen bg-gray-50/50">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Shop Settings</h1>
                    <p className="text-gray-500 mt-1">Manage your shop's identity and location details.</p>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
                {/* Basic Information */}
                <section className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                    <div className="p-6 border-b border-gray-50 bg-gray-50/50">
                        <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                            <Store className="w-5 h-5 text-amber-500" /> General Information
                        </h3>
                    </div>
                    <div className="p-6 space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Shop Name</label>
                            <input
                                name="name"
                                value={formData.name}
                                onChange={handleInputChange}
                                className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-amber-500 outline-none transition-all"
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Description / Bio</label>
                            <textarea
                                name="description"
                                value={formData.description}
                                onChange={handleInputChange}
                                rows={4}
                                className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-amber-500 outline-none transition-all resize-none"
                            />
                        </div>
                    </div>
                </section>

                {/* Contact Information */}
                <section className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                    <div className="p-6 border-b border-gray-50 bg-gray-50/50">
                        <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                            <Phone className="w-5 h-5 text-blue-500" /> Contact Details
                        </h3>
                    </div>
                    <div className="p-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Public Email</label>
                            <div className="relative">
                                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                <input
                                    name="email"
                                    type="email"
                                    value={formData.email}
                                    onChange={handleInputChange}
                                    className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-amber-500 outline-none transition-all"
                                />
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
                            <div className="relative">
                                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                <input
                                    name="phone"
                                    type="tel"
                                    value={formData.phone}
                                    onChange={handleInputChange}
                                    className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-amber-500 outline-none transition-all"
                                />
                            </div>
                        </div>
                    </div>
                </section>

                {/* Location Information */}
                <section className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                    <div className="p-6 border-b border-gray-50 bg-gray-50/50 flex items-center justify-between">
                        <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                            <MapPin className="w-5 h-5 text-red-500" /> Shop Location
                        </h3>
                        <button
                            type="button"
                            onClick={handleAutoFindLocation}
                            disabled={isLocating}
                            className="text-xs font-semibold text-amber-600 hover:text-amber-700 flex items-center gap-1 transition-colors"
                        >
                            {isLocating ? <Loader2 className="w-3 h-3 animate-spin" /> : <Navigation className="w-3 h-3" />}
                            {isLocating ? "Locating..." : "Auto-find Coordinates"}
                        </button>
                    </div>
                    <div className="p-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Country</label>
                            <input
                                name="country"
                                value={formData.country}
                                onChange={handleInputChange}
                                className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-amber-500 outline-none transition-all"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">City</label>
                            <input
                                name="city"
                                value={formData.city}
                                onChange={handleInputChange}
                                className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-amber-500 outline-none transition-all"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Village / Suburb</label>
                            <input
                                name="village"
                                value={formData.village}
                                onChange={handleInputChange}
                                className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-amber-500 outline-none transition-all"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Street / House No.</label>
                            <input
                                name="street"
                                value={formData.street}
                                onChange={handleInputChange}
                                className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-amber-500 outline-none transition-all"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Place Name</label>
                            <input
                                name="placeName"
                                value={formData.placeName}
                                onChange={handleInputChange}
                                className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-amber-500 outline-none transition-all"
                            />
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Latitude</label>
                                <input
                                    name="latitude"
                                    type="number"
                                    step="any"
                                    value={formData.latitude}
                                    onChange={handleInputChange}
                                    className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-amber-500 outline-none transition-all text-sm"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Longitude</label>
                                <input
                                    name="longitude"
                                    type="number"
                                    step="any"
                                    value={formData.longitude}
                                    onChange={handleInputChange}
                                    className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-amber-500 outline-none transition-all text-sm"
                                />
                            </div>
                        </div>
                    </div>
                </section>

                <div className="flex items-center justify-end">
                    <button
                        type="submit"
                        disabled={isUpdating}
                        className="flex items-center gap-2 bg-gray-900 border border-transparent text-white px-8 py-3 rounded-xl font-semibold shadow-lg hover:bg-gray-800 transition-all disabled:opacity-50"
                    >
                        {isUpdating ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
                        Save Changes
                    </button>
                </div>
            </form>
        </div>
    );
};

export default ShopSettings;
