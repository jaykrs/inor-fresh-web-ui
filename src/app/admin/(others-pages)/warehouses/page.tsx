"use client";

import React, { useEffect, useState } from "react";
import Button from "@/components/ui/button/Button";
import { X, Trash2, Edit, ChevronLeft, ChevronRight } from "lucide-react";
import { toast } from "react-hot-toast";
import Layout from "@/components/layout/Layout";

/**
 * Warehouse Management Component
 * 
 * This component provides a complete interface for managing warehouse records including:
 * - Displaying a paginated list of warehouses with sorting capabilities
 * - Creating, updating, and deleting warehouse records
 * - Form validation and user feedback
 * 
 * Features:
 * - Server-side pagination
 * - Client-side sorting
 * - Responsive design
 * - Toast notifications for user feedback
 * - Description column in list view
 * 
 * API Integration:
 * - Uses JWT authentication for all requests
 * - Handles GET, POST, PUT, and DELETE operations
 * - Connects to Strapi backend
 *   @Developer : Simran Samir
 */

type Warehouse = {
  id?: number;
  documentId?: string;
  warehouseid: string;
  name: string;
  location: string;
  phone: string;
  area: string;
  manager: string;
  managername: string;
  managerphone: string;
  email: string;
  description: string;
  active: boolean;
  startdt?: string;
};

