'use client';

import React, { useState } from 'react';
import Zoom from 'react-medium-image-zoom';
import 'react-medium-image-zoom/dist/styles.css';
import { Enquiry } from '@/lib/api/enquiries';
import { enquiryApi } from '@/lib/api/enquiries';
import toast from 'react-hot-toast';
import { CheckCircle, XCircle, Trash2, Eye, X, User, Phone, Mail, Calendar, MessageSquare, Image as ImageIcon, Tag } from 'lucide-react';
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
                      {enquiry.user ? (
                        <>
                          <div className="font-medium text-gray-900">
                            {enquiry.user.firstName} {enquiry.user.lastName}
                          </div>
                          <div className="text-sm text-gray-500">{enquiry.user.phoneNumber}</div>
                          {enquiry.user.email && (
                            <div className="text-xs text-gray-400">{enquiry.user.email}</div>
                          )}
                        </>
                      ) : (
                        <div className="font-medium text-gray-400 italic">Deleted user</div>
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

        {/* Pagination */}
        {totalPages > 1 && (
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={onPageChange}
          />
        )}
      </div>

      {/* Details Modal */}
      {isDetailsModalOpen && selectedEnquiry && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b bg-gradient-to-r from-blue-50 to-indigo-50">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <MessageSquare className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">Enquiry Details</h2>
                  <p className="text-sm text-gray-600 mt-1">
                    #{selectedEnquiry._id?.slice(-8).toUpperCase()}
                  </p>
                </div>
              </div>
              <button
                onClick={() => {
                  setIsDetailsModalOpen(false);
                  setSelectedEnquiry(null);
                }}
                className="text-gray-400 hover:text-gray-600 transition-colors cursor-pointer p-2 hover:bg-white rounded-lg"
                title="Close"
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-6">
              <div className="space-y-6">
                {/* Status and Type Badges */}
                <div className="flex flex-wrap items-center gap-3 pb-4 border-b">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-gray-600">Status:</span>
                    <span
                      className={`px-3 py-1.5 rounded-full text-sm font-semibold inline-flex items-center gap-1.5 ${getStatusColor(
                        selectedEnquiry.status
                      )}`}
                    >
                      {selectedEnquiry.status === 'RESOLVED' && <CheckCircle className="h-4 w-4" />}
                      {selectedEnquiry.status === 'CLOSED' && <XCircle className="h-4 w-4" />}
                      {selectedEnquiry.status}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Tag className="h-4 w-4 text-gray-600" />
                    <span className="text-sm font-medium text-gray-600">Type:</span>
                    <span
                      className={`px-3 py-1.5 rounded-full text-sm font-semibold inline-block ${getTypeColor(
                        selectedEnquiry.type
                      )}`}
                    >
                      {selectedEnquiry.type}
                    </span>
                  </div>
                </div>

                {/* Customer Information */}
                <div className="bg-gradient-to-br from-gray-50 to-blue-50/30 rounded-xl p-5 border border-gray-200">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <User className="h-5 w-5 text-blue-600" />
                    Customer Information
                  </h3>
                  {selectedEnquiry.user ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="flex items-start gap-3">
                        <div className="p-2 bg-white rounded-lg shadow-sm">
                          <User className="h-5 w-5 text-gray-600" />
                        </div>
                        <div>
                          <p className="text-xs text-gray-500 mb-1">Name</p>
                          <p className="text-sm font-semibold text-gray-900">
                            {selectedEnquiry.user.firstName} {selectedEnquiry.user.lastName}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-start gap-3">
                        <div className="p-2 bg-white rounded-lg shadow-sm">
                          <Phone className="h-5 w-5 text-gray-600" />
                        </div>
                        <div>
                          <p className="text-xs text-gray-500 mb-1">Phone</p>
                          <p className="text-sm font-semibold text-gray-900">{selectedEnquiry.user.phoneNumber}</p>
                        </div>
                      </div>
                      {selectedEnquiry.user.email && (
                        <div className="flex items-start gap-3 md:col-span-2">
                          <div className="p-2 bg-white rounded-lg shadow-sm">
                            <Mail className="h-5 w-5 text-gray-600" />
                          </div>
                          <div className="flex-1">
                            <p className="text-xs text-gray-500 mb-1">Email</p>
                            <p className="text-sm font-semibold text-gray-900 break-all">{selectedEnquiry.user.email}</p>
                          </div>
                        </div>
                      )}
                    </div>
                  ) : (
                    <p className="text-sm text-gray-500 italic">
                      This customer&apos;s account has been deleted.
                    </p>
                  )}
                </div>

                {/* Message */}
                <div className="bg-white rounded-xl p-5 border border-gray-200 shadow-sm">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <MessageSquare className="h-5 w-5 text-blue-600" />
                    Message
                  </h3>
                  <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                    <p className="text-sm text-gray-900 whitespace-pre-wrap leading-relaxed">
                      {selectedEnquiry.message}
                    </p>
                  </div>
                </div>

                {/* Images Gallery */}
                {selectedEnquiry.images && selectedEnquiry.images.length > 0 && (
                  <div className="bg-white rounded-xl p-5 border border-gray-200 shadow-sm">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                      <ImageIcon className="h-5 w-5 text-blue-600" />
                      Attached Images ({selectedEnquiry.images.length})
                    </h3>
                    <div className={`grid gap-4 ${
                      selectedEnquiry.images.length === 1 
                        ? 'grid-cols-1' 
                        : selectedEnquiry.images.length === 2
                        ? 'grid-cols-1 md:grid-cols-2'
                        : 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3'
                    }`}>
                      {selectedEnquiry.images.map((imageUrl, index) => (
                        <div key={index} className="relative group">
                          <div className="relative overflow-hidden rounded-lg border-2 border-gray-200 hover:border-blue-400 transition-all shadow-sm hover:shadow-md">
                            <Zoom>
                              <img
                                src={imageUrl}
                                alt={`Enquiry attachment ${index + 1}`}
                                className="w-full h-64 object-cover transition-transform group-hover:scale-105 cursor-zoom-in"
                              />
                            </Zoom>
                            <div className="absolute bottom-2 left-0 right-0 flex justify-center">
                              <span className="text-white opacity-0 group-hover:opacity-100 text-sm font-medium bg-black/50 px-2 py-1 rounded">
                                Click to zoom
                              </span>
                            </div>
                          </div>
                          <p className="text-xs text-gray-500 mt-2 text-center">Image {index + 1}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Timeline Information */}
                <div className="bg-white rounded-xl p-5 border border-gray-200 shadow-sm">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <Calendar className="h-5 w-5 text-blue-600" />
                    Timeline
                  </h3>
                  <div className="space-y-3">
                    <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                      <Calendar className="h-5 w-5 text-gray-500 mt-0.5" />
                      <div className="flex-1">
                        <p className="text-xs text-gray-500 mb-1">Created At</p>
                        <p className="text-sm font-medium text-gray-900">{formatDate(selectedEnquiry.createdAt)}</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                      <Calendar className="h-5 w-5 text-gray-500 mt-0.5" />
                      <div className="flex-1">
                        <p className="text-xs text-gray-500 mb-1">Last Updated</p>
                        <p className="text-sm font-medium text-gray-900">{formatDate(selectedEnquiry.updatedAt)}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Footer Actions */}
            <div className="border-t p-6 bg-gray-50">
              <div className="flex flex-wrap gap-3">
                {selectedEnquiry.status !== 'RESOLVED' && (
                  <button
                    onClick={() => {
                      handleStatusUpdate(selectedEnquiry._id, 'RESOLVED');
                      setIsDetailsModalOpen(false);
                    }}
                    disabled={updatingId === selectedEnquiry._id}
                    className="flex-1 min-w-[140px] px-4 py-2.5 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium flex items-center justify-center gap-2 shadow-sm hover:shadow cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <CheckCircle className="h-4 w-4" />
                    Mark as Resolved
                  </button>
                )}
                {selectedEnquiry.status !== 'CLOSED' && (
                  <button
                    onClick={() => {
                      handleStatusUpdate(selectedEnquiry._id, 'CLOSED');
                      setIsDetailsModalOpen(false);
                    }}
                    disabled={updatingId === selectedEnquiry._id}
                    className="flex-1 min-w-[140px] px-4 py-2.5 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors font-medium flex items-center justify-center gap-2 shadow-sm hover:shadow cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <XCircle className="h-4 w-4" />
                    Close Enquiry
                  </button>
                )}
                <button
                  onClick={() => {
                    handleDelete(selectedEnquiry._id);
                    setIsDetailsModalOpen(false);
                  }}
                  disabled={deletingId === selectedEnquiry._id}
                  className="flex-1 min-w-[140px] px-4 py-2.5 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium flex items-center justify-center gap-2 shadow-sm hover:shadow cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Trash2 className="h-4 w-4" />
                  Delete
                </button>
                <button
                  onClick={() => {
                    setIsDetailsModalOpen(false);
                    setSelectedEnquiry(null);
                  }}
                  className="px-4 py-2.5 bg-white text-gray-700 rounded-lg hover:bg-gray-100 transition-colors font-medium border border-gray-300 shadow-sm hover:shadow cursor-pointer"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

