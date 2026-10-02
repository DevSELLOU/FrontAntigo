export const generateYears = (startYear: number): string[] => {
  const currentYear = new Date().getFullYear();
  const years: string[] = [];
  for (let year = currentYear; year >= startYear; year--) {
    years.push(year.toString());
  }
  return years;
};

export const START_YEAR = 2025;

export const allMonths = [
  '01', '02', '03', '04', '05', '06',
  '07', '08', '09', '10', '11', '12',
];

export const toArray = (
  value: string | string[] | undefined,
): string[] => {
  if (Array.isArray(value)) return value;
  if (value) return [value];
  return [];
};

export interface ParsedReportSearchParams {
  selectedYears: string[];
  selectedMonths: string[];
  selectedThird: string[];
}

export const parseReportSearchParams = ({
  years,
  months,
  third,
}: {
  years?: string | string[];
  months?: string | string[];
  third?: string | string[];
}): ParsedReportSearchParams => {
  const selectedYears = toArray(years).length
    ? toArray(years)
    : [new Date().getFullYear().toString()];

  return {
    selectedYears,
    selectedMonths: toArray(months),
    selectedThird: toArray(third),
  };
};

export const buildReportQueryString = (
  years: string[],
  months: string[],
  thirdParamName?: string,
  third?: string[],
): string => {
  const queryParams = new URLSearchParams();

  years.forEach((year) => queryParams.append('years', year));
  months.forEach((month) => queryParams.append('months', month));

  if (thirdParamName && third) {
    third.forEach((value) => queryParams.append(thirdParamName, value));
  }

  return queryParams.toString();
};
