'use client';

import React, { useState } from 'react';
import { Enquiry } from '@/lib/api/enquiries';
import { enquiryApi } from '@/lib/api/enquiries';
import toast from 'react-hot-toast';
import { CheckCircle, XCircle, Trash2, Eye, X } from 'lucide-react';
import { Pagination } from '@/components/ui/pagination';

interface SupportTableProps {
  enquiries: Enquiry[];
  currentPage: number;
  totalPages: number;
  total: number;
  onPageChange: (page: number) => void;
  onEnquiryUpdate: () => void;
}

export function SupportTable({
  enquiries,
  currentPage,
  totalPages,
  total,
  onPageChange,
  onEnquiryUpdate,
}: SupportTableProps) {
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [selectedEnquiry, setSelectedEnquiry] = useState<Enquiry | null>(null);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PENDING':
        return 'bg-yellow-100 text-yellow-700';
      case 'RESOLVED':
        return 'bg-green-100 text-green-700';
      case 'CLOSED':
        return 'bg-gray-100 text-gray-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  const getTypeColor = (type: string) => {
    switch (type?.toUpperCase()) {
      case 'PAYMENT':
        return 'bg-blue-100 text-blue-700';
      case 'DELIVERY':
        return 'bg-purple-100 text-purple-700';
      case 'PRODUCT':
        return 'bg-orange-100 text-orange-700';
      case 'OTHER':
        return 'bg-gray-100 text-gray-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  const handleStatusUpdate = async (enquiryId: string, newStatus: 'PENDING' | 'RESOLVED' | 'CLOSED') => {
    if (!confirm(`Are you sure you want to mark this enquiry as ${newStatus}?`)) {
      return;
    }

    try {
      setUpdatingId(enquiryId);
      await enquiryApi.update(enquiryId, newStatus);
      toast.success(`Enquiry marked as ${newStatus.toLowerCase()}`);
      onEnquiryUpdate();
    } catch (error) {
      console.error('Error updating enquiry:', error);
      toast.error('Failed to update enquiry status');
    } finally {
      setUpdatingId(null);
    }
  };

  const handleDelete = async (enquiryId: string) => {
    if (!confirm('Are you sure you want to delete this enquiry? This action cannot be undone.')) {
      return;
    }

    try {
      setDeletingId(enquiryId);
      await enquiryApi.delete(enquiryId);
      toast.success('Enquiry deleted successfully');
      onEnquiryUpdate();
    } catch (error) {
      console.error('Error deleting enquiry:', error);
      toast.error('Failed to delete enquiry');
    } finally {
      setDeletingId(null);
    }
  };

  const handleViewDetails = async (enquiryId: string) => {
    try {
      const enquiry = await enquiryApi.getById(enquiryId);
      setSelectedEnquiry(enquiry);
      setIsDetailsModalOpen(true);
    } catch (error) {
      console.error('Error fetching enquiry details:', error);
      toast.error('Failed to load enquiry details');
    }
  };

  return (
    <>
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-[#d9f4ff] border-b border-blue-200">
              <tr>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Customer</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Type</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Message</th>
                <th className="px-6 py-3 text-center text-sm font-semibold text-gray-900">Status</th>
                <th className="px-6 py-3 text-center text-sm font-semibold text-gray-900">Date</th>
                <th className="px-6 py-3 text-center text-sm font-semibold text-gray-900">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {enquiries.map((enquiry) => (
                <tr key={enquiry._id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div>
                      <div className="font-medium text-gray-900">
                        {enquiry.user.firstName} {enquiry.user.lastName}
                      </div>
                      <div className="text-sm text-gray-500">{enquiry.user.phoneNumber}</div>
                      {enquiry.user.email && (
                        <div className="text-xs text-gray-400">{enquiry.user.email}</div>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-medium inline-block ${getTypeColor(
                        enquiry.type
                      )}`}
                    >
                      {enquiry.type}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="max-w-md">
                      <p className="text-sm text-gray-900 line-clamp-2">{enquiry.message}</p>
                      {enquiry.images && enquiry.images.length > 0 && (
                        <span className="text-xs text-gray-500 mt-1">
                          {enquiry.images.length} image{enquiry.images.length > 1 ? 's' : ''}
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-medium inline-block ${getStatusColor(
                        enquiry.status
                      )}`}
                    >
                      {enquiry.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-center text-sm text-gray-900">
                    {formatDate(enquiry.createdAt)}
                  </td>
                  <td className="px-6 py-4 text-center">
                    <button
                      onClick={() => handleViewDetails(enquiry._id)}
                      className="text-blue-600 hover:text-blue-700 bg-transparent hover:bg-blue-50 border-0 shadow-none rounded-full p-2 cursor-pointer"
                      title="View details"
                    >
                      <Eye className="h-4 w-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center">
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={onPageChange}
          />
        </div>
      )}

      {/* Details Modal */}
      {isDetailsModalOpen && selectedEnquiry && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-start mb-4">
              <h2 className="text-xl font-bold text-gray-900">Enquiry Details</h2>
              <button
                onClick={() => {
                  setIsDetailsModalOpen(false);
                  setSelectedEnquiry(null);
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            <div className="space-y-4">
              {/* Customer Info */}
              <div>
                <h3 className="text-sm font-semibold text-gray-700 mb-2">Customer Information</h3>
                <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                  <div>
                    <span className="text-sm text-gray-600">Name: </span>
                    <span className="text-sm font-medium text-gray-900">
                      {selectedEnquiry.user.firstName} {selectedEnquiry.user.lastName}
                    </span>
                  </div>
                  <div>
                    <span className="text-sm text-gray-600">Phone: </span>
                    <span className="text-sm text-gray-900">{selectedEnquiry.user.phoneNumber}</span>
                  </div>
                  {selectedEnquiry.user.email && (
                    <div>
                      <span className="text-sm text-gray-600">Email: </span>
                      <span className="text-sm text-gray-900">{selectedEnquiry.user.email}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Enquiry Details */}
              <div>
                <h3 className="text-sm font-semibold text-gray-700 mb-2">Enquiry Details</h3>
                <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                  <div>
                    <span className="text-sm text-gray-600">Type: </span>
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-medium inline-block ${getTypeColor(
                        selectedEnquiry.type
                      )}`}
                    >
                      {selectedEnquiry.type}
                    </span>
                  </div>
                  <div>
                    <span className="text-sm text-gray-600">Status: </span>
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-medium inline-block ${getStatusColor(
                        selectedEnquiry.status
                      )}`}
                    >
                      {selectedEnquiry.status}
                    </span>
                  </div>
                  <div>
                    <span className="text-sm text-gray-600">Created: </span>
                    <span className="text-sm text-gray-900">{formatDate(selectedEnquiry.createdAt)}</span>
                  </div>
                  <div>
                    <span className="text-sm text-gray-600">Last Updated: </span>
                    <span className="text-sm text-gray-900">{formatDate(selectedEnquiry.updatedAt)}</span>
                  </div>
                </div>
              </div>

              {/* Message */}
              <div>
                <h3 className="text-sm font-semibold text-gray-700 mb-2">Message</h3>
                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="text-sm text-gray-900 whitespace-pre-wrap">{selectedEnquiry.message}</p>
                </div>
              </div>

              {/* Images */}
              {selectedEnquiry.images && selectedEnquiry.images.length > 0 && (
                <div>
                  <h3 className="text-sm font-semibold text-gray-700 mb-2">Images</h3>
                  <div className="grid grid-cols-2 gap-4">
                    {selectedEnquiry.images.map((imageUrl, index) => (
                      <div key={index} className="relative">
                        <img
                          src={imageUrl}
                          alt={`Enquiry image ${index + 1}`}
                          className="w-full h-48 object-cover rounded-lg border border-gray-200"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Actions */}
              <div className="flex gap-2 pt-4 border-t">
                {selectedEnquiry.status !== 'RESOLVED' && (
                  <button
                    onClick={() => {
                      handleStatusUpdate(selectedEnquiry._id, 'RESOLVED');
                      setIsDetailsModalOpen(false);
                    }}
                    className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                  >
                    Mark as Resolved
                  </button>
                )}
                {selectedEnquiry.status !== 'CLOSED' && (
                  <button
                    onClick={() => {
                      handleStatusUpdate(selectedEnquiry._id, 'CLOSED');
                      setIsDetailsModalOpen(false);
                    }}
                    className="flex-1 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                  >
                    Close Enquiry
                  </button>
                )}
                <button
                  onClick={() => {
                    handleDelete(selectedEnquiry._id);
                    setIsDetailsModalOpen(false);
                  }}
                  className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

