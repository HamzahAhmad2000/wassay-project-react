import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { Input, InputWithIcon, Label } from '../modern-input';
import { User, Lock } from 'lucide-react';

describe('ModernInput Components', () => {
  describe('Input Component', () => {
    it('renders basic input correctly', () => {
      render(
        <Input data-testid="basic-input" placeholder="Enter text" />
      );
      const input = screen.getByTestId('basic-input');
      expect(input).toBeInTheDocument();
      expect(input).toHaveAttribute('type', 'text');
      expect(input).toHaveAttribute('placeholder', 'Enter text');
    });

    it('applies correct styling classes', () => {
      render(
        <Input data-testid="styled-input" />
      );
      const input = screen.getByTestId('styled-input');
      expect(input).toHaveClass('border-[var(--color-primary-100)]');
      expect(input).toHaveClass('bg-[var(--color-primary-50)]');
      expect(input).toHaveClass('text-[var(--color-secondary-900)]');
    });

    it('handles password type with visibility toggle', () => {
      render(
        <Input type="password" data-testid="password-input" />
      );
      
      const input = screen.getByTestId('password-input');
      expect(input).toHaveAttribute('type', 'password');
      
      const toggleButton = screen.getByRole('button');
      expect(toggleButton).toBeInTheDocument();
      
      fireEvent.click(toggleButton);
      expect(input).toHaveAttribute('type', 'text');
      
      fireEvent.click(toggleButton);
      expect(input).toHaveAttribute('type', 'password');
    });

    it('shows error state styling', () => {
      render(
        <Input error data-testid="error-input" />
      );
      const input = screen.getByTestId('error-input');
      expect(input).toHaveClass('border-red-500');
      expect(input).toHaveClass('focus-visible:ring-red-500');
      
      const errorIcon = screen.getByRole('img', { hidden: true });
      expect(errorIcon).toBeInTheDocument();
    });

    it('shows success state styling', () => {
      render(
        <Input success data-testid="success-input" />
      );
      const input = screen.getByTestId('success-input');
      expect(input).toHaveClass('border-green-500');
      expect(input).toHaveClass('focus-visible:ring-green-500');
    });

    it('disables password toggle when disabled', () => {
      render(
        <Input type="password" disabled data-testid="disabled-password" />
      );
      
      const toggleButton = screen.getByRole('button');
      expect(toggleButton).toBeDisabled();
    });

    it('handles ref forwarding', () => {
      const ref = React.createRef();
      render(
        <Input ref={ref} data-testid="ref-input" />
      );
      expect(ref.current).toBeInstanceOf(HTMLInputElement);
    });
  });

  describe('InputWithIcon Component', () => {
    it('renders with left icon', () => {
      render(
        <InputWithIcon 
          icon={<User data-testid="user-icon" />} 
          data-testid="icon-input"
        />
      );
      
      const input = screen.getByTestId('icon-input');
      const icon = screen.getByTestId('user-icon');
      expect(input).toBeInTheDocument();
      expect(icon).toBeInTheDocument();
      expect(input.parentElement).toHaveClass('pl-10');
    });

    it('renders with right icon', () => {
      render(
        <InputWithIcon 
          icon={<Lock data-testid="lock-icon" />} 
          iconPosition="right"
          data-testid="icon-input-right"
        />
      );
      
      const input = screen.getByTestId('icon-input-right');
      const icon = screen.getByTestId('lock-icon');
      expect(input).toBeInTheDocument();
      expect(icon).toBeInTheDocument();
      expect(input.parentElement).toHaveClass('pr-10');
    });

    it('merges custom className', () => {
      render(
        <InputWithIcon 
          icon={<User />} 
          className="custom-class"
          data-testid="custom-icon-input"
        />
      );
      
      const input = screen.getByTestId('custom-icon-input');
      expect(input).toHaveClass('custom-class');
    });

    it('applies correct icon styling', () => {
      render(
        <InputWithIcon 
          icon={<User data-testid="styled-icon" />} 
          data-testid="styled-icon-input"
        />
      );
      
      const icon = screen.getByTestId('styled-icon');
      expect(icon).toHaveClass('h-4', 'w-4', 'text-[var(--color-secondary-800)]');
    });
  });

  describe('Label Component', () => {
    it('renders label correctly', () => {
      render(
        <Label htmlFor="test-input" data-testid="label">
          Test Label
        </Label>
      );
      
      const label = screen.getByTestId('label');
      expect(label).toBeInTheDocument();
      expect(label).toHaveTextContent('Test Label');
      expect(label).toHaveAttribute('for', 'test-input');
    });

    it('applies correct styling', () => {
      render(
        <Label data-testid="styled-label">Label Text</Label>
      );
      
      const label = screen.getByTestId('styled-label');
      expect(label).toHaveClass('text-sm', 'font-medium', 'text-[var(--color-secondary-900)]');
    });

    it('merges custom className', () => {
      render(
        <Label className="custom-label-class" data-testid="custom-label">
          Custom Label
        </Label>
      );
      
      const label = screen.getByTestId('custom-label');
      expect(label).toHaveClass('custom-label-class');
    });
  });

  describe('Integration Tests', () => {
    it('works with Label and Input together', () => {
      render(
        <div>
          <Label htmlFor="email-input">Email</Label>
          <Input id="email-input" type="email" placeholder="Enter email" />
        </div>
      );
      
      const label = screen.getByText('Email');
      const input = screen.getByPlaceholderText('Enter email');
      expect(label).toHaveAttribute('for', 'email-input');
      expect(input).toHaveAttribute('id', 'email-input');
    });

    it('handles user input correctly', () => {
      render(
        <Input data-testid="user-input" />
      );
      
      const input = screen.getByTestId('user-input');
      fireEvent.change(input, { target: { value: 'test value' } });
      expect(input).toHaveValue('test value');
    });
  });
});