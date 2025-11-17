import { useEffect, useRef } from 'react';
import { Copy, Edit, Trash2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface NodeContextMenuProps {
  x: number;
  y: number;
  onEdit: () => void;
  onClone: () => void;
  onDelete: () => void;
  onClose: () => void;
}

export const NodeContextMenu = ({
  x,
  y,
  onEdit,
  onClone,
  onDelete,
  onClose,
}: NodeContextMenuProps) => {
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        onClose();
      }
    };

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleEscape);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscape);
    };
  }, [onClose]);

  const menuItems = [
    {
      label: 'Edit',
      icon: Edit,
      onClick: () => {
        onEdit();
        onClose();
      },
    },
    {
      label: 'Clone',
      icon: Copy,
      onClick: () => {
        onClone();
        onClose();
      },
    },
    {
      label: 'Delete',
      icon: Trash2,
      onClick: () => {
        onDelete();
        onClose();
      },
      destructive: true,
    },
  ];

  return (
    <div
      ref={menuRef}
      className="fixed z-50 min-w-[160px] rounded-md border border-border bg-card p-1 shadow-lg"
      style={{ left: x, top: y }}
    >
      {menuItems.map((item) => {
        const Icon = item.icon;
        return (
          <button
            key={item.label}
            onClick={item.onClick}
            className={cn(
              'w-full flex items-center gap-2 rounded-sm px-3 py-2 text-sm transition-colors',
              'hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground',
              item.destructive && 'text-destructive hover:text-destructive focus:text-destructive'
            )}
          >
            <Icon className="w-4 h-4" />
            {item.label}
          </button>
        );
      })}
    </div>
  );
};
