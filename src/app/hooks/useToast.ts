import { toast } from 'react-toastify';

const useToast = () => {
  const toastSuccess = (message: string) => toast.success(message);
  const toastError = (message: string) => toast.error(message);
  const toastInfo = (message: string) => toast.info(message);
  const toastWarning = (message: string) => toast.warning(message);

  return { toastSuccess, toastError, toastInfo, toastWarning };
};

export default useToast;