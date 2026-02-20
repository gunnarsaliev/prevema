import type { Metadata } from 'next'
import { RegisterForm } from './RegisterForm'

export const metadata: Metadata = {
  title: 'Sign Up | Prevema',
  description: 'Create your Prevema account',
}

export default function RegisterPage() {
  return <RegisterForm />
}
