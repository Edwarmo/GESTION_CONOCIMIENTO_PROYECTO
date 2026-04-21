export function validateOrder(data) {
  const errors = {};
  if (!data.phone) errors.phone = 'Phone is required';
  if (!data.items || data.items.length === 0) errors.items = 'Items are required';
  return errors;
}
