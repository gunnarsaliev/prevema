'use server'

type Member = {
  id: string
  user: { id: string; name: string; email: string }
  role: string
  status: string
  createdAt: string
}

export async function getOrganizationMembers(): Promise<{ success: boolean; members: Member[] }> {
  return { success: true, members: [] }
}

export async function createInvitation(
  _formData: FormData,
): Promise<{ success: boolean; message: string; error?: string }> {
  return { success: false, message: '', error: 'Not implemented' }
}
