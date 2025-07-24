import React from 'react';
import { ToastProvider as RadixToastProvider, ToastViewport } from '@/components/ui/toast';
import { useToast } from '@/hooks/use-toast';
import { Toast, ToastTitle, ToastDescription, ToastClose, ToastAction } from '@/components/ui/toast';

const ToastContainer = () => {
  const { toasts } = useToast();

  return (
    <RadixToastProvider>
      {toasts.map(({ id, title, description, action, ...props }) => (
        <Toast key={id} {...props}>
          <div className="grid gap-1">
            {title && <ToastTitle>{title}</ToastTitle>}
            {description && <ToastDescription>{description}</ToastDescription>}
          </div>
          {action}
          <ToastClose />
        </Toast>
      ))}
      <ToastViewport />
    </RadixToastProvider>
  );
};

export default ToastContainer;