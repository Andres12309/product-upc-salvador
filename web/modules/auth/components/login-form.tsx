'use client';

import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Paper from '@mui/material/Paper';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { fieldShrink } from '@/modules/shared/utils/field-shrink';
import { currentUser, login } from '../services/api';
import { clearToken, saveToken } from '../utils/token';
import type { SessionUser } from '../types';

type LoginValues = {
  username: string;
  password: string;
};

const required = 'Indica el usuario y la contraseña.';

export function LoginForm({ onSuccess }: { onSuccess: (user: SessionUser) => void }) {
  const [error, setError] = useState('');
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<LoginValues>({ defaultValues: { username: '', password: '' } });
  const values = watch();

  async function onSubmit(values: LoginValues) {
    setError('');
    try {
      const token = await login(values.username.trim(), values.password);
      saveToken(token);
      const session = await currentUser();
      if (!session) {
        clearToken();
        setError('La sesión no quedó activa.');
        return;
      }
      onSuccess(session);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'No se pudo iniciar sesión');
    }
  }

  return (
    <Box sx={{ display: 'flex', minHeight: '100%', alignItems: 'center', justifyContent: 'center', p: 3 }}>
      <Paper sx={{ width: '100%', maxWidth: 420, p: 4 }}>
        <Typography variant="overline" color="text.secondary">
          Catálogo de productos
        </Typography>
        <Typography variant="h4" sx={{ mt: 1, mb: 3 }}>
          Iniciar sesión
        </Typography>
        <Box component="form" onSubmit={handleSubmit(onSubmit)} sx={{ display: 'grid', gap: 2 }}>
          <TextField
            label="Usuario"
            autoComplete="username"
            error={Boolean(errors.username)}
            helperText={errors.username?.message}
            slotProps={fieldShrink(values.username)}
            {...register('username', { required })}
          />
          <TextField
            label="Contraseña"
            type="password"
            autoComplete="current-password"
            error={Boolean(errors.password)}
            helperText={errors.password?.message}
            slotProps={fieldShrink(values.password)}
            {...register('password', { required })}
          />
          {error ? <Alert severity="error">{error}</Alert> : null}
          <Button type="submit" variant="contained" disabled={isSubmitting}>
            {isSubmitting ? 'Entrando…' : 'Entrar'}
          </Button>
        </Box>
      </Paper>
    </Box>
  );
}
