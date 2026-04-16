import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { SampleCard } from '../SampleCard';

describe('SampleCard', () => {
  test('renders basic card without optional props', () => {
    render(<SampleCard title="Test Title" description="Test Description" />);
    
    expect(screen.getByText('Test Title')).toBeInTheDocument();
    expect(screen.getByText('Test Description')).toBeInTheDocument();
    expect(screen.queryByLabelText('badge')).not.toBeInTheDocument();
  });

  test('renders badge when provided', () => {
    render(
      <SampleCard title="T" description="D" badge="NEW" />
    );

    const badge = screen.getByLabelText('badge');
    expect(badge).toBeInTheDocument();
    expect(badge).toHaveTextContent('NEW');
  });

  test('calls onClick when clicked', () => {
    const handle = jest.fn();
    render(
      <SampleCard title="Clickable" description="D" onClick={handle} />
    );

    const article = screen.getByLabelText('Clickable');
    fireEvent.click(article);
    expect(handle).toHaveBeenCalledTimes(1);
  });

  test('shows loading state when isLoading is true', () => {
    render(
      <SampleCard title="Should not show" description="D" isLoading />
    );

    expect(screen.getByText('Loading...')).toBeInTheDocument();
    expect(screen.queryByText('Should not show')).not.toBeInTheDocument();
  });

  test('shows error state when error is provided', () => {
    render(
      <SampleCard title="T" description="D" error="Something went wrong" />
    );

    expect(screen.getByRole('alert')).toHaveTextContent('Something went wrong');
    expect(screen.queryByText('T')).not.toBeInTheDocument();
  });

  test('triggers onClick on Enter key press', () => {
    const handle = jest.fn();
    render(<SampleCard title="Keyboard" description="D" onClick={handle} />);

    const article = screen.getByLabelText('Keyboard');
    fireEvent.keyDown(article, { key: 'Enter' });
    expect(handle).toHaveBeenCalledTimes(1);
  });

  test('triggers onClick on Space key press', () => {
    const handle = jest.fn();
    render(<SampleCard title="Keyboard" description="D" onClick={handle} />);

    const article = screen.getByLabelText('Keyboard');
    fireEvent.keyDown(article, { key: ' ' });
    expect(handle).toHaveBeenCalledTimes(1);
  });

  test('sets tabIndex when onClick is provided', () => {
    render(<SampleCard title="Tab" description="D" onClick={() => {}} />);

    const article = screen.getByLabelText('Tab');
    expect(article).toHaveAttribute('tabIndex', '0');
  });
});
