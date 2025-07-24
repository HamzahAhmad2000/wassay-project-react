import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import ChartCard from '../ChartCard';

describe('ChartCard Component', () => {
  test('renders with title and description', () => {
    render(
      <ChartCard title="Test Chart" description="This is a test description">
        <div>Chart content</div>
      </ChartCard>
    );
    
    expect(screen.getByText('Test Chart')).toBeInTheDocument();
    expect(screen.getByText('This is a test description')).toBeInTheDocument();
    expect(screen.getByText('Chart content')).toBeInTheDocument();
  });

  test('renders without title and description', () => {
    render(
      <ChartCard>
        <div>Chart content</div>
      </ChartCard>
    );
    
    expect(screen.queryByRole('heading')).not.toBeInTheDocument();
    expect(screen.getByText('Chart content')).toBeInTheDocument();
  });

  test('applies custom className', () => {
    const { container } = render(
      <ChartCard className="custom-class">
        <div>Chart content</div>
      </ChartCard>
    );
    
    expect(container.firstChild).toHaveClass('custom-class');
  });

  test('applies header and content classNames', () => {
    render(
      <ChartCard 
        title="Test" 
        headerClassName="custom-header"
        contentClassName="custom-content"
      >
        <div>Chart content</div>
      </ChartCard>
    );
    
    const header = screen.getByRole('heading').closest('div');
    const content = screen.getByText('Chart content');
    
    expect(header).toHaveClass('custom-header');
    expect(content).toHaveClass('custom-content');
  });
});