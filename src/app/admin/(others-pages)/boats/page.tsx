"use client";

import React, { useEffect, useState } from "react";
import Button from "@/components/ui/button/Button";
import { X, Trash2, Edit, ChevronLeft, ChevronRight } from "lucide-react";
import { toast } from "react-hot-toast";
import Layout from "@/components/layout/Layout";

/**
 * Boat Management Page
 * 
 * This component provides a comprehensive interface for managing boat records including:
 * - Displaying a paginated list of boats with sorting capabilities
 * - Adding new boat records
 * - Editing existing boat records
 * - Deleting boat records
 * 
 * Features:
 * - Responsive design with a clean UI
 * - Client-side sorting
 * - Server-side pagination
 * - Form validation
 * - Toast notifications for user feedback
 * 
 * API Integration:
 * - Connects to a Strapi backend for CRUD operations
 * - Uses JWT for authentication
 *   @Developer : Simran Samir
 */

type Boat = {
  id?: number;
  documentId?: string;
  ownername: string;
  ownerphone: string;
  ownercity: string;
  owneremail: string;
  boatcategory: string;
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
  });

  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [totalItems, setTotalItems] = useState(0);

  /**
   * Fetches boat data from the API with pagination support
   * @param {number} page - The page number to fetch (defaults to currentPage)
   */
  const fetchBoats = async (page = currentPage) => {
    try {
      setLoading(true);
      const res = await fetch(
        process.env.NEXT_PUBLIC_API_URL+`/boats?pagination[page]=${page}&pagination[pageSize]=${itemsPerPage}`,
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
        ownername: item.ownername || "",
        ownerphone: item.ownerphone || "",
        ownercity: item.ownercity || "",
        owneremail: item.owneremail || "",
        boatcategory: item.boatcategory || "",
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

  /**
   * Handles column sorting for the boat table
   * @param {keyof Boat} key - The column key to sort by
   */
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

  /**
   * Prepares the form for editing an existing boat
   * @param {Boat} boat - The boat object to edit
   */
  const handleEdit = (boat: Boat) => {
    setFormData({ ...boat });
    setFormOpen(true);
  };

  /**
   * Prepares the form for adding a new boat
   */
  const handleAdd = () => {
    setFormData({
      ownername: "",
      ownerphone: "",
      ownercity: "",
      owneremail: "",
      boatcategory: "",
    });
    setFormOpen(true);
  };

  /**
   * Handles boat deletion after confirmation
   * @param {number} id - The ID of the boat to delete
   */
  const handleDelete = async (id: number) => {
    if (!window.confirm("Are you sure you want to delete this boat?")) return;
    try {
      const res = await fetch(process.env.NEXT_PUBLIC_API_URL+`/boats/${id}`, { 
        method: "DELETE",
        headers: {
          Authorization: "Bearer " + localStorage.getItem("jwt"),
        }
      });
      if (!res.ok) throw new Error("Failed to delete boat");
      toast.success("Boat deleted successfully");
      fetchBoats();
    } catch (err) {
      toast.error("Error deleting boat");
      console.error(err);
    }
  };

  /**
   * Handles form input changes
   * @param {React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>} e - The change event
   */
  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  /**
   * Handles boat creation or update
   * Determines if the form is in 'edit' mode based on the presence of documentId
   * Constructs a request to the Strapi API with appropriate method and payload
   * Shows user feedback on success/failure and refreshes list if successful
   */
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
      },
    };

    const url = isEdit
      ? `${process.env.NEXT_PUBLIC_API_URL}/boats/${formData.documentId}`
      : `${process.env.NEXT_PUBLIC_API_URL}/boats`;

    const method = isEdit ? "PUT" : "POST";

    try {
      const res = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer " + localStorage.getItem("jwt"),
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
      fetchBoats(currentPage);
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