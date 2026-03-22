import { cn } from '@/lib/utils';

/**
 * Renders icon properly whether passed as component or element
 */
function renderIcon(icon) {
  if (!icon) return null;
  
  // If it's a React element (has $typeof), render it directly
  if (icon && typeof icon === 'object' && '$typeof' in icon) {
    return icon;
  }
  
  // If it's a function (component), try to render it
  if (typeof icon === 'function') {
    const IconComponent = icon;
    return <IconComponent className="w-6 h-6" />;
  }
  
  // Otherwise, render as text
  return icon;
}

export default function EmptyState({ icon, title, description, action, className }) {
  return (
    <div className={cn(
      'flex flex-col items-center justify-center',
      'py-16 px-8 text-center',
      className
    )}>
      {icon && (
        <div className="
          w-14 h-14 rounded-2xl bg-bg-subtle
          flex items-center justify-center
          text-text-tertiary mb-5
          text-2xl
        ">
          {renderIcon(icon)}
        </div>
      )}
      <h3 className="text-base font-semibold text-text-primary mb-2">{title}</h3>
      {description && (
        <p className="text-sm text-text-tertiary max-w-xs leading-relaxed">{description}</p>
      )}
      {action && <div className="mt-6">{action}</div>}
    </div>
  );
}
