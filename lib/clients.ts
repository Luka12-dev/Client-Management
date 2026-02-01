import { supabase } from './supabase';
import { ClientOverview } from '@/types/database.types';

export async function getClientsOverview(): Promise<ClientOverview[]> {
  const { data, error } = await supabase
    .from('client_overview')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching clients:', error);
    throw error;
  }

  return data || [];
}

export async function getClientById(id: string) {
  const { data, error } = await supabase
    .from('clients')
    .select('*')
    .eq('id', id)
    .single();

  if (error) {
    console.error('Error fetching client:', error);
    throw error;
  }

  return data;
}
