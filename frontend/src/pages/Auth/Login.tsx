import { useState, type FC, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../../hooks/useAuth';
import LoginTemplate from '../../components/templates/LoginTemplate';
import { getRoleDashboardPath } from '../../utils/role';

export const Login: FC = () => {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [data, setDataState] = useState<{
    login: string;
    password: string;
    remember: boolean;
    [key: string]: unknown;
  }>({
    login: '',
    password: '',
    remember: false,
  });

  const [processing, setProcessing] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const setData = (fieldOrObj: any, value?: any) => {
    if (typeof fieldOrObj === 'string') {
      setDataState((prev) => ({ ...prev, [fieldOrObj]: value }));
    } else if (typeof fieldOrObj === 'object' && fieldOrObj !== null) {
      setDataState((prev) => ({ ...prev, ...fieldOrObj }));
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setProcessing(true);
    setErrors({});

    try {
      const res = await login(data.login, data.password, Boolean(data.remember));
      const targetPath = getRoleDashboardPath(
        res.role || res.user.role?.nama || res.user.Role?.nama
      );
      navigate(targetPath, { replace: true });
    } catch (err: unknown) {
      if (axios.isAxiosError(err) && err.response?.data) {
        const responseData = err.response.data as {
          message?: string;
          errors?: Record<string, string[] | string>;
        };
        const validationErrors: Record<string, string> = {};

        if (responseData.errors) {
          Object.entries(responseData.errors).forEach(([field, msg]) => {
            validationErrors[field] = Array.isArray(msg) ? msg[0] : String(msg);
          });
        } else if (responseData.message) {
          validationErrors.login = responseData.message;
        }

        setErrors(validationErrors);
      } else if (err instanceof Error) {
        setErrors({ login: err.message });
      } else {
        setErrors({ login: 'Gagal masuk. Periksa kembali username dan password Anda.' });
      }
    } finally {
      setProcessing(false);
    }
  };

  return (
    <LoginTemplate
      form={{
        data,
        setData,
        processing,
        errors,
      }}
      onSubmit={handleSubmit}
    />
  );
};

export default Login;
