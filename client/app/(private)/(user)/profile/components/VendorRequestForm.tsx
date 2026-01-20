import React, { useState } from "react";
import { useSubmitVendorRequestMutation } from "@/app/store/apis/VendorRequestApi";
import { useAppDispatch } from "@/app/store/hooks";
import { addToast } from "@/app/store/slices/ToastSlice";
import { Store, Send, Loader2, MapPin, Phone, Mail, Globe, Navigation } from "lucide-react";
import { motion } from "framer-motion";

const VendorRequestForm = () => {
    const [formData, setFormData] = useState({
        shopName: "",
        shopDescription: "",
        shopEmail: "",
        phone: "",
        country: "",
        city: "",
        village: "",
        street: "",
        placeName: "",
        latitude: "" as string | number,
        longitude: "" as string | number,
    });

    const [submitRequest, { isLoading }] = useSubmitVendorRequestMutation();
    const [isLocating, setIsLocating] = useState(false);
    const dispatch = useAppDispatch();

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleAutoFindLocation = () => {
        if (!navigator.geolocation) {
            dispatch(addToast({ message: "Geolocation is not supported by your browser", type: "error" }));
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
                dispatch(addToast({ message: "Location coordinates captured!", type: "success" }));
            },
            (error) => {
                setIsLocating(false);
                dispatch(addToast({ message: "Unable to retrieve your location", type: "error" }));
            }
        );
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.shopName || !formData.shopDescription) {
            dispatch(addToast({ message: "Shop Name and Description are required", type: "error" }));
            return;
        }

        try {
            const dataToSubmit = {
                ...formData,
                latitude: formData.latitude !== "" ? Number(formData.latitude) : undefined,
                longitude: formData.longitude !== "" ? Number(formData.longitude) : undefined,
            };

            await submitRequest(dataToSubmit).unwrap();
            dispatch(
                addToast({
                    message: "Vendor request submitted successfully! An admin will review it soon.",
                    type: "success",
                })
            );
            // Reset form
            setFormData({
                shopName: "",
                shopDescription: "",
                shopEmail: "",
                phone: "",
                country: "",
                city: "",
                village: "",
                street: "",
                placeName: "",
                latitude: "",
                longitude: "",
            });
        } catch (err: any) {
            dispatch(
                addToast({
                    message: err?.data?.message || "Failed to submit vendor request",
                    type: "error",
                })
            );
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden"
        >
            <div className="bg-gradient-to-r from-amber-500 to-orange-600 p-4 sm:p-6 text-white">
                <div className="flex items-center space-x-3 mb-2">
                    <Store className="w-6 h-6" />
                    <h2 className="text-xl font-bold">Become a Vendor</h2>
                </div>
                <p className="text-amber-50 text-sm opacity-90">
                    Sell your products on our platform. Provide your shop details to begin.
                </p>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-6">
                {/* Basic Info */}
                <div className="space-y-4">
                    <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider flex items-center gap-2">
                        <Store className="w-4 h-4" /> Basic Information
                    </h3>
                    <div className="grid grid-cols-1 gap-4">
                        <div>
                            <label htmlFor="shopName" className="block text-sm font-medium text-gray-700 mb-1">
                                Shop Name *
                            </label>
                            <input
                                id="shopName"
                                name="shopName"
                                type="text"
                                required
                                value={formData.shopName}
                                onChange={handleInputChange}
                                placeholder="Enter your shop's name"
                                className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-transparent outline-none transition-all duration-200"
                                disabled={isLoading}
                            />
                        </div>
                        <div>
                            <label htmlFor="shopDescription" className="block text-sm font-medium text-gray-700 mb-1">
                                Shop Description / Bio *
                            </label>
                            <textarea
                                id="shopDescription"
                                name="shopDescription"
                                required
                                value={formData.shopDescription}
                                onChange={handleInputChange}
                                placeholder="Tell us about what you plan to sell"
                                rows={3}
                                className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-transparent outline-none transition-all duration-200 resize-none"
                                disabled={isLoading}
                            ></textarea>
                        </div>
                    </div>
                </div>

                {/* Contact Info */}
                <div className="space-y-4">
                    <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider flex items-center gap-2">
                        <Phone className="w-4 h-4" /> Contact Information
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                            <label htmlFor="shopEmail" className="block text-sm font-medium text-gray-700 mb-1">
                                Shop Email
                            </label>
                            <div className="relative">
                                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                <input
                                    id="shopEmail"
                                    name="shopEmail"
                                    type="email"
                                    value={formData.shopEmail}
                                    onChange={handleInputChange}
                                    placeholder="contact@yourshop.com"
                                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-transparent outline-none transition-all duration-200"
                                    disabled={isLoading}
                                />
                            </div>
                        </div>
                        <div>
                            <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
                                Phone Number
                            </label>
                            <div className="relative">
                                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                <input
                                    id="phone"
                                    name="phone"
                                    type="tel"
                                    value={formData.phone}
                                    onChange={handleInputChange}
                                    placeholder="+1 (555) 000-0000"
                                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-transparent outline-none transition-all duration-200"
                                    disabled={isLoading}
                                />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Location Info */}
                <div className="space-y-4">
                    <div className="flex items-center justify-between">
                        <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider flex items-center gap-2">
                            <MapPin className="w-4 h-4" /> Shop Location
                        </h3>
                        <button
                            type="button"
                            onClick={handleAutoFindLocation}
                            disabled={isLocating || isLoading}
                            className="text-xs font-semibold text-amber-600 hover:text-amber-700 flex items-center gap-1 transition-colors"
                        >
                            {isLocating ? <Loader2 className="w-3 h-3 animate-spin" /> : <Navigation className="w-3 h-3" />}
                            Auto-find Coordinates
                        </button>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                            <label htmlFor="country" className="block text-sm font-medium text-gray-700 mb-1">
                                Country
                            </label>
                            <div className="relative">
                                <Globe className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                <input
                                    id="country"
                                    name="country"
                                    type="text"
                                    value={formData.country}
                                    onChange={handleInputChange}
                                    placeholder="e.g. United States"
                                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-transparent outline-none transition-all duration-200"
                                    disabled={isLoading}
                                />
                            </div>
                        </div>
                        <div>
                            <label htmlFor="city" className="block text-sm font-medium text-gray-700 mb-1">
                                City / Town
                            </label>
                            <input
                                id="city"
                                name="city"
                                type="text"
                                value={formData.city}
                                onChange={handleInputChange}
                                placeholder="e.g. New York"
                                className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-transparent outline-none transition-all duration-200"
                                disabled={isLoading}
                            />
                        </div>
                        <div>
                            <label htmlFor="village" className="block text-sm font-medium text-gray-700 mb-1">
                                Village / Suburb
                            </label>
                            <input
                                id="village"
                                name="village"
                                type="text"
                                value={formData.village}
                                onChange={handleInputChange}
                                placeholder="e.g. Brooklyn"
                                className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-transparent outline-none transition-all duration-200"
                                disabled={isLoading}
                            />
                        </div>
                        <div>
                            <label htmlFor="street" className="block text-sm font-medium text-gray-700 mb-1">
                                Street / House No.
                            </label>
                            <input
                                id="street"
                                name="street"
                                type="text"
                                value={formData.street}
                                onChange={handleInputChange}
                                placeholder="e.g. 123 Main St, Apt 4"
                                className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-transparent outline-none transition-all duration-200"
                                disabled={isLoading}
                            />
                        </div>
                        <div>
                            <label htmlFor="placeName" className="block text-sm font-medium text-gray-700 mb-1">
                                Place Name / Landmark
                            </label>
                            <input
                                id="placeName"
                                name="placeName"
                                type="text"
                                value={formData.placeName}
                                onChange={handleInputChange}
                                placeholder="e.g. Near Central Park"
                                className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-transparent outline-none transition-all duration-200"
                                disabled={isLoading}
                            />
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                            <div>
                                <label htmlFor="latitude" className="block text-sm font-medium text-gray-700 mb-1">
                                    Latitude
                                </label>
                                <input
                                    id="latitude"
                                    name="latitude"
                                    type="number"
                                    step="any"
                                    value={formData.latitude}
                                    onChange={handleInputChange}
                                    placeholder="0.0000"
                                    className="w-full px-3 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-transparent outline-none transition-all duration-200 text-sm"
                                    disabled={isLoading}
                                />
                            </div>
                            <div>
                                <label htmlFor="longitude" className="block text-sm font-medium text-gray-700 mb-1">
                                    Longitude
                                </label>
                                <input
                                    id="longitude"
                                    name="longitude"
                                    type="number"
                                    step="any"
                                    value={formData.longitude}
                                    onChange={handleInputChange}
                                    placeholder="0.0000"
                                    className="w-full px-3 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-transparent outline-none transition-all duration-200 text-sm"
                                    disabled={isLoading}
                                />
                            </div>
                        </div>
                    </div>
                </div>

                <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full flex items-center justify-center space-x-2 bg-amber-600 text-white py-3 rounded-xl font-semibold shadow-lg hover:bg-amber-700 hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {isLoading ? (
                        <Loader2 className="w-5 h-5 animate-spin" />
                    ) : (
                        <>
                            <Send className="w-4 h-4" />
                            <span>Submit Request</span>
                        </>
                    )}
                </button>
            </form>
        </motion.div>
    );
};

export default VendorRequestForm;
