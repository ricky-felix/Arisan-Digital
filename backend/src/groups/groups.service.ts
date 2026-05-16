import { Injectable, NotFoundException } from '@nestjs/common';
import { SupabaseService } from '../supabase/supabase.service';
import { CreateGroupDto } from './dto/create-group.dto';

@Injectable()
export class GroupsService {
  constructor(private readonly supabase: SupabaseService) {}

  async findAllForUser(userId: string) {
    const { data, error } = await this.supabase.admin
      .from('groups')
      .select('*, group_members!inner(user_id, role)')
      .eq('group_members.user_id', userId);

    if (error) throw error;
    return data;
  }

  async findOne(id: string) {
    const { data, error } = await this.supabase.admin
      .from('groups')
      .select('*, group_members(*, profiles(*))')
      .eq('id', id)
      .single();

    if (error) throw new NotFoundException(`Group ${id} not found`);
    return data;
  }

  async create(dto: CreateGroupDto, userId: string) {
    const { data, error } = await this.supabase.admin
      .from('groups')
      .insert({ ...dto, created_by: userId })
      .select()
      .single();

    if (error) throw error;

    // Add creator as admin member
    await this.supabase.admin
      .from('group_members')
      .insert({ group_id: data.id, user_id: userId, role: 'admin' });

    return data;
  }

  async remove(id: string, userId: string) {
    const { error } = await this.supabase.admin
      .from('groups')
      .delete()
      .eq('id', id)
      .eq('created_by', userId);

    if (error) throw error;
    return { message: 'Group deleted' };
  }
}
