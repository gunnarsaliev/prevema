import type { Metadata } from 'next'
import { LoginForm } from './LoginForm'

export const metadata: Metadata = {
  title: 'Login | Prevema',
  description: 'Login to your Prevema account',
}

export default function LoginPage() {
  return <LoginForm />
}
