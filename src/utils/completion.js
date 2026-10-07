export const getCompletion = (data, fields) => {
  const completedFields = fields.filter((field) => {
    const value = data?.[field];

    return (
      value !== null &&
      value !== undefined &&
      String(value).trim() !== ''
    );
  });

  const incompleteFields = fields.filter(
    (field) => !completedFields.includes(field)
  );

  const percentage = fields.length
    ? Math.round(
        (completedFields.length / fields.length) * 100
      )
    : 0;

  return {
    percentage,
    completed: completedFields,
    incomplete: incompleteFields,
    completedCount: completedFields.length,
    total: fields.length,
  };
};