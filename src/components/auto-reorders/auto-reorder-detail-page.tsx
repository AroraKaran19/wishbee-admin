'use client';

import React from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Edit, Pause, SkipForward, SendHorizonal, Play, X } from 'lucide-react';

interface AutoReorderDetailProps {
  data: {
    id: string;
    customer: {
      name: string;
      phone: string;
      email: string;
      address: string;
      gender?: string;
      gst?: string;
    };
    products: string;
    frequency: string;
    nextDate: string;
    preferredSlot: string;
    paymentMethod: string;
    lastAutoReorder: string;
    status: 'Active' | 'Paused';
  };
}

export function AutoReorderDetailPage({ data }: AutoReorderDetailProps) {
  const router = useRouter();

  return (
    <div className="space-y-6 h-full flex flex-col">
      <div className="flex items-center gap-4">
        <button
          title="Back"
          onClick={() => router.back()}
          className="flex items-center text-gray-600 cursor-pointer hover:text-gray-900 transition-colors"
        >
          <ArrowLeft className="w-5 h-5 mr-2" />
        </button>
        <span className="text-lg font-medium">Auto-Reorder Details</span>
      </div>

      <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white rounded-lg border border-gray-200">
              <div className="flex items-center mt-4">
                <div className="px-3 py-3 rounded-tr-3xl bg-[#00B7FB] text-[#fff] text-sm font-semibold">Customer Information</div>
              </div>
              <div className="p-6 text-sm space-y-4">
                <div className="grid grid-cols-12 gap-4">
                  <div className="col-span-4 md:col-span-3 text-gray-500">Name</div>
                  <div className="col-span-8 md:col-span-9 text-gray-900">{data.customer.name}</div>
                </div>
                <div className="grid grid-cols-12 gap-4">
                  <div className="col-span-4 md:col-span-3 text-gray-500">Phone</div>
                  <div className="col-span-8 md:col-span-9 text-gray-900">{data.customer.phone}</div>
                </div>
                <div className="grid grid-cols-12 gap-4">
                  <div className="col-span-4 md:col-span-3 text-gray-500">Email</div>
                  <div className="col-span-8 md:col-span-9 text-gray-900">{data.customer.email}</div>
                </div>
                <div className="grid grid-cols-12 gap-4">
                  <div className="col-span-4 md:col-span-3 text-gray-500">Address</div>
                  <div className="col-span-8 md:col-span-9 text-gray-900">{data.customer.address}</div>
                </div>
                <div className="grid grid-cols-12 gap-4">
                  <div className="col-span-4 md:col-span-3 text-gray-500">Gender</div>
                  <div className="col-span-8 md:col-span-9 text-gray-900">{data.customer.gender || '-'}</div>
                </div>
                <div className="grid grid-cols-12 gap-4">
                  <div className="col-span-4 md:col-span-3 text-gray-500">GST no</div>
                  <div className="col-span-8 md:col-span-9 text-gray-900">{data.customer.gst || '-'}</div>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-lg border border-gray-200 p-4 flex items-center justify-center">
              <Image
                src="https://img.freepik.com/premium-photo/software-engineer-digital-avatar-generative-ai_934475-8997.jpg?w=2000"
                alt="Customer profile"
                width={200}
                height={200}
                className="w-60 h-60 rounded-full object-cover"
              />
            </div>
          </div>

        <div className="bg-white rounded-lg border border-gray-200 mb-4 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200">
            <div className="px-3 py-2 rounded-md bg-[#d9f4ff] inline-block text-[#0b8ec7] text-sm font-semibold">Reorder Details</div>
            </div>
          <div className="bg-[#d9f4ff] grid grid-cols-1 md:grid-cols-3 gap-3 items-center px-6 py-3">
            <div className="text-sm font-semibold text-gray-900">Field</div>
            <div className="text-sm font-semibold text-gray-900">Value Example</div>
            <div className="text-sm font-semibold text-gray-900">Actions</div>
          </div>
          <div className="divide-y divide-gray-100">
              <div className="px-6 py-4 grid grid-cols-1 md:grid-cols-3 gap-3 items-center">
                <div className="text-sm text-gray-500">Products</div>
                <div className="text-sm text-gray-900 md:col-span-1">{data.products}</div>
                <div className="flex items-center justify-start gap-2">
                  <button className="cursor-pointer text-green-600 hover:text-green-700 bg-green-50 hover:bg-green-100 border-0 shadow-none rounded-full px-2 py-1.5 inline-flex items-center gap-2">
                    <Edit className="h-4 w-4" />
                    <span className="text-sm">Edit</span>
                  </button>
                </div>
              </div>
              <div className="px-6 py-4 grid grid-cols-1 md:grid-cols-3 gap-3 items-center">
                <div className="text-sm text-gray-500">Frequency</div>
                <div className="text-sm text-gray-900 md:col-span-1">{data.frequency}</div>
                <div className="flex items-center justify-start gap-2">
                  <button className="cursor-pointer text-green-600 hover:text-green-700 bg-transparent hover:bg-green-50 border-0 shadow-none rounded-full px-2 py-1.5 inline-flex items-center gap-2">
                    <Edit className="h-4 w-4" />
                    <span className="text-sm">Edit</span>
                  </button>
                </div>
              </div>
              <div className="px-6 py-4 grid grid-cols-1 md:grid-cols-3 gap-3 items-center">
                <div className="text-sm text-gray-500">Next Scheduled Date</div>
                <div className="text-sm text-gray-900 md:col-span-1">{data.nextDate}</div>
                <div className="flex items-center justify-start gap-2">
                  <button className="cursor-pointer text-red-600 hover:text-red-700 bg-transparent hover:bg-red-50 border-0 shadow-none rounded-full px-2 py-1.5 inline-flex items-center gap-2">
                    <Pause className="h-4 w-4" />
                    <span className="text-sm">Pause Order</span>
                  </button>
                </div>
              </div>
              <div className="px-6 py-4 grid grid-cols-1 md:grid-cols-3 gap-3 items-center">
                <div className="text-sm text-gray-500">Preferred Delivery Slot</div>
                <div className="text-sm text-gray-900 md:col-span-1">{data.preferredSlot}</div>
                <div className="flex items-center justify-start gap-2">
                  <button className="cursor-pointer text-gray-700 hover:text-gray-900 bg-transparent hover:bg-gray-50 border-0 shadow-none rounded-full px-2 py-1.5 inline-flex items-center gap-2">
                    <SkipForward className="h-4 w-4" />
                    <span className="text-sm">Skip Next Order</span>
                  </button>
                </div>
              </div>
              <div className="px-6 py-4 grid grid-cols-1 md:grid-cols-3 gap-3 items-center">
                <div className="text-sm text-gray-500">Payment Method</div>
                <div className="text-sm text-gray-900 md:col-span-1">{data.paymentMethod}</div>
                <div className="flex items-center justify-start gap-2">
                  <button className="cursor-pointer text-amber-600 hover:text-amber-700 bg-transparent hover:bg-amber-50 border-0 shadow-none rounded-full px-2 py-1.5 inline-flex items-center gap-2">
                    <SendHorizonal className="h-4 w-4" />
                    <span className="text-sm">Send Reminder</span>
                  </button>
                </div>
              </div>
              <div className="px-6 py-4 grid grid-cols-1 md:grid-cols-3 gap-3 items-center">
                <div className="text-sm text-gray-500">Last Auto-Reorder</div>
                <div className="text-sm text-gray-900 md:col-span-1">{data.lastAutoReorder}</div>
                <div className="flex items-center justify-start gap-2">
                  <button className="cursor-pointer text-sky-600 hover:text-sky-700 bg-transparent hover:bg-sky-50 border-0 shadow-none rounded-full px-2 py-1.5 inline-flex items-center gap-2">
                    <SendHorizonal className="h-4 w-4" />
                    <span className="text-sm">Trigger Reorder Now</span>
                  </button>
                </div>
              </div>
              <div className="px-6 py-4 grid grid-cols-1 md:grid-cols-3 gap-3 items-center">
                <div className="text-sm text-gray-500">Status</div>
                <div className="text-sm text-gray-900 md:col-span-1">{data.status}</div>
                <div className="text-sm text-gray-900">Active</div>
              </div>
            </div>
            <div className="p-6">
              <button className="inline-flex cursor-pointer items-center gap-2 rounded-md bg-[#D65144] text-white text-sm px-4 py-2">
                <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-white">
                  <X className="w-3.5 h-3.5 text-red-600" />
                </span>
                <span>Cancel Reorder</span>
              </button>
            </div>
          </div>
      </div>
    </div>
  );
}
