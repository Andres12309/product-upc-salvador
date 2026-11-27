'use client';

import Alert from '@mui/material/Alert';
import Button from '@mui/material/Button';
import MenuItem from '@mui/material/MenuItem';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import { useEffect, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import type { SessionUser } from '@/modules/auth/types';
import { fieldShrink } from '@/modules/shared/utils/field-shrink';
import { getProduct, listCategories, listSubcategories, saveProduct } from '../services/api';
import type { CategoryItem, Product, ProductDraft } from '../types';

const utcDate = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}Z$/;

function nowUtc(): string {
  return new Date().toISOString().replace(/\.\d{3}Z$/, 'Z');
}

function blankDraft(user: SessionUser): ProductDraft {
  const now = nowUtc();
  return {
    upcDescription: '',
    upcCode: '',
    categoryCode: '',
    subCategoryCode: '',
    dateAdded: now,
    updatedDate: now,
    addedBy: user.username,
    modifiedBy: user.username,
  };
}

export function ProductForm({
  user,
  id,
  products,
  onCancel,
  onSaved,
}: {
  user: SessionUser;
  id?: string;
  products: Product[];
  onCancel: () => void;
  onSaved: () => void;
}) {
  const [categories, setCategories] = useState<CategoryItem[]>([]);
  const [subcategories, setSubcategories] = useState<string[]>([]);
  const [error, setError] = useState('');
  const {
    register,
    control,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<ProductDraft>({ defaultValues: blankDraft(user) });
  const draft = watch();
  const categoryCode = draft.categoryCode;

  useEffect(() => {
    listCategories()
      .then(setCategories)
      .catch((cause: unknown) => setError(cause instanceof Error ? cause.message : 'No se pudieron leer las categorías'));
    if (!id) return;
    getProduct(id)
      .then((product) => {
        reset({
          upcDescription: product.upcDescription,
          upcCode: product.upcCode,
          categoryCode: product.categoryCode ?? '',
          subCategoryCode: product.subCategoryCode ?? '',
          dateAdded: product.dateAdded ?? nowUtc(),
          updatedDate: nowUtc(),
          addedBy: product.addedBy || user.username,
          modifiedBy: user.username,
        });
      })
      .catch((cause: unknown) => setError(cause instanceof Error ? cause.message : 'No se pudo leer el producto'));
  }, [id, reset, user.username]);

  useEffect(() => {
    if (!categoryCode) {
      setSubcategories([]);
      return;
    }
    listSubcategories(categoryCode)
      .then(setSubcategories)
      .catch((cause: unknown) => setError(cause instanceof Error ? cause.message : 'No se pudieron leer las subcategorías'));
  }, [categoryCode]);

  async function onSubmit(values: ProductDraft) {
    setError('');
    try {
      await saveProduct(
        {
          ...values,
          upcDescription: values.upcDescription.trim(),
          upcCode: values.upcCode.trim(),
        },
        id,
      );
      onSaved();
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'No se pudo guardar el producto');
    }
  }

  return (
    <Stack component="form" spacing={2} onSubmit={handleSubmit(onSubmit)} sx={{ pt: 1 }}>
      <TextField
        label="Nombre"
        error={Boolean(errors.upcDescription)}
        helperText={errors.upcDescription?.message}
        slotProps={fieldShrink(draft.upcDescription)}
        {...register('upcDescription', { required: 'El nombre es obligatorio.' })}
      />
      <TextField
        label="UPC"
        error={Boolean(errors.upcCode)}
        helperText={errors.upcCode?.message}
        slotProps={fieldShrink(draft.upcCode)}
        {...register('upcCode', {
          required: 'El UPC es obligatorio.',
          pattern: { value: /^\d{12}$/, message: 'El UPC debe tener 12 dígitos.' },
          validate: (value) =>
            products.some((product) => product.upcCode === value.trim() && product.id !== id)
              ? 'El UPC ya existe.'
              : true,
        })}
      />
      <Controller
        name="categoryCode"
        control={control}
        rules={{ required: 'La categoría es obligatoria.' }}
        render={({ field }) => (
          <TextField
            select
            label="Categoría"
            error={Boolean(errors.categoryCode)}
            helperText={errors.categoryCode?.message}
            slotProps={fieldShrink(field.value)}
            {...field}
            onChange={(event) => {
              field.onChange(event);
              setValue('subCategoryCode', '');
            }}
          >
            <MenuItem value="">Elige una categoría</MenuItem>
            {field.value && !categories.some((category) => category.code === field.value) ? (
              <MenuItem value={field.value}>{field.value}</MenuItem>
            ) : null}
            {categories.map((category) => (
              <MenuItem key={category.code} value={category.code}>
                {category.code}
              </MenuItem>
            ))}
          </TextField>
        )}
      />
      <Controller
        name="subCategoryCode"
        control={control}
        rules={{ required: 'La subcategoría es obligatoria.' }}
        render={({ field }) => (
          <TextField
            select
            label="Subcategoría"
            error={Boolean(errors.subCategoryCode)}
            helperText={errors.subCategoryCode?.message}
            slotProps={fieldShrink(field.value)}
            {...field}
          >
            <MenuItem value="">Elige una subcategoría</MenuItem>
            {field.value && !subcategories.includes(field.value) ? (
              <MenuItem value={field.value}>{field.value}</MenuItem>
            ) : null}
            {subcategories.map((code) => (
              <MenuItem key={code} value={code}>
                {code}
              </MenuItem>
            ))}
          </TextField>
        )}
      />
      <TextField
        label="Fecha de alta"
        error={Boolean(errors.dateAdded)}
        helperText={errors.dateAdded?.message}
        slotProps={fieldShrink(draft.dateAdded)}
        {...register('dateAdded', {
          required: 'La fecha no es válida.',
          pattern: { value: utcDate, message: 'La fecha no es válida.' },
        })}
      />
      <TextField
        label="Fecha de modificación"
        error={Boolean(errors.updatedDate)}
        helperText={errors.updatedDate?.message}
        slotProps={fieldShrink(draft.updatedDate)}
        {...register('updatedDate', {
          required: 'La fecha no es válida.',
          pattern: { value: utcDate, message: 'La fecha no es válida.' },
        })}
      />
      <TextField
        label="Registró"
        error={Boolean(errors.addedBy)}
        helperText={errors.addedBy?.message}
        slotProps={fieldShrink(draft.addedBy)}
        {...register('addedBy', { required: 'Indica quién registró el producto.' })}
      />
      <TextField
        label="Modificó"
        error={Boolean(errors.modifiedBy)}
        helperText={errors.modifiedBy?.message}
        slotProps={fieldShrink(draft.modifiedBy)}
        {...register('modifiedBy', { required: 'Indica quién modificó el producto.' })}
      />
      {error ? <Alert severity="error">{error}</Alert> : null}
      <Stack direction="row" spacing={1}>
        <Button type="submit" variant="contained" disabled={isSubmitting}>
          {isSubmitting ? 'Guardando…' : 'Guardar'}
        </Button>
        <Button onClick={onCancel}>Cancelar</Button>
      </Stack>
    </Stack>
  );
}
