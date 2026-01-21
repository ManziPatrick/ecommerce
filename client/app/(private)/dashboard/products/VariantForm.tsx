"use client";
import { useState } from "react";
import { Controller, useFieldArray, UseFormReturn } from "react-hook-form";
import { Trash2, Plus, ChevronDown, ChevronUp } from "lucide-react";
import Dropdown from "@/app/components/molecules/Dropdown";
import ImageUploader from "@/app/components/molecules/ImageUploader";
import { ProductFormData } from "./product.types";

interface VariantFormProps {
  form: UseFormReturn<ProductFormData>;
  categoryAttributes: {
    id: string;
    name: string;
    isRequired: boolean;
    values: { id: string; value: string; slug: string }[];
  }[];
  allAttributes: {
    id: string;
    name: string;
    values: { id: string; value: string; slug: string }[];
  }[];
}

const VariantForm: React.FC<VariantFormProps> = ({
  form,
  categoryAttributes,
  allAttributes,
}) => {
  const {
    control,
    formState: { errors },
    setValue,
    watch,
  } = form;
  const { fields, append, remove } = useFieldArray({
    control,
    name: "variants",
  });

  // Track which variants are collapsed
  const [collapsedVariants, setCollapsedVariants] = useState<Set<number>>(new Set());

  const toggleCollapse = (index: number) => {
    setCollapsedVariants((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(index)) {
        newSet.delete(index);
      } else {
        newSet.add(index);
      }
      return newSet;
    });
  };

  const inputStyles =
    "w-full p-2 border border-gray-300 rounded-md focus:border-blue-500 focus:ring-2 focus:ring-blue-500 transition-colors";

  return (
    <div className="space-y-6 p-6 bg-white rounded-xl shadow-sm">
      <div className="flex justify-between items-center">
        <h2 className="text-lg font-semibold text-gray-900">
          Product Variants
        </h2>
        <button
          type="button"
          onClick={() =>
            append({
              id: "",
              sku: "",
              price: 0,
              stock: 0,
              lowStockThreshold: 10,
              barcode: "",
              warehouseLocation: "",
              images: [],
              attributes: categoryAttributes
                .filter((attr) => attr.isRequired)
                .map((attr) => ({ attributeId: attr.id, valueId: "" })),
            })
          }
          className="flex items-center gap-2 text-blue-600 hover:text-blue-700 font-medium"
        >
          <Plus size={20} /> Add Variant
        </button>
      </div>

      {fields.map((field, index) => {
        const variantAttributes = watch(`variants.${index}.attributes`) || [];
        const variantAttributeIds = variantAttributes.map((a: any) => a.attributeId);

        const availableAttributes = allAttributes.filter(
          (attr) => !variantAttributeIds.includes(attr.id)
        );

        const isCollapsed = collapsedVariants.has(index);
        const sku = watch(`variants.${index}.sku`) || "No SKU";
        const price = watch(`variants.${index}.price`) || 0;
        const stock = watch(`variants.${index}.stock`) || 0;

        return (
          <div
            key={field.id}
            className="border border-gray-200 rounded-lg overflow-hidden"
          >
            {/* Collapsible Header */}
            <div
              className={`flex justify-between items-center p-4 cursor-pointer transition-colors ${isCollapsed ? "bg-gray-50 hover:bg-gray-100" : "bg-white"
                }`}
              onClick={() => toggleCollapse(index)}
            >
              <div className="flex items-center gap-3">
                {isCollapsed ? (
                  <ChevronDown size={20} className="text-gray-400" />
                ) : (
                  <ChevronUp size={20} className="text-gray-400" />
                )}
                <h3 className="text-base font-medium text-gray-800">
                  Variant {index + 1}
                </h3>
                {isCollapsed && (
                  <span className="text-sm text-gray-500 ml-2">
                    {sku} · ${price} · {stock} in stock
                  </span>
                )}
              </div>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  remove(index);
                }}
                className="text-red-500 hover:text-red-600"
              >
                <Trash2 size={20} />
              </button>
            </div>

            {/* Collapsible Content */}
            {!isCollapsed && (
              <div className="p-4 pt-0 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      SKU
                    </label>
                    <Controller
                      name={`variants.${index}.sku`}
                      control={control}
                      rules={{
                        required: "SKU is required",
                        pattern: {
                          value: /^[a-zA-Z0-9-]+$/,
                          message: "SKU must be alphanumeric with dashes",
                        },
                      }}
                      render={({ field }) => (
                        <input
                          {...field}
                          type="text"
                          className={inputStyles}
                          placeholder="TSH-RED-S"
                        />
                      )}
                    />
                    {errors.variants?.[index]?.sku && (
                      <p className="text-red-500 text-xs mt-1">
                        {errors.variants[index].sku?.message}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Price
                    </label>
                    <Controller
                      name={`variants.${index}.price`}
                      control={control}
                      rules={{
                        required: "Price is required",
                        min: { value: 0.01, message: "Price must be positive" },
                      }}
                      render={({ field }) => (
                        <input
                          {...field}
                          type="number"
                          step="0.01"
                          className={inputStyles}
                          placeholder="19.99"
                        />
                      )}
                    />
                    {errors.variants?.[index]?.price && (
                      <p className="text-red-500 text-xs mt-1">
                        {errors.variants[index].price?.message}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Discount Price
                    </label>
                    <Controller
                      name={`variants.${index}.discountPrice`}
                      control={control}
                      rules={{
                        min: { value: 0.01, message: "Must be positive" },
                        validate: (value) => {
                          if (!value) return true;
                          const price = watch(`variants.${index}.price`);
                          return Number(value) < Number(price) || "Must be less than price";
                        }
                      }}
                      render={({ field }) => (
                        <input
                          {...field}
                          type="number"
                          step="0.01"
                          className={inputStyles}
                          placeholder="15.99"
                        />
                      )}
                    />
                    {errors.variants?.[index]?.discountPrice && (
                      <p className="text-red-500 text-xs mt-1">
                        {errors.variants[index].discountPrice?.message}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Stock
                    </label>
                    <Controller
                      name={`variants.${index}.stock`}
                      control={control}
                      rules={{
                        required: "Stock is required",
                        min: { value: 0, message: "Stock cannot be negative" },
                      }}
                      render={({ field }) => (
                        <input
                          {...field}
                          type="number"
                          className={inputStyles}
                          placeholder="50"
                        />
                      )}
                    />
                    {errors.variants?.[index]?.stock && (
                      <p className="text-red-500 text-xs mt-1">
                        {errors.variants[index].stock?.message}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Low Stock Threshold
                    </label>
                    <Controller
                      name={`variants.${index}.lowStockThreshold`}
                      control={control}
                      rules={{ min: { value: 0, message: "Cannot be negative" } }}
                      render={({ field }) => (
                        <input
                          {...field}
                          type="number"
                          className={inputStyles}
                          placeholder="10"
                        />
                      )}
                    />
                    {errors.variants?.[index]?.lowStockThreshold && (
                      <p className="text-red-500 text-xs mt-1">
                        {errors.variants[index].lowStockThreshold?.message}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Barcode
                    </label>
                    <Controller
                      name={`variants.${index}.barcode`}
                      control={control}
                      render={({ field }) => (
                        <input
                          {...field}
                          type="text"
                          className={inputStyles}
                          placeholder="123456789012"
                        />
                      )}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Warehouse Location
                    </label>
                    <Controller
                      name={`variants.${index}.warehouseLocation`}
                      control={control}
                      render={({ field }) => (
                        <input
                          {...field}
                          type="text"
                          className={inputStyles}
                          placeholder="WH-A1"
                        />
                      )}
                    />
                  </div>

                  <div className="md:col-span-2">
                    <ImageUploader
                      control={control}
                      errors={errors}
                      setValue={setValue}
                      label="Variant Images"
                      name={`variants.${index}.images`}
                      maxFiles={5}
                    />
                    {errors.variants?.[index]?.images && (
                      <p className="text-red-500 text-xs mt-1">
                        {errors.variants[index].images?.message}
                      </p>
                    )}
                  </div>
                </div>

                <div className="space-y-3">
                  <h4 className="text-sm font-medium text-gray-700">Attributes</h4>

                  {/* Category-specific attributes (mandatory or optional) */}
                  {variantAttributes.map((attrField: any, attrIndex: number) => {
                    const attrInfo = allAttributes.find(a => a.id === attrField.attributeId);
                    const isRequiredInCat = categoryAttributes.find(a => a.id === attrField.attributeId)?.isRequired;

                    if (!attrInfo) return null;

                    return (
                      <div key={attrField.attributeId} className="flex flex-col gap-1">
                        <div className="flex justify-between items-center">
                          <label className="block text-sm font-medium text-gray-600">
                            {attrInfo.name}{" "}
                            {isRequiredInCat && <span className="text-red-500">*</span>}
                          </label>
                          {!isRequiredInCat && (
                            <button
                              type="button"
                              onClick={() => {
                                const current = watch(`variants.${index}.attributes`);
                                const filtered = current.filter((_: any, i: number) => i !== attrIndex);
                                setValue(`variants.${index}.attributes`, filtered);
                              }}
                              className="text-xs text-red-400 hover:text-red-600"
                            >
                              Remove
                            </button>
                          )}
                        </div>
                        <Controller
                          name={`variants.${index}.attributes[${attrIndex}].valueId`}
                          control={control}
                          rules={
                            isRequiredInCat
                              ? { required: `${attrInfo.name} is required` }
                              : undefined
                          }
                          render={({ field }) => (
                            <Dropdown
                              options={attrInfo.values.map((v) => ({
                                label: v.value,
                                value: v.id,
                              }))}
                              value={field.value}
                              onChange={(value) => field.onChange(value)}
                              label={`Select ${attrInfo.name}`}
                              className="p-2"
                            />
                          )}
                        />
                      </div>
                    );
                  })}

                  {/* Add more attributes dropdown */}
                  {availableAttributes.length > 0 && (
                    <div className="mt-4 pt-4 border-t border-gray-100">
                      <Dropdown
                        options={availableAttributes.map((attr) => ({
                          label: `Add ${attr.name}`,
                          value: attr.id,
                        }))}
                        onChange={(attrId) => {
                          const current = watch(`variants.${index}.attributes`) || [];
                          setValue(`variants.${index}.attributes`, [...current, { attributeId: attrId, valueId: "" }]);
                        }}
                        label="Add more properties (Color, Size etc.)"
                        className="p-2 border-dashed"
                        value=""
                      />
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        );
      })}
      {errors.variants && !Array.isArray(errors.variants) && (
        <p className="text-red-500 text-xs mt-2">
          At least one variant is required
        </p>
      )}
    </div>
  );
};

export default VariantForm;
