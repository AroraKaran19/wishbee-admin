import React from 'react';
import Link from 'next/link';
import { Plus, Upload } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function ActionButtons() {
  return (
    <div className="flex items-center space-x-3">
      <Link href="/inventory/add">
        <Button 
          variant="primary" 
          icon={<Plus className="w-4 h-4" />}
        >
          Add Products
        </Button>
      </Link>
      <Button 
        variant="danger" 
        icon={<Upload className="w-4 h-4" />}
      >
        Export CSV
      </Button>
    </div>
  );
}
