"use client";
import { Controller, UseFormReturn } from "react-hook-form";
import { Tag } from "lucide-react";
import Dropdown from "@/app/components/molecules/Dropdown";
import { ProductFormData } from "./product.types";
import CheckBox from "@/app/components/atoms/CheckBox";
import VariantForm from "./VariantForm";

interface ProductFormProps {
  form: UseFormReturn<ProductFormData>;
  onSubmit: (data: ProductFormData) => void;
  categories?: { label: string; value: string }[];
  categoryAttributes?: {
    id: string;
    name: string;
    isRequired: boolean;
    values: { id: string; value: string; slug: string }[];
  }[];
  allAttributes?: {
    id: string;
    name: string;
    values: { id: string; value: string; slug: string }[];
  }[];
  isLoading?: boolean;
  error?: any;
  submitLabel?: string;
}

const ProductForm: React.FC<ProductFormProps> = ({
  form,
  onSubmit,
  categories = [],
  categoryAttributes = [],
  allAttributes = [],
  isLoading,
  error,
  submitLabel = "Save",
}) => {
  const {
    control,
    handleSubmit,
    setValue,
    formState: { errors },
  } = form;

  return (
    <form
      encType="multipart/form-data"
      onSubmit={handleSubmit(onSubmit)}
      className="space-y-6"
    >
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        <div className="relative">
          <label className="block text-xs font-black uppercase tracking-widest text-gray-400 mb-2">
            Product Name
          </label>
          <div className="relative group">
            <Controller
              name="name"
              control={control}
              rules={{ required: "Name is required" }}
              render={({ field }) => (
                <input
                  {...field}
                  type="text"
                  className="pl-11 pr-4 py-3.5 w-full border border-gray-200 rounded-2xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 focus:outline-none transition-all duration-200 bg-gray-50/30 group-hover:bg-white"
                  placeholder="e.g. Premium Leather Jacket"
                />
              )}
            />
            <Tag className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-hover:text-indigo-500 transition-colors" size={18} />
          </div>
          {errors.name && (
            <p className="text-rose-500 text-[10px] font-bold mt-1.5 ml-1 flex items-center gap-1 uppercase tracking-wider">
              <span className="w-1 h-1 bg-rose-500 rounded-full" /> {errors.name.message}
            </p>
          )}
        </div>

        <div className="relative">
          <label className="block text-xs font-black uppercase tracking-widest text-gray-400 mb-2">
            Category
          </label>
          <Controller
            name="categoryId"
            control={control}
            rules={{ required: "Category is required" }}
            render={({ field }) => (
              <Dropdown
                onChange={(value) => {
                  field.onChange(value);
                  setValue("variants", []); // Reset variants when category changes
                }}
                options={categories}
                value={field.value}
                label="Select Category"
                className="py-[14px] rounded-2xl bg-gray-50/30 hover:bg-white transition-all border-gray-200"
              />
            )}
          />
          {errors.categoryId && (
             <p className="text-rose-500 text-[10px] font-bold mt-1.5 ml-1 flex items-center gap-1 uppercase tracking-wider">
               <span className="w-1 h-1 bg-rose-500 rounded-full" /> {errors.categoryId.message}
             </p>
          )}
        </div>
      </div>

      <div>
        <label className="block text-xs font-black uppercase tracking-widest text-gray-400 mb-3">
          Product Badges
        </label>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          <CheckBox
            name="isNew"
            control={control}
            label="New Arrival"
            defaultValue={false}
          />
          <CheckBox
            name="isBestSeller"
            control={control}
            label="Best Seller"
            defaultValue={false}
          />
          <CheckBox
            name="isFeatured"
            control={control}
            label="Featured"
            defaultValue={false}
          />
          <CheckBox
            name="isTrending"
            control={control}
            label="Trending"
            defaultValue={false}
          />
        </div>
      </div>

      <div>
        <label className="block text-xs font-black uppercase tracking-widest text-gray-400 mb-2">
          Description
        </label>
        <Controller
          name="description"
          control={control}
          render={({ field }) => (
            <textarea
              {...field}
              className="px-5 py-4 w-full border border-gray-200 rounded-2xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 focus:outline-none transition-all duration-200 bg-gray-50/30 hover:bg-white resize-none"
              placeholder="Tell your customers about this product..."
              rows={4}
            />
          )}
        />
      </div>

      <VariantForm
        form={form}
        categoryAttributes={categoryAttributes}
        allAttributes={allAttributes}
      />

      {error && (
        <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded">
          <p className="text-red-600 text-sm font-medium">
            {error.data?.message || "An error occurred"}
          </p>
        </div>
      )}

      <div className="flex justify-end">
        <button
          type="submit"
          disabled={isLoading}
          className={`px-6 py-3 text-white rounded-lg shadow-md font-medium flex items-center justify-center min-w-24 ${isLoading
            ? "bg-blue-400 cursor-not-allowed"
            : "bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700"
            } transition-all duration-200`}
        >
          {isLoading ? "Saving..." : submitLabel}
        </button>
      </div>
    </form>
  );
};

export default ProductForm;
