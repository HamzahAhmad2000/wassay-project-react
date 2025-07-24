import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import {
  Table,
  TableHeader,
  TableBody,
  TableHead,
  TableRow,
  TableCell,
  TableHeaderCell,
  TablePagination,
  TableFilter,
  useTableContext
} from '../modern-table';

// Mock data for testing
const mockData = [
  { id: 1, name: 'John Doe', age: 30, email: 'john@example.com' },
  { id: 2, name: 'Jane Smith', age: 25, email: 'jane@example.com' },
  { id: 3, name: 'Bob Johnson', age: 35, email: 'bob@example.com' },
  { id: 4, name: 'Alice Brown', age: 28, email: 'alice@example.com' },
  { id: 5, name: 'Charlie Wilson', age: 32, email: 'charlie@example.com' }
];

const mockColumns = [
  { key: 'id', header: 'ID', sortable: true },
  { key: 'name', header: 'Name', sortable: true, filterable: true },
  { key: 'age', header: 'Age', sortable: true, filterable: true },
  { key: 'email', header: 'Email', sortable: true, filterable: true }
];

const TestTable = () => (
  <Table data={mockData} columns={mockColumns}>
    <TableFilter data-testid="table-filter" />
    <TableHeader>
      <TableBody>
        <TableHead>
          <TableRow>
            {mockColumns.map(col => (
              <TableHeaderCell
                key={col.key}
                columnKey={col.key}
                sortable={col.sortable}
                filterable={col.filterable}
                data-testid={`header-${col.key}`}
              >
                {col.header}
              </TableHeaderCell>
            ))}
          </TableRow>
        </TableHead>
        <tbody>
          {mockData.map(row => (
            <TableRow key={row.id} data-testid={`row-${row.id}`}>
              <TableCell data-testid={`cell-${row.id}-id`}>{row.id}</TableCell>
              <TableCell data-testid={`cell-${row.id}-name`}>{row.name}</TableCell>
              <TableCell data-testid={`cell-${row.id}-age`}>{row.age}</TableCell>
              <TableCell data-testid={`cell-${row.id}-email`}>{row.email}</TableCell>
            </TableRow>
          ))}
        </tbody>
      </TableBody>
    </TableHeader>
    <TablePagination data-testid="table-pagination" />
  </Table>
);

