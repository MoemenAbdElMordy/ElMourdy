// @vitest-environment jsdom
import '@testing-library/jest-dom/vitest';
import { afterEach, expect, it, vi } from 'vitest';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { useState } from 'react';
import { arabicLabel, arabicNumber } from './arabic';
import { Card2 } from './ui';
import { StudentWorkspace, ManagementWorkspace } from '../features/dashboard/workspace-views';
import type { StudentDashboardData, ManagementDashboardData } from './dashboard/api';
afterEach(cleanup);
it('formats display numbers and known labels without changing email addresses',()=>{
  expect(arabicNumber('2026 / 92%')).toBe('٢٠٢٦ / ٩٢٪');
  expect(arabicLabel('First Secondary')).toBe('الصف الأول الثانوي');
  expect(arabicLabel('published')).toBe('منشور');
  expect(arabicLabel('student12@example.com')).toBe('student12@example.com');
});
it('keeps input focus and submitted values intact while localizing card text',()=>{
  function Form(){const [value,setValue]=useState('');return <Card2><span>24</span><input aria-label="الاسم" value={value} onChange={e=>setValue(e.target.value)}/></Card2>}
  render(<Form/>);const input=screen.getByLabelText('الاسم');input.focus();fireEvent.change(input,{target:{value:'abc123'}});expect(input).toHaveFocus();expect(input).toHaveValue('abc123');expect(screen.getByText('٢٤')).toBeInTheDocument();
});
const student:StudentDashboardData={role:'student',enrollment:null,statistics:{total_lectures:0,completed_lectures:0,highest_score:null,subjects_count:0,attempts_remaining:0,active_access_grants:0},subjects:[],continue_watching:null,announcements:[]};
it('uses real student routes and handles empty learning data',()=>{
  const nav=vi.fn();const {container}=render(<StudentWorkspace data={student} nav={nav}/>);
  fireEvent.click(screen.getByRole('button',{name:'افتح واجباتي'}));expect(nav).toHaveBeenLastCalledWith('homeworks');
  fireEvent.click(screen.getByRole('button',{name:'تفعيل محاضرة'}));expect(nav).toHaveBeenLastCalledWith('activation');
  expect(container.textContent).not.toMatch(/[A-Za-z0-9]/);expect(container.textContent).not.toContain('NaN');
});
it('translates management states and does not add privileged assistant shortcuts',()=>{
  const data:ManagementDashboardData={role:'assistant',statistics:{total_students:0,active_students:0,inactive_students:0,risk_students:0,pending_support_requests:0,ready_videos:0,processing_videos:0,failed_videos:0,queued_jobs:0,failed_jobs:0,queue_workers:0,draft_content:1},top_students:[],most_watched:[],recent_content:[{id:1,title:'محاضرة',status:'draft',updated_at:'2026-09-01'}]};
  const{container}=render(<ManagementWorkspace data={data} role="assistant" nav={vi.fn()}/>);expect(screen.getByText('مسودة')).toBeInTheDocument();expect(container.textContent).not.toMatch(/[A-Za-z0-9]/);expect(screen.queryByRole('button',{name:/حذف|نشر/})).not.toBeInTheDocument();
});
