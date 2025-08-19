"use client";

import React, { useEffect, useState } from "react";
import Button from "@/components/ui/button/Button";
import { X, Trash2, Edit, ChevronLeft, ChevronRight } from "lucide-react";
import { toast } from "react-hot-toast";
import Layout from "@/components/layout/Layout";

/**
 * Order Workflow Management Component
 * 
 * This component provides a complete interface for managing order workflows including:
 * - Displaying a paginated list of orders with sorting capabilities
 * - Creating, updating, and deleting order records
 * - Form validation and user feedback
 * 
 * Features:
 * - Server-side pagination
 * - Client-side sorting
 * - Responsive design with horizontal scrolling for many columns
 * - Toast notifications for user feedback
 * - Rich text editor for details field
 * 
 * API Integration:
 * - Uses JWT authentication for all requests
 * - Handles GET, POST, PUT, and DELETE operations
 * - Connects to Strapi backend
 *   @Developer : Simran Samir
 */

type OrderWorkflow = {
  id?: number;
  documentId?: string;
  vendorId: string;
  product_list: string;
  ordervalue: string;
  details: string;
  orderdt: string;
  orderstatus: string;
  quantity: number;
  delivery_channel: string;
  delivery_address: string;
  delivery_location: string;
  delivery_contact: string;
  delivery_notification: string;
  completion_status: boolean;
};

