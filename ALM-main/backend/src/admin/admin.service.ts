import {
  Injectable,
  ConflictException,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import * as bcrypt from 'bcrypt';
import { UserRole } from '@/generated/prisma-client/client';

@Injectable()
export class AdminService {
  constructor(private readonly prisma: PrismaService) {}

  // ==================== ADMIN MANAGEMENT ====================

  /**
   * Create a new admin user
   */
  async createAdmin(
    dto: {
      firstName: string;
      lastName: string;
      email: string;
      password: string;
      phone: string;
    },
    createdBy: string,
  ) {
    // Check if email exists
    const existingUser = await this.prisma.member.findUnique({
      where: { email: dto.email },
    });

    if (existingUser) {
      throw new ConflictException('Email already registered');
    }

    // Check if phone exists
    const existingPhone = await this.prisma.member.findFirst({
      where: { phone: dto.phone },
    });

    if (existingPhone) {
      throw new ConflictException('Phone number already registered');
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(dto.password, 10);

    // Generate unique membership ID
    const membershipId = await this.generateMembershipId();

    // Create admin
    const admin = await this.prisma.member.create({
      data: {
        firstName: dto.firstName,
        lastName: dto.lastName,
        email: dto.email,
        password: hashedPassword,
        phone: dto.phone,
        membershipId,
        role: 'ADMIN',
        status: 'Active',
        gender: 'Other',
        membershipType: 'Executive',
      },
      omit: { password: true },
    });

    return {
      success: true,
      message: 'Admin user created successfully',
      admin,
    };
  }

  /**
   * Get all admin users
   */
  async getAllAdmins() {
    const admins = await this.prisma.member.findMany({
      where: { role: 'ADMIN' },
      omit: { password: true },
      include: {
        emergencyContact: true,
        _count: {
          select: {
            loginLogs: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return {
      success: true,
      count: admins.length,
      admins,
    };
  }

  /**
   * Promote a member to admin role
   */
  async promoteToAdmin(memberId: string, promotedBy: string) {
    const member = await this.prisma.member.findUnique({
      where: { id: memberId },
    });

    if (!member) {
      throw new NotFoundException('Member not found');
    }

    if (member.role === 'ADMIN') {
      throw new BadRequestException('User is already an admin');
    }

    const updatedMember = await this.prisma.member.update({
      where: { id: memberId },
      data: {
        role: 'ADMIN',
        status: 'Active',
      },
      omit: { password: true },
    });

    return {
      success: true,
      message: `${member.firstName} ${member.lastName} has been promoted to admin`,
      member: updatedMember,
    };
  }

  /**
   * Demote an admin to member role
   */
  async demoteToMember(memberId: string, demotedBy: string) {
    const member = await this.prisma.member.findUnique({
      where: { id: memberId },
    });

    if (!member) {
      throw new NotFoundException('Member not found');
    }

    if (member.role === 'MEMBER') {
      throw new BadRequestException('User is already a member');
    }

    // Don't allow demoting yourself
    if (memberId === demotedBy) {
      throw new ForbiddenException('You cannot demote yourself');
    }

    const updatedMember = await this.prisma.member.update({
      where: { id: memberId },
      data: {
        role: 'MEMBER',
      },
      omit: { password: true },
    });

    return {
      success: true,
      message: `${member.firstName} ${member.lastName} has been demoted to member`,
      member: updatedMember,
    };
  }

  // ==================== MEMBER MANAGEMENT ====================

  /**
   * Get all members with filters and pagination
   */
  async getAllMembers(filters: {
    status?: string;
    role?: UserRole;
    limit?: number;
    page?: number;
    search?: string;
  }) {
    const { status, role, limit = 50, page = 1, search } = filters;
    const skip = (page - 1) * limit;

    const where: any = {
      role: {
        not: 'ADMIN',
      },
    };

    if (status) where.status = status;
    if (role) where.role = role;

    if (search) {
      where.OR = [
        { firstName: { contains: search, mode: 'insensitive' } },
        { lastName: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
        { membershipId: { contains: search, mode: 'insensitive' } },
      ];
    }

    const [members, total] = await Promise.all([
      await this.prisma.member.findMany({
        where: {
          ...where,
        },
        omit: { password: true },

        include: {
          emergencyContact: true,
        },
        orderBy: { createdAt: 'desc' },
        take: limit,
        skip,
        // not: { role: '' },
      }),
      this.prisma.member.count({ where }),
    ]);

    if (!members) {
      throw new NotFoundException('Members not found');
    }
    return {
      success: true,
      data: members,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Get member by ID with full details
   */
  async getMemberById(memberId: string) {
    const member = await this.prisma.member.findUnique({
      where: { id: memberId },
      omit: { password: true },
      include: {
        emergencyContact: true,
        documents: true,
        loginLogs: {
          take: 10,
          orderBy: { timestamp: 'desc' },
        },
        payments: {
          take: 5,
          orderBy: { createdAt: 'desc' },
        },
        invoices: {
          take: 5,
          orderBy: { issuedAt: 'desc' },
        },
        _count: {
          select: {
            rsvps: true,
            payments: true,
            invoices: true,
            loginLogs: true,
          },
        },
      },
    });

    if (!member) {
      throw new NotFoundException('Member not found');
    }

    return {
      success: true,
      member,
    };
  }

  /**
   * Get all pending members
   */
  async getPendingMembers() {
    const pendingMembers = await this.prisma.member.findMany({
      where: { status: 'Pending' },
      omit: { password: true },
      include: {
        emergencyContact: true,
        documents: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    return {
      success: true,
      count: pendingMembers.length,
      members: pendingMembers,
    };
  }

  /**
   * Update member status
   */
  async updateMemberStatus(
    memberId: string,
    status: 'Active' | 'Rejected' | 'Suspended' | 'Pending',
    updatedBy: string,
    reason?: string,
  ) {
    const member = await this.prisma.member.findUnique({
      where: { id: memberId },
    });

    if (!member) {
      throw new NotFoundException('Member not found');
    }

    const updatedMember = await this.prisma.member.update({
      where: { id: memberId },
      data: { status },
      omit: { password: true },
    });

    return {
      success: true,
      message: `Member status updated to ${status}`,
      member: updatedMember,
      reason,
    };
  }

  /**
   * Approve a pending member
   */
  async approveMember(memberId: string, approvedBy: string) {
    return this.updateMemberStatus(memberId, 'Active', approvedBy);
  }

  /**
   * Reject a pending member
   */
  async rejectMember(memberId: string, rejectedBy: string, reason?: string) {
    return this.updateMemberStatus(memberId, 'Rejected', rejectedBy, reason);
  }

  /**
   * Suspend a member
   */
  async suspendMember(memberId: string, suspendedBy: string, reason?: string) {
    return this.updateMemberStatus(memberId, 'Suspended', suspendedBy, reason);
  }

  /**
   * Reactivate suspended member
   */
  async reactivateMember(memberId: string, reactivatedBy: string) {
    return this.updateMemberStatus(memberId, 'Active', reactivatedBy);
  }

  /**
   * Reset member password (by admin)
   */
  async resetMemberPassword(
    memberId: string,
    newPassword: string,
    resetBy: string,
  ) {
    const member = await this.prisma.member.findUnique({
      where: { id: memberId },
    });

    if (!member) {
      throw new NotFoundException('Member not found');
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    await this.prisma.member.update({
      where: { id: memberId },
      data: { password: hashedPassword },
    });

    return {
      success: true,
      message: `Password reset successfully for ${member.firstName} ${member.lastName}`,
    };
  }

  /**
   * Update member details (by admin)
   */
  async updateMemberDetails(memberId: string, data: any, updatedBy: string) {
    const member = await this.prisma.member.findUnique({
      where: { id: memberId },
    });

    if (!member) {
      throw new NotFoundException('Member not found');
    }

    // Remove sensitive fields that shouldn't be updated this way
    const { password, role, status, membershipId, ...updateData } = data;

    const updatedMember = await this.prisma.member.update({
      where: { id: memberId },
      data: updateData,
      omit: { password: true },
    });

    return {
      success: true,
      message: 'Member details updated successfully',
      member: updatedMember,
    };
  }

  /**
   * Delete member (soft delete)
   */
  async deleteMember(memberId: string, deletedBy: string) {
    const member = await this.prisma.member.findUnique({
      where: { id: memberId },
    });

    if (!member) {
      throw new NotFoundException('Member not found');
    }

    // Don't allow deleting yourself
    if (memberId === deletedBy) {
      throw new ForbiddenException('You cannot delete yourself');
    }

    // Soft delete by suspending
    await this.prisma.member.update({
      where: { id: memberId },
      data: { status: 'Suspended' },
    });

    return {
      success: true,
      message: `Member ${member.firstName} ${member.lastName} has been suspended`,
    };
  }

  // ==================== STATISTICS & REPORTS ====================

  /**
   * Get dashboard statistics
   */
  async getDashboardStats() {
    const [
      totalMembers,
      activeMembers,
      pendingMembers,
      suspendedMembers,
      totalAdmins,
      recentLogins,
      todayRegistrations,
    ] = await Promise.all([
      this.prisma.member.count(),
      this.prisma.member.count({ where: { status: 'Active' } }),
      this.prisma.member.count({ where: { status: 'Pending' } }),
      this.prisma.member.count({ where: { status: 'Suspended' } }),
      this.prisma.member.count({ where: { role: 'ADMIN' } }),
      this.prisma.loginLog.count({
        where: {
          timestamp: {
            gte: new Date(Date.now() - 24 * 60 * 60 * 1000), // Last 24 hours
          },
        },
      }),
      this.prisma.member.count({
        where: {
          createdAt: {
            gte: new Date(new Date().setHours(0, 0, 0, 0)), // Today
          },
        },
      }),
    ]);

    return {
      success: true,
      stats: {
        members: {
          total: totalMembers,
          active: activeMembers,
          pending: pendingMembers,
          suspended: suspendedMembers,
          rejected:
            totalMembers - activeMembers - pendingMembers - suspendedMembers,
        },
        admins: totalAdmins,
        activity: {
          recentLogins,
          todayRegistrations,
        },
      },
    };
  }

  /**
   * Get member statistics
   */
  async getMemberStats() {
    const [statusStats, roleStats, membershipTypeStats, genderStats] =
      await Promise.all([
        this.prisma.member.groupBy({
          by: ['status'],
          _count: true,
        }),
        this.prisma.member.groupBy({
          by: ['role'],
          _count: true,
        }),
        this.prisma.member.groupBy({
          by: ['membershipType'],
          _count: true,
        }),
        this.prisma.member.groupBy({
          by: ['gender'],
          _count: true,
        }),
      ]);

    return {
      success: true,
      stats: {
        byStatus: statusStats,
        byRole: roleStats,
        byMembershipType: membershipTypeStats,
        byGender: genderStats,
      },
    };
  }

  /**
   * Get recent activity
   */
  async getRecentActivity(limit: number = 20) {
    const recentLogins = await this.prisma.loginLog.findMany({
      take: limit,
      orderBy: { timestamp: 'desc' },
      include: {
        member: {
          select: {
            firstName: true,
            lastName: true,
            email: true,
            avatar: true,
          },
        },
      },
    });

    return {
      success: true,
      activities: recentLogins,
    };
  }

  /**
   * Get login logs
   */
  async getLoginLogs(filters: {
    limit?: number;
    status?: string;
    role?: string;
  }) {
    const { limit = 50, status, role } = filters;

    const where: any = {};
    if (status) where.status = status;
    if (role) where.role = role;

    const logs = await this.prisma.loginLog.findMany({
      where,
      take: limit,
      orderBy: { timestamp: 'desc' },
      include: {
        member: {
          select: {
            firstName: true,
            lastName: true,
            email: true,
            avatar: true,
          },
        },
      },
    });

    return {
      success: true,
      count: logs.length,
      logs,
    };
  }

  /**
   * Get member's login history
   */
  async getMemberLoginHistory(memberId: string, limit: number = 20) {
    const member = await this.prisma.member.findUnique({
      where: { id: memberId },
    });

    if (!member) {
      throw new NotFoundException('Member not found');
    }

    const history = await this.prisma.loginLog.findMany({
      where: { memberId },
      take: limit,
      orderBy: { timestamp: 'desc' },
    });

    return {
      success: true,
      member: {
        id: member.id,
        name: `${member.firstName} ${member.lastName}`,
        email: member.email,
      },
      history,
    };
  }

  // ==================== BULK OPERATIONS ====================

  /**
   * Bulk approve members
   */
  async bulkApproveMembers(memberIds: string[], approvedBy: string) {
    const result = await this.prisma.member.updateMany({
      where: {
        id: { in: memberIds },
        status: 'Pending',
      },
      data: {
        status: 'Active',
      },
    });

    return {
      success: true,
      message: `${result.count} members approved successfully`,
      count: result.count,
    };
  }

  /**
   * Bulk reject members
   */
  async bulkRejectMembers(
    memberIds: string[],
    rejectedBy: string,
    reason?: string,
  ) {
    const result = await this.prisma.member.updateMany({
      where: {
        id: { in: memberIds },
        status: 'Pending',
      },
      data: {
        status: 'Rejected',
      },
    });

    return {
      success: true,
      message: `${result.count} members rejected`,
      count: result.count,
      reason,
    };
  }

  /**
   * Export members data
   */
  async exportMembers(format: string = 'json') {
    const members = await this.prisma.member.findMany({
      omit: { password: true },
      include: {
        emergencyContact: true,
      },
    });

    if (format === 'csv') {
      // Convert to CSV format
      const csv = this.convertToCSV(members);
      return {
        success: true,
        format: 'csv',
        data: csv,
      };
    }

    return {
      success: true,
      format: 'json',
      count: members.length,
      data: members,
    };
  }

  // ==================== HELPER METHODS ====================

  /**
   * Generate unique membership ID
   */
  private async generateMembershipId(): Promise<string> {
    const year = new Date().getFullYear();
    let membershipId: string;
    let exists = true;

    while (exists) {
      const random = Math.floor(Math.random() * 10000)
        .toString()
        .padStart(4, '0');
      membershipId = `ALM-${year}-${random}`;

      const existing = await this.prisma.member.findUnique({
        where: { membershipId },
      });

      exists = !!existing;
    }

    return membershipId!;
  }

  /**
   * Convert data to CSV format
   */
  private convertToCSV(data: any[]): string {
    if (!data || data.length === 0) return '';

    const headers = Object.keys(data[0]);
    const rows = data.map((item) =>
      headers.map((header) => JSON.stringify(item[header] || '')).join(','),
    );

    return [headers.join(','), ...rows].join('\n');
  }
}
