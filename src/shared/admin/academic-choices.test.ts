import { beforeEach, expect, it, vi } from 'vitest';
import { ApiError } from '../api/client';
import { loadCurriculum } from '../curriculum/api';
import { loadAcademicYears, loadGrades } from './day5';
import { loadAcademicChoices } from './academic-choices';
vi.mock('./day5', () => ({ loadAcademicYears: vi.fn(), loadGrades: vi.fn() }));
vi.mock('../curriculum/api', () => ({ loadCurriculum: vi.fn() }));
beforeEach(() => vi.resetAllMocks());
it('uses full authorized year choices when available', async () => {
  const result = { academic_years: [], grades: [] };
  vi.mocked(loadAcademicYears).mockResolvedValue(result);
  expect(await loadAcademicChoices()).toEqual(result);
  expect(loadCurriculum).not.toHaveBeenCalled();
});
it('uses the authorized current curriculum for a content assistant', async () => {
  vi.mocked(loadAcademicYears).mockRejectedValue(new ApiError('Forbidden', 403, 'forbidden'));
  vi.mocked(loadCurriculum).mockResolvedValue({ curriculum: { academic_year: { id: 2, name: '2026/2027' }, grade: null, branches: [] } });
  vi.mocked(loadGrades).mockResolvedValue({ grades: [{ id: 3, level: 1, name: 'الأول' }] });
  expect(await loadAcademicChoices()).toEqual({ academic_years: [{ id: 2, name: '2026/2027' }], grades: [{ id: 3, level: 1, name: 'الأول' }] });
});
it('does not mask server failures or bypass curriculum permissions', async () => {
  const failure = new ApiError('Failure', 500);
  vi.mocked(loadAcademicYears).mockRejectedValue(failure);
  await expect(loadAcademicChoices()).rejects.toBe(failure);
  expect(loadCurriculum).not.toHaveBeenCalled();
  vi.mocked(loadAcademicYears).mockRejectedValue(new ApiError('Forbidden', 403));
  vi.mocked(loadCurriculum).mockRejectedValue(new ApiError('Forbidden', 403));
  vi.mocked(loadGrades).mockResolvedValue({ grades: [] });
  await expect(loadAcademicChoices()).rejects.toMatchObject({ status: 403 });
});
