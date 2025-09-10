import React from 'react';
import { Plus, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function ActionButtons() {
  return (
    <div className="flex items-center space-x-3">
      <Button 
        variant="primary" 
        icon={<Plus className="w-4 h-4" />}
      >
        Add Products
      </Button>
      <Button 
        variant="danger" 
        icon={<Download className="w-4 h-4" />}
      >
        Export CSV
      </Button>
    </div>
  );
}
