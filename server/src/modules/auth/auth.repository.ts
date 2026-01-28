import prisma from "@/infra/database/database.config";
import { ROLE } from "@prisma/client";

export class AuthRepository {
  async findUserByEmail(email: string) {
    return prisma.user.findUnique({
      where: { email },
    });
  }

  async findUserByEmailWithPassword(email: string) {
    return prisma.user.findUnique({
      where: { email },
      select: {
        id: true,
        password: true,
        role: true,
        name: true,
        email: true,
        avatar: true,
      },
    });
  }

  async findUserById(id: string) {
    return prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        avatar: true,
      },
    });
  }

  async createUser(data: {
    email: string;
    name: string;
    password: string;
    role: ROLE;
  }) {
    return prisma.user.create({
      data,
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        avatar: true,
      },
    });
  }

  async updateUserEmailVerification(
    userId: string,
    data: {
      emailVerificationToken: string | null;
      emailVerificationTokenExpiresAt: Date | null;
      emailVerified?: boolean;
    }
  ) {
    return prisma.user.update({
      where: { id: userId },
      data,
    });
  }

  async updateUserPasswordReset(
    email: string,
    data: {
      resetPasswordToken?: string | null;
      resetPasswordTokenExpiresAt?: Date | null;
      password?: string;
    }
  ) {
    return prisma.user.update({
      where: { email },
      data,
    });
  }

  async findUserByResetToken(hashedToken: string) {
    return prisma.user.findFirst({
      where: {
        resetPasswordToken: hashedToken,
        resetPasswordTokenExpiresAt: { gt: new Date() },
      },
    });
  }

  async updateUserPassword(userId: string, password: string) {
    return prisma.user.update({
      where: { id: userId },
      data: {
        password,
        resetPasswordToken: null,
        resetPasswordTokenExpiresAt: null,
      },
    });
  }

  async findOrCreateSocialUser(data: {
    email: string;
    name: string;
    googleId?: string;
    facebookId?: string;
    avatar?: string;
  }) {
    const user = await prisma.user.findUnique({
      where: { email: data.email },
    });

    if (user) {
      return prisma.user.update({
        where: { email: data.email },
        data: {
          googleId: data.googleId || user.googleId,
          facebookId: data.facebookId || user.facebookId,
          avatar: data.avatar || user.avatar,
        },
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          avatar: true,
        },
      });
    }

    return prisma.user.create({
      data: {
        email: data.email,
        name: data.name,
        googleId: data.googleId,
        facebookId: data.facebookId,
        avatar: data.avatar,
        role: ROLE.USER,
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        avatar: true,
      },
    });
  }
}
