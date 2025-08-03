"use client";

import React, { useEffect, useState } from "react";
import { X, Edit2, Trash2 } from "lucide-react";
import Button from "@/components/ui/button/Button";

interface Box {
  id?: number;
  name: string;
  type: string;
  dimension: string;
  color: string;
  resource: string;
  status: boolean;
}

export default function BoxPage() {
  const [boxes, setBoxes] = useState<Box[]>([]);
  const [loading, setLoading] = useState(true);
  const [sortAsc, setSortAsc] = useState(true);
  const [formOpen, setFormOpen] = useState(false);
  const [formData, setFormData] = useState<Box>({
    name: "",
    type: "",
    dimension: "",
    color: "",
    resource: "",
    status: false,
  });

  const fetchBoxes = async () => {
    try {
      const res = await fetch("process.env.NEXT_PUBLIC_API_URL/boxes");
      const json = await res.json();
      const formatted = json.data.map((item: any) => ({
        id: item.id,
        ...item,
      }));
      setBoxes(formatted);
    } catch (err) {
      alert("Failed to fetch boxes.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBoxes();
  }, []);

  const handleSort = () => {
    const sorted = [...boxes].sort((a, b) =>
      sortAsc ? a.name.localeCompare(b.name) : b.name.localeCompare(a.name)
    );
    setBoxes(sorted);
    setSortAsc(!sortAsc);
  };

  const handleAdd = () => {
    setFormData({
      name: "",
      type: "",
      dimension: "",
      color: "",
      resource: "",
      status: false,
    });
    setFormOpen(true);
  };

  const handleEdit = (box: Box) => {
    setFormData({ ...box });
    setFormOpen(true);
  };

  const handleDelete = async (id?: number) => {
    if (!id) return;
    if (!confirm("Are you sure you want to delete this box?")) return;
    try {
      await fetch(process.env.NEXT_PUBLIC_API_URL+`/boxes/${id}`, {
        method: "DELETE",
      });
      fetchBoxes();
    } catch (err) {
      alert("Error deleting box.");
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

    try {
      const res = await fetch(
        isEdit
          ? process.env.NEXT_PUBLIC_API_URL+`/boxes/${id}`
          : process.env.NEXT_PUBLIC_API_URL+`/boxes`,
        {
          method: isEdit ? "PUT" : "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ data: dataWithoutId }),
        }
      );

      if (!res.ok) throw new Error("Save failed");
      alert(isEdit ? "Box updated!" : "Box added!");
      setFormOpen(false);
      fetchBoxes();
    } catch (err) {
      alert("Error saving box.");
    }
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold text-indigo-600">📦 Boxes</h1>
        <Button
          onClick={handleAdd}
          className="bg-green-500 hover:bg-green-600 text-white"
        >
          + Add Box
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
              <th className="px-4 py-2 border text-center">Type</th>
              <th className="px-4 py-2 border text-center">Dimension</th>
              <th className="px-4 py-2 border text-center">Color</th>
              <th className="px-4 py-2 border text-center">Resource</th>
              <th className="px-4 py-2 border text-center">Status</th>
              <th className="px-4 py-2 border text-center">Actions</th>
            </tr>
          </thead>
          <tbody>
            {boxes.map((b) => (
              <tr key={b.id} className="hover:bg-gray-50">
                <td className="px-4 py-2 border text-center">{b.id}</td>
                <td className="px-4 py-2 border text-center">{b.name}</td>
                <td className="px-4 py-2 border text-center">{b.type}</td>
                <td className="px-4 py-2 border text-center">{b.dimension}</td>
                <td className="px-4 py-2 border text-center">{b.color}</td>
                <td className="px-4 py-2 border text-center">{b.resource}</td>
                <td className="px-4 py-2 border text-center">
                  <span
                    className={`px-2 py-1 rounded text-xs font-medium ${
                      b.status
                        ? "bg-green-100 text-green-700"
                        : "bg-yellow-100 text-yellow-800"
                    }`}
                  >
                    {b.status ? "Published" : "Unpublished"}
                  </span>
                </td>
                <td className="px-4 py-2 border text-center">
                  <Button
                    onClick={() => handleEdit(b)}
                    className="bg-blue-500 hover:bg-blue-600 text-white"
                  >
                    Edit
                  </Button>
                  <Button
                    onClick={() => handleDelete(b.id)}
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

      {/* Add/Edit Modal */}
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
              {formData.id ? "Edit" : "Add"} Box
            </h2>

            <div className="grid grid-cols-2 gap-4 text-sm">
              <input
                name="name"
                placeholder="Name"
                value={formData.name}
                onChange={handleChange}
                className="border p-2 rounded"
              />
              <input
                name="type"
                placeholder="Type"
                value={formData.type}
                onChange={handleChange}
                className="border p-2 rounded"
              />
              <input
                name="dimension"
                placeholder="Dimension"
                value={formData.dimension}
                onChange={handleChange}
                className="border p-2 rounded"
              />
              <input
                name="color"
                placeholder="Color"
                value={formData.color}
                onChange={handleChange}
                className="border p-2 rounded"
              />
              <input
                name="resource"
                placeholder="Resource"
                value={formData.resource}
                onChange={handleChange}
                className="border p-2 rounded"
              />
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
