// @vitest-environment jsdom
import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import { afterEach, expect, it, vi } from 'vitest';
import { PaginationControls } from './index';

afterEach(cleanup);
it('renders Arabic numbers while passing numeric page identifiers', () => {
  const change = vi.fn();
  render(<PaginationControls pagination={{current_page:1, per_page:20, total_count:258, total_pages:13, next_page:2, previous_page:null}} onPageChange={change}/>);
  expect(screen.getByText('عرض صفحة ١ من ١٣ — إجمالي ٢٥٨')).toBeTruthy();
  expect((screen.getByRole('button', {name:'السابق'}) as HTMLButtonElement).disabled).toBe(true);
  fireEvent.click(screen.getByRole('button', {name:'التالي'}));
  expect(change).toHaveBeenCalledWith(2);
});
