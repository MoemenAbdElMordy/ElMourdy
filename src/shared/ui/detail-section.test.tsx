// @vitest-environment jsdom
import '@testing-library/jest-dom/vitest';
import { afterEach, expect, it, vi } from 'vitest';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { useState } from 'react';
import { DetailSection } from './detail-section';
afterEach(cleanup);
it('preserves field values and focus while typing inside the dossier section',()=>{
 function Form(){const [value,setValue]=useState('');return <DetailSection title="البيانات" open><input aria-label="الاسم" value={value} onChange={e=>setValue(e.target.value)}/></DetailSection>}
 render(<Form/>);const input=screen.getByRole('textbox');input.focus();fireEvent.change(input,{target:{value:'اسم الطالب'}});expect(input).toHaveFocus();expect(input).toHaveValue('اسم الطالب');
});
it('does not trigger child actions when a section is toggled',()=>{const action=vi.fn();const {container}=render(<DetailSection title="الأجهزة"><button onClick={action}>إزالة</button></DetailSection>);fireEvent.click(container.querySelector('summary')!);expect(action).not.toHaveBeenCalled();});
