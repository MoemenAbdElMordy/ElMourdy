// @vitest-environment jsdom
import '@testing-library/jest-dom/vitest';
import { afterEach, expect, it, vi } from 'vitest';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { StorageLibrary } from './storage-library';
import type { VideoAsset } from '../../shared/videos/api';
afterEach(cleanup);
const videos:VideoAsset[]=[{id:1,lecture_id:1,lecture_title:'النحو',processing_status:'ready',storage_size_bytes:1024,used_by_lectures_count:2},{id:2,lecture_id:2,lecture_title:'البلاغة',processing_status:'failed',storage_size_bytes:4096}];
it('filters without deleting records and preserves the selected asset',()=>{const remove=vi.fn();render(<StorageLibrary videos={videos} busy={false} onDelete={remove}/>);fireEvent.change(screen.getByLabelText('البحث'),{target:{value:'النحو'}});expect(screen.queryByText('البلاغة')).not.toBeInTheDocument();expect(remove).not.toHaveBeenCalled();fireEvent.click(screen.getByRole('button',{name:'حذف نهائي'}));expect(remove).toHaveBeenCalledWith(videos[0]);});
it('disables every deletion while a request is pending',()=>{render(<StorageLibrary videos={videos} busy onDelete={vi.fn()}/>);for(const button of screen.getAllByRole('button',{name:'حذف نهائي'}))expect(button).toBeDisabled();});
it('sorts a copy by size without mutating the supplied records',()=>{const {container}=render(<StorageLibrary videos={videos} busy={false} onDelete={vi.fn()}/>);fireEvent.change(screen.getByLabelText('الترتيب'),{target:{value:'size'}});expect(container.querySelector('article h3')).toHaveTextContent('البلاغة');expect(videos[0].id).toBe(1);});
