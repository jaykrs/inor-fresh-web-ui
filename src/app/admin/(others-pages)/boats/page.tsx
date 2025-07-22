"use client";

import React, { useEffect, useState } from "react";
import { X } from "lucide-react";
import Button from "@/components/ui/button/Button";

type Boat = {
  id?: number;
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
  const [sortAsc, setSortAsc] = useState(true);
  const [formOpen, setFormOpen] = useState(false);
  const [formData, setFormData] = useState<Boat>({
    ownername: "",
    ownerphone: "",
    ownercity: "",
    owneremail: "",
    boatcategory: "",
    status: false,
  });

  const fetchBoats = async () => {
    try {
      const res = await fetch("http://localhost:1337/api/boats");
      const json = await res.json();

      const formatted = json.data.map((item: any) => ({
        id: item.id,
        ...item,
      }));

      setBoats(formatted);
    } catch (err) {
      alert("Failed to fetch boats.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBoats();
  }, []);

  const handleSort = () => {
    const sorted = [...boats].sort((a, b) =>
      sortAsc
        ? a.ownername?.localeCompare(b.ownername ?? "")
        : b.ownername?.localeCompare(a.ownername ?? "")
    );
    setBoats(sorted);
    setSortAsc(!sortAsc);
  };

  const handleFormChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

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

  const handleSubmit = async () => {
    const isEdit = !!formData.id;
    const { id, ...dataWithoutId } = formData;

    const url = isEdit
      ? `http://localhost:1337/api/boats/${id}`
      : `http://localhost:1337/api/boats`;

    try {
      const res = await fetch(url, {
        method: isEdit ? "PUT" : "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ data: dataWithoutId }),
      });

      const result = await res.json();

      if (!res.ok) {
        alert(result?.error?.message || "Save failed");
        return;
      }

      alert(isEdit ? "Boat updated!" : "Boat created!");
      setFormOpen(false);
      fetchBoats();
    } catch (err) {
      alert("Error saving boat.");
    }
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold text-indigo-600">🚤 Boats</h1>
        <Button onClick={handleAdd} className="bg-green-500 hover:bg-green-600 text-white">
          + Add Boat
        </Button>
      </div>

      {loading ? (
        <p>Loading...</p>
      ) : (
        <table className="w-full table-auto text-sm border shadow bg-white">
          <thead className="bg-gray-100">
            <tr>
              <th className="px-4 py-2 border text-center">ID</th>
              <th className="px-4 py-2 border text-center cursor-pointer" onClick={handleSort}>
                Owner Name {sortAsc ? "▲" : "▼"}
              </th>
              <th className="px-4 py-2 border text-center">Phone</th>
              <th className="px-4 py-2 border text-center">City</th>
              <th className="px-4 py-2 border text-center">Email</th>
              <th className="px-4 py-2 border text-center">Category</th>
              <th className="px-4 py-2 border text-center">Status</th>
              <th className="px-4 py-2 border text-center">Actions</th>
            </tr>
          </thead>
          <tbody>
            {boats.map((boat) => (
              <tr key={boat.id} className="hover:bg-gray-50">
                <td className="px-4 py-2 border text-center">{boat.id}</td>
                <td className="px-4 py-2 border text-center">{boat.ownername}</td>
                <td className="px-4 py-2 border text-center">{boat.ownerphone}</td>
                <td className="px-4 py-2 border text-center">{boat.ownercity}</td>
                <td className="px-4 py-2 border text-center">{boat.owneremail}</td>
                <td className="px-4 py-2 border text-center">{boat.boatcategory}</td>
                <td className="px-4 py-2 border text-center">
                  <span
                    className={`px-2 py-1 rounded text-xs font-medium ${
                      boat.status ? "bg-green-100 text-green-700" : "bg-yellow-100 text-yellow-800"
                    }`}
                  >
                    {boat.status ? "Published" : "Unpublished"}
                  </span>
                </td>
                <td className="px-4 py-2 border text-center">
                  <Button onClick={() => handleEdit(boat)} className="bg-blue-500 hover:bg-blue-600 text-white text-xs px-3 py-1">
                    Edit
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
              {formData.id ? "Edit" : "Add"} Boat
            </h2>

            <div className="grid grid-cols-2 gap-4 text-sm">
              <input name="ownername" placeholder="Owner Name" value={formData.ownername} onChange={handleFormChange} className="border p-2 rounded" />
              <input name="ownerphone" placeholder="Phone" value={formData.ownerphone} onChange={handleFormChange} className="border p-2 rounded" />
              <input name="ownercity" placeholder="City" value={formData.ownercity} onChange={handleFormChange} className="border p-2 rounded" />
              <input name="owneremail" placeholder="Email" value={formData.owneremail} onChange={handleFormChange} className="border p-2 rounded" />
              <input name="boatcategory" placeholder="Boat Category" value={formData.boatcategory} onChange={handleFormChange} className="border p-2 rounded" />

              <label className="col-span-2 flex items-center gap-2">
                <input
                  type="checkbox"
                  name="status"
                  checked={formData.status}
                  onChange={handleFormChange}
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
