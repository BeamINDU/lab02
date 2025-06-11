export const extractErrorMessage = (error: unknown): string => {
  if (error && typeof error === 'object' && 'response' in error) {
    const axiosError = error as any;
    return axiosError.response?.data?.detail?.error || 'Unexpected error occurred';
  }
  return error instanceof Error ? error.message : 'Unknown error';
};
