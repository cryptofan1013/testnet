import { Request } from 'express'
import { AnyZodObject, z, ZodEffects } from 'zod'
import { BadRequest } from '@/errors'

export async function validate<
  T extends AnyZodObject | ZodEffects<AnyZodObject>
>(schema: T, req: Request): Promise<z.infer<T>> {
  const res = await schema.safeParseAsync(req.body)
  if (!res.success) {
    const errors: Record<string, string> = {}
    res.error.issues.forEach((i) => {
      errors[i.path[0]] = i.message
    })

    throw new BadRequest('Invalid input', errors)
  }
  return res.data
}
