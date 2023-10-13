import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { ChatSharedService } from '../shared/chat-shared.service';
import {
  ChannelMember,
  ChannelMemberRoles,
  ChannelUserRestriction,
  ChannelUserRestrictionTypes,
} from '@prisma/client';
import {
  RestrictionDto,
  ShowUsersRestrictions,
  ShowUsersRolesRestrictions,
  UpdateRoleDto,
} from './dto';
import { extendedChannel } from './types';
import { UserService } from 'src/user/user.service';

@Injectable()
export class AdminService {
  constructor(
    private prisma: PrismaService,
    private readonly chatSharedService: ChatSharedService,
    private readonly userService: UserService,
  ) {}

  async getChannelUsersAsAdmin(
    channelId: number,
    adminId: number,
  ): Promise<ShowUsersRolesRestrictions> {
    await this.ensureUserIsAdmin(channelId, adminId);

    const channelUsers = await this.prisma.user.findMany({
      where: { followingChannels: { some: { channelId: channelId } } },
    });

    const usersProps = await Promise.all(
      channelUsers.map(async (user) => {
        const channel = await this.getUserRoleRestriction(channelId, user.id);
        return { user, channel };
      }),
    );

    return ShowUsersRolesRestrictions.from(usersProps);
  }

  async getRestrictedUsers(
    channelId: number,
    adminId: number,
  ): Promise<ShowUsersRestrictions> {
    await this.ensureUserIsAdmin(channelId, adminId);

    const allRestrictions = await this.prisma.channelUserRestriction.findMany({
      where: { restrictedChannelId: channelId },
    });

    const usersProps = await Promise.all(
      allRestrictions.map(async (restriction) => {
        const user = await this.userService.getUserById(
          restriction.restrictedUserId,
        );
        return { restriction, user };
      }),
    );

    return ShowUsersRestrictions.from(usersProps);
  }

  async addUserToChannel(
    channelId: number,
    adminId: number,
    username: string,
  ): Promise<ChannelMember> {
    await this.ensureUserIsAdmin(channelId, adminId);
    const user = await this.userService.getUserByName(username);

    await this.verifyAccessPermission(channelId, user.id);

    const addUser = {
      userId: user.id,
      channelId,
      role: ChannelMemberRoles.USER,
    };

    const newMembership = await this.chatSharedService.addUser(addUser);
    return newMembership;
  }

  async createOrUpdateRestriction(
    channelId: number,
    username: string,
    adminId: number,
    restrictionDto: RestrictionDto,
  ): Promise<ChannelUserRestriction> {
    const userId = await this.validateAdminAction(channelId, username, adminId);
    if (
      restrictionDto.restrictionType === ChannelUserRestrictionTypes.BANNED &&
      (await this.userIsOnChannel(channelId, userId))
    ) {
      await this.chatSharedService.deleteUserFromChannel(channelId, userId);
    }

    let restriction: ChannelUserRestriction;
    if (restrictionDto.actionType === 'create') {
      restriction = await this.createRestriction(
        channelId,
        userId,
        restrictionDto,
      );
    } else if (restrictionDto.actionType === 'update') {
      restriction = await this.updateRestriction(
        channelId,
        userId,
        restrictionDto,
      );
    } else {
      throw new InternalServerErrorException(
        'Error while creating/updating user restriction',
      );
    }
    return restriction;
  }

  async updateRole(
    channelId: number,
    username: string,
    adminId: number,
    updateRole: UpdateRoleDto,
  ): Promise<ChannelMember> {
    const userId = await this.validateAdminAction(channelId, username, adminId);

    const membership = await this.prisma.channelMember.update({
      where: { userId_channelId: { userId, channelId } },
      data: { ...updateRole },
    });

    return membership;
  }

