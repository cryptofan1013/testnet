import { getError } from '../httpClient'
import { z } from 'zod'
import {
  httpClient,
  type ErrorResponse,
  type SuccessResponse
} from '../httpClient'
import { ACCEPTED_IMAGE_TYPES } from '@/utils/constants'

export const signUpSchema = z
  .object({
    email: z.string().email({ message: 'Email is required' }),
    password: z
      .string()
      .min(6, { message: 'Password should be at least 6 characters long' }),
    confirmPassword: z.string()
  })
  .superRefine(({ confirmPassword, password }, ctx) => {
    if (confirmPassword !== password) {
      ctx.addIssue({
        code: 'custom',
        message: 'Passwords must match',
        path: ['confirmPassword']
      })
    }
  })

export const loginSchema = z.object({
  email: z.string().email({ message: 'Email is required' }),
  password: z.string().min(1, { message: 'Password is required' })
})

export const personalDetailsSchema = z.object({
  firstName: z.string().min(1, { message: 'First name is required' }),
  lastName: z.string().min(1, { message: 'Last name is required' }),
  country: z.object({
    value: z.string().length(2),
    label: z.string().min(1)
  }),
  city: z.string().min(1, { message: 'City is required' }),
  address: z.string().min(1, { message: 'Address is required' }),
  zip: z.string().min(1, { message: 'ZIP code is required' })
})

export const profileSchema = z.object({
  firstName: z.string().min(1, { message: 'First name is required' }),
  lastName: z.string().min(1, { message: 'Last name is required' })
})

export const verifyIdentitySchema = z
  .object({
    documentType: z.string({
      invalid_type_error: 'Please select an ID Type'
    }),
    frontSideImage: z
      .string()
      .min(1, { message: 'Front side of ID is required' }),
    frontSideImageType: z.string(),
    backSideImage: z.string().optional(),
    backSideImageType: z.string().optional(),
    faceImage: z.string().min(1, { message: 'A selfie image is required' }),
    faceImageType: z.string()
  })
  .superRefine(
    ({ frontSideImageType, faceImageType, backSideImageType }, ctx) => {
      if (!ACCEPTED_IMAGE_TYPES.includes(frontSideImageType)) {
        ctx.addIssue({
          code: 'custom',
          message: `Image must be 'jpeg' or 'png'`,
          path: ['frontSideImage']
        })
      }
      if (!ACCEPTED_IMAGE_TYPES.includes(faceImageType)) {
        ctx.addIssue({
          code: 'custom',
          message: `Image must be 'jpeg' or 'png'`,
          path: ['faceImage']
        })
      }
      if (
        backSideImageType &&
        backSideImageType?.length > 0 &&
        !ACCEPTED_IMAGE_TYPES.includes(backSideImageType)
      ) {
        ctx.addIssue({
          code: 'custom',
          message: `Image must be 'jpeg' or 'png'`,
          path: ['backSideImage']
        })
      }
    }
  )

export type UserData = {
  email: string
  firstName: string
  lastName: string
  address: string
  noKyc: boolean
}

type SignUpArgs = z.infer<typeof signUpSchema>
type SignUpError = ErrorResponse<SignUpArgs | undefined>
type SignUpResponse = Promise<SuccessResponse | SignUpError>

type LoginArgs = z.infer<typeof loginSchema>
type LoginError = ErrorResponse<LoginArgs | undefined>
type LoginResponse = Promise<SuccessResponse | LoginError>

type MeResult = SuccessResponse<UserData>
type MeResponse = Promise<MeResult | ErrorResponse>

type CreateWalletArgs = z.infer<typeof personalDetailsSchema>
type CreateWalletError = ErrorResponse<CreateWalletArgs | undefined>
type CreateWalletResponse = Promise<SuccessResponse | CreateWalletError>

type VerifyIdentityArgs = z.infer<typeof verifyIdentitySchema>
type VerifyIdentityError = ErrorResponse<VerifyIdentityArgs | undefined>
type VerifyIdentityResponse = Promise<SuccessResponse | VerifyIdentityError>

type ProfileArgs = z.infer<typeof profileSchema>
type ProfileError = ErrorResponse<ProfileArgs | undefined>
type ProfileResponse = Promise<SuccessResponse | ProfileError>

interface UserService {
  signUp: (args: SignUpArgs) => Promise<SignUpResponse>
  login: (args: LoginArgs) => Promise<LoginResponse>
  me: (cookies?: string) => Promise<MeResponse>
  createWallet: (args: CreateWalletArgs) => Promise<CreateWalletResponse>
  verifyIdentity: (args: VerifyIdentityArgs) => Promise<VerifyIdentityResponse>
  updateProfile: (args: ProfileArgs) => Promise<ProfileResponse>
}

const createUserService = (): UserService => ({
  async signUp(args): Promise<SignUpResponse> {
    try {
      const response = await httpClient
        .post('signup', {
          json: args
        })
        .json<SuccessResponse>()
      return response
    } catch (error) {
      return getError<SignUpArgs>(
        error,
        'We could not create your account. Please try again.'
      )
    }
  },

  async login(args): Promise<LoginResponse> {
    try {
      const response = await httpClient
        .post('login', {
          json: args
        })
        .json<SuccessResponse>()
      return response
    } catch (error) {
      return getError<LoginArgs>(
        error,
        'We could not log you in. Please try again.'
      )
    }
  },

  async me(cookies): Promise<MeResponse> {
    try {
      const response = await httpClient
        .get('me', {
          headers: {
            ...(cookies ? { Cookie: cookies } : {})
          }
        })
        .json<MeResult>()
      return response
    } catch (error) {
      return getError(error, 'Unable to retrive user information.')
    }
  },

  async createWallet(args: CreateWalletArgs): Promise<CreateWalletResponse> {
    try {
      const response = await httpClient
        .post('wallet', {
          json: {
            ...args,
            country: args.country.value
          }
        })
        .json<SuccessResponse>()
      return response
    } catch (error) {
      return getError<CreateWalletArgs>(
        error,
        'Something went wrong while trying to create your wallet. Please try again.'
      )
    }
  },

  async verifyIdentity(
    args: VerifyIdentityArgs
  ): Promise<VerifyIdentityResponse> {
    try {
      const response = await httpClient
        .post('verify', {
          json: args
        })
        .json<SuccessResponse>()
      return response
    } catch (error) {
      return getError<VerifyIdentityArgs>(
        error,
        'Something went wrong while verifying your ID. Please try again.'
      )
    }
  },

  async updateProfile(args: ProfileArgs): Promise<ProfileResponse> {
    try {
      const response = await httpClient
        .post('updateProfile', {
          json: args
        })
        .json<SuccessResponse>()
      return response
    } catch (error) {
      return getError<ProfileArgs>(
        error,
        'Something went wrong while updating your profile. Please try again.'
      )
    }
  }
})

export const userService = createUserService()
