import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';

const ChartCard = ({ 
  title, 
  description, 
  children, 
  className,
  headerClassName,
  contentClassName,
  ...props 
}) => {
  return (
    <Card className={cn(
      "border-border bg-card text-card-foreground shadow-sm",
      "w-full transition-all duration-200",
      "hover:shadow-md",
      className
    )} {...props}>
      {(title || description) && (
        <CardHeader className={cn(
          "border-b border-border",
          "px-4 py-3 sm:px-6 sm:py-4",
          headerClassName
        )}>
          {title && (
            <CardTitle className={cn(
              "text-base sm:text-lg font-semibold text-foreground",
              "leading-tight"
            )}>
              {title}
            </CardTitle>
          )}
          {description && (
            <CardDescription className={cn(
              "text-xs sm:text-sm text-muted-foreground",
              "mt-1"
            )}>
              {description}
            </CardDescription>
          )}
        </CardHeader>
      )}
      <CardContent className={cn(
        "px-4 py-4 sm:px-6 sm:py-6",
        contentClassName
      )}>
        {children}
      </CardContent>
    </Card>
  );
};

export default ChartCard;