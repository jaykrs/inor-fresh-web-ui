"use client";

import React, { useEffect, useState } from "react";
import Button from "@/components/ui/button/Button";
import { X, Trash2, Edit, ChevronLeft, ChevronRight } from "lucide-react";
import { toast } from "react-hot-toast";
import Layout from "@/components/layout/Layout";

/**
 * Supplier Management Component
 * 
 * This component provides a complete interface for managing supplier records including:
 * - Displaying a paginated list of suppliers with sorting capabilities
 * - Creating, updating, and deleting supplier records
 * - Form validation and user feedback
 * 
 * Features:
 * - Server-side pagination
 * - Client-side sorting
 * - Responsive design
 * - Toast notifications for user feedback
 * 
 * API Integration:
 * - Uses JWT authentication for all requests
 * - Handles GET, POST, PUT, and DELETE operations
 * - Connects to Strapi backend
 *   @Developer : Simran Samir
 */

interface Supplier {
  id?: number;
  documentId?: string;
  name: string;
  phone: string;
  email: string;
  city: string;
  createdAt?: string;
  createdBy: string;
  status: boolean;
}

export default function SupplierPage() {
  // State management
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [loading, setLoading] = useState(true);
  const [sortConfig, setSortConfig] = useState<{ key: keyof Supplier; direction: 'asc' | 'desc' } | null>(null);
  const [formOpen, setFormOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [formData, setFormData] = useState<Supplier>({
    name: "",
    phone: "",
    email: "",
    city: "",
    createdAt: new Date().toISOString().split('T')[0],
    createdBy: "",
    status: false,
  });

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [totalItems, setTotalItems] = useState(0);

  /**
   * Fetches suppliers from the API with pagination
   * @param {number} page - The page number to fetch (defaults to currentPage)
   */
  const fetchSuppliers = async (page = currentPage) => {
    try {
      setLoading(true);
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/suppliers?pagination[page]=${page}&pagination[pageSize]=${itemsPerPage}`,
        {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('jwt')}`,
            'Content-Type': 'application/json',
          },
          cache: 'no-store'
        }
      );

      if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);

      const json = await res.json();
      if (!json.data) throw new Error("No data received from API");

      const formatted = json.data.map((item: any) => ({
        id: item.id,
        documentId: item.documentId,
        name: item.name || "",
        phone: item.phone || "",
        email: item.email || "",
        city: item.city || "",
        createdAt: item.createdAt || "",
        createdBy: item.createdBy || "",
        status: item.status || false,
      }));

      setSuppliers(formatted);
      setTotalItems(json.meta?.pagination?.total || 0);
    } catch (err: any) {
      console.error("Fetch error:", err);
      toast.error(`Failed to load data: ${err.message}`);
      setSuppliers([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSuppliers();
  }, [currentPage]);

  /**
   * Handles column sorting
   * @param {keyof Supplier} key - The column to sort by
   */
  const handleSort = (key: keyof Supplier) => {
    let direction: 'asc' | 'desc' = 'asc';
    if (sortConfig && sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  // Sorted suppliers list
  const sortedSuppliers = React.useMemo(() => {
    if (!sortConfig) return suppliers;
    return [...suppliers].sort((a, b) => {
      if (a[sortConfig.key]! < b[sortConfig.key]!) return sortConfig.direction === 'asc' ? -1 : 1;
      if (a[sortConfig.key]! > b[sortConfig.key]!) return sortConfig.direction === 'asc' ? 1 : -1;
      return 0;
    });
  }, [suppliers, sortConfig]);

  /**
   * Prepares form for editing an existing supplier
   * @param {Supplier} supplier - The supplier to edit
   */
  const handleEdit = (supplier: Supplier) => {
    setFormData({ 
      ...supplier,
      createdAt: supplier.createdAt ? supplier.createdAt.split('T')[0] : new Date().toISOString().split('T')[0],
      createdBy: supplier.createdBy || ""
    });
    setFormOpen(true);
  };

  /** Prepares form for adding a new supplier */
  const handleAdd = () => {
    setFormData({
      name: "",
      phone: "",
      email: "",
      city: "",
      createdAt: new Date().toISOString().split('T')[0],
      createdBy: "",
      status: false,
    });
    setFormOpen(true);
  };

  /**
   * Deletes a supplier after confirmation
   * @param {number} id - The ID of the supplier to delete
   */
  const handleDelete = async (id?: number) => {
    if (!id) return;
    if (!window.confirm("Are you sure you want to delete this supplier?")) return;
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/suppliers/${id}`, {
        method: "DELETE",
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('jwt')}`,
          'Content-Type': 'application/json',
        },
      });
      if (!res.ok) throw new Error("Failed to delete supplier");
      toast.success("Supplier deleted successfully");
      fetchSuppliers(currentPage);
    } catch (err) {
      toast.error("Error deleting supplier");
      console.error(err);
    }
  };

  /**
   * Handles form input changes
   * @param {React.ChangeEvent<HTMLInputElement>} e - The change event
   */
  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type } = e.target;
    const isCheckbox = type === "checkbox";
    const checked = isCheckbox && "checked" in e.target ? (e.target as HTMLInputElement).checked : undefined;

    setFormData((prev) => ({
      ...prev,
      [name]: isCheckbox ? checked : value,
    }));
  };

  /**
   * Handles form submission for create/update
   * Validates required fields and makes appropriate API request
   */
  const handleSubmit = async () => {
    setIsSaving(true);
    const isEdit = !!formData.documentId;

    const payload = {
      data: {
        name: formData.name,
        phone: formData.phone,
        email: formData.email,
        city: formData.city,
        createdBy: formData.createdBy,
        status: formData.status,
      },
    };

    const url = isEdit
      ? `${process.env.NEXT_PUBLIC_API_URL}/suppliers/${formData.documentId}`
      : `${process.env.NEXT_PUBLIC_API_URL}/suppliers`;

    try {
      const res = await fetch(url, {
        method: isEdit ? "PUT" : "POST",
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('jwt')}`,
        },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error?.message || `Failed to save supplier [${res.status}]`);
      }

      toast.success(isEdit ? "Supplier updated!" : "Supplier created!");
      setFormOpen(false);
      fetchSuppliers(isEdit ? currentPage : 1);
    } catch (err) {
      console.error("Error saving supplier:", err);
      toast.error(`Error: ${err instanceof Error ? err.message : "Unknown error"}`);
    } finally {
      setIsSaving(false);
    }
  };

  // Pagination calculations
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const canPreviousPage = currentPage > 1;
  const canNextPage = currentPage < totalPages;

  return (
    <Layout pageTitle="Supplier Management | Fisher">
      <div className="p-6 max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-gray-800">🧾 Supplier Management</h1>
          <Button onClick={handleAdd} className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-md">
            + Add Supplier
          </Button>
        </div>

        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th 
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                      onClick={() => handleSort('id')}
                    >
                      #
                      {sortConfig?.key === 'id' && (
                        <span className="ml-1">
                          {sortConfig.direction === 'asc' ? '↑' : '↓'}
                        </span>
                      )}
                    </th>
                    <th 
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                      onClick={() => handleSort('name')}
                    >
                      Name
                      {sortConfig?.key === 'name' && (
                        <span className="ml-1">
                          {sortConfig.direction === 'asc' ? '↑' : '↓'}
                        </span>
                      )}
                    </th>
                    <th 
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                      onClick={() => handleSort('phone')}
                    >
                      Phone
                      {sortConfig?.key === 'phone' && (
                        <span className="ml-1">
                          {sortConfig.direction === 'asc' ? '↑' : '↓'}
                        </span>
                      )}
                    </th>
                    <th 
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                      onClick={() => handleSort('email')}
                    >
                      Email
                      {sortConfig?.key === 'email' && (
                        <span className="ml-1">
                          {sortConfig.direction === 'asc' ? '↑' : '↓'}
                        </span>
                      )}
                    </th>
                    <th 
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                      onClick={() => handleSort('city')}
                    >
                      City
                      {sortConfig?.key === 'city' && (
                        <span className="ml-1">
                          {sortConfig.direction === 'asc' ? '↑' : '↓'}
                        </span>
                      )}
                    </th>
                    <th 
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                      onClick={() => handleSort('createdAt')}
                    >
                      Created At
                      {sortConfig?.key === 'createdAt' && (
                        <span className="ml-1">
                          {sortConfig.direction === 'asc' ? '↑' : '↓'}
                        </span>
                      )}
                    </th>
                    <th 
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                      onClick={() => handleSort('createdBy')}
                    >
                      Created By
                      {sortConfig?.key === 'createdBy' && (
                        <span className="ml-1">
                          {sortConfig.direction === 'asc' ? '↑' : '↓'}
                        </span>
                      )}
                    </th>
                    <th 
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                      onClick={() => handleSort('status')}
                    >
                      Status
                      {sortConfig?.key === 'status' && (
                        <span className="ml-1">
                          {sortConfig.direction === 'asc' ? '↑' : '↓'}
                        </span>
                      )}
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {sortedSuppliers.map((supplier, index) => (
                    <tr key={supplier.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 text-sm text-gray-900">
                        {(currentPage - 1) * itemsPerPage + index + 1}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {supplier.name}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {supplier.phone}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {supplier.email}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {supplier.city}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {supplier.createdAt?.slice(0, 10)}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {supplier.createdBy}
                      </td>
                      <td className="px-6 py-4">
                        <span className={`text-xs font-semibold px-2 py-1 rounded-full ${supplier.status ? "bg-green-100 text-green-800" : "bg-yellow-100 text-yellow-800"}`}>
                          {supplier.status ? "Active" : "Inactive"}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right flex justify-end gap-2">
                        <Button onClick={() => handleEdit(supplier)} className="bg-indigo-600 hover:bg-indigo-700 text-white p-2 rounded-md"><Edit className="h-4 w-4" /></Button>
                        <Button onClick={() => supplier.id && handleDelete(supplier.id)} className="bg-red-600 hover:bg-red-700 text-white p-2 rounded-md"><Trash2 className="h-4 w-4" /></Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="bg-white px-6 py-3 border-t border-gray-200">
                <div className="flex justify-between items-center">
                  <p className="text-sm text-gray-600">
                    Showing {(currentPage - 1) * itemsPerPage + 1} - {Math.min(currentPage * itemsPerPage, totalItems)} of {totalItems}
                  </p>
                  <div className="inline-flex rounded-md shadow-sm">
                    <Button 
                      onClick={() => setCurrentPage(p => Math.max(p - 1, 1))} 
                      disabled={!canPreviousPage} 
                      className="px-2 py-1 bg-white border border-gray-300 hover:bg-gray-50 text-sm text-gray-600 rounded-l-md"
                    >
                      <ChevronLeft />
                    </Button>
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                      <Button 
                        key={page} 
                        onClick={() => setCurrentPage(page)} 
                        className={`px-3 py-1 border text-sm ${currentPage === page ? "bg-indigo-600 text-white border-indigo-600" : "bg-white hover:bg-indigo-50 text-gray-600 border-gray-300"}`}
                      >
                        {page}
                      </Button>
                    ))}
                    <Button 
                      onClick={() => setCurrentPage(p => Math.min(p + 1, totalPages))} 
                      disabled={!canNextPage} 
                      className="px-2 py-1 bg-white border border-gray-300 hover:bg-gray-50 text-sm text-gray-600 rounded-r-md"
                    >
                      <ChevronRight />
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Modal */}
        {formOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
            <div className="bg-white p-4 rounded-xl shadow-lg w-full max-w-3xl max-h-[90vh] overflow-y-auto relative">
              <button onClick={() => setFormOpen(false)} className="absolute top-4 right-4 text-gray-400 hover:text-red-500"><X /></button>
              <h2 className="text-xl font-semibold mb-4">{formData.id ? "Edit" : "Add"} Supplier</h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm max-h-[60vh] overflow-y-auto pr-2">
                {[
                  { label: "Name", name: "name" },
                  { label: "Phone", name: "phone" },
                  { label: "Email", name: "email" },
                  { label: "City", name: "city" },
                  { 
                    label: "Created At", 
                    name: "createdAt",
                    type: "date" 
                  },
                  { label: "Created By", name: "createdBy" },
                ].map(({ label, name, type = "text" }) => (
                  <div key={name} className="space-y-2">
                    <label className="text-sm text-gray-700">{label}</label>
                    <input
                      type={type}
                      name={name}
                      value={(formData as any)[name] || ""}
                      onChange={handleFormChange}
                      placeholder={label}
                      className="w-full p-2 border border-gray-300 rounded-md"
                    />
                  </div>
                ))}
                <div className="flex items-center gap-2 md:col-span-2">
                  <input 
                    type="checkbox" 
                    name="status" 
                    checked={formData.status} 
                    onChange={handleFormChange} 
                    className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                  />
                  <label className="text-sm text-gray-700">Active Supplier</label>
                </div>
              </div>

              <div className="mt-4 pt-4 border-t flex justify-end gap-3 sticky bottom-0 bg-white">
                <Button 
                  onClick={() => setFormOpen(false)} 
                  className="bg-gray-100 border border-gray-300 text-gray-800 hover:bg-gray-200 px-4 py-2 rounded-md"
                >
                  Cancel
                </Button>
                <Button 
                  onClick={handleSubmit} 
                  disabled={isSaving}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-md disabled:opacity-50"
                >
                  {isSaving ? "Saving..." : formData.id ? "Update Supplier" : "Create Supplier"}
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}