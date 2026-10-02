import { ApiError } from '../api/client';
import { loadCurriculum } from '../curriculum/api';
import { loadAcademicYears, loadGrades, type AcademicYear, type Grade } from './day5';

export type AcademicYearChoice = Pick<AcademicYear, 'id' | 'name'> & { status?: AcademicYear['status'] };

/** Content editors must not require permission to administer academic years. */
export async function loadAcademicChoices(): Promise<{ academic_years: AcademicYearChoice[]; grades: Grade[] }> {
  try {
    return await loadAcademicYears();
  } catch (error) {
    if (!(error instanceof ApiError) || error.status !== 403) throw error;
    const [{ curriculum }, { grades }] = await Promise.all([loadCurriculum(), loadGrades()]);
    return { academic_years: curriculum.academic_year ? [curriculum.academic_year] : [], grades };
  }
}
