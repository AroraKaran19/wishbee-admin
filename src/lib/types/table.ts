import { ReactNode } from 'react';

export interface TableColumn<T = any> {
  key: keyof T | string;
  title: string;
  dataIndex?: keyof T | string;
  render?: (value: any, record: T, index: number) => ReactNode;
  align?: 'left' | 'center' | 'right';
  width?: string | number;
  sortable?: boolean;
  className?: string;
}

export interface TableAction<T = any> {
  key: string;
  label: string;
  icon?: ReactNode;
  onClick: (record: T, index: number) => void;
  variant?: 'primary' | 'secondary' | 'danger' | 'warning' | 'success' | 'muted';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  disabled?: (record: T) => boolean;
}

export interface TableConfig<T = any> {
  columns: TableColumn<T>[];
  actions?: TableAction<T>[];
  pagination?: {
    currentPage: number;
    totalPages: number;
    onPageChange: (page: number) => void;
    showPageInfo?: boolean;
  };
  loading?: boolean;
  emptyState?: {
    title: string;
    description?: string;
    icon?: ReactNode;
  };
  rowKey?: keyof T | string | ((record: T) => string);
  onRowClick?: (record: T, index: number) => void;
  className?: string;
  headerClassName?: string;
  bodyClassName?: string;
  rowClassName?: (record: T, index: number) => string;
  showHeader?: boolean;
  stickyHeader?: boolean;
  scrollable?: boolean;
}

export interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  showPageInfo?: boolean;
  className?: string;
  previousLabel?: string;
  nextLabel?: string;
}
