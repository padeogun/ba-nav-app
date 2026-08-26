'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { z } from 'zod'
import { createClient } from '@/lib/supabase/server'

const LoginSchema = z.object({
  email: z.email({ error: 'Enter a valid email address.' }),
  password: z.string().min(1, { error: 'Password is required.' }),
})

const SignupSchema = z.object({
  name: z.string().min(2, { error: 'Name must be at least 2 characters.' }).trim(),
  email: z.email({ error: 'Enter a valid email address.' }),
  password: z
    .string()
    .min(8, { error: 'Must be at least 8 characters.' })
    .regex(/[a-zA-Z]/, { error: 'Must contain at least one letter.' })
    .regex(/[0-9]/, { error: 'Must contain at least one number.' }),
})

export type AuthState =
  | { errors?: Record<string, string[]>; message?: string }
  | undefined

export async function login(state: AuthState, formData: FormData): Promise<AuthState> {
  const validated = LoginSchema.safeParse({
    email: formData.get('email'),
    password: formData.get('password'),
  })

  if (!validated.success) {
    return { errors: validated.error.flatten().fieldErrors as Record<string, string[]> }
  }

  const supabase = await createClient()
  const { error } = await supabase.auth.signInWithPassword(validated.data)

  if (error) {
    return { message: error.message }
  }

  revalidatePath('/', 'layout')
  redirect('/dashboard')
}

export async function signup(state: AuthState, formData: FormData): Promise<AuthState> {
  const validated = SignupSchema.safeParse({
    name: formData.get('name'),
    email: formData.get('email'),
    password: formData.get('password'),
  })

  if (!validated.success) {
    return { errors: validated.error.flatten().fieldErrors as Record<string, string[]> }
  }

  const supabase = await createClient()
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://ba-nav-app.vercel.app'
  const { error } = await supabase.auth.signUp({
    email: validated.data.email,
    password: validated.data.password,
    options: {
      data: { name: validated.data.name },
      emailRedirectTo: `${siteUrl}/auth/callback`,
    },
  })

  if (error) {
    return { message: error.message }
  }

  revalidatePath('/', 'layout')
  redirect('/check-email')
}

export async function logout() {
  const supabase = await createClient()
  await supabase.auth.signOut()
  revalidatePath('/', 'layout')
  redirect('/login')
}
