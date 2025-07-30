"use client";

import React, { useEffect, useState } from "react";
import Button from "@/components/ui/button/Button";
import { X, Trash2, Edit, ChevronLeft, ChevronRight } from "lucide-react";
import { toast } from "react-hot-toast";
import Layout from "@/components/layout/Layout";

type Boat = {
  id?: number;
  documentId?: string;
  ownername: string;
  ownerphone: string;
  ownercity: string;
  owneremail: string;
  boatcategory: string;
  status: boolean;
};

export default function BoatPage() {
  const [boats, setBoats] = useState<Boat[]>([]);
  const [loading, setLoading] = useState(true);
  const [sortConfig, setSortConfig] = useState<{ key: keyof Boat; direction: 'asc' | 'desc' } | null>(null);
  const [formOpen, setFormOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [formData, setFormData] = useState<Boat>({
    ownername: "",
    ownerphone: "",
    ownercity: "",
    owneremail: "",
    boatcategory: "",
    status: false,
  });

  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [totalItems, setTotalItems] = useState(0);

  const fetchBoats = async (page = currentPage) => {
    try {
      setLoading(true);
      const res = await fetch(
        `http://localhost:1337/api/boats?pagination[page]=${page}&pagination[pageSize]=${itemsPerPage}`
      );

      if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);

      const json = await res.json();
      if (!json.data) throw new Error("No data received from API");

      const formatted = json.data.map((item: any) => ({
        id: item.id,
        documentId: item.documentId,
        ownername: item.ownername || "",
        ownerphone: item.ownerphone || "",
        ownercity: item.ownercity || "",
        owneremail: item.owneremail || "",
        boatcategory: item.boatcategory || "",
        status: item.status || false,
      }));

      setBoats(formatted);
      setTotalItems(json.meta?.pagination?.total || 0);
    } catch (err: any) {
      console.error("Fetch error:", err);
      toast.error(`Failed to load data: ${err.message}`);
      setBoats([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBoats();
  }, [currentPage]);

  const handleSort = (key: keyof Boat) => {
    let direction: 'asc' | 'desc' = 'asc';
    if (sortConfig && sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  const sortedBoats = React.useMemo(() => {
    if (!sortConfig) return boats;
    return [...boats].sort((a, b) => {
      if (a[sortConfig.key]! < b[sortConfig.key]!) return sortConfig.direction === 'asc' ? -1 : 1;
      if (a[sortConfig.key]! > b[sortConfig.key]!) return sortConfig.direction === 'asc' ? 1 : -1;
      return 0;
    });
  }, [boats, sortConfig]);

  const handleEdit = (boat: Boat) => {
    setFormData({ ...boat });
    setFormOpen(true);
  };

  const handleAdd = () => {
    setFormData({
      ownername: "",
      ownerphone: "",
      ownercity: "",
      owneremail: "",
      boatcategory: "",
      status: false,
    });
    setFormOpen(true);
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm("Are you sure you want to delete this boat?")) return;
    try {
      const res = await fetch(`http://localhost:1337/api/boats/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete boat");
      toast.success("Boat deleted successfully");
      fetchBoats();
    } catch (err) {
      toast.error("Error deleting boat");
      console.error(err);
    }
  };

  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    const isCheckbox = type === "checkbox";
    const checked = isCheckbox && "checked" in e.target ? (e.target as HTMLInputElement).checked : undefined;

    setFormData((prev) => ({
      ...prev,
      [name]: isCheckbox ? checked : value,
    }));
  };

  const handleSubmit = async () => {
    setIsSaving(true);
    const isEdit = !!formData.documentId;

    const payload = {
      data: {
        ownername: formData.ownername,
        ownerphone: formData.ownerphone,
        ownercity: formData.ownercity,
        owneremail: formData.owneremail,
        boatcategory: formData.boatcategory,
        status: formData.status,
      },
    };

    const url = isEdit
      ? `http://localhost:1337/api/boats/${formData.documentId}`
      : "http://localhost:1337/api/boats";

    const method = isEdit ? "PUT" : "POST";

    try {
      const res = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      let resJson;
      try {
        resJson = await res.json();
      } catch {
        resJson = {};
      }

      if (!res.ok) {
        console.error(`Save failed: [${res.status}]`, resJson);
        toast.error(resJson?.error?.message || `Failed to save boat [${res.status}]`);
        return;
      }

      toast.success(isEdit ? "Boat updated!" : "Boat created!");
      setFormOpen(false);
      fetchBoats(currentPage); // Maintain current page after edit
    } catch (err) {
      console.error("Unexpected error saving boat:", err);
      toast.error("Something went wrong");
    } finally {
      setIsSaving(false);
    }
  };

  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const canPreviousPage = currentPage > 1;
  const canNextPage = currentPage < totalPages;

  return (
    <Layout pageTitle="Boat Management | Fisher">
      <div className="p-6 max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-gray-800">🚤 Boat Management</h1>
          <Button onClick={handleAdd} className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-md">
            + Add Boat
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
                      onClick={() => handleSort('ownername')}
                    >
                      Owner
                      {sortConfig?.key === 'ownername' && (
                        <span className="ml-1">
                          {sortConfig.direction === 'asc' ? '↑' : '↓'}
                        </span>
                      )}
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Contact</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Boat Details</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {sortedBoats.map((boat, index) => (
                    <tr key={boat.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 text-sm text-gray-900">
                        {(currentPage - 1) * itemsPerPage + index + 1}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {boat.ownername}<br />
                        {boat.ownercity}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        📞 {boat.ownerphone}<br />
                        ✉️ {boat.owneremail}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {boat.boatcategory}
                      </td>
                      <td className="px-6 py-4">
                        <span className={`text-xs font-semibold px-2 py-1 rounded-full ${boat.status ? "bg-green-100 text-green-800" : "bg-yellow-100 text-yellow-800"}`}>
                          {boat.status ? "Active" : "Inactive"}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right flex justify-end gap-2">
                        <Button onClick={() => handleEdit(boat)} className="bg-indigo-600 hover:bg-indigo-700 text-white p-2 rounded-md"><Edit className="h-4 w-4" /></Button>
                        <Button onClick={() => boat.id && handleDelete(boat.id)} className="bg-red-600 hover:bg-red-700 text-white p-2 rounded-md"><Trash2 className="h-4 w-4" /></Button>
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
              <h2 className="text-xl font-semibold mb-4">{formData.id ? "Edit" : "Add"} Boat</h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm max-h-[60vh] overflow-y-auto pr-2">
                {[
                  { label: "Owner Name", name: "ownername" },
                  { label: "Owner Phone", name: "ownerphone" },
                  { label: "Owner City", name: "ownercity" },
                  { label: "Owner Email", name: "owneremail" },
                  { label: "Boat Category", name: "boatcategory" },
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
                <div className="flex items-center gap-2 md:col-span-2">
                  <input 
                    type="checkbox" 
                    name="status" 
                    checked={formData.status} 
                    onChange={handleFormChange} 
                    className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                  />
                  <label className="text-sm text-gray-700">Active Boat</label>
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
                  {isSaving ? "Saving..." : formData.id ? "Update Boat" : "Create Boat"}
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}