  async liberateUser(
    channelId: number,
    username: string,
    adminId: number,
  ): Promise<void> {
    await this.ensureUserIsAdmin(channelId, adminId);
    const user = await this.userService.getUserByName(username);

    await this.prisma.channelUserRestriction.delete({
      where: {
        restrictedUserId_restrictedChannelId: {
          restrictedUserId: user.id,
          restrictedChannelId: channelId,
        },
      },
    });
  }

  async kickUser(
    channelId: number,
    username: string,
    adminId: number,
  ): Promise<void> {
    const userId = await this.validateAdminAction(channelId, username, adminId);

    await this.chatSharedService.deleteUserFromChannel(channelId, userId);
  }

  private async createRestriction(
    restrictedChannelId: number,
    restrictedUserId: number,
    createRestrictionDto: RestrictionDto,
  ): Promise<ChannelUserRestriction> {
    const newRestriction = await this.prisma.channelUserRestriction.create({
      data: {
        restrictedChannelId,
        restrictedUserId,
        restrictionType: createRestrictionDto.restrictionType,
        duration: createRestrictionDto.duration,
      },
    });
    return newRestriction;
  }

  private async updateRestriction(
    restrictedChannelId: number,
    restrictedUserId: number,
    updateRestrictionDto: RestrictionDto,
  ): Promise<ChannelUserRestriction> {
    const updatedRestriction = await this.prisma.channelUserRestriction.update({
      where: {
        restrictedUserId_restrictedChannelId: {
          restrictedUserId,
          restrictedChannelId,
        },
      },
      data: {
        restrictionType: updateRestrictionDto.restrictionType,
        duration: updateRestrictionDto.duration,
      },
    });
    return updatedRestriction;
  }

  private async verifyAccessPermission(
    channelId: number,
    userId: number,
  ): Promise<void> {
    const restriction = await this.prisma.channelUserRestriction.findUnique({
      where: {
        restrictedUserId_restrictedChannelId: {
          restrictedChannelId: channelId,
          restrictedUserId: userId,
        },
        restrictionType: ChannelUserRestrictionTypes.BANNED,
      },
    });
    if (restriction)
      throw new BadRequestException(
        `User with id: '${userId}' is banned on this channel (ID: ${channelId})`,
      );
  }

  private async validateAdminAction(
    channelId: number,
    username: string,
    adminId: number,
  ): Promise<number> {
    await this.ensureUserIsAdmin(channelId, adminId);
    const user = await this.userService.getUserByName(username);
    await this.ensureUserIsNotCreator(channelId, user.id);
    await this.chatSharedService.ensureUserIsMember(channelId, user.id);
    return user.id;
  }

  private async ensureUserIsAdmin(
    channelId: number,
    adminId: number,
  ): Promise<void> {
    const adminship = await this.prisma.channelMember.findUnique({
      where: {
        userId_channelId: { userId: adminId, channelId },
        role: ChannelMemberRoles.ADMIN,
      },
    });
    if (!adminship)
      throw new ForbiddenException(
        `User with id: '${adminId}' is not Admin of  of this channel (ID:${channelId})`,
      );
  }

  private async ensureUserIsNotCreator(
    channelId: number,
    userId: number,
  ): Promise<void> {
    const channel = await this.prisma.channel.findUnique({
      where: { id: channelId, creatorId: userId },
    });
    if (channel)
      throw new BadRequestException(
        `User with id: '${userId}' the creator of this channel (ID: ${channelId})`,
      );
  }

  private async getUserRoleRestriction(
    channelId: number,
    userId: number,
  ): Promise<extendedChannel> {
    const props = await this.prisma.channel.findUnique({
      where: { id: channelId },
      include: {
        channelUsers: { where: { userId } },
        restrictedUsers: { where: { restrictedUserId: userId } },
      },
    });

    if (!props)
      throw new InternalServerErrorException(
        'Error when Getting Users Details for Admin',
      );
    return props;
  }

  private async userIsOnChannel(channelId: number, userId: number) {
    const user = await this.prisma.channelMember.findUnique({
      where: { userId_channelId: { userId, channelId } },
    });
    return !user ? false : true;
  }
}
