import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { EmptyState, ChartEmptyState, TableEmptyState, ErrorEmptyState } from '../EmptyState';
import { BarChart3, FileText, AlertCircle } from 'lucide-react';

describe('EmptyState Component', () => {
  test('renders with default props', () => {
    render(<EmptyState />);
    
    expect(screen.getByText('No Data Available')).toBeInTheDocument();
    expect(screen.getByText('There is no data to display at this time.')).toBeInTheDocument();
  });

  test('renders with custom title and description', () => {
    render(
      <EmptyState 
        title="Custom Title" 
        description="Custom description" 
      />
    );
    
    expect(screen.getByText('Custom Title')).toBeInTheDocument();
    expect(screen.getByText('Custom description')).toBeInTheDocument();
  });

  test('renders with custom icon', () => {
    render(
      <EmptyState icon={AlertCircle} />
    );
    
    expect(screen.getByRole('img')).toBeInTheDocument();
  });

  test('renders with action button', () => {
    render(
      <EmptyState action={<button>Reload</button>} />
    );
    
    expect(screen.getByRole('button')).toBeInTheDocument();
  });

  test('ChartEmptyState renders correctly', () => {
    render(<ChartEmptyState />);
    
    expect(screen.getByText('No Chart Data')).toBeInTheDocument();
  });

  test('TableEmptyState renders correctly', () => {
    render(<TableEmptyState />);
    
    expect(screen.getByText('No Records Found')).toBeInTheDocument();
  });

  test('ErrorEmptyState renders correctly', () => {
    render(<ErrorEmptyState />);
    
    expect(screen.getByText('Error Loading Data')).toBeInTheDocument();
  });
});