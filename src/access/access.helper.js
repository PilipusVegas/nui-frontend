export const hasAccess = (meta, user) => {
  if (!meta) return true;

  const roleId = String(user?.id_role);
  const perusahaanId = String(user?.id_perusahaan);

  if (meta.roles && !meta.roles.includes(roleId)) return false;
  if (meta.perusahaan && !meta.perusahaan.includes(perusahaanId)) return false;

  return true;
};
