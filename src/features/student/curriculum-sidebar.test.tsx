// @vitest-environment jsdom
import '@testing-library/jest-dom/vitest';
import { afterEach, expect, it, vi } from 'vitest';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { CurriculumSidebar } from './connected-video-page';
import type { Branch } from '../../shared/curriculum/api';
afterEach(cleanup);
const branch:Branch={id:1,title:'النحو',position:1,status:'published',chapters:[{id:2,title:'المشتقات',position:1,status:'published',lessons:[{id:3,title:'اسم الفاعل',position:1,status:'published',is_free:false,lectures:[{id:4,title:'محاضرة جاهزة',position:1,status:'published',is_free:false,has_access:true,video_asset:{id:10,processing_status:'ready'}},{id:5,title:'محاضرة مغلقة',position:2,status:'published',is_free:false,has_access:false,video_asset:{id:11,processing_status:'ready'}}]}]}]};
it('preserves locked content and identifies the current lecture',()=>{const open=vi.fn();render(<CurriculumSidebar branch={branch} currentLectureId={4} openChapters={new Set([2])} onToggleChapter={vi.fn()} onOpenLecture={open} watchProgress={20}/>);const locked=screen.getByRole('button',{name:/محاضرة مغلقة/});expect(locked).toBeDisabled();fireEvent.click(locked);expect(open).not.toHaveBeenCalled();const ready=screen.getByRole('button',{name:/محاضرة جاهزة/});expect(ready).toHaveAttribute('aria-current','true');fireEvent.click(ready);expect(open.mock.calls[0][0].lecture.id).toBe(4);});
it('exposes chapter expansion without navigating',()=>{const toggle=vi.fn();render(<CurriculumSidebar branch={branch} currentLectureId={4} openChapters={new Set()} onToggleChapter={toggle} onOpenLecture={vi.fn()} watchProgress={0}/>);const button=screen.getByRole('button',{name:/المشتقات/});expect(button).toHaveAttribute('aria-expanded','false');fireEvent.click(button);expect(toggle).toHaveBeenCalledWith(2);expect(screen.queryByRole('button',{name:/محاضرة جاهزة/})).not.toBeInTheDocument();});