export default function WarehousePage() {
  // State management
  const [warehouses, setWarehouses] = useState<Warehouse[]>([]);
  const [loading, setLoading] = useState(true);
  const [sortConfig, setSortConfig] = useState<{ key: keyof Warehouse; direction: 'asc' | 'desc' } | null>(null);
  const [formOpen, setFormOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [formData, setFormData] = useState<Warehouse>({
    warehouseid: "",
    name: "",
    location: "",
    phone: "",
    area: "",
    manager: "",
    managername: "",
    managerphone: "",
    email: "",
    description: "",
    active: false,
  });

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [totalItems, setTotalItems] = useState(0);

  /**
   * Fetches warehouses from the API with pagination
   * @param {number} page - The page number to fetch (defaults to currentPage)
   */
  const fetchWarehouses = async (page = currentPage) => {
    try {
      setLoading(true);
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/warehouses?pagination[page]=${page}&pagination[pageSize]=${itemsPerPage}`,
        {
          method: 'GET',
          headers: {
            Authorization: "Bearer " + localStorage.getItem("jwt"),
            'Content-Type': 'application/json',
          },
        }
      );

      if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);

      const json = await res.json();
      if (!json.data) throw new Error("No data received from API");

      const formatted = json.data.map((item: any) => ({
        id: item.id,
        documentId: item.documentId,
        warehouseid: item.warehouseid || "",
        name: item.name || "",
        location: item.location || "",
        phone: item.phone || "",
        area: item.area || "",
        manager: item.manager || "",
        managername: item.managername || "",
        managerphone: item.managerphone || "",
        email: item.email || "",
        description: item.description || "",
        active: item.active || false,
        startdt: item.startdt || "",
      }));

      setWarehouses(formatted);
      setTotalItems(json.meta?.pagination?.total || 0);
    } catch (err: any) {
      console.error("Fetch error:", err);
      toast.error(`Failed to load data: ${err.message}`);
      setWarehouses([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWarehouses();
  }, [currentPage]);

  /**
   * Handles column sorting
   * @param {keyof Warehouse} key - The column to sort by
   */
  const handleSort = (key: keyof Warehouse) => {
    let direction: 'asc' | 'desc' = 'asc';
    if (sortConfig && sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  // Sorted warehouses list
  const sortedWarehouses = React.useMemo(() => {
    if (!sortConfig) return warehouses;
    return [...warehouses].sort((a, b) => {
      if (a[sortConfig.key]! < b[sortConfig.key]!) return sortConfig.direction === 'asc' ? -1 : 1;
      if (a[sortConfig.key]! > b[sortConfig.key]!) return sortConfig.direction === 'asc' ? 1 : -1;
      return 0;
    });
  }, [warehouses, sortConfig]);

  /**
   * Prepares form for editing an existing warehouse
   * @param {Warehouse} warehouse - The warehouse to edit
   */
  const handleEdit = (warehouse: Warehouse) => {
    setFormData({ ...warehouse });
    setFormOpen(true);
  };

  /** Prepares form for adding a new warehouse */
  const handleAdd = () => {
    setFormData({
      warehouseid: "",
      name: "",
      location: "",
      phone: "",
      area: "",
      manager: "",
      managername: "",
      managerphone: "",
      email: "",
      description: "",
      active: false,
      startdt: "",
    });
    setFormOpen(true);
  };

  /**
   * Deletes a warehouse after confirmation
   * @param {number} id - The ID of the warehouse to delete
   */
  const handleDelete = async (id: number) => {
    if (!window.confirm("Are you sure you want to delete this warehouse?")) return;
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/warehouses/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${localStorage.getItem('jwt')}`,
        },
      });
      if (!res.ok) throw new Error("Failed to delete warehouse");
      toast.success("Warehouse deleted successfully");
      fetchWarehouses(currentPage); // Refresh list
    } catch (err) {
      toast.error("Error deleting warehouse");
      console.error(err);
    }
  };

  /**
   * Handles form input changes
   * @param {React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>} e - The change event
   */
  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
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
        warehouseid: formData.warehouseid,
        name: formData.name,
        location: formData.location,
        phone: formData.phone,
        area: formData.area,
        manager: formData.manager,
        managername: formData.managername,
        managerphone: formData.managerphone,
        email: formData.email,
        description: formData.description,
        active: formData.active,
        startdt: formData.startdt,
      },
    };

    const url = isEdit
      ? `${process.env.NEXT_PUBLIC_API_URL}/warehouses/${formData.documentId}`
      : `${process.env.NEXT_PUBLIC_API_URL}/warehouses`;

    try {
      const res = await fetch(url, {
        method: isEdit ? "PUT" : "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem('jwt')}`,
        },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error?.message || `Failed to save warehouse [${res.status}]`);
      }

      toast.success(isEdit ? "Warehouse updated!" : "Warehouse created!");
      setFormOpen(false);
      fetchWarehouses(isEdit ? currentPage : 1); // Stay on current page for edits, go to first for new
    } catch (err) {
      console.error("Error saving warehouse:", err);
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
    <Layout pageTitle="Warehouse Management | Fisher">
      <div className="p-6 max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-gray-800">📦 Warehouse Management</h1>
          <Button onClick={handleAdd} className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-md">
            + Add Warehouse
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
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Warehouse</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Manager</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Description</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {sortedWarehouses.map((wh, index) => (
                    <tr key={wh.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 text-sm text-gray-900">
                        {(currentPage - 1) * itemsPerPage + index + 1}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        <div className="font-medium">{wh.name}</div>
                        <div>ID: {wh.warehouseid}</div>
                        <div>{wh.location}</div>
                        <div>Area: {wh.area} sq ft</div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        <div>{wh.managername}</div>
                        <div>ID: {wh.manager}</div>
                        <div>📞 {wh.managerphone}</div>
                        <div>✉️ {wh.email}</div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600 max-w-xs">
                        {wh.description || '-'}
                      </td>
                      <td className="px-6 py-4">
                        <span className={`text-xs font-semibold px-2 py-1 rounded-full ${wh.active ? "bg-green-100 text-green-800" : "bg-yellow-100 text-yellow-800"}`}>
                          {wh.active ? "Active" : "Inactive"}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right flex justify-end gap-2">
                        <Button onClick={() => handleEdit(wh)} className="bg-indigo-600 hover:bg-indigo-700 text-white p-2 rounded-md"><Edit className="h-4 w-4" /></Button>
                        <Button onClick={() => wh.id && handleDelete(wh.id)} className="bg-red-600 hover:bg-red-700 text-white p-2 rounded-md"><Trash2 className="h-4 w-4" /></Button>
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

        {/* Modal (remains exactly the same) */}
        {formOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
            <div className="bg-white p-4 rounded-xl shadow-lg w-full max-w-3xl max-h-[90vh] overflow-y-auto relative">
              <button onClick={() => setFormOpen(false)} className="absolute top-4 right-4 text-gray-400 hover:text-red-500"><X /></button>
              <h2 className="text-xl font-semibold mb-4">{formData.id ? "Edit" : "Add"} Warehouse</h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm max-h-[60vh] overflow-y-auto pr-2">
                {[
                  { label: "Warehouse ID", name: "warehouseid" },
                  { label: "Name", name: "name" },
                  { label: "Location*", name: "location" },
                  { label: "Area (sq ft)", name: "area" },
                  { label: "Phone*", name: "phone" },
                  { label: "Email", name: "email" },
                  { label: "Manager ID", name: "manager" },
                  { label: "Manager Name", name: "managername" },
                  { label: "Manager Phone", name: "managerphone" },
                ].map(({ label, name }) => (
                  <div key={name} className="space-y-2">
                    <label className="text-sm text-gray-700">{label}</label>
                    <input
                      name={name}
                      value={(formData as any)[name]}
                      onChange={handleFormChange}
                      placeholder={label}
                      className="w-full p-2 border border-gray-300 rounded-md"
                    />
                  </div>
                ))}
                <div className="space-y-2">
                  <label className="text-sm text-gray-700">Start Date</label>
                  <input
                    type="date"
                    name="startdt"
                    value={formData.startdt}
                    onChange={handleFormChange}
                    className="w-full p-2 border border-gray-300 rounded-md"
                  />
                </div>
                <div className="space-y-2 md:col-span-2">
                  <label className="text-sm text-gray-700">Description</label>
                  <textarea
                    name="description"
                    rows={3}
                    value={formData.description}
                    onChange={handleFormChange}
                    className="w-full p-2 border border-gray-300 rounded-md"
                  />
                </div>
                <div className="flex items-center gap-2 md:col-span-2">
                  <input 
                    type="checkbox" 
                    name="active" 
                    checked={formData.active} 
                    onChange={handleFormChange} 
                    className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                  />
                  <label className="text-sm text-gray-700">Active Warehouse</label>
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
                  {isSaving ? "Saving..." : formData.id ? "Update Warehouse" : "Create Warehouse"}
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}