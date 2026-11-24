import { createClient } from '@supabase/supabase-js';

function cleanUrl(rawUrl) {
  if (!rawUrl) return null;
  return rawUrl.trim().replace(/\/rest\/v1\/?$/, '').replace(/\/+$/, '');
}

// Get Supabase credentials from Vite environment variables or localStorage override
function getSupabaseConfig() {
  const envUrl = cleanUrl(import.meta.env.VITE_SUPABASE_URL);
  const envKey = import.meta.env.VITE_SUPABASE_ANON_KEY?.trim();

  if (envUrl && envKey && !envUrl.includes('your-project')) {
    return { url: envUrl, key: envKey };
  }

  try {
    const saved = localStorage.getItem('railfood_supabase_config');
    if (saved) {
      const parsed = JSON.parse(saved);
      const url = cleanUrl(parsed.url);
      const key = parsed.key?.trim();
      if (url && key) {
        return { url, key };
      }
    }
  } catch {
    // Ignore localStorage parse errors
  }

  return { url: null, key: null };
}

const config = getSupabaseConfig();

export const isSupabaseConfigured = () => Boolean(config.url && config.key);

export const supabase = isSupabaseConfigured()
  ? createClient(config.url, config.key, {
      realtime: {
        params: {
          eventsPerSecond: 10
        }
      }
    })
  : null;

/**
 * Save credentials dynamically from UI (useful when testing without rebuilding .env)
 */
export function setSupabaseCredentials(url, key) {
  try {
    if (url && key) {
      localStorage.setItem('railfood_supabase_config', JSON.stringify({ url: url.trim(), key: key.trim() }));
    } else {
      localStorage.removeItem('railfood_supabase_config');
    }
    window.location.reload();
  } catch (err) {
    console.error('Failed to save Supabase credentials:', err);
  }
}
