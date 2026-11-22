import Joi from 'joi';

export interface RegisterInput {
  name: string;
  email: string;
  password: string;
}

export interface LoginInput {
  email: string;
  password: string;
}

const emailSchema = Joi.string().trim().lowercase().email().required();
const passwordSchema = Joi.string().min(6).max(128).required();

export const registerSchema = Joi.object<RegisterInput>({
  name: Joi.string().trim().min(2).max(50).required(),
  email: emailSchema,
  password: passwordSchema,
});

export const loginSchema = Joi.object<LoginInput>({
  email: emailSchema,
  password: passwordSchema,
});
