"use client";

import React, { useEffect, useState } from "react";
import Button from "@/components/ui/button/Button";
import { X, Trash2, Edit, ChevronLeft, ChevronRight, Plus } from "lucide-react";
import { toast } from "react-hot-toast";
import Layout from "@/components/layout/Layout";

/**
 * Product Management Page
 * 
 * This component provides a comprehensive interface for managing product records including:
 * - Displaying a paginated list of products with image support
 * - Adding new product records
 * - Editing existing product records
 * - Deleting product records
 * 
 * Features:
 * - Responsive design with a clean UI
 * - Image upload and preview functionality
 * - Form validation
 * - Toast notifications for user feedback
 * 
 * API Integration:
 * - Connects to a Strapi backend for CRUD operations
 * - Uses JWT for authentication
 *   @Developer : Simran Samir
 */

type Product = {
  id?: number;
  documentId?: string;
  name: string;
  description: string;
  image?: string;
  imageavatar?: string;
  size: string;
  grade: string;
  expiry: string;
  manufacturedt: string;
  about: string;
};

export default function ProductPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [sortConfig, setSortConfig] = useState<{ key: keyof Product; direction: 'asc' | 'desc' } | null>(null);
  const [formOpen, setFormOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [formData, setFormData] = useState<Product>({
    name: "",
    description: "",
    size: "",
    grade: "",
    expiry: "",
    manufacturedt: "",
    about: "",
  });

  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [totalItems, setTotalItems] = useState(0);

  /**
   * Fetches product data from the API with pagination support
   * @param {number} page - The page number to fetch (defaults to currentPage)
   */
  const fetchProducts = async (page = currentPage) => {
    try {
      setLoading(true);
      const res = await fetch(
        process.env.NEXT_PUBLIC_API_URL+`/products?pagination[page]=${page}&pagination[pageSize]=${itemsPerPage}&populate=*`,
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

      const formatted = json.data.map((item: any) => {
        const attributes = item.attributes || item;
        
        // Handle image data
        const imageData = attributes.image?.data?.attributes || attributes.image || null;
        const imageUrl = imageData?.url ? `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:1337'}${imageData.url}` : "";
        
        // Handle imageavatar data
        const imageavatarData = attributes.imageavatar?.data?.attributes || attributes.imageavatar || null;
        const imageavatarUrl = imageavatarData?.url ? `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:1337'}${imageavatarData.url}` : "";

        return {
          id: item.id,
          documentId: item.id,
          name: attributes.name || "",
          description: attributes.description || "",
          image: imageUrl,
          imageavatar: imageavatarUrl,
          size: attributes.size || "",
          grade: attributes.grade || "",
          expiry: attributes.expiry || "",
          manufacturedt: attributes.manufacturedt || "",
          about: Array.isArray(attributes.about)
            ? attributes.about
                .map((block: any) =>
                  block.children?.map((child: any) => child.text).join("")
                )
                .join("\n")
            : typeof attributes.about === "object"
            ? JSON.stringify(attributes.about)
            : attributes.about || "",
        };
      });

      setProducts(formatted);
      setTotalItems(json.meta?.pagination?.total || 0);
    } catch (err: any) {
      console.error("Fetch error:", err);
      toast.error(`Failed to load data: ${err.message}`);
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, [currentPage]);

  /**
   * Handles column sorting for the product table
   * @param {keyof Product} key - The column key to sort by
   */
  const handleSort = (key: keyof Product) => {
    let direction: 'asc' | 'desc' = 'asc';
    if (sortConfig && sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  const sortedProducts = React.useMemo(() => {
    if (!sortConfig) return products;
    return [...products].sort((a, b) => {
      if (a[sortConfig.key]! < b[sortConfig.key]!) return sortConfig.direction === 'asc' ? -1 : 1;
      if (a[sortConfig.key]! > b[sortConfig.key]!) return sortConfig.direction === 'asc' ? 1 : -1;
      return 0;
    });
  }, [products, sortConfig]);

  /**
   * Prepares the form for editing an existing product
   * @param {Product} product - The product object to edit
   */
  const handleEdit = (product: Product) => {
    setFormData({ ...product });
    setFormOpen(true);
  };

  /**
   * Prepares the form for adding a new product
   */
  const handleAdd = () => {
    setFormData({
      name: "",
      description: "",
      size: "",
      grade: "",
      expiry: "",
      manufacturedt: "",
      about: "",
    });
    setFormOpen(true);
  };

  /**
   * Handles product deletion after confirmation
   * @param {number} id - The ID of the product to delete
   */
  const handleDelete = async (id: number) => {
    if (!window.confirm("Are you sure you want to delete this product?")) return;
    try {
      const res = await fetch(process.env.NEXT_PUBLIC_API_URL+`/products/${id}`, { 
        method: "DELETE",
        headers: {
          Authorization: "Bearer " + localStorage.getItem("jwt"),
        }
      });
      if (!res.ok) throw new Error("Failed to delete product");
      toast.success("Product deleted successfully");
      fetchProducts();
    } catch (err) {
      toast.error("Error deleting product");
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
   * Handles file input changes for image uploads
   * @param {React.ChangeEvent<HTMLInputElement>} e - The file change event
   * @param {'image' | 'imageavatar'} field - The field to update
   */
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, field: 'image' | 'imageavatar') => {
    if (e.target.files && e.target.files[0]) {
      setFormData(prev => ({ ...prev, [field]: URL.createObjectURL(e.target.files![0]) }));
    }
  };

  /**
   * Handles product creation or update
   * Determines if the form is in 'edit' mode based on the presence of documentId
   * Constructs a request to the Strapi API with appropriate method and payload
   * Shows user feedback on success/failure and refreshes list if successful
   */
  const handleSubmit = async () => {
    setIsSaving(true);
    const isEdit = !!formData.documentId;

    const payload = {
      data: {
        name: formData.name,
        description: formData.description,
        size: formData.size,
        grade: formData.grade,
        expiry: formData.expiry,
        manufacturedt: formData.manufacturedt,
        about: formData.about,
      },
    };

    const url = isEdit
      ? `${process.env.NEXT_PUBLIC_API_URL}/products/${formData.documentId}`
      : `${process.env.NEXT_PUBLIC_API_URL}/products`;

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
        toast.error(resJson?.error?.message || `Failed to save product [${res.status}]`);
        return;
      }

      toast.success(isEdit ? "Product updated!" : "Product created!");
      setFormOpen(false);
      fetchProducts(currentPage);
    } catch (err) {
      console.error("Unexpected error saving product:", err);
      toast.error("Something went wrong");
    } finally {
      setIsSaving(false);
    }
  };

  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const canPreviousPage = currentPage > 1;
  const canNextPage = currentPage < totalPages;

  return (
    <Layout pageTitle="Product Management | Fisher">
      <div className="p-6 max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-gray-800">📦 Product Management</h1>
          <Button onClick={handleAdd} className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-md flex items-center gap-2">
            <Plus className="h-4 w-4" />
            Add Product
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
                      Product
                      {sortConfig?.key === 'name' && (
                        <span className="ml-1">
                          {sortConfig.direction === 'asc' ? '↑' : '↓'}
                        </span>
                      )}
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Details</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Images</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Dates</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {sortedProducts.map((product, index) => (
                    <tr key={product.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 text-sm text-gray-900">
                        {(currentPage - 1) * itemsPerPage + index + 1}
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm font-medium text-gray-900">{product.name}</div>
                        <div className="text-sm text-gray-500 line-clamp-2">{product.description}</div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-700">
                        <div>Size: {product.size}</div>
                        <div>Grade: {product.grade}</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex gap-2">
                          {product.image && (
                            <img src={product.image} alt="Product" className="h-10 w-10 rounded-md object-cover" />
                          )}
                          {product.imageavatar && (
                            <img src={product.imageavatar} alt="Product avatar" className="h-10 w-10 rounded-full object-cover" />
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-700">
                        <div>Expiry: {product.expiry}</div>
                        <div>Manufactured: {product.manufacturedt}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex justify-end gap-2">
                          <Button onClick={() => handleEdit(product)} className="bg-indigo-600 hover:bg-indigo-700 text-white p-2 rounded-md">
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button onClick={() => product.id && handleDelete(product.id)} className="bg-red-600 hover:bg-red-700 text-white p-2 rounded-md">
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
              <h2 className="text-xl font-semibold mb-4">{formData.id ? "Edit" : "Add"} Product</h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm max-h-[60vh] overflow-y-auto pr-2">
                {[
                  { label: "Name", name: "name", required: true },
                  { label: "Description", name: "description" },
                  { label: "Size", name: "size" },
                  { label: "Grade", name: "grade" },
                  { label: "Expiry Date", name: "expiry", type: "date" },
                  { label: "Manufacture Date", name: "manufacturedt", type: "date" },
                ].map(({ label, name, type, required }) => (
                  <div key={name} className="space-y-2">
                    <label className="text-sm text-gray-700">
                      {label}
                      {required && <span className="text-red-500">*</span>}
                    </label>
                    <input
                      type={type || "text"}
                      name={name}
                      value={(formData as any)[name]}
                      onChange={handleFormChange}
                      placeholder={label}
                      required={required}
                      className="w-full p-2 border border-gray-300 rounded-md"
                    />
                  </div>
                ))}

                <div className="md:col-span-2 space-y-2">
                  <label className="text-sm text-gray-700">About</label>
                  <textarea
                    name="about"
                    value={formData.about}
                    onChange={handleFormChange}
                    placeholder="Detailed product information..."
                    rows={4}
                    className="w-full p-2 border border-gray-300 rounded-md"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm text-gray-700">Product Image</label>
                  <input
                    type="file"
                    onChange={(e) => handleFileChange(e, 'image')}
                    className="w-full p-2 border border-gray-300 rounded-md"
                  />
                  {formData.image && (
                    <img src={formData.image} alt="Product preview" className="h-16 w-16 object-cover rounded-md mt-2" />
                  )}
                </div>

                <div className="space-y-2">
                  <label className="text-sm text-gray-700">Avatar Image</label>
                  <input
                    type="file"
                    onChange={(e) => handleFileChange(e, 'imageavatar')}
                    className="w-full p-2 border border-gray-300 rounded-md"
                  />
                  {formData.imageavatar && (
                    <img src={formData.imageavatar} alt="Avatar preview" className="h-16 w-16 object-cover rounded-full mt-2" />
                  )}
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
                  {isSaving ? "Saving..." : formData.id ? "Update Product" : "Create Product"}
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}