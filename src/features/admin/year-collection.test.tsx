// @vitest-environment jsdom
import '@testing-library/jest-dom/vitest';
import { afterEach, expect, it, vi } from 'vitest';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { YearCollection, YearGradeCollection } from './year-collection';
import type { AcademicYear } from '../../shared/admin/day5';
afterEach(cleanup);
const year:AcademicYear={id:12,name:'2026/2027',starts_on:'2026-09-01',ends_on:'2027-07-01',status:'active',students_count:20,grades:[{id:31,name:'Second Secondary',level:2,students_count:20,branches_count:3,lessons_count:8,lectures_count:15}]};
it('separates opening a year from its management actions',()=>{
 const select=vi.fn(),archive=vi.fn();const {container}=render(<YearCollection years={[year]} onSelect={select} actions={()=><button onClick={archive}>أرشفة</button>}/>);
 fireEvent.click(screen.getByRole('button',{name:'أرشفة'}));expect(archive).toHaveBeenCalledTimes(1);expect(select).not.toHaveBeenCalled();
 fireEvent.click(screen.getByRole('button',{name:/استعرض الصفوف/}));expect(select).toHaveBeenCalledWith(12);expect(container.textContent).not.toMatch(/[A-Za-z0-9]/);
});
it('keeps the selected year and grade in both navigation routes',()=>{
 const nav=vi.fn();const {container}=render(<YearGradeCollection year={year} onNavigate={nav}/>);
 fireEvent.click(screen.getByRole('button',{name:'عرض التقرير'}));expect(nav).toHaveBeenLastCalledWith('management-reports',{yearId:12,gradeId:31});
 fireEvent.click(screen.getByRole('button',{name:'إدارة المحتوى'}));expect(nav).toHaveBeenLastCalledWith('content-subjects',{yearId:12,gradeId:31});expect(container.textContent).not.toMatch(/[A-Za-z0-9]/);
});
it('shows an honest empty state',()=>{render(<YearCollection years={[]} onSelect={vi.fn()}/>);expect(screen.getByText('لا توجد سنوات دراسية لعرضها بعد.')).toBeInTheDocument();expect(screen.queryByRole('button')).not.toBeInTheDocument();});
