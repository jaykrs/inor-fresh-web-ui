"use client";

import React, { useEffect, useState } from "react";
import { X, Edit2, Trash2 } from "lucide-react";
import Button from "@/components/ui/button/Button";

interface Supplier {
  id?: number;
  name: string;
  phone: string;
  email: string;
  city: string;
  createdAt?: string;
  createdBy?: string;
  status: boolean;
}

export default function SupplierPage() {
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [loading, setLoading] = useState(true);
  const [sortAsc, setSortAsc] = useState(true);
  const [formOpen, setFormOpen] = useState(false);
  const [formData, setFormData] = useState<Supplier>({
    name: "",
    phone: "",
    email: "",
    city: "",
    createdBy: "",
    status: false,
  });

  // Fetch suppliers
    const fetchSuppliers = async () => {
    try {
      const res = await fetch("http://localhost:1337/api/suppliers");
      const json = await res.json();
      const formatted = json.data.map((item: any) => ({
        ...item
      }));
      setSuppliers(formatted);
    } catch (err) {
      alert("Failed to fetch suppliers.");
    } finally {
      setLoading(false);
    }
  };


  useEffect(() => {
    fetchSuppliers();
  }, []);

  //  Sort by name
  const handleSort = () => {
    const sorted = [...suppliers].sort((a, b) =>
      sortAsc ? a.name.localeCompare(b.name) : b.name.localeCompare(a.name)
    );
    setSuppliers(sorted);
    setSortAsc(!sortAsc);
  };

  // Form actions
  const handleAdd = () => {
    setFormData({
      name: "",
      phone: "",
      email: "",
      city: "",
      createdBy: "",
      status: false,
    });
    setFormOpen(true);
  };

  const handleEdit = (supplier: Supplier) => {
    setFormData({ ...supplier });
    setFormOpen(true);
  };

  const handleDelete = async (id?: number) => {
    if (!id) return;
    if (!confirm("Are you sure you want to delete this supplier?")) return;
    try {
      await fetch(`http://localhost:1337/api/suppliers/${id}`, {
        method: "DELETE",
      });
      fetchSuppliers();
    } catch (err) {
      alert("Error deleting supplier.");
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = async () => {
    const isEdit = !!formData.id;
    const { id, ...dataWithoutId } = formData;
    const url = isEdit
      ? `http://localhost:1337/api/suppliers/${id}`
      : `http://localhost:1337/api/suppliers`;

    try {
      const res = await fetch(url, {
        method: isEdit ? "PUT" : "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ data: dataWithoutId }),
      });

      if (!res.ok) throw new Error("Save failed");
      alert(isEdit ? "Supplier updated!" : "Supplier added!");
      setFormOpen(false);
      fetchSuppliers();
    } catch (err) {
      alert("Error saving supplier.");
    }
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold text-indigo-600">🧾 Suppliers</h1>
        <Button
          onClick={handleAdd}
          className="bg-green-500 hover:bg-green-600 text-white"
        >
          + Add Supplier
        </Button>
      </div>

      {loading ? (
        <p>Loading...</p>
      ) : (
        <table className="w-full table-auto text-sm border shadow bg-white">
          <thead className="bg-gray-100">
            <tr>
              <th className="px-4 py-2 border text-center">ID</th>
              <th
                className="px-4 py-2 border text-center cursor-pointer"
                onClick={handleSort}
              >
                Name {sortAsc ? "▲" : "▼"}
              </th>
              <th className="px-4 py-2 border text-center">Phone</th>
              <th className="px-4 py-2 border text-center">Email</th>
              <th className="px-4 py-2 border text-center">City</th>
              <th className="px-4 py-2 border text-center">Created At</th>
              <th className="px-4 py-2 border text-center">Created By</th>
              <th className="px-4 py-2 border text-center">Status</th>
              <th className="px-4 py-2 border text-center">Actions</th>
            </tr>
          </thead>
          <tbody>
            {suppliers.map((s) => (
              <tr key={s.id} className="hover:bg-gray-50">
                <td className="px-4 py-2 border text-center">{s.id}</td>
                <td className="px-4 py-2 border text-center">{s.name}</td>
                <td className="px-4 py-2 border text-center">{s.phone}</td>
                <td className="px-4 py-2 border text-center">{s.email}</td>
                <td className="px-4 py-2 border text-center">{s.city}</td>
                <td className="px-4 py-2 border text-center">{s.createdAt?.slice(0, 10)}</td>
                <td className="px-4 py-2 border text-center">{s.createdBy}</td>
                <td className="px-4 py-2 border text-center">
                  <span
                    className={`px-2 py-1 rounded text-xs font-medium ${
                      s.status ? "bg-green-100 text-green-700" : "bg-yellow-100 text-yellow-800"
                    }`}
                  >
                    {s.status ? "Published" : "Unpublished"}
                  </span>
                </td>
                <td className="px-4 py-2 border text-center">
                  <Button
                    onClick={() => handleEdit(s)}
                    className="bg-blue-500 hover:bg-blue-600 text-white"
                  >
                    Edit
                  </Button>
                  <Button
                    onClick={() => handleDelete(s.id)}
                    className="bg-red-500 hover:bg-red-600 text-white ml-2"
                  >
                    Delete
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {/* MODAL */}
      {formOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <div className="bg-white p-6 rounded-xl shadow-lg w-full max-w-xl relative">
            <button
              onClick={() => setFormOpen(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-red-500"
            >
              <X />
            </button>
            <h2 className="text-xl font-semibold mb-4 text-indigo-700">
              {formData.id ? "Edit" : "Add"} Supplier
            </h2>

            <div className="grid grid-cols-2 gap-4 text-sm">
              <input name="name" placeholder="Name" value={formData.name} onChange={handleChange} className="border p-2 rounded" />
              <input name="phone" placeholder="Phone" value={formData.phone} onChange={handleChange} className="border p-2 rounded" />
              <input name="email" placeholder="Email" value={formData.email} onChange={handleChange} className="border p-2 rounded" />
              <input name="city" placeholder="City" value={formData.city} onChange={handleChange} className="border p-2 rounded" />
              <input name="createdBy" placeholder="Created By" value={formData.createdBy} onChange={handleChange} className="border p-2 rounded" />
              <label className="col-span-2">
                <input
                  type="checkbox"
                  name="status"
                  checked={formData.status}
                  onChange={handleChange}
                  className="mr-2"
                />
                Active (Published)
              </label>
            </div>

            <div className="mt-6 flex justify-end">
              <Button
                onClick={handleSubmit}
                className="bg-indigo-600 hover:bg-indigo-700 text-white"
              >
                {formData.id ? "Update" : "Create"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
