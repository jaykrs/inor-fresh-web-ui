"use client";

import React, { useEffect, useState } from "react";
import { X, Edit, Trash2, Plus, ChevronLeft, ChevronRight } from "lucide-react";
import Button from "@/components/ui/button/Button";

interface Author {
  id?: number;
  name: string;
  email: string;
  avatar: File | null;
  avatarPreview?: string;
  articles?: string[];
}

export default function AuthorPage() {
  const [authors, setAuthors] = useState<Author[]>([]);
  const [loading, setLoading] = useState(true);
  const [formOpen, setFormOpen] = useState(false);
  const [formData, setFormData] = useState<Author>({
    name: "",
    email: "",
    avatar: null,
    articles: [],
  });

  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [totalItems, setTotalItems] = useState(0);

  const fetchAuthors = async (page = 1) => {
  try {
    setLoading(true);
    const res = await fetch(
      `http://localhost:1337/api/authors?pagination[page]=${page}&pagination[pageSize]=${itemsPerPage}`
    );
    const json = await res.json();

    console.log("Fetched Authors Response:", json); 

    const formatted = json.data.map((item: any) => ({
      id: item.id,
      name: item.name,
      email: item.email,
      avatarPreview: null, // not using avatar for now
    }));

    setAuthors(formatted);
    setTotalItems(json.meta?.pagination?.total || 0);
  } catch (err) {
    console.error("Fetch Error:", err);
    alert("Failed to fetch authors.");
  } finally {
    setLoading(false);
  }
};



  useEffect(() => {
    fetchAuthors(currentPage);
  }, [currentPage]);

  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const canPreviousPage = currentPage > 1;
  const canNextPage = currentPage < totalPages;

  const handleAdd = () => {
    setFormData({ name: "", email: "", avatar: null, articles: [] });
    setFormOpen(true);
  };

  const handleEdit = (author: Author) => {
    setFormData({
      id: author.id,
      name: author.name,
      email: author.email,
      avatar: null,
      avatarPreview: author.avatarPreview,
      articles: author.articles || [],
    });
    setFormOpen(true);
  };

  const handleDelete = async (id?: number) => {
    if (!id || !confirm("Are you sure you want to delete this author?")) return;
    try {
      await fetch(`http://localhost:1337/api/authors/${id}`, { method: "DELETE" });
      fetchAuthors(currentPage);
    } catch (err) {
      alert("Failed to delete author.");
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, files } = e.target;
    if (name === "avatar" && files) {
      setFormData(prev => ({
        ...prev,
        avatar: files[0],
        avatarPreview: URL.createObjectURL(files[0]),
      }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async () => {
    const isEdit = !!formData.id;
    const form = new FormData();
    form.append("data", JSON.stringify({ 
      name: formData.name, 
      email: formData.email 
    }));

    if (formData.avatar) {
      form.append("files.avatar", formData.avatar);
    }

    const res = await fetch(
      isEdit
        ? `http://localhost:1337/api/authors/${formData.id}`
        : `http://localhost:1337/api/authors`,
      {
        method: isEdit ? "PUT" : "POST",
        body: form,
      }
    );

    if (!res.ok) {
      alert("Save failed");
      return;
    }

    alert(isEdit ? "Updated!" : "Created!");
    setFormOpen(false);
    fetchAuthors(currentPage);
  };

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-indigo-700">📚 Author Management</h1>
        <Button onClick={handleAdd} className="bg-green-600 hover:bg-green-700 text-white flex items-center gap-2 px-4 py-2 rounded-md">
          <Plus className="w-4 h-4" /> Add Author
        </Button>
      </div>

      {loading ? (
        <p>Loading...</p>
      ) : (
        <div className="bg-white shadow rounded-lg overflow-x-auto">
          <table className="min-w-full text-sm text-gray-800 border">
            <thead className="bg-gray-100 text-xs uppercase">
              <tr>
                <th className="px-4 py-3 border">#</th>
                <th className="px-4 py-3 border">Name</th>
                <th className="px-4 py-3 border">Email</th>
                <th className="px-4 py-3 border">Avatar</th>
                <th className="px-4 py-3 border">Articles</th>
                <th className="px-4 py-3 border text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {authors.map((author, index) => (
                <tr key={author.id} className="hover:bg-gray-50">
                  <td className="px-4 py-2 border text-center">
                    {(currentPage - 1) * itemsPerPage + index + 1}
                  </td>
                  <td className="px-4 py-2 border">{author.name}</td>
                  <td className="px-4 py-2 border">{author.email}</td>
                  <td className="px-4 py-2 border text-center">
                    {author.avatarPreview && (
                      <img src={author.avatarPreview} className="h-10 w-10 rounded-full object-cover mx-auto" />
                    )}
                  </td>
                  <td className="px-4 py-2 border">
                    {author.articles?.length
                      ? author.articles.map((a, i) => <div key={i}>• {a}</div>)
                      : "—"}
                  </td>
                  <td className="px-4 py-2 border text-right space-x-2">
                    <Button onClick={() => handleEdit(author)} className="bg-blue-500 hover:bg-blue-600 text-white px-2 py-1 rounded">
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button onClick={() => handleDelete(author.id)} className="bg-red-500 hover:bg-red-600 text-white px-2 py-1 rounded">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Pagination UI */}
          {totalPages > 1 && (
            <div className="bg-white p-4 flex items-center justify-between border-t">
              <div className="text-sm text-gray-700">
                Showing <span className="font-medium">{(currentPage - 1) * itemsPerPage + 1}</span> to{" "}
                <span className="font-medium">{Math.min(currentPage * itemsPerPage, totalItems)}</span> of{" "}
                <span className="font-medium">{totalItems}</span> results
              </div>
              <div className="flex items-center space-x-1">
                <Button
                  onClick={() => setCurrentPage(p => Math.max(p - 1, 1))}
                  disabled={!canPreviousPage}
                  className="px-2 py-1 border rounded-md text-gray-700 hover:bg-gray-100"
                >
                  <ChevronLeft className="w-4 h-4" />
                </Button>
                {Array.from({ length: totalPages }, (_, i) => (
                  <Button
                    key={i + 1}
                    onClick={() => setCurrentPage(i + 1)}
                    className={`px-3 py-1 border rounded-md ${
                      currentPage === i + 1
                        ? "bg-indigo-100 border-indigo-500 text-indigo-700"
                        : "text-gray-700 hover:bg-gray-100"
                    }`}
                  >
                    {i + 1}
                  </Button>
                ))}
                <Button
                  onClick={() => setCurrentPage(p => Math.min(p + 1, totalPages))}
                  disabled={!canNextPage}
                  className="px-2 py-1 border rounded-md text-gray-700 hover:bg-gray-100"
                >
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Modal code remains the same (formOpen, formData, submit, etc.) */}
      {formOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto relative">
            <button
              onClick={() => setFormOpen(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-red-500"
            >
              <X />
            </button>
            <h2 className="text-xl font-semibold mb-4 text-indigo-600">
              {formData.id ? "Edit" : "Add"} Author
            </h2>

            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium">Name</label>
                <input
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className="mt-1 w-full p-2 border border-gray-300 rounded focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>
              <div>
                <label className="text-sm font-medium">Email</label>
                <input
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="mt-1 w-full p-2 border border-gray-300 rounded focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>
              <div>
                <label className="text-sm font-medium">Avatar</label>
                <input
                  type="file"
                  name="avatar"
                  accept="image/*"
                  onChange={handleChange}
                  className="w-full"
                />
                {formData.avatarPreview && (
                  <img src={formData.avatarPreview} className="mt-2 h-16 w-16 rounded-full object-cover" />
                )}
              </div>
            </div>

            <div className="mt-6 flex justify-end gap-3">
              <Button
                onClick={() => setFormOpen(false)}
                className="bg-gray-200 hover:bg-gray-300 text-gray-800 px-4 py-2 rounded"
              >
                Cancel
              </Button>
              <Button
                onClick={handleSubmit}
                className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded"
              >
                {formData.id ? "Update Author" : "Create Author"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}