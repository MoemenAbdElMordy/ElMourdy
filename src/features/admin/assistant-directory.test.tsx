// @vitest-environment jsdom
import '@testing-library/jest-dom/vitest';
import { afterEach, expect, it, vi } from 'vitest';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { AssistantDirectory } from './assistant-directory';
import type { AssistantRecord } from '../../shared/admin/day5';
afterEach(cleanup);
const assistant:AssistantRecord={id:9,name:'مساعد توضيحي',phone:'01012345678',email:'sample@example.com',status:'active',permissions:['manage_content'],created_at:'2026-09-01'};
it('preserves the chosen record for editing and archiving',()=>{const edit=vi.fn(),archive=vi.fn();render(<AssistantDirectory assistants={[assistant]} labels={{manage_content:'إدارة المحتوى'}} onEdit={edit} onArchive={archive}/>);fireEvent.click(screen.getByRole('button',{name:'تعديل الحساب والصلاحيات'}));expect(edit).toHaveBeenCalledWith(assistant);fireEvent.click(screen.getByRole('button',{name:'أرشفة'}));expect(archive).toHaveBeenCalledWith(assistant);expect(screen.getByText('sample@example.com')).toBeInTheDocument();expect(screen.getByText('إدارة المحتوى')).toBeInTheDocument();});
it('does not offer archiving an already archived assistant',()=>{render(<AssistantDirectory assistants={[{...assistant,status:'archived'}]} labels={{}} onEdit={vi.fn()} onArchive={vi.fn()}/>);expect(screen.queryByRole('button',{name:'أرشفة'})).not.toBeInTheDocument();});
