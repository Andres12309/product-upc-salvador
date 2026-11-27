'use client';

import Button from '@mui/material/Button';
import Chip from '@mui/material/Chip';
import Stack from '@mui/material/Stack';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import type { Product } from '../types';

export function ProductTable({
  products,
  canWrite,
  onOpen,
  onEdit,
  onDelete,
}: {
  products: Product[];
  canWrite: boolean;
  onOpen: (id: string) => void;
  onEdit: (id: string) => void;
  onDelete: (product: Product) => void;
}) {
  return (
    <TableContainer>
      <Table size="small">
        <TableHead>
          <TableRow>
            <TableCell>Nombre</TableCell>
            <TableCell>UPC</TableCell>
            <TableCell>Categoría</TableCell>
            <TableCell>Subcategoría</TableCell>
            <TableCell>Alta</TableCell>
            <TableCell>Modificación</TableCell>
            <TableCell>Acciones</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {products.map((product) => (
            <TableRow key={product.id} hover>
              <TableCell>
                <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
                  <span>{product.upcDescription || 'Sin nombre'}</span>
                  {product.needsAttention ? <Chip size="small" color="warning" label="Revisar" /> : null}
                </Stack>
              </TableCell>
              <TableCell sx={{ fontFamily: 'monospace' }}>{product.upcCode}</TableCell>
              <TableCell>{product.categoryCode ?? ''}</TableCell>
              <TableCell>{product.subCategoryCode ?? ''}</TableCell>
              <TableCell>{product.dateAdded ?? ''}</TableCell>
              <TableCell>{product.updatedDate ?? ''}</TableCell>
              <TableCell>
                <Stack direction="row" spacing={1}>
                  <Button size="small" onClick={() => onOpen(product.id)}>
                    Ver
                  </Button>
                  {canWrite ? (
                    <Button size="small" onClick={() => onEdit(product.id)}>
                      Editar
                    </Button>
                  ) : null}
                  {canWrite ? (
                    <Button size="small" color="error" onClick={() => onDelete(product)}>
                      Eliminar
                    </Button>
                  ) : null}
                </Stack>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
}