export default function OrderWorkflowPage() {
  // State management
  const [orders, setOrders] = useState<OrderWorkflow[]>([]);
  const [loading, setLoading] = useState(true);
  const [sortConfig, setSortConfig] = useState<{ key: keyof OrderWorkflow; direction: 'asc' | 'desc' } | null>(null);
  const [formOpen, setFormOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [formData, setFormData] = useState<OrderWorkflow>({
    vendorId: "",
    product_list: "",
    ordervalue: "",
    details: "",
    orderdt: new Date().toISOString().split('T')[0], // Default to today
    orderstatus: "pending",
    quantity: 1,
    delivery_channel: "",
    delivery_address: "",
    delivery_location: "",
    delivery_contact: "",
    delivery_notification: "",
    completion_status: false,
  });

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [totalItems, setTotalItems] = useState(0);

  /**
   * Fetches orders from the API with pagination
   * @param {number} page - The page number to fetch (defaults to currentPage)
   */
  const fetchOrders = async (page = currentPage) => {
    try {
      setLoading(true);
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/order-workflows?pagination[page]=${page}&pagination[pageSize]=${itemsPerPage}`,
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
        vendorId: item.vendorId || "",
        product_list: item.product_list || "",
        ordervalue: item.ordervalue || "",
        details: item.details || "",
        orderdt: item.orderdt || "",
        orderstatus: item.orderstatus || "pending",
        quantity: item.quantity || 0,
        delivery_channel: item.delivery_channel || "",
        delivery_address: item.delivery_address || "",
        delivery_location: item.delivery_location || "",
        delivery_contact: item.delivery_contact || "",
        delivery_notification: item.delivery_notification || "",
        completion_status: item.completion_status || false,
      }));

      setOrders(formatted);
      setTotalItems(json.meta?.pagination?.total || 0);
    } catch (err: any) {
      console.error("Fetch error:", err);
      toast.error(`Failed to load data: ${err.message}`);
      setOrders([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [currentPage]);

  /**
   * Handles column sorting
   * @param {keyof OrderWorkflow} key - The column to sort by
   */
  const handleSort = (key: keyof OrderWorkflow) => {
    let direction: 'asc' | 'desc' = 'asc';
    if (sortConfig && sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  // Sorted orders list
  const sortedOrders = React.useMemo(() => {
    if (!sortConfig) return orders;
    return [...orders].sort((a, b) => {
      if (a[sortConfig.key]! < b[sortConfig.key]!) return sortConfig.direction === 'asc' ? -1 : 1;
      if (a[sortConfig.key]! > b[sortConfig.key]!) return sortConfig.direction === 'asc' ? 1 : -1;
      return 0;
    });
  }, [orders, sortConfig]);

  /**
   * Prepares form for editing an existing order
   * @param {OrderWorkflow} order - The order to edit
   */
  const handleEdit = (order: OrderWorkflow) => {
    setFormData({ ...order });
    setFormOpen(true);
  };

  /** Prepares form for adding a new order */
  const handleAdd = () => {
    setFormData({
      vendorId: "",
      product_list: "",
      ordervalue: "",
      details: "",
      orderdt: new Date().toISOString().split('T')[0],
      orderstatus: "pending",
      quantity: 1,
      delivery_channel: "",
      delivery_address: "",
      delivery_location: "",
      delivery_contact: "",
      delivery_notification: "",
      completion_status: false,
    });
    setFormOpen(true);
  };

  /**
   * Deletes an order after confirmation
   * @param {number} id - The ID of the order to delete
   */
  const handleDelete = async (id: number) => {
    if (!window.confirm("Are you sure you want to delete this order?")) return;
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/order-workflows/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${localStorage.getItem('jwt')}`,
        },
      });
      if (!res.ok) throw new Error("Failed to delete order");
      toast.success("Order deleted successfully");
      fetchOrders(currentPage); // Refresh list
    } catch (err) {
      toast.error("Error deleting order");
      console.error(err);
    }
  };

  /**
   * Handles form input changes
   * @param {React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>} e - The change event
   */
  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    const isCheckbox = type === "checkbox";
    const checked = isCheckbox && "checked" in e.target ? (e.target as HTMLInputElement).checked : undefined;
    const isNumber = type === "number";

    setFormData((prev) => ({
      ...prev,
      [name]: isCheckbox ? checked : isNumber ? Number(value) : value,
    }));
  };

  /**
   * Handles form submission for create/update
   * Validates required fields and makes appropriate API request
   */
  const handleSubmit = async () => {
    // Validate required fields
    if (!formData.vendorId || !formData.product_list || !formData.orderdt) {
      toast.error("Please fill in all required fields");
      return;
    }

    setIsSaving(true);
    const isEdit = !!formData.documentId;

    const payload = {
      data: {
        vendorId: formData.vendorId,
        product_list: formData.product_list,
        ordervalue: formData.ordervalue,
        details: formData.details,
        orderdt: formData.orderdt,
        orderstatus: formData.orderstatus,
        quantity: formData.quantity,
        delivery_channel: formData.delivery_channel,
        delivery_address: formData.delivery_address,
        delivery_location: formData.delivery_location,
        delivery_contact: formData.delivery_contact,
        delivery_notification: formData.delivery_notification,
        completion_status: formData.completion_status,
      },
    };

    const url = isEdit
      ? `${process.env.NEXT_PUBLIC_API_URL}/order-workflows/${formData.documentId}`
      : `${process.env.NEXT_PUBLIC_API_URL}/order-workflows`;

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
        throw new Error(errorData.error?.message || `Failed to save order [${res.status}]`);
      }

      toast.success(isEdit ? "Order updated!" : "Order created!");
      setFormOpen(false);
      fetchOrders(isEdit ? currentPage : 1); // Stay on current page for edits, go to first for new
    } catch (err) {
      console.error("Error saving order:", err);
      toast.error(`Error: ${err instanceof Error ? err.message : "Unknown error"}`);
    } finally {
      setIsSaving(false);
    }
  };

  // Pagination calculations
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const canPreviousPage = currentPage > 1;
  const canNextPage = currentPage < totalPages;

  // Status options for dropdown
  const statusOptions = [
    "pending",
    "processing",
    "shipped",
    "delivered",
    "cancelled",
    "returned"
  ];

  return (
    <Layout pageTitle="Order Workflow Management | Fisher">
      <div className="p-6 max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-gray-800">📦 Order Workflow</h1>
          <Button onClick={handleAdd} className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-md">
            + Add Order
          </Button>
        </div>

        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <div className="overflow-x-auto">
              <div className="inline-block min-w-full align-middle">
                <div className="overflow-hidden">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th 
                          className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer sticky left-0 bg-gray-50 z-10"
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
                          onClick={() => handleSort('vendorId')}
                        >
                          Vendor ID
                          {sortConfig?.key === 'vendorId' && (
                            <span className="ml-1">
                              {sortConfig.direction === 'asc' ? '↑' : '↓'}
                            </span>
                          )}
                        </th>
                        <th 
                          className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                          onClick={() => handleSort('product_list')}
                        >
                          Products
                          {sortConfig?.key === 'product_list' && (
                            <span className="ml-1">
                              {sortConfig.direction === 'asc' ? '↑' : '↓'}
                            </span>
                          )}
                        </th>
                        <th 
                          className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                          onClick={() => handleSort('ordervalue')}
                        >
                          Value
                          {sortConfig?.key === 'ordervalue' && (
                            <span className="ml-1">
                              {sortConfig.direction === 'asc' ? '↑' : '↓'}
                            </span>
                          )}
                        </th>
                        <th 
                          className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                          onClick={() => handleSort('orderdt')}
                        >
                          Order Date
                          {sortConfig?.key === 'orderdt' && (
                            <span className="ml-1">
                              {sortConfig.direction === 'asc' ? '↑' : '↓'}
                            </span>
                          )}
                        </th>
                        <th 
                          className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                          onClick={() => handleSort('orderstatus')}
                        >
                          Status
                          {sortConfig?.key === 'orderstatus' && (
                            <span className="ml-1">
                              {sortConfig.direction === 'asc' ? '↑' : '↓'}
                            </span>
                          )}
                        </th>
                        <th 
                          className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                          onClick={() => handleSort('quantity')}
                        >
                          Qty
                          {sortConfig?.key === 'quantity' && (
                            <span className="ml-1">
                              {sortConfig.direction === 'asc' ? '↑' : '↓'}
                            </span>
                          )}
                        </th>
                        <th 
                          className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                          onClick={() => handleSort('delivery_channel')}
                        >
                          Delivery Channel
                          {sortConfig?.key === 'delivery_channel' && (
                            <span className="ml-1">
                              {sortConfig.direction === 'asc' ? '↑' : '↓'}
                            </span>
                          )}
                        </th>
                        <th 
                          className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                          onClick={() => handleSort('delivery_address')}
                        >
                          Delivery Address
                          {sortConfig?.key === 'delivery_address' && (
                            <span className="ml-1">
                              {sortConfig.direction === 'asc' ? '↑' : '↓'}
                            </span>
                          )}
                        </th>
                        <th 
                          className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                          onClick={() => handleSort('delivery_location')}
                        >
                          Delivery Location
                          {sortConfig?.key === 'delivery_location' && (
                            <span className="ml-1">
                              {sortConfig.direction === 'asc' ? '↑' : '↓'}
                            </span>
                          )}
                        </th>
                        <th 
                          className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                          onClick={() => handleSort('completion_status')}
                        >
                          Completed
                          {sortConfig?.key === 'completion_status' && (
                            <span className="ml-1">
                              {sortConfig.direction === 'asc' ? '↑' : '↓'}
                            </span>
                          )}
                        </th>
                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider sticky right-0 bg-gray-50 z-10">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {sortedOrders.map((order, index) => (
                        <tr key={order.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 text-sm text-gray-900 sticky left-0 bg-white z-10">
                            {(currentPage - 1) * itemsPerPage + index + 1}
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-600 whitespace-nowrap">
                            {order.vendorId}
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-600 max-w-xs truncate">
                            {order.product_list}
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-600 whitespace-nowrap">
                            {order.ordervalue}
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-600 whitespace-nowrap">
                            {new Date(order.orderdt).toLocaleDateString()}
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-600">
                            <span className={`px-2 py-1 rounded-full text-xs ${
                              order.orderstatus === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                              order.orderstatus === 'processing' ? 'bg-blue-100 text-blue-800' :
                              order.orderstatus === 'shipped' ? 'bg-purple-100 text-purple-800' :
                              order.orderstatus === 'delivered' ? 'bg-green-100 text-green-800' :
                              'bg-red-100 text-red-800'
                            }`}>
                              {order.orderstatus}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-600">
                            {order.quantity}
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-600 whitespace-nowrap">
                            {order.delivery_channel || '-'}
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-600 max-w-xs truncate">
                            {order.delivery_address || '-'}
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-600 whitespace-nowrap">
                            {order.delivery_location || '-'}
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-600">
                            <span className={`px-2 py-1 rounded-full text-xs ${order.completion_status ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                              {order.completion_status ? 'Yes' : 'No'}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-right flex justify-end gap-2 sticky right-0 bg-white z-10">
                            <Button onClick={() => handleEdit(order)} className="bg-indigo-600 hover:bg-indigo-700 text-white p-2 rounded-md"><Edit className="h-4 w-4" /></Button>
                            <Button onClick={() => order.id && handleDelete(order.id)} className="bg-red-600 hover:bg-red-700 text-white p-2 rounded-md"><Trash2 className="h-4 w-4" /></Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
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

        {/* Modal Form */}
        {formOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
            <div className="bg-white p-4 rounded-xl shadow-lg w-full max-w-4xl max-h-[90vh] overflow-y-auto relative">
              <button onClick={() => setFormOpen(false)} className="absolute top-4 right-4 text-gray-400 hover:text-red-500"><X /></button>
              <h2 className="text-xl font-semibold mb-4">{formData.id ? "Edit" : "Add"} Order</h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm max-h-[60vh] overflow-y-auto pr-2">
                {/* Vendor ID */}
                <div className="space-y-2">
                  <label className="text-sm text-gray-700">Vendor ID*</label>
                  <input
                    name="vendorId"
                    value={formData.vendorId}
                    onChange={handleFormChange}
                    placeholder="Vendor ID"
                    className="w-full p-2 border border-gray-300 rounded-md"
                    required
                  />
                </div>

                {/* Product List */}
                <div className="space-y-2">
                  <label className="text-sm text-gray-700">Product List*</label>
                  <input
                    name="product_list"
                    value={formData.product_list}
                    onChange={handleFormChange}
                    placeholder="Product list (comma separated)"
                    className="w-full p-2 border border-gray-300 rounded-md"
                    required
                  />
                </div>

                {/* Order Value */}
                <div className="space-y-2">
                  <label className="text-sm text-gray-700">Order Value</label>
                  <input
                    name="ordervalue"
                    value={formData.ordervalue}
                    onChange={handleFormChange}
                    placeholder="Order value"
                    className="w-full p-2 border border-gray-300 rounded-md"
                  />
                </div>

                {/* Order Date */}
                <div className="space-y-2">
                  <label className="text-sm text-gray-700">Order Date*</label>
                  <input
                    type="date"
                    name="orderdt"
                    value={formData.orderdt}
                    onChange={handleFormChange}
                    className="w-full p-2 border border-gray-300 rounded-md"
                    required
                  />
                </div>

                {/* Order Status */}
                <div className="space-y-2">
                  <label className="text-sm text-gray-700">Order Status</label>
                  <select
                    name="orderstatus"
                    value={formData.orderstatus}
                    onChange={handleFormChange}
                    className="w-full p-2 border border-gray-300 rounded-md"
                  >
                    {statusOptions.map(status => (
                      <option key={status} value={status}>
                        {status.charAt(0).toUpperCase() + status.slice(1)}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Quantity */}
                <div className="space-y-2">
                  <label className="text-sm text-gray-700">Quantity</label>
                  <input
                    type="number"
                    name="quantity"
                    value={formData.quantity}
                    onChange={handleFormChange}
                    min="1"
                    className="w-full p-2 border border-gray-300 rounded-md"
                  />
                </div>

                {/* Delivery Channel */}
                <div className="space-y-2">
                  <label className="text-sm text-gray-700">Delivery Channel</label>
                  <input
                    name="delivery_channel"
                    value={formData.delivery_channel}
                    onChange={handleFormChange}
                    placeholder="Delivery channel"
                    className="w-full p-2 border border-gray-300 rounded-md"
                  />
                </div>

                {/* Delivery Address */}
                <div className="space-y-2 md:col-span-2">
                  <label className="text-sm text-gray-700">Delivery Address</label>
                  <textarea
                    name="delivery_address"
                    rows={2}
                    value={formData.delivery_address}
                    onChange={handleFormChange}
                    className="w-full p-2 border border-gray-300 rounded-md"
                  />
                </div>

                {/* Delivery Location */}
                <div className="space-y-2">
                  <label className="text-sm text-gray-700">Delivery Location</label>
                  <input
                    name="delivery_location"
                    value={formData.delivery_location}
                    onChange={handleFormChange}
                    placeholder="Delivery location"
                    className="w-full p-2 border border-gray-300 rounded-md"
                  />
                </div>

                {/* Delivery Contact */}
                <div className="space-y-2">
                  <label className="text-sm text-gray-700">Delivery Contact</label>
                  <input
                    name="delivery_contact"
                    value={formData.delivery_contact}
                    onChange={handleFormChange}
                    placeholder="Delivery contact"
                    className="w-full p-2 border border-gray-300 rounded-md"
                  />
                </div>

                {/* Delivery Notification */}
                <div className="space-y-2">
                  <label className="text-sm text-gray-700">Delivery Notification</label>
                  <input
                    name="delivery_notification"
                    value={formData.delivery_notification}
                    onChange={handleFormChange}
                    placeholder="Delivery notification"
                    className="w-full p-2 border border-gray-300 rounded-md"
                  />
                </div>

                {/* Details (Rich Text) */}
                <div className="space-y-2 md:col-span-2">
                  <label className="text-sm text-gray-700">Details</label>
                  <textarea
                    name="details"
                    rows={4}
                    value={formData.details}
                    onChange={handleFormChange}
                    className="w-full p-2 border border-gray-300 rounded-md"
                  />
                </div>

                {/* Completion Status */}
                <div className="flex items-center gap-2">
                  <input 
                    type="checkbox" 
                    name="completion_status" 
                    checked={formData.completion_status} 
                    onChange={handleFormChange} 
                    className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                  />
                  <label className="text-sm text-gray-700">Order Completed</label>
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
                  {isSaving ? "Saving..." : formData.id ? "Update Order" : "Create Order"}
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}