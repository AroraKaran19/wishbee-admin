'use client';

import React from 'react';
import { Button } from './button';
import { Pagination } from './pagination';
import { TableConfig } from '@/lib/types/table';

interface DataTableProps<T = any> {
  data: T[];
  config: TableConfig<T>;
}

export function DataTable<T = any>({ data, config }: DataTableProps<T>) {
  const {
    columns,
    actions = [],
    pagination,
    loading = false,
    emptyState,
    rowKey = 'id',
    onRowClick,
    className = '',
    headerClassName = '',
    bodyClassName = '',
    rowClassName,
    showHeader = true,
    stickyHeader = false,
    scrollable = true
  } = config;

  const getRowKey = (record: T, index: number): string => {
    if (typeof rowKey === 'function') {
      return rowKey(record);
    }
    if (typeof rowKey === 'string') {
      return (record as any)[rowKey] || index.toString();
    }
    return index.toString();
  };

  const getCellValue = (column: any, record: T, index: number) => {
    if (column.render) {
      return column.render(
        column.dataIndex ? (record as any)[column.dataIndex] : (record as any)[column.key],
        record,
        index
      );
    }
    
    const value = column.dataIndex 
      ? (record as any)[column.dataIndex] 
      : (record as any)[column.key];
    
    return value;
  };

  const getAlignmentClass = (align?: 'left' | 'center' | 'right') => {
    switch (align) {
      case 'center':
        return 'text-center';
      case 'right':
        return 'text-right';
      default:
        return 'text-left';
    }
  };

  if (loading) {
    return (
      <div className={`bg-white rounded-lg border border-gray-200 overflow-hidden ${className}`}>
        <div className="p-8 text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-gray-500">Loading...</p>
        </div>
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div className={`bg-white rounded-lg border border-gray-200 overflow-hidden ${className}`}>
        <div className="p-8 text-center">
          {emptyState?.icon && (
            <div className="mx-auto w-12 h-12 text-gray-400 mb-4">
              {emptyState.icon}
            </div>
          )}
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            {emptyState?.title || 'No data available'}
          </h3>
          {emptyState?.description && (
            <p className="text-gray-500">{emptyState.description}</p>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-white rounded-lg border border-gray-200 overflow-hidden ${className}`}>
      <div className={scrollable ? 'overflow-x-auto' : ''}>
        <table className="w-full">
          {showHeader && (
            <thead className={`bg-[#d9f4ff] border-b border-gray-200 ${stickyHeader ? 'sticky top-0 z-10' : ''} ${headerClassName}`}>
              <tr>
                {columns.map((column) => (
                  <th
                    key={column.key as string}
                    className={`px-6 py-4 text-sm font-semibold text-gray-900 capitalize tracking-wider border-r border-blue-200 ${getAlignmentClass(column.align)} ${column.className || ''}`}
                    {...(column.width && { style: { width: column.width } })}
                  >
                    {column.title}
                  </th>
                ))}
                {actions.length > 0 && (
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900 capitalize tracking-wider">
                    Actions
                  </th>
                )}
              </tr>
            </thead>
          )}
          <tbody className={`bg-white divide-y divide-gray-200 ${bodyClassName}`}>
            {data.map((record, index) => {
              const key = getRowKey(record, index);
              const rowClass = rowClassName ? rowClassName(record, index) : '';
              
              return (
                <tr
                  key={key}
                  className={`hover:bg-gray-50 ${onRowClick ? 'cursor-pointer' : ''} ${rowClass}`}
                  onClick={() => onRowClick?.(record, index)}
                >
                  {columns.map((column) => (
                    <td
                      key={column.key as string}
                      className={`px-6 py-4 whitespace-nowrap text-sm text-gray-900 border-r border-gray-200 ${getAlignmentClass(column.align)} ${column.className || ''}`}
                    >
                      {getCellValue(column, record, index)}
                    </td>
                  ))}
                  {actions.length > 0 && (
                    <td className="px-6 py-4 whitespace-nowrap flex justify-center items-center text-sm text-gray-500 border-r border-gray-200">
                      <div className="flex items-center space-x-2">
                        {actions.map((action) => {
                          const isDisabled = action.disabled ? action.disabled(record) : false;
                          
                          // Don't render disabled buttons at all
                          if (isDisabled) {
                            return null;
                          }
                          
                          return (
                            <Button
                              key={action.key}
                              onClick={(e) => {
                                e.stopPropagation();
                                action.onClick(record, index);
                              }}
                              variant={action.variant || 'secondary'}
                              size={action.size || 'sm'}
                              className={action.className || ''}
                            >
                              {action.icon && <span className="mr-2">{action.icon}</span>}
                              {action.label}
                            </Button>
                          );
                        })}
                      </div>
                    </td>
                  )}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      
      {pagination && (
        <Pagination
          currentPage={pagination.currentPage}
          totalPages={pagination.totalPages}
          onPageChange={pagination.onPageChange}
          showPageInfo={pagination.showPageInfo}
        />
      )}
    </div>
  );
}
