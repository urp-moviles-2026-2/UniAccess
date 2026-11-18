import React, { forwardRef } from 'react';
import { Controller } from 'react-hook-form';
import CampoTexto from './CampoTexto';

// Único enlace entre TextInput y RHF. CampoTexto conserva el diseño del LAB-02.
const FormField = forwardRef(function FormField({ control, name, label, trigger, ...inputProps }, ref) {
  return (
    <Controller
      control={control}
      name={name}
      render={({ field, fieldState: { error }, formState: { isSubmitting } }) => (
        <CampoTexto
          {...inputProps}
          ref={(input) => {
            field.ref(input);
            if (typeof ref === 'function') ref(input);
            else if (ref) ref.current = input;
          }}
          etiqueta={label}
          valor={field.value}
          editable={!isSubmitting && inputProps.editable !== false}
          onChangeText={(valor) => {
            field.onChange(valor);
            if (error) void trigger?.(name);
          }}
          onBlur={field.onBlur}
          error={error?.message}
          accessibilityLabel={label}
        />
      )}
    />
  );
});

export default FormField;
