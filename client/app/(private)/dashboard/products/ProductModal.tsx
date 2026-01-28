"use client";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import {
  useGetAllCategoriesQuery,
  useGetCategoryAttributesQuery,
} from "@/app/store/apis/CategoryApi";
import { useGetAllAttributesQuery } from "@/app/store/apis/AttributeApi";
import { ProductFormData } from "./product.types";
import ProductForm from "./ProductForm";

interface ProductModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: ProductFormData) => void;
  initialData?: ProductFormData;
  isLoading?: boolean;
  error?: any;
}

const ProductModal: React.FC<ProductModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  initialData,
  isLoading,
  error,
}) => {
  const { data: categoriesData } = useGetAllCategoriesQuery({});
  const { data: allAttributesData } = useGetAllAttributesQuery({});
  const categories =
    categoriesData?.categories?.map((category) => ({
      label: category.name,
      value: category.id,
    })) || [];

  const allAttributes = allAttributesData?.attributes || [];

  const form = useForm<ProductFormData>({
    defaultValues: {
      id: "",
      name: "",
      isNew: false,
      isTrending: false,
      isFeatured: false,
      isBestSeller: false,
      categoryId: "",
      description: "",
      variants: [
        {
          id: "",
          images: [],
          lowStockThreshold: 10,
          barcode: "",
          warehouseLocation: "",
          price: 0,
          sku: "",
          stock: 0,
          attributes: [],
        },
      ],
    },
  });

  const selectedCategoryId = form.watch("categoryId");
  const { data: categoryAttributesData } = useGetCategoryAttributesQuery(
    selectedCategoryId,
    {
      skip: !selectedCategoryId,
    }
  );
  const categoryAttributes = categoryAttributesData?.attributes || [];

  useEffect(() => {
    if (initialData) {
      form.reset({
        id: initialData.id || "",
        name: initialData.name || "",
        isNew: initialData.isNew || false,
        isTrending: initialData.isTrending || false,
        isFeatured: initialData.isFeatured || false,
        isBestSeller: initialData.isBestSeller || false,
        categoryId: initialData.categoryId || "",
        description: initialData.description || "",
        variants: initialData.variants || [],
      });
    } else {
      form.reset({
        id: "",
        name: "",
        isNew: false,
        isTrending: false,
        isFeatured: false,
        isBestSeller: false,
        categoryId: "",
        description: "",
        variants: [],
      });
    }
  }, [initialData, form]);

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-2 sm:p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.1 }}
        >
          <motion.div
            className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] sm:max-h-[85vh] overflow-hidden flex flex-col border border-gray-100"
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
          >
            <div className="flex justify-between items-center p-5 sm:p-8 border-b border-gray-100 bg-white sticky top-0 z-10">
              <div>
                <h2 className="text-xl sm:text-2xl font-black text-gray-900 tracking-tight">
                  {initialData ? "Edit Product" : "Create Product"}
                </h2>
                <p className="text-xs text-gray-400 font-medium">Fill in the details below</p>
              </div>
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-gray-900 transition-all duration-200 rounded-xl p-2 hover:bg-gray-50 bg-gray-50/50"
              >
                <X size={20} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-5 sm:p-8 custom-scrollbar">
              <ProductForm
                form={form}
                onSubmit={onSubmit}
                categories={categories}
                categoryAttributes={categoryAttributes}
                allAttributes={allAttributes}
                isLoading={isLoading}
                error={error}
                submitLabel={initialData ? "Update" : "Create"}
              />
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default ProductModal;
