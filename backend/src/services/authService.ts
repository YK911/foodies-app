import bcrypt from 'bcryptjs';
import { Prisma } from '@prisma/client';
import createHttpError from 'http-errors';
import { prisma } from '../db/prisma.js';
import { createSessionToken } from '../utils/auth.js';
import type { LoginInput, RegisterInput } from '../validation/authSchemas.js';

const PASSWORD_SALT_ROUNDS = 10;

const authUserSelect = {
  id: true,
  name: true,
  email: true,
  avatar: true,
} satisfies Prisma.UserSelect;

type AuthUser = Prisma.UserGetPayload<{ select: typeof authUserSelect }>;
type SessionClient = Pick<Prisma.TransactionClient, 'session'>;

interface AuthResult {
  user: AuthUser;
  token: string;
}

const createSession = async (client: SessionClient, userId: string): Promise<string> => {
  const { sessionId, token, expiresAt } = createSessionToken(userId);

  await client.session.create({
    data: {
      id: sessionId,
      userId,
      expiresAt,
    },
  });

  return token;
};

export const registerUser = async (input: RegisterInput): Promise<AuthResult> => {
  const existingUser = await prisma.user.findUnique({
    where: { email: input.email },
    select: { id: true },
  });

  if (existingUser) {
    throw createHttpError(409, 'Email is already in use');
  }

  const hashedPassword = await bcrypt.hash(input.password, PASSWORD_SALT_ROUNDS);

  try {
    return await prisma.$transaction(async (transaction) => {
      const user = await transaction.user.create({
        data: {
          name: input.name,
          email: input.email,
          password: hashedPassword,
        },
        select: authUserSelect,
      });
      const token = await createSession(transaction, user.id);

      return { user, token };
    });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
      throw createHttpError(409, 'Email is already in use');
    }

    throw error;
  }
};

export const loginUser = async (input: LoginInput): Promise<AuthResult> => {
  const user = await prisma.user.findUnique({
    where: { email: input.email },
    select: {
      ...authUserSelect,
      password: true,
    },
  });

  if (!user || !(await bcrypt.compare(input.password, user.password))) {
    throw createHttpError(401, 'Email or password is incorrect');
  }

  const { password: _password, ...authUser } = user;
  const token = await createSession(prisma, user.id);

  return { user: authUser, token };
};
