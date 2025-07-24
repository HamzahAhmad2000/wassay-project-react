import React from 'react';
import { cn } from '@/lib/utils';
import { BarChart3, FileText, AlertCircle } from 'lucide-react';

const EmptyState = ({ 
  title = 'No Data Available', 
  description = 'There is no data to display at this time.',
  icon: Icon = BarChart3,
  className,
  action,
  ...props 
}) => {
  return (
    <div 
      className={cn(
        "flex flex-col items-center justify-center text-center p-8",
        "border-2 border-dashed border-border rounded-lg",
        "bg-muted/30",
        className
      )}
      {...props}
    >
      <Icon className="h-12 w-12 text-muted-foreground mb-4" />
      <h3 className="text-lg font-semibold text-foreground mb-2">
        {title}
      </h3>
      <p className="text-sm text-muted-foreground mb-4 max-w-sm">
        {description}
      </p>
      {action && (
        <div className="mt-2">
          {action}
        </div>
      )}
    </div>
  );
};

// Pre-configured variants for common use cases
const ChartEmptyState = ({ title = 'No Chart Data', description = 'No data available to display this chart.' }) => (
  <EmptyState 
    title={title}
    description={description}
    icon={BarChart3}
  />
);

const TableEmptyState = ({ title = 'No Records Found', description = 'There are no records to display.' }) => (
  <EmptyState 
    title={title}
    description={description}
    icon={FileText}
  />
);

const ErrorEmptyState = ({ title = 'Error Loading Data', description = 'Something went wrong while loading the data.' }) => (
  <EmptyState 
    title={title}
    description={description}
    icon={AlertCircle}
  />
);

export { EmptyState, ChartEmptyState, TableEmptyState, ErrorEmptyState };
export default EmptyState;