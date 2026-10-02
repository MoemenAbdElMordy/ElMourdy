// @vitest-environment jsdom
import '@testing-library/jest-dom/vitest';
import { afterEach, expect, it, vi } from 'vitest';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { SupportInbox, ResultsJournal } from './followup-views';
import type { SupportRequest } from '../../shared/learning/api';
afterEach(cleanup);
const pending:SupportRequest={id:3,request_type:'extra_exam_attempt',status:'pending',reason:'أحتاج فرصة للمراجعة',payload:{},requester:{id:8,name:'طالب توضيحي',role:'student'},created_at:'2026-09-01',actions:[]};
it('filters the current page without reviewing any request',()=>{const review=vi.fn();render(<SupportInbox items={[pending,{...pending,id:4,status:'approved',requester:{...pending.requester,name:'طلب مكتمل'}}]} onReview={review}/>);fireEvent.click(screen.getByRole('button',{name:/تحتاج مراجعة/}));expect(screen.queryByText('طلب مكتمل')).not.toBeInTheDocument();expect(review).not.toHaveBeenCalled();fireEvent.click(screen.getByRole('button',{name:'قبول الطلب'}));expect(review).toHaveBeenCalledWith(3,'approve');});
it('does not offer decisions for reviewed requests',()=>{render(<SupportInbox items={[{...pending,status:'rejected'}]} onReview={vi.fn()}/>);expect(screen.queryByRole('button',{name:'قبول الطلب'})).not.toBeInTheDocument();expect(screen.queryByRole('button',{name:'رفض الطلب'})).not.toBeInTheDocument();});
it('renders empty result history without fabricated results',()=>{render(<ResultsJournal attempts={[]} onOpen={vi.fn()}/>);expect(screen.getByText('النتائج هتظهر هنا بعد التسليم')).toBeInTheDocument();expect(screen.queryByRole('button')).not.toBeInTheDocument();});
