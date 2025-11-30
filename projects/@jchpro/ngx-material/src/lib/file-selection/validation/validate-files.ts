/**
 * Checks whether the file list is compatible with `accept` string, similar to input[type="file].
 * Returns `true` if ALL files match the criteria.
 */
export function validateFiles(files: File[], accept: string): boolean {
  if (!accept || accept.trim() === '') {
    return true;
  }

  const rules = accept.split(',')
    .map(rule => rule.trim().toLowerCase())
    .filter(rule => rule.length > 0);

  if (rules.length === 0) {
    return true;
  }

  // All must match
  return files.every(file => {
    const fileName = file.name.toLowerCase();
    const fileType = file.type.toLowerCase(); // Can be empty string in rare cases

    // Any must match
    return rules.some(rule => {

      // 1. Extensions
      if (rule.startsWith('.')) {
        return fileName.endsWith(rule);
      }

      // 2. Wildcard MIME
      if (rule.endsWith('/*')) {
        // "image/*" -> "image/"
        const mainType = rule.slice(0, -1);
        return fileType.startsWith(mainType);
      }

      // 3. Exact MIME
      return fileType === rule;
    });
  });
}
