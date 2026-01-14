import {
  Controller,
  Post,
  Body,
  UseGuards,
  Get,
  Patch,
  Param,
  Delete,
  HttpCode,
  HttpStatus,
  Query,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { AdminService } from './admin.service';
import { CurrentUser, Roles } from '@/auth/decorators/roles.decorator';
import { CreateAdminDto, UpdateMemberStatusDto } from './dto/admin.dto';
import { Request } from 'express';
import { Req } from '@nestjs/common';
import { PayloadDto } from '@/@types';
import { UserRole } from '@/generated/prisma-client/client';

@Controller('admin')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('ADMIN')
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @Post('create')
  @HttpCode(HttpStatus.CREATED)
  async createAdmin(@Body() dto: CreateAdminDto, @Req() req: Request) {
    const createdBy = req?.user as PayloadDto;
    return this.adminService.createAdmin(dto, createdBy.id);
  }

  @Get('list')
  async getAllAdmins() {
    return this.adminService.getAllAdmins();
  }

  @Patch('promote/:memberId')
  async promoteMemberToAdmin(
    @Param('memberId') memberId: string,
    @CurrentUser() user: PayloadDto,
  ) {
    return this.adminService.promoteToAdmin(memberId, user.id);
  }

  /**
   * Demote an admin to member role
   * PATCH /admin/demote/:memberId
   */
  @Patch('demote/:memberId')
  async demoteAdminToMember(@Param('memberId') memberId: string, @Req() req) {
    return this.adminService.demoteToMember(memberId, req.user.sub);
  }

  // ==================== MEMBER MANAGEMENT ====================

  /**
   * Get all members with filters
   * GET /admin/members?status=Active&role=MEMBER&limit=50&page=1
   */
  @Get('members')
  async getAllMembers(
    @Query('status') status?: string,
    @Query('role') role?: UserRole,
    @Query('limit') limit?: string,
    @Query('page') page?: string,
    @Query('search') search?: string,
  ) {
    return this.adminService.getAllMembers({
      status,
      role,
      limit: limit ? parseInt(limit) : 50,
      page: page ? parseInt(page) : 1,
      search,
    });
  }

  /**
   * Get member by ID with full details
   * GET /admin/members/:memberId
   */
  @Get('members/:memberId')
  async getMemberById(@Param('memberId') memberId: string) {
    return this.adminService.getMemberById(memberId);
  }

  /**
   * Get all pending members (awaiting approval)
   * GET /admin/members/pending
   */
  @Get('members/status/pending')
  async getPendingMembers() {
    return this.adminService.getPendingMembers();
  }

  /**
   * Update member status
   * PATCH /admin/members/:memberId/status
   */
  @Patch('members/:memberId/status')
  async updateMemberStatus(
    @Param('memberId') memberId: string,
    @Body() dto: UpdateMemberStatusDto,
    @Req() req,
  ) {
    return this.adminService.updateMemberStatus(
      memberId,
      dto.status,
      req.user.sub,
      dto.reason,
    );
  }

  /**
   * Approve pending member
   * PATCH /admin/members/:memberId/approve
   */
  @Patch('members/:memberId/approve')
  async approveMember(@Param('memberId') memberId: string, @Req() req) {
    return this.adminService.approveMember(memberId, req.user.sub);
  }

  /**
   * Reject pending member
   * PATCH /admin/members/:memberId/reject
   */
  @Patch('members/:memberId/reject')
  async rejectMember(
    @Param('memberId') memberId: string,
    @Body() dto: { reason?: string },
    @Req() req,
  ) {
    return this.adminService.rejectMember(memberId, req.user.sub, dto.reason);
  }

  /**
   * Suspend member account
   * PATCH /admin/members/:memberId/suspend
   */
  @Patch('members/:memberId/suspend')
  async suspendMember(
    @Param('memberId') memberId: string,
    @Body() dto: { reason?: string },
    @Req() req,
  ) {
    return this.adminService.suspendMember(memberId, req.user.sub, dto.reason);
  }

  /**
   * Reactivate suspended member
   * PATCH /admin/members/:memberId/reactivate
   */
  @Patch('members/:memberId/reactivate')
  async reactivateMember(@Param('memberId') memberId: string, @Req() req) {
    return this.adminService.reactivateMember(memberId, req.user.sub);
  }

  /**
   * Reset member password (by admin)
   * PATCH /admin/members/:memberId/reset-password
   */
  @Patch('members/:memberId/reset-password')
  async resetMemberPassword(
    @Param('memberId') memberId: string,
    @Body() dto: { newPassword: string },
    @Req() req,
  ) {
    return this.adminService.resetMemberPassword(
      memberId,
      dto.newPassword,
      req.user.sub,
    );
  }

  /**
   * Update member details (by admin)
   * PATCH /admin/members/:memberId
   */
  @Patch('members/:memberId')
  async updateMember(
    @Param('memberId') memberId: string,
    @Body() dto: any,
    @CurrentUser() user: PayloadDto,
  ) {
    return this.adminService.updateMemberDetails(memberId, dto, user.id);
  }

  /**
   * Delete member (soft delete - suspend account)
   * DELETE /admin/members/:memberId
   */
  @Delete('members/:memberId')
  async deleteMember(@Param('memberId') memberId: string, @Req() req) {
    return this.adminService.deleteMember(memberId, req.user.sub);
  }

  @Get('dashboard/stats')
  async getDashboardStats() {
    return this.adminService.getDashboardStats();
  }

  /**
   * Get member statistics by status
   * GET /admin/stats/members
   */
  @Get('stats/members')
  async getMemberStats() {
    return this.adminService.getMemberStats();
  }

  /**
   * Get recent activity logs
   * GET /admin/activity?limit=20
   */
  @Get('activity')
  async getRecentActivity(@Query('limit') limit?: string) {
    return this.adminService.getRecentActivity(limit ? parseInt(limit) : 20);
  }

  /**
   * Get login logs
   * GET /admin/logs/login?limit=50&status=Success
   */
  @Get('logs/login')
  async getLoginLogs(
    @Query('limit') limit?: string,
    @Query('status') status?: string,
    @Query('role') role?: string,
  ) {
    return this.adminService.getLoginLogs({
      limit: limit ? parseInt(limit) : 50,
      status,
      role,
    });
  }

  /**
   * Get member's login history
   * GET /admin/members/:memberId/login-history
   */
  @Get('members/:memberId/login-history')
  async getMemberLoginHistory(
    @Param('memberId') memberId: string,
    @Query('limit') limit?: string,
  ) {
    return this.adminService.getMemberLoginHistory(
      memberId,
      limit ? parseInt(limit) : 20,
    );
  }

  // ==================== BULK OPERATIONS ====================

  /**
   * Bulk approve members
   * POST /admin/members/bulk-approve
   */
  @Post('members/bulk-approve')
  async bulkApproveMembers(@Body() dto: { memberIds: string[] }, @Req() req) {
    return this.adminService.bulkApproveMembers(dto.memberIds, req.user.sub);
  }

  /**
   * Bulk reject members
   * POST /admin/members/bulk-reject
   */
  @Post('members/bulk-reject')
  async bulkRejectMembers(
    @Body() dto: { memberIds: string[]; reason?: string },
    @Req() req,
  ) {
    return this.adminService.bulkRejectMembers(
      dto.memberIds,
      req.user.sub,
      dto.reason,
    );
  }

  /**
   * Export members data
   * GET /admin/members/export?format=csv
   */
  @Get('members/export/data')
  async exportMembers(@Query('format') format?: string) {
    return this.adminService.exportMembers(format || 'json');
  }

  // ==================== SYSTEM SETTINGS ====================

  /**
   * Get system settings
   * GET /admin/settings
   */
  @Get('settings')
  async getSystemSettings() {
    return {
      message: 'System settings endpoint',
      // Implement your settings logic here
    };
  }

  /**
   * Update system settings
   * PATCH /admin/settings
   */
  @Patch('settings')
  async updateSystemSettings(@Body() dto: any) {
    return {
      message: 'System settings updated',
      // Implement your settings update logic here
    };
  }
}
