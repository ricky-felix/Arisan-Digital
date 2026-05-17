import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { SupabaseService } from '../supabase/supabase.service';
import { UpsertPlanDto } from './dto/upsert-plan.dto';

@Injectable()
export class PlansService {
  constructor(private readonly supabase: SupabaseService) {}

  /** Returns all active plans — used on the public pricing page. */
  async listActive() {
    const { data, error } = await this.supabase.admin
      .from('plans')
      .select('*')
      .eq('is_active', true)
      .order('price_monthly', { ascending: true });

    if (error) throw error;
    return data;
  }

  /** Returns a single plan by slug regardless of is_active status (admin use). */
  async getBySlug(slug: string) {
    const { data, error } = await this.supabase.admin
      .from('plans')
      .select('*')
      .eq('slug', slug)
      .maybeSingle();

    if (error) throw error;
    if (!data) throw new NotFoundException(`Plan '${slug}' not found`);
    return data;
  }

  /**
   * Creates a new plan. slug and name are required.
   * Only callable by super_admin (enforced at controller level).
   */
  async create(dto: UpsertPlanDto) {
    if (!dto.slug) throw new BadRequestException('slug is required to create a plan');
    if (!dto.name) throw new BadRequestException('name is required to create a plan');

    const { data, error } = await this.supabase.admin
      .from('plans')
      .insert({
        slug: dto.slug,
        name: dto.name,
        description: dto.description ?? null,
        price_monthly: dto.price_monthly ?? 0,
        price_yearly: dto.price_yearly ?? 0,
        max_groups: dto.max_groups ?? null,
        max_members_per_group: dto.max_members_per_group ?? null,
        max_bills_per_month: dto.max_bills_per_month ?? null,
        recurring_bills: dto.recurring_bills ?? false,
        analytics_access: dto.analytics_access ?? false,
        pdf_export: dto.pdf_export ?? false,
        debt_simplification: dto.debt_simplification ?? false,
        custom_invite_links: dto.custom_invite_links ?? false,
        priority_support: dto.priority_support ?? false,
        white_label: dto.white_label ?? false,
        is_active: dto.is_active ?? true,
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  /**
   * Partial update of a plan by slug.
   * Only callable by super_admin (enforced at controller level).
   */
  async update(slug: string, dto: UpsertPlanDto) {
    // Verify plan exists first
    await this.getBySlug(slug);

    // Build a clean update payload excluding undefined fields
    const patch: Record<string, unknown> = {};
    if (dto.name !== undefined) patch.name = dto.name;
    if (dto.description !== undefined) patch.description = dto.description;
    if (dto.price_monthly !== undefined) patch.price_monthly = dto.price_monthly;
    if (dto.price_yearly !== undefined) patch.price_yearly = dto.price_yearly;
    if (dto.max_groups !== undefined) patch.max_groups = dto.max_groups;
    if (dto.max_members_per_group !== undefined) patch.max_members_per_group = dto.max_members_per_group;
    if (dto.max_bills_per_month !== undefined) patch.max_bills_per_month = dto.max_bills_per_month;
    if (dto.recurring_bills !== undefined) patch.recurring_bills = dto.recurring_bills;
    if (dto.analytics_access !== undefined) patch.analytics_access = dto.analytics_access;
    if (dto.pdf_export !== undefined) patch.pdf_export = dto.pdf_export;
    if (dto.debt_simplification !== undefined) patch.debt_simplification = dto.debt_simplification;
    if (dto.custom_invite_links !== undefined) patch.custom_invite_links = dto.custom_invite_links;
    if (dto.priority_support !== undefined) patch.priority_support = dto.priority_support;
    if (dto.white_label !== undefined) patch.white_label = dto.white_label;
    if (dto.is_active !== undefined) patch.is_active = dto.is_active;

    const { data, error } = await this.supabase.admin
      .from('plans')
      .update(patch)
      .eq('slug', slug)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  /**
   * Soft-deactivates a plan by setting is_active = false.
   * Hard deletion is never performed — plans remain for historical billing reference.
   */
  async deactivate(slug: string) {
    await this.getBySlug(slug);

    const { data, error } = await this.supabase.admin
      .from('plans')
      .update({ is_active: false })
      .eq('slug', slug)
      .select()
      .single();

    if (error) throw error;
    return data;
  }
}
