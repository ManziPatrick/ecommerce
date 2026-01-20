"use client";
import { useState } from "react";
import {
  useGetAllVariantsQuery,
  useRestockVariantMutation,
} from "@/app/store/apis/VariantApi";
import Table from "@/app/components/layout/Table";
import { History, Plus, Minus } from "lucide-react";
import useToast from "@/app/hooks/ui/useToast";
import RestockModal from "./RestockModal";
import RestockHistoryModal from "./RestockHistoryModal";
import { withAuth } from "@/app/components/HOC/WithAuth";
import CurrencyFormatter from "@/app/components/format/CurrencyFormatter";

interface Variant {
  id: string;
  productId: string;
  sku: string;
  price: number;
  stock: number;
  lowStockThreshold?: number;
  barcode?: string;
  warehouseLocation?: string;
  attributes: Array<{
    attributeId: string;
    valueId: string;
    attribute: { id: string; name: string; slug: string };
    value: { id: string; value: string; slug: string };
  }>;
  product: { id: string; name: string };
}

const InventoryDashboard = () => {
  const { showToast } = useToast();
  const [isRestockModalOpen, setIsRestockModalOpen] = useState(false);
  const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false);
  const [selectedVariant, setSelectedVariant] = useState<Variant | null>(null);
  const [expandedRowId, setExpandedRowId] = useState<string | null>(null);
  const { data, isLoading } = useGetAllVariantsQuery({});
  console.log("data: ", data);
  const [restockVariant, { isLoading: isRestocking }] =
    useRestockVariantMutation();
  const variants = data?.variants || [];
  console.log("variants: ", variants);

  const handleRestock = async (
    variantId: string,
    data: { quantity: number; notes?: string }
  ) => {
    try {
      await restockVariant({ id: variantId, data }).unwrap();
      setIsRestockModalOpen(false);
      setSelectedVariant(null);
      showToast("Variant restocked successfully", "success");
    } catch (err) {
      console.error("Failed to restock variant:", err);
      showToast("Failed to restock variant", "error");
    }
  };

  const toggleRow = (id: string) => {
    setExpandedRowId(expandedRowId === id ? null : id);
  };

  const columns = [
    {
      key: "expand",
      label: "",
      sortable: false,
      width: "50px",
      render: (row: Variant) => (
        <button
          onClick={() => toggleRow(row.id)}
          className="p-1 hover:bg-gray-100 rounded transition-colors"
        >
          {expandedRowId === row.id ? (
            <Minus size={18} className="text-gray-500" />
          ) : (
            <Plus size={18} className="text-blue-500" />
          )}
        </button>
      ),
    },
    {
      key: "productName",
      label: "Product",
      sortable: true,
      render: (row: Variant) => (
        <span className="font-medium text-gray-900">{row.product.name}</span>
      ),
    },
    {
      key: "price",
      label: "Price",
      sortable: true,
      render: (row: Variant) => <CurrencyFormatter amount={row.price} />,
    },
    {
      key: "stock",
      label: "Stock",
      sortable: true,
      render: (row: Variant) => (
        <span
          className={
            row.stock <= (row.lowStockThreshold || 10)
              ? "text-red-600 font-bold"
              : "text-gray-700"
          }
        >
          {row.stock}
        </span>
      ),
    },
    {
      key: "status",
      label: "Status",
      sortable: false,
      render: (row: Variant) => (
        <span
          className={`inline-block px-2 py-1 rounded text-xs font-semibold ${row.stock <= (row.lowStockThreshold || 10)
              ? "bg-red-100 text-red-700 border border-red-200"
              : "bg-green-100 text-green-700 border border-green-200"
            }`}
        >
          {row.stock <= (row.lowStockThreshold || 10)
            ? "Low Stock"
            : "Available"}
        </span>
      ),
    },
    {
      key: "actions",
      label: "Actions",
      render: (row: Variant) => (
        <div className="flex space-x-2">
          <button
            onClick={() => {
              setSelectedVariant(row);
              setIsRestockModalOpen(true);
            }}
            className="text-blue-600 hover:text-blue-800 flex items-center gap-1"
            disabled={isRestocking}
          >
            <Plus size={16} />
            Restock
          </button>
          <button
            onClick={() => {
              setSelectedVariant(row);
              setIsHistoryModalOpen(true);
            }}
            className="text-gray-600 hover:text-gray-800 flex items-center gap-1"
          >
            <History size={16} />
            History
          </button>
        </div>
      ),
    },
  ];

  const renderExpandedRow = (row: Variant) => (
    <div className="p-4 bg-gray-50 border-y border-gray-100 space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div>
          <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
            Identifier Details
          </h4>
          <div className="space-y-1">
            <p className="text-sm">
              <span className="text-gray-500">SKU:</span>{" "}
              <span className="font-mono">{row.sku}</span>
            </p>
            {row.barcode && (
              <p className="text-sm">
                <span className="text-gray-500">Barcode:</span> {row.barcode}
              </p>
            )}
          </div>
        </div>

        <div>
          <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
            Configuration
          </h4>
          <div className="flex flex-wrap gap-2">
            {row.attributes.map((attr) => (
              <span
                key={attr.attributeId}
                className="inline-flex items-center px-2 py-1 rounded-md bg-blue-50 text-blue-700 text-xs font-medium border border-blue-100"
              >
                {attr.attribute.name}: {attr.value.value}
              </span>
            ))}
          </div>
        </div>

        <div>
          <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
            Logistics
          </h4>
          <div className="space-y-1">
            <p className="text-sm">
              <span className="text-gray-500">Threshold:</span>{" "}
              {row.lowStockThreshold || 10} units
            </p>
            <p className="text-sm">
              <span className="text-gray-500">Location:</span>{" "}
              {row.warehouseLocation || "Not specified"}
            </p>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-4">
        <div>
          <h1 className="text-xl font-semibold">Inventory Dashboard</h1>
          <p className="text-sm text-gray-500">
            Manage variant stock and restock history
          </p>
        </div>
      </div>

      <Table
        data={variants}
        columns={columns}
        isLoading={isLoading}
        emptyMessage="No variants available"
        totalPages={data?.totalPages}
        totalResults={data?.totalResults}
        resultsPerPage={data?.resultsPerPage}
        currentPage={data?.currentPage}
        expandable={true}
        expandedRowId={expandedRowId}
        renderExpandedRow={renderExpandedRow}
      />

      <RestockModal
        isOpen={isRestockModalOpen}
        onClose={() => {
          setIsRestockModalOpen(false);
          setSelectedVariant(null);
        }}
        onSubmit={handleRestock}
        variant={selectedVariant}
        isLoading={isRestocking}
      />

      <RestockHistoryModal
        isOpen={isHistoryModalOpen}
        onClose={() => {
          setIsHistoryModalOpen(false);
          setSelectedVariant(null);
        }}
        variantId={selectedVariant?.id}
      />
    </div>
  );
};

export default withAuth(InventoryDashboard);
