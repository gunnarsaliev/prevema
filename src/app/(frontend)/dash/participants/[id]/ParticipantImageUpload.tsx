'use client'

import { ImageDropzone } from '@/components/ImageDropzone'
import { uploadParticipantImage } from './actions'

type ParticipantImageUploadProps = {
  participantId: string
}

export function ParticipantImageUpload({ participantId }: ParticipantImageUploadProps) {
  const handleUpload = async (file: File) => {
    const formData = new FormData()
    formData.append('image', file)

    const result = await uploadParticipantImage(participantId, formData)
    return result
  }

  return <ImageDropzone onUpload={handleUpload} />
}