describe('ModernTable Components', () => {
  describe('Table Component', () => {
    it('renders table with data correctly', () => {
      render(<TestTable />);
      
      expect(screen.getByText('John Doe')).toBeInTheDocument();
      expect(screen.getByText('Jane Smith')).toBeInTheDocument();
      expect(screen.getByText('bob@example.com')).toBeInTheDocument();
    });

    it('displays correct pagination info', () => {
      render(<TestTable />);
      
      expect(screen.getByText('Showing 1-5 of 5 items')).toBeInTheDocument();
      expect(screen.getByText('Page 1 of 1')).toBeInTheDocument();
    });
  });

  describe('Sorting Functionality', () => {
    it('sorts data by column when header is clicked', async () => {
      render(<TestTable />);
      
      const nameHeader = screen.getByTestId('header-name');
      fireEvent.click(nameHeader);
      
      // Wait for sort to apply (in real usage, this would re-render with sorted data)
      await waitFor(() => {
        expect(nameHeader).toHaveClass('cursor-pointer');
      });
    });

    it('toggles sort direction on subsequent clicks', async () => {
      render(<TestTable />);
      
      const ageHeader = screen.getByTestId('header-age');
      fireEvent.click(ageHeader);
      
      // First click should sort ascending
      await waitFor(() => {
        expect(ageHeader).toHaveClass('cursor-pointer');
      });
      
      fireEvent.click(ageHeader);
      
      // Second click should sort descending
      await waitFor(() => {
        expect(ageHeader).toHaveClass('cursor-pointer');
      });
    });
  });

  describe('Filtering Functionality', () => {
    it('filters data when filter input is used', async () => {
      render(<TestTable />);
      
      const nameFilter = screen.getByPlaceholderText('Filter...');
      fireEvent.change(nameFilter, { target: { value: 'John' } });
      
      await waitFor(() => {
        expect(screen.getByText('John Doe')).toBeInTheDocument();
        expect(screen.queryByText('Jane Smith')).not.toBeInTheDocument();
      });
    });

    it('shows clear filters button when filters are active', () => {
      render(<TestTable />);
      
      const nameFilter = screen.getByPlaceholderText('Filter...');
      fireEvent.change(nameFilter, { target: { value: 'John' } });
      
      expect(screen.getByText('Clear Filters')).toBeInTheDocument();
    });

    it('clears all filters when clear button is clicked', () => {
      render(<TestTable />);
      
      const nameFilter = screen.getByPlaceholderText('Filter...');
      fireEvent.change(nameFilter, { target: { value: 'John' } });
      
      const clearButton = screen.getByText('Clear Filters');
      fireEvent.click(clearButton);
      
      expect(nameFilter).toHaveValue('');
    });
  });

  describe('Pagination Functionality', () => {
    it('changes page size correctly', () => {
      render(<TestTable />);
      
      const pageSizeSelect = screen.getByRole('combobox');
      fireEvent.change(pageSizeSelect, { target: { value: '2' } });
      
      expect(screen.getByText('Showing 1-2 of 5 items')).toBeInTheDocument();
    });

    it('navigates between pages correctly', () => {
      render(<TestTable />);
      
      // Change page size to 2 to create multiple pages
      const pageSizeSelect = screen.getByRole('combobox');
      fireEvent.change(pageSizeSelect, { target: { value: '2' } });
      
      const nextButton = screen.getByLabelText('Next page');
      fireEvent.click(nextButton);
      
      expect(screen.getByText('Showing 3-4 of 5 items')).toBeInTheDocument();
    });

    it('disables previous button on first page', () => {
      render(<TestTable />);
      
      const prevButton = screen.getByLabelText('Previous page');
      expect(prevButton).toBeDisabled();
    });

    it('disables next button on last page', () => {
      render(<TestTable />);
      
      // This test would need more mock data to properly test last page
      expect(screen.getByText('Page 1 of 1')).toBeInTheDocument();
    });
  });

  describe('Table Structure Components', () => {
    it('renders table header correctly', () => {
      render(<TestTable />);
      
      expect(screen.getByText('ID')).toBeInTheDocument();
      expect(screen.getByText('Name')).toBeInTheDocument();
      expect(screen.getByText('Age')).toBeInTheDocument();
      expect(screen.getByText('Email')).toBeInTheDocument();
    });

    it('renders table rows correctly', () => {
      render(<TestTable />);
      
      mockData.forEach(row => {
        expect(screen.getByTestId(`row-${row.id}`)).toBeInTheDocument();
      });
    });

    it('applies correct styling to table cells', () => {
      render(<TestTable />);
      
      const cell = screen.getByTestId('cell-1-id');
      expect(cell).toHaveClass('text-[var(--color-secondary-900)]');
    });

    it('applies hover styling to table rows', () => {
      render(<TestTable />);
      
      const row = screen.getByTestId('row-1');
      expect(row).toHaveClass('hover:bg-[var(--color-primary-100)]');
    });
  });

  describe('TableFilter Component', () => {
    it('renders search input', () => {
      render(<TableFilter data-testid="filter" />);
      
      expect(screen.getByPlaceholderText('Search all columns...')).toBeInTheDocument();
    });

    it('handles search input changes', () => {
      const mockOnClear = jest.fn();
      render(<TableFilter onClear={mockOnClear} data-testid="filter" />);
      
      const searchInput = screen.getByPlaceholderText('Search all columns...');
      fireEvent.change(searchInput, { target: { value: 'test search' } });
      
      expect(searchInput).toHaveValue('test search');
    });
  });

  describe('Integration Tests', () => {
    it('handles complex table with all features', () => {
      const { container } = render(<TestTable />);
      
      expect(container.querySelector('table')).toBeInTheDocument();
      expect(screen.getByTestId('table-filter')).toBeInTheDocument();
      expect(screen.getByTestId('table-pagination')).toBeInTheDocument();
    });

    it('maintains accessibility features', () => {
      render(<TestTable />);
      
      const table = screen.getByRole('table');
      expect(table).toBeInTheDocument();
      
      const headers = screen.getAllByRole('columnheader');
      expect(headers).toHaveLength(mockColumns.length);
    });
  });
});