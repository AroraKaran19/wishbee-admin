'use client';

import React from 'react';
import { formatCurrency } from '@/lib/utils';
import { OrderSummary } from '@/lib/types';

interface OrderSummaryCardsProps {
    summary: OrderSummary;
}

export function OrderSummaryCards({ summary }: OrderSummaryCardsProps) {
    return (
        <div className="flex flex-wrap gap-6 justify-start">
            {/* Total Orders Card */}
            <div className="bg-[#d9f4ff] rounded-lg pt-4 pb-2 pb-2 w-1/5">
                <div className="bg-[#00b7fb] text-white px-3 py-2 rounded-tr-2xl inline-block mb-3">
                    <span className="text-sm font-medium">Total Orders</span>
                </div>
                <div className="flex flex-col items-start justify-center pl-4">
                    <div className="text-2xl font-semibold text-gray-900 text-center">
                        {summary.totalOrders}
                    </div>
                    <div className="text-xs text-gray-600 text-center">
                        Last Seven Days
                    </div>
                </div>
            </div>

            {/* Total Received Card */}
            <div className="bg-[#dbeed9] rounded-lg pt-4 pb-2 pb-2 w-1/5">
                <div className="bg-[#0b8f00] text-white px-3 py-2 rounded-tr-2xl inline-block mb-3">
                    <span className="text-sm font-medium">Total Received</span>
                </div>
                <div className="flex justify-between items-start px-4">
                    <div>
                        <div className="text-2xl font-semibold text-gray-900">
                            {summary.totalReceived}
                        </div>
                        <div className="text-xs text-gray-600">
                            Last Seven Days
                        </div>
                    </div>
                    <div className="text-right">
                        <div className="text-2xl font-semibold text-gray-900">
                            {formatCurrency(summary.revenue)}
                        </div>
                        <div className="text-xs text-gray-600">
                            Revenue
                        </div>
                    </div>
                </div>
            </div>

            {/* Total Returned Card */}
            <div className="bg-[#fce4e6] rounded-lg pt-4 pb-2 pb-2 w-1/5">
                <div className="bg-[#dc2626] text-white px-3 py-2 rounded-tr-2xl inline-block mb-3">
                    <span className="text-sm font-medium">Total Returned</span>
                </div>
                <div className="flex justify-between items-start px-4">
                    <div>
                        <div className="text-2xl font-semibold text-gray-900">
                            {summary.totalReturned}
                        </div>
                        <div className="text-xs text-gray-600">
                            Last Seven Days
                        </div>
                    </div>
                    <div className="text-right">
                        <div className="text-2xl font-semibold text-gray-900">
                            {formatCurrency(summary.returnAmount)}
                        </div>
                        <div className="text-xs text-gray-600">
                            Last Seven Days
                        </div>
                    </div>
                </div>
            </div>

            {/* On the way Card */}
            <div className="bg-[#d9f4ff] rounded-lg pt-4 pb-2 w-1/5">
                <div className="bg-[#00b7fb] text-white px-3 py-2 rounded-tr-2xl inline-block mb-3">
                    <span className="text-sm font-medium">On the way</span>
                </div>
                <div className="flex justify-between items-start px-4">
                    <div>
                        <div className="text-2xl font-semibold text-gray-900">
                            {summary.onTheWay}
                        </div>
                        <div className="text-xs text-gray-600">
                            Ordered
                        </div>
                    </div>
                    <div className="text-right">
                        <div className="text-2xl font-semibold text-gray-900">
                            {formatCurrency(summary.onTheWayCost)}
                        </div>
                        <div className="text-xs text-gray-600">
                            Cost
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
