'use client';

import { usePathname, useRouter, useSearchParams } from 'next/navigation';

export type PageAction = 'nuevo' | 'editar' | 'eliminar';

export function usePageAction() {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();
  const action = params.get('accion') as PageAction | null;
  const targetId = params.get('id');

  function open(nextAction: PageAction, id?: string) {
    const next = new URLSearchParams();
    next.set('accion', nextAction);
    if (id) next.set('id', id);
    router.push(`${pathname}?${next.toString()}`);
  }

  function close() {
    router.back();
  }

  return { action, targetId, open, close };
}
