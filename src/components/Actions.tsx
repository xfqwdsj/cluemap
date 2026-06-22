'use client';

import { useRef, useEffect, useCallback, type ReactNode } from 'react';
import { useStore } from '@/lib/store';

interface ActionItemProps {
  id: string;
  priority: number;
  children: ReactNode;
}

export function ActionItem({ id, priority, children }: ActionItemProps) {
  const collapsedIds = useStore((s) => s.collapsedActionIds);
  const isCollapsed = collapsedIds.includes(id);

  return (
    <div
      data-action-id={id}
      data-action-priority={priority}
      className={isCollapsed ? 'hidden' : undefined}
    >
      {children}
    </div>
  );
}

interface ActionGroupProps {
  children: ReactNode;
  className?: string;
}

export function ActionGroup({ children, className }: ActionGroupProps) {
  const ref = useRef<HTMLDivElement>(null);
  const setCollapsedIds = useStore((s) => s.setCollapsedActionIds);
  const widthCache = useRef<Map<string, number>>(new Map());

  const measure = useCallback(() => {
    const container = ref.current;
    if (!container) return;

    const items = Array.from(
      container.querySelectorAll<HTMLElement>('[data-action-id]')
    );
    if (items.length === 0) return;

    items.forEach((el) => {
      const id = el.dataset.actionId!;
      if (el.offsetWidth > 0) {
        widthCache.current.set(id, el.offsetWidth);
      }
    });

    if (widthCache.current.size === 0) return;

    const gap = 24;
    const parent = container.parentElement;
    if (!parent) return;

    const parentRect = parent.getBoundingClientRect();
    const prevSibling = container.previousElementSibling;
    const availableWidth = prevSibling
      ? parentRect.right - prevSibling.getBoundingClientRect().right
      : parentRect.width;

    const itemData = Array.from(widthCache.current.entries()).map(
      ([id, width]) => ({
        id,
        width,
        priority: Number(
          items.find((el) => el.dataset.actionId === id)?.dataset
            .actionPriority ?? '0'
        ),
      })
    );

    let totalWidth =
      itemData.reduce((sum, item) => sum + item.width, 0) +
      gap * (itemData.length - 1);

    const sorted = [...itemData].sort((a, b) => a.priority - b.priority);
    const collapsed: string[] = [];

    for (const item of sorted) {
      if (totalWidth <= availableWidth) break;
      collapsed.push(item.id);
      totalWidth -= item.width + gap;
    }

    setCollapsedIds(collapsed);
  }, [setCollapsedIds]);

  useEffect(() => {
    const container = ref.current;
    if (!container) return;

    const parent = container.parentElement;
    if (!parent) return;

    requestAnimationFrame(measure);

    const targets: Element[] = [parent];
    const prevSibling = container.previousElementSibling;
    if (prevSibling) targets.push(prevSibling);

    const ro = new ResizeObserver(() => {
      requestAnimationFrame(measure);
    });
    targets.forEach((t) => ro.observe(t));

    return () => ro.disconnect();
  }, [measure]);

  return (
    <div ref={ref} className={`flex items-center gap-6 ${className ?? ''}`}>
      {children}
    </div>
  );
}
