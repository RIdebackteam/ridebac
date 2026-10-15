import { forwardRef } from 'react'

export const Input = forwardRef(({ 
  label, 
  error, 
  icon, 
  type = 'text', 
  helperText, 
  className = '', 
  ...props 
}, ref) => {
  const isTextarea = type === 'textarea'
  const Component = isTextarea ? 'textarea' : 'input'
  
  return (
    <div className={`w-full ${className}`}>
      {label && <label className="block text-sm font-medium text-slate-300 mb-1.5">{label}</label>}
      <div className="relative">
        {icon && (
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
            {icon}
          </div>
        )}
        <Component
          ref={ref}
          type={isTextarea ? undefined : type}
          className={`input-field ${icon ? 'pl-10' : ''} ${error ? 'border-rose-500 focus:border-rose-500 focus:ring-rose-500/20' : ''} ${isTextarea ? 'min-h-[100px] resize-y' : ''}`}
          {...props}
        />
      </div>
      {error && <p className="mt-1.5 text-sm text-rose-400">{error}</p>}
      {helperText && !error && <p className="mt-1.5 text-sm text-slate-400">{helperText}</p>}
    </div>
  )
})

Input.displayName = 'Input'
