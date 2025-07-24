import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { Button, LoadingButton, IconButton } from '../modern-button';
import { User, Lock } from 'lucide-react';

describe('ModernButton Components', () => {
  describe('Button Component', () => {
    it('renders default button correctly', () => {
      render(
        <Button data-testid="default-button">Click me</Button>
      );
      const button = screen.getByTestId('default-button');
      expect(button).toBeInTheDocument();
      expect(button).toHaveTextContent('Click me');
    });

    it('applies default variant styling', () => {
      render(
        <Button data-testid="default-variant">Default</Button>
      );
      const button = screen.getByTestId('default-variant');
      expect(button).toHaveClass('bg-[var(--color-tertiary-500)]');
      expect(button).toHaveClass('text-white');
    });

    it('applies destructive variant styling', () => {
      render(
        <Button variant="destructive" data-testid="destructive-button">Delete</Button>
      );
      const button = screen.getByTestId('destructive-button');
      expect(button).toHaveClass('bg-red-500');
      expect(button).toHaveClass('text-white');
    });

    it('applies outline variant styling', () => {
      render(
        <Button variant="outline" data-testid="outline-button">Outline</Button>
      );
      const button = screen.getByTestId('outline-button');
      expect(button).toHaveClass('border-[var(--color-primary-100)]');
      expect(button).toHaveClass('hover:bg-[var(--color-primary-50)]');
    });

    it('applies secondary variant styling', () => {
      render(
        <Button variant="secondary" data-testid="secondary-button">Secondary</Button>
      );
      const button = screen.getByTestId('secondary-button');
      expect(button).toHaveClass('bg-[var(--color-primary-100)]');
      expect(button).toHaveClass('text-[var(--color-secondary-900)]');
    });

    it('applies ghost variant styling', () => {
      render(
        <Button variant="ghost" data-testid="ghost-button">Ghost</Button>
      );
      const button = screen.getByTestId('ghost-button');
      expect(button).toHaveClass('hover:bg-[var(--color-primary-100)]');
    });

    it('applies link variant styling', () => {
      render(
        <Button variant="link" data-testid="link-button">Link</Button>
      );
      const button = screen.getByTestId('link-button');
      expect(button).toHaveClass('text-[var(--color-tertiary-500)]');
      expect(button).toHaveClass('hover:underline');
    });

    it('applies size variants correctly', () => {
      const { rerender } = render(<Button size="sm" data-testid="size-button">Small</Button>);
      let button = screen.getByTestId('size-button');
      expect(button).toHaveClass('h-9', 'px-3');

      rerender(<Button size="lg" data-testid="size-button">Large</Button>);
      button = screen.getByTestId('size-button');
      expect(button).toHaveClass('h-11', 'px-8');

      rerender(<Button size="icon" data-testid="size-button">Icon</Button>);
      button = screen.getByTestId('size-button');
      expect(button).toHaveClass('h-10', 'w-10');
    });

    it('handles loading state correctly', () => {
      render(
        <Button loading data-testid="loading-button">Loading...</Button>
      );
      const button = screen.getByTestId('loading-button');
      expect(button).toBeDisabled();
      expect(screen.getByRole('img', { hidden: true })).toBeInTheDocument();
    });

    it('handles disabled state correctly', () => {
      render(
        <Button disabled data-testid="disabled-button">Disabled</Button>
      );
      const button = screen.getByTestId('disabled-button');
      expect(button).toBeDisabled();
    });

    it('handles click events', () => {
      const handleClick = jest.fn();
      render(
        <Button onClick={handleClick} data-testid="click-button">Click me</Button>
      );
      const button = screen.getByTestId('click-button');
      fireEvent.click(button);
      expect(handleClick).toHaveBeenCalledTimes(1);
    });

    it('does not trigger click when loading', () => {
      const handleClick = jest.fn();
      render(
        <Button loading onClick={handleClick} data-testid="loading-click-button">
          Click me
        </Button>
      );
      const button = screen.getByTestId('loading-click-button');
      fireEvent.click(button);
      expect(handleClick).not.toHaveBeenCalled();
    });

    it('handles ref forwarding', () => {
      const ref = React.createRef();
      render(
        <Button ref={ref} data-testid="ref-button">Ref button</Button>
      );
      expect(ref.current).toBeInstanceOf(HTMLButtonElement);
    });
  });

  describe('LoadingButton Component', () => {
    it('renders normally when not loading', () => {
      render(
        <LoadingButton loading={false} data-testid="loading-button-normal">
          Normal Text
        </LoadingButton>
      );
      const button = screen.getByTestId('loading-button-normal');
      expect(button).toHaveTextContent('Normal Text');
    });

    it('shows loading text when loading', () => {
      render(
        <LoadingButton loading loadingText="Loading..." data-testid="loading-button">
          Normal Text
        </LoadingButton>
      );
      const button = screen.getByTestId('loading-button');
      expect(button).toHaveTextContent('Loading...');
    });

    it('falls back to children when no loadingText provided', () => {
      render(
        <LoadingButton loading data-testid="loading-button-fallback">
          Normal Text
        </LoadingButton>
      );
      const button = screen.getByTestId('loading-button-fallback');
      expect(button).toHaveTextContent('Normal Text');
    });
  });

  describe('IconButton Component', () => {
    it('renders with left icon by default', () => {
      render(
        <IconButton icon={<User data-testid="user-icon" />} data-testid="icon-button">
          User Profile
        </IconButton>
      );
      const button = screen.getByTestId('icon-button');
      const icon = screen.getByTestId('user-icon');
      expect(button).toContainElement(icon);
    });

    it('renders with right icon when specified', () => {
      render(
        <IconButton 
          icon={<Lock data-testid="lock-icon" />} 
          iconPosition="right"
          data-testid="icon-button-right"
        >
          Secure
        </IconButton>
      );
      const button = screen.getByTestId('icon-button-right');
      const icon = screen.getByTestId('lock-icon');
      expect(button).toContainElement(icon);
    });

    it('passes through all button props', () => {
      const handleClick = jest.fn();
      render(
        <IconButton 
          icon={<User />}
          onClick={handleClick}
          variant="secondary"
          size="lg"
          data-testid="icon-button-props"
        >
          Click me
        </IconButton>
      );
      const button = screen.getByTestId('icon-button-props');
      fireEvent.click(button);
      expect(handleClick).toHaveBeenCalledTimes(1);
      expect(button).toHaveClass('bg-[var(--color-primary-100)]', 'h-11');
    });
  });

  describe('Integration Tests', () => {
    it('combines loading and icon states correctly', () => {
      render(
        <IconButton 
          icon={<User data-testid="user-icon" />}
          loading
          data-testid="loading-icon-button"
        >
          Loading User
        </IconButton>
      );
      
      const button = screen.getByTestId('loading-icon-button');
      expect(button).toBeDisabled();
      expect(screen.getByRole('img', { hidden: true })).toBeInTheDocument();
      expect(screen.queryByTestId('user-icon')).not.toBeInTheDocument();
    });

    it('handles custom className with variants', () => {
      render(
        <Button 
          variant="outline" 
          size="sm" 
          className="custom-class"
          data-testid="custom-button"
        >
          Custom Button
        </Button>
      );
      const button = screen.getByTestId('custom-button');
      expect(button).toHaveClass('custom-class');
      expect(button).toHaveClass('border-[var(--color-primary-100)]');
      expect(button).toHaveClass('h-9');
    });
  });
});