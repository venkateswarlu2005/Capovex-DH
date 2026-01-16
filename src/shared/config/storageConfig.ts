export const ASSETS_BUCKET = process.env.SUPABASE_ASSETS_BUCKET || 'assets';

export const STORAGE_BUCKET = process.env.SUPABASE_STORAGE_BUCKET || 'assets';

export const SIGNED_URL_TTL = Number(process.env.SIGNED_URL_TTL_SECONDS || 60 * 60 * 24 * 7); // 7 days

export const currentProvider = process.env.STORAGE_PROVIDER;
