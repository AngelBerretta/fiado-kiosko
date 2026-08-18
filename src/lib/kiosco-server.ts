import { supabase } from './supabase'

export async function resolverKioscoId(slug: string | null): Promise<string | null> {
  if (!slug) return null

  const { data, error } = await supabase
    .from('kioscos')
    .select('id')
    .eq('slug_acceso', slug)
    .maybeSingle()

  if (error || !data) return null
  return data.id
}