import { NotFoundException } from '@nestjs/common';
import type { ArgumentsHost } from '@nestjs/common';
import { describe, expect, it } from 'vitest';
import { HttpExceptionFilter } from './http-exception.filter.js';

function capture() {
  const sent: { status?: number; body?: { message?: string; detail?: string } } = {};
  const host = {
    switchToHttp: () => ({
      getResponse: () => ({
        status(status: number) {
          sent.status = status;
          return { json: (body: { message?: string; detail?: string }) => { sent.body = body; } };
        },
      }),
    }),
  } as ArgumentsHost;
  return { sent, host };
}

describe('error no previsto', () => {
  const filter = new HttpExceptionFilter();

  it('devuelve el mensaje técnico y el stack', () => {
    const { sent, host } = capture();
    filter.catch(new Error('duplicate key value violates unique constraint "product_upcCode_key"'), host);
    expect(sent.status).toBe(500);
    expect(sent.body?.message).toBe('duplicate key value violates unique constraint "product_upcCode_key"');
    expect(sent.body?.detail).toContain('duplicate key value violates unique constraint');
  });

  it('deja pasar el mensaje de un error previsto', () => {
    const { sent, host } = capture();
    filter.catch(new NotFoundException('No existe el producto.'), host);
    expect(sent.status).toBe(404);
    expect(sent.body?.message).toBe('No existe el producto.');
  });
});
