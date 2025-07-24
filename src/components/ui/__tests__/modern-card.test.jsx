import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '../modern-card';

describe('ModernCard Components', () => {
  describe('Card Component', () => {
    it('renders default variant correctly', () => {
      render(
        <Card data-testid="card" data-testclass="default-card">
          Test Content
        </Card>
      );
      const card = screen.getByTestId('card');
      expect(card).toBeInTheDocument();
      expect(card).toHaveTextContent('Test Content');
      expect(card).toHaveClass('rounded-lg', 'border', 'shadow-sm');
    });

    it('applies chart variant styling', () => {
      render(
        <Card variant="chart" data-testid="chart-card" data-testclass="chart-card">
          Chart Content
        </Card>
      );
      const card = screen.getByTestId('chart-card');
      expect(card).toHaveClass('bg-[var(--color-primary-100)]');
      expect(card).toHaveClass('border-[var(--color-tertiary-400)]');
    });

    it('applies summary variant styling', () => {
      render(
        <Card variant="summary" data-testid="summary-card" data-testclass="summary-card">
          Summary Content
        </Card>
      );
      const card = screen.getByTestId('summary-card');
      expect(card).toHaveClass('bg-[var(--color-primary-200)]');
      expect(card).toHaveClass('border-[var(--color-tertiary-500)]');
    });

    it('applies form variant styling', () => {
      render(
        <Card variant="form" data-testid="form-card" data-testclass="form-card">
          Form Content
        </Card>
      );
      const card = screen.getByTestId('form-card');
      expect(card).toHaveClass('bg-card');
      expect(card).toHaveClass('border-[var(--color-tertiary-600)]');
    });

    it('merges custom className with variant classes', () => {
      render(
        <Card className="custom-class" data-testid="custom-card" data-testclass="custom-card">
          Custom Content
        </Card>
      );
      const card = screen.getByTestId('custom-card');
      expect(card).toHaveClass('custom-class');
    });
  });

  describe('CardHeader Component', () => {
    it('renders with correct styling', () => {
      render(
        <Card data-testid="card">
          <CardHeader data-testid="header">Header Content</CardHeader>
        </Card>
      );
      const header = screen.getByTestId('header');
      expect(header).toHaveClass('flex', 'flex-col', 'space-y-1.5', 'p-6');
    });
  });

  describe('CardTitle Component', () => {
    it('renders with correct styling and color', () => {
      render(
        <Card data-testid="card">
          <CardTitle data-testid="title">Test Title</CardTitle>
        </Card>
      );
      const title = screen.getByTestId('title');
      expect(title).toBeInTheDocument();
      expect(title).toHaveClass('text-2xl', 'font-semibold', 'text-[var(--color-secondary-900)]');
      expect(title.tagName).toBe('H3');
    });
  });

  describe('CardDescription Component', () => {
    it('renders with correct styling and color', () => {
      render(
        <Card data-testid="card">
          <CardDescription data-testid="description">Test Description</CardDescription>
        </Card>
      );
      const description = screen.getByTestId('description');
      expect(description).toBeInTheDocument();
      expect(description).toHaveClass('text-sm', 'text-[var(--color-secondary-800)]');
    });
  });

  describe('CardContent Component', () => {
    it('renders with correct styling', () => {
      render(
        <Card data-testid="card">
          <CardContent data-testid="content">Content</CardContent>
        </Card>
      );
      const content = screen.getByTestId('content');
      expect(content).toHaveClass('p-6', 'pt-0');
    });
  });

  describe('CardFooter Component', () => {
    it('renders with correct styling', () => {
      render(
        <Card data-testid="card">
          <CardFooter data-testid="footer">Footer</CardFooter>
        </Card>
      );
      const footer = screen.getByTestId('footer');
      expect(footer).toHaveClass('flex', 'items-center', 'p-6', 'pt-0');
    });
  });

  describe('Card Composition', () => {
    it('renders complete card structure correctly', () => {
      render(
        <Card data-testid="card">
          <CardHeader>
            <CardTitle>Card Title</CardTitle>
            <CardDescription>Card description</CardDescription>
          </CardHeader>
          <CardContent>
            <p>Card content goes here</p>
          </CardContent>
          <CardFooter>
            <p>Footer content</p>
          </CardFooter>
        </Card>
      );
      
      expect(screen.getByText('Card Title')).toBeInTheDocument();
      expect(screen.getByText('Card description')).toBeInTheDocument();
      expect(screen.getByText('Card content goes here')).toBeInTheDocument();
      expect(screen.getByText('Footer content')).toBeInTheDocument();
    });
  });
});