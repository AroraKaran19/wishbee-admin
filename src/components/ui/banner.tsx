'use client';

import React from 'react';
import { AlertTriangle, CheckCircle, Info } from 'lucide-react';
import { cn } from '@/lib/utils';

export type BannerVariant = 'warning' | 'danger' | 'success' | 'info';

export interface BannerProps {
    variant: BannerVariant;
    message: string;
    className?: string;
    showIcon?: boolean;
}

const bannerConfig = {
    warning: {
        bgColor: 'bg-warning',
        borderColor: 'border-warning',
        iconColor: 'text-yellow-600',
        textColor: 'text-yellow-800',
        icon: AlertTriangle
    },
    danger: {
        bgColor: 'bg-[#f9e5e3]',
        borderColor: 'border-[#f9e5e3]',
        iconColor: 'text-[#d65144]',
        textColor: 'text-red-800',
        icon: AlertTriangle
    },
    success: {
        bgColor: 'bg-success',
        borderColor: 'border-success',
        iconColor: 'text-green-600',
        textColor: 'text-green-800',
        icon: CheckCircle
    },
    info: {
        bgColor: 'bg-muted',
        borderColor: 'border-muted',
        iconColor: 'text-blue-600',
        textColor: 'text-blue-800',
        icon: Info
    }
};

export function Banner({
    variant,
    message,
    className = '',
    showIcon = true,
}: BannerProps) {
    const config = bannerConfig[variant];
    const IconComponent = config.icon;

    return (
        <div
            className={cn(
                'inline-flex items-center border rounded-xl p-4 mb-4 w-fit',
                config.bgColor,
                config.borderColor,
                className
            )}
        >
            {showIcon && (
                <IconComponent className={cn(
                    'w-5 h-5 mr-3 flex-shrink-0',
                    config.iconColor
                )} />
            )}

            <p className={cn(
                'text-sm',
                config.textColor
            )}>
                {message}
            </p>
        </div>
    );
}

export function WarningBanner({
    message,
    className,
    showIcon = true,
}: Omit<BannerProps, 'variant'>) {
    return (
        <Banner
            variant="warning"
            message={message}
            className={className}
            showIcon={showIcon}
        />
    );
}

export function DangerBanner({
    message,
    className,
    showIcon = true,
}: Omit<BannerProps, 'variant'>) {
    return (
        <Banner
            variant="danger"
            message={message}
            className={className}
            showIcon={showIcon}
        />
    );
}

export function SuccessBanner({
    message,
    className,
    showIcon = true,
}: Omit<BannerProps, 'variant'>) {
    return (
        <Banner
            variant="success"
            message={message}
            className={className}
            showIcon={showIcon}
        />
    );
}

export function InfoBanner({
    message,
    className,
    showIcon = true,
}: Omit<BannerProps, 'variant'>) {
    return (
        <Banner
            variant="info"
            message={message}
            className={className}
            showIcon={showIcon}
        />
    );
}
