import Image from 'next/image';
import { Package } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ProductThumbProps {
  src?: string;
  alt: string;
  size: number;
  className?: string;
}

export function ProductThumb({ src, alt, size, className }: ProductThumbProps) {
  const box = cn('shrink-0 overflow-hidden rounded-lg bg-gray-100', className);
  if (!src) {
    return (
      <span className={cn(box, 'flex items-center justify-center text-gray-400')} style={{ width: size, height: size }}>
        <Package className="h-1/2 w-1/2" aria-hidden />
      </span>
    );
  }
  return (
    <Image
      src={src}
      alt={alt}
      width={size}
      height={size}
      className={cn(box, 'object-cover')}
      style={{ width: size, height: size }}
      loading="lazy"
      unoptimized
    />
  );
}
