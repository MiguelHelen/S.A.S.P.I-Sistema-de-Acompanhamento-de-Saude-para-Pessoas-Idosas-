import { Injectable } from '@nestjs/common';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import ws from 'ws';

@Injectable()
export class SupabaseService {
  public client: SupabaseClient;

  constructor() {
    this.client = createClient(
      process.env.SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      {
        realtime: {
          transport: ws as any,
        },
      },
    );
  }
}