export const getInitials = (name) => {
  if (!name) return "?";

  const trimmed = name.trim();

  const parts = trimmed.split(/\s+/);

  if (parts.length > 1) {
    return (
      parts[0][0] +
      parts[parts.length - 1][0]
    ).toUpperCase();
  }

  const capitals = trimmed.match(/[A-Z]/g);

  if (capitals && capitals.length >= 2) {
    return (
      capitals[0] +
      capitals[capitals.length - 1]
    ).toUpperCase();
  }

  return trimmed.slice(0, 2).toUpperCase();
};