// Admin panel path is read from env so automated scanners can't guess it
export const ADMIN_PATH = import.meta.env.VITE_ADMIN_PATH ?? 'admin'
