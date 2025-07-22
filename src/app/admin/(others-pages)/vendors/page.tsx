"use client";

import React, { useEffect, useState } from "react";
import Button from "@/components/ui/button/Button";
import { X, Trash2, Edit, ChevronLeft, ChevronRight, Plus } from "lucide-react";
import { toast } from "react-hot-toast";

type Vendor = {
  id?: number;
  name: string;
  phone: string;
  email: string;
  city: string;
  location: string;
  category: string;
  about: string;
  resource?: string;
};

export default function VendorPage() {
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [loading, setLoading] = useState(true);
  const [formOpen, setFormOpen] = useState(false);
  const [formData, setFormData] = useState<Vendor>({
    name: "",
    phone: "",
    email: "",
    city: "",
    location: "",
    category: "",
    about: "",
  });

  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [totalItems, setTotalItems] = useState(0);

  const fetchVendors = async (page = 1) => {
    try {
      setLoading(true);
      const res = await fetch(
        `http://localhost:1337/api/vendors?pagination[page]=${page}&pagination[pageSize]=${itemsPerPage}&populate=resource`
      );

      if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);

      const json = await res.json();
      if (!json.data) throw new Error("No data received from API");

      const formatted = json.data.map((item: any) => {
        const attributes = item.attributes || item; // support both deep and flat formats
        const resourceData = attributes.resource?.data?.attributes || item.resource?.[0] || null;
        const resourceUrl = resourceData?.url ? `http://localhost:1337${resourceData.url}` : "";

        return {
          id: item.id,
          name: attributes.name || "",
          phone: attributes.phone || "",
          email: attributes.email || "",
          city: attributes.city || "",
          location: attributes.location || "",
          category: attributes.category || "",
          about: Array.isArray(attributes.about)
            ? attributes.about
                .map((block: any) =>
                  block.children?.map((child: any) => child.text).join("")
                )
                .join("\n")
            : typeof attributes.about === "object"
            ? JSON.stringify(attributes.about)
            : attributes.about || "",

          resource: resourceUrl,
        };
      });

      setVendors(formatted);
      setTotalItems(json.meta?.pagination?.total || 0);
    } catch (err: any) {
      toast.error(`Failed to load data: ${err.message}`);
      setVendors([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVendors(currentPage);
  }, [currentPage]);

  const handleEdit = (vendor: Vendor) => {
    setFormData({ ...vendor });
    setFormOpen(true);
  };

  const handleAdd = () => {
    setFormData({
      name: "",
      phone: "",
      email: "",
      city: "",
      location: "",
      category: "",
      about: "",
    });
    setFormOpen(true);
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm("Are you sure you want to delete this vendor?")) return;
    try {
      const res = await fetch(`http://localhost:1337/api/vendors/${id}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("Failed to delete vendor");
      toast.success("Vendor deleted successfully");
      fetchVendors(currentPage);
    } catch (err) {
      toast.error("Error deleting vendor");
      console.error(err);
    }
  };

  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFormData(prev => ({ ...prev, resource: URL.createObjectURL(e.target.files![0]) }));
    }
  };

  const handleSubmit = async () => {
    try {
      if (!formData.name || !formData.phone) {
        toast.error("Name and Phone are required.");
        return;
      }

      const isEdit = !!formData.id;
      const url = isEdit
        ? `http://localhost:1337/api/vendors/${formData.id}`
        : `http://localhost:1337/api/vendors`;

      const payload = {
        data: {
          name: formData.name,
          phone: formData.phone,
          email: formData.email,
          city: formData.city,
          location: formData.location,
          category: formData.category,
          about: formData.about,
        }
      };

      const res = await fetch(url, {
        method: isEdit ? "PUT" : "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error?.message || "Failed to save vendor");
      }

      toast.success(isEdit ? "Updated successfully!" : "Created successfully!");
      setFormOpen(false);
      fetchVendors(currentPage);
    } catch (err) {
      toast.error(`Error saving vendor: ${err instanceof Error ? err.message : "Unknown error"}`);
    }
  };

  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const canPreviousPage = currentPage > 1;
  const canNextPage = currentPage < totalPages;

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-800">🏢 Vendor Management</h1>
        <Button onClick={handleAdd} className="bg-blue-600 hover:bg-blue-700 text-white flex items-center gap-2 px-4 py-2 rounded-md">
          <Plus className="h-4 w-4" />
          Add Vendor
        </Button>
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">#</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Vendor</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Contact</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Location</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">About</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {vendors.map((vendor, index) => (
                  <tr key={vendor.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 text-sm text-gray-700">
                      {(currentPage - 1) * itemsPerPage + index + 1}
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm font-medium text-gray-900">{vendor.name}</div>
                      <div className="text-sm text-gray-500">{vendor.category}</div>
                      {vendor.resource && (
                        <img src={vendor.resource} alt="resource" className="mt-1 h-10 w-10 rounded-full object-cover" />
                      )}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-700">
                      <div>{vendor.phone}</div>
                      <div className="text-gray-500">{vendor.email}</div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-700">
                      <div>{vendor.city}</div>
                      <div className="text-gray-500">{vendor.location}</div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-700 max-w-xs">
                      <div dangerouslySetInnerHTML={{ __html: vendor.about }} />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex justify-end gap-2">
                        <Button onClick={() => handleEdit(vendor)} className="bg-blue-600 hover:bg-blue-700 text-white p-2 rounded-md">
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button onClick={() => vendor.id && handleDelete(vendor.id)} className="bg-red-600 hover:bg-red-700 text-white p-2 rounded-md">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="bg-white px-6 py-3 flex items-center justify-between border-t border-gray-200">
              <div className="flex-1 flex justify-between sm:hidden">
                <Button
                  onClick={() => setCurrentPage(p => Math.max(p - 1, 1))}
                  disabled={!canPreviousPage}
                  className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                >
                  Previous
                </Button>
                <Button
                  onClick={() => setCurrentPage(p => Math.min(p + 1, totalPages))}
                  disabled={!canNextPage}
                  className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                >
                  Next
                </Button>
              </div>
              <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm text-gray-700">
                    Showing <span className="font-medium">{(currentPage - 1) * itemsPerPage + 1}</span> to{' '}
                    <span className="font-medium">{Math.min(currentPage * itemsPerPage, totalItems)}</span> of{' '}
                    <span className="font-medium">{totalItems}</span> results
                  </p>
                </div>
                <div>
                  <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                    <Button
                      onClick={() => setCurrentPage(p => Math.max(p - 1, 1))}
                      disabled={!canPreviousPage}
                      className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50"
                    >
                      <span className="sr-only">Previous</span>
                      <ChevronLeft className="h-5 w-5" aria-hidden="true" />
                    </Button>
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                      <Button
                        key={page}
                        onClick={() => setCurrentPage(page)}
                        className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                          currentPage === page
                            ? 'z-10 bg-blue-50 border-blue-500 text-blue-600'
                            : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                        }`}
                      >
                        {page}
                      </Button>
                    ))}
                    <Button
                      onClick={() => setCurrentPage(p => Math.min(p + 1, totalPages))}
                      disabled={!canNextPage}
                      className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50"
                    >
                      <span className="sr-only">Next</span>
                      <ChevronRight className="h-5 w-5" aria-hidden="true" />
                    </Button>
                  </nav>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* FORM MODAL */}
      {formOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <div className="bg-white p-6 rounded-xl shadow-lg w-full max-w-2xl relative max-h-[80vh] flex flex-col">
             <div className="overflow-y-auto pr-2 flex-1">
            <button
              onClick={() => setFormOpen(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-red-500"
            >
              <X />
            </button>
            <h2 className="text-xl font-semibold mb-4 text-gray-800">
              {formData.id ? "Edit" : "Add"} Vendor
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">Name*</label>
                <input 
                  name="name" 
                  placeholder="Vendor name" 
                  value={formData.name} 
                  onChange={handleFormChange} 
                  className="border border-gray-300 p-2 rounded-md w-full focus:ring-blue-500 focus:border-blue-500" 
                  required
                />
              </div>
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">Phone*</label>
                <input 
                  name="phone" 
                  placeholder="+1 (555) 123-4567" 
                  value={formData.phone} 
                  onChange={handleFormChange} 
                  className="border border-gray-300 p-2 rounded-md w-full focus:ring-blue-500 focus:border-blue-500" 
                  required
                />
              </div>
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">Email</label>
                <input 
                  name="email" 
                  placeholder="vendor@example.com" 
                  value={formData.email} 
                  onChange={handleFormChange} 
                  className="border border-gray-300 p-2 rounded-md w-full focus:ring-blue-500 focus:border-blue-500" 
                />
              </div>
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">City</label>
                <input 
                  name="city" 
                  placeholder="City" 
                  value={formData.city} 
                  onChange={handleFormChange} 
                  className="border border-gray-300 p-2 rounded-md w-full focus:ring-blue-500 focus:border-blue-500" 
                />
              </div>
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">Location</label>
                <input 
                  name="location" 
                  placeholder="Full address" 
                  value={formData.location} 
                  onChange={handleFormChange} 
                  className="border border-gray-300 p-2 rounded-md w-full focus:ring-blue-500 focus:border-blue-500" 
                />
              </div>
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">Category</label>
                <input 
                  name="category" 
                  placeholder="Vendor category" 
                  value={formData.category} 
                  onChange={handleFormChange} 
                  className="border border-gray-300 p-2 rounded-md w-full focus:ring-blue-500 focus:border-blue-500" 
                />
              </div>
              <div className="space-y-2 md:col-span-2">
                <label className="block text-sm font-medium text-gray-700">About</label>
                <textarea 
                  name="about" 
                  placeholder="Details about the vendor..." 
                  value={formData.about} 
                  onChange={handleFormChange} 
                  rows={4}
                  className="border border-gray-300 p-2 rounded-md w-full focus:ring-blue-500 focus:border-blue-500" 
                />
              </div>
              <div className="space-y-2 md:col-span-2">
                <label className="block text-sm font-medium text-gray-700">Resource (Image/File)</label>
                <input 
                  type="file" 
                  onChange={handleFileChange}
                  className="border border-gray-300 p-2 rounded-md w-full focus:ring-blue-500 focus:border-blue-500" 
                />
                {formData.resource && (
                  <div className="mt-2">
                    <img 
                      src={formData.resource} 
                      alt="Vendor resource preview" 
                      className="h-16 w-16 object-cover rounded-md"
                    />
                  </div>
                )}
              </div>
            </div>
           </div>
            <div className="mt-6 flex justify-end gap-3">
              <Button
                onClick={() => setFormOpen(false)}
                className="bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 px-4 py-2 rounded-md"
              >
                Cancel
              </Button>
              <Button
                onClick={handleSubmit}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md"
              >
                {formData.id ? "Update Vendor" : "Create Vendor"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
