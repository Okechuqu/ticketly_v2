// FormField component to render input or select fields based on the type
export const FormField = ({
  name,
  type,
  label,
  value,
  options = [], // Default to an empty array to prevent errors if options are not provided
  onChange,
  disabled,
  className,
  placeholder = "",
  required = false,
  labelClassName = "",
}) => {
  let fieldContent;

  // Check if the field type is 'select' to render a dropdown
  if (type === "select") {
    fieldContent = (
      <select
        name={name}
        value={value}
        onChange={onChange}
        disabled={disabled}
        required={required}
        className={className}
        aria-label={label} // Use aria-label for accessibility instead of label attribute
      >
        {options.map((option, i) => (
          <option key={i} value={option}>
            {option}
          </option>
        ))}
      </select>
    );
  } else if (type === "textarea") {
    // Render a textarea for multiline text input
    fieldContent = (
      <textarea
        name={name}
        value={value}
        onChange={onChange}
        disabled={disabled}
        required={required}
        className={className}
        placeholder={placeholder}
        aria-label={label}
        rows={4}
      />
    );
  } else if (type === "file") {
    // Render an file field for file types
    fieldContent = (
      <input
        type={type}
        name={name}
        value={value}
        accept="image/*"
        required={required}
        onChange={onChange}
        disabled={disabled}
        className={className}
        placeholder={placeholder}
        aria-label={label} // Use aria-label for accessibility instead of label attribute
      />
    );
  } else if (type === "checkbox") {
    // Render an checkbox field for checkbox types
    fieldContent = (
      <input
        type={type}
        name={name}
        required={required}
        checked={value}
        onChange={onChange}
        disabled={disabled}
        className={className}
        aria-label={label} // Use aria-label for accessibility instead of label attribute
      />
    );
  } else {
    // Render an input field for other types
    fieldContent = (
      <input
        type={type}
        name={name}
        value={value}
        required={required}
        onChange={onChange}
        disabled={disabled}
        className={className}
        placeholder={placeholder}
        aria-label={label} // Use aria-label for accessibility instead of label attribute
      />
    );
  }

  return (
    <div>
      <label
        htmlFor={name} // Use the 'name' attribute for htmlFor to correctly associate the label with the input/select
        className={`block ${labelClassName}`}
      >
        {label}
      </label>
      {fieldContent}
    </div>
  );
};
