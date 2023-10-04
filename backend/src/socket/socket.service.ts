import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { UserService } from 'src/user/user.service';

@Injectable()
export class SocketService {
  private userSocketMap = new Map<string, number>();

  constructor(private readonly userService: UserService) {}

  async registerOnlineUser(userId: number, socketId: string): Promise<void> {
    if (!userId) {
      throw new InternalServerErrorException(`Query param 'userId' is missing`);
    }
    console.log(this.userSocketMap);
    this.userSocketMap.set(socketId, userId);
    const user = await this.userService.getUserById(+userId);
    await this.userService.updateUser(user, { isOnline: true });
    console.log(this.userSocketMap);
  }

  async disconnectUser(socketId: string): Promise<void> {
    console.log(this.userSocketMap);
    const userId = this.getUserId(socketId);
    if (!userId) {
      throw new InternalServerErrorException(
        'userId is not found in socket map',
      );
    }
    const user = await this.userService.getUserById(userId);
    await this.userService.updateUser(user, { isOnline: false });
    this.userSocketMap.delete(socketId);
    console.log(this.userSocketMap);
  }

  getUserId(socketId: string): number {
    console.log(this.userSocketMap);
    const userId = this.userSocketMap.get(socketId);
    if (!userId)
      throw new InternalServerErrorException(
        'userId is not found in socket map',
      );
    return userId;
  }

  getSocketIds(userId: number): string[] {
    const socketIds: string[] = [];

    for (const [key, value] of this.userSocketMap.entries()) {
      if (value === userId) {
        socketIds.push(key);
      }
    }
    return socketIds;
  }
}
