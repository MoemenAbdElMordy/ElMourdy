// @vitest-environment jsdom
import '@testing-library/jest-dom/vitest';
import { afterEach, expect, it, vi } from 'vitest';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { AssessmentIntro, AssessmentSheet, ResultHero } from './assessment-layout';
afterEach(cleanup);
it('navigates questions without changing the application route',()=>{
  render(<AssessmentSheet questions={[{id:7},{id:8}]} answered={{7:0}}><section id="question-8">السؤال الثاني</section></AssessmentSheet>);
  const target=document.getElementById('question-8')!;
  target.scrollIntoView=vi.fn(); const hash=window.location.hash;
  fireEvent.click(screen.getByRole('button',{name:'السؤال ٢'}));
  expect(window.location.hash).toBe(hash);expect(target).toHaveFocus();expect(target.scrollIntoView).toHaveBeenCalled();
  expect(screen.getByRole('progressbar')).toHaveAttribute('value','1');
});
it('starts the assessment only when requested and respects busy state',()=>{
  const begin=vi.fn();const {rerender}=render(<AssessmentIntro title="واجب النحو" homework duration={30} attempts={3} pass={60} busy={false} onBegin={begin}/>);
  fireEvent.click(screen.getByRole('button',{name:'ابدأ الواجب'}));expect(begin).toHaveBeenCalledTimes(1);
  rerender(<AssessmentIntro title="واجب النحو" homework duration={30} attempts={3} pass={60} busy onBegin={begin}/>);
  expect(screen.getByRole('button')).toBeDisabled();
});
it('shows an unavailable score without inventing a percentage',()=>{
  const {container}=render(<ResultHero percent={null} points={null} max={null} attempt={1} label="تم التسليم"/>);
  expect(container.textContent).not.toContain('NaN');expect(container.textContent).not.toMatch(/[A-Za-z0-9]/);expect(container.textContent).not.toContain('٠٪');
});
