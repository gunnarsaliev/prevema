import archiver from 'archiver'
import { Readable } from 'stream'

/**
 * Image data for ZIP archive
 */
export interface ImageForZip {
  buffer: Buffer
  fileName: string
}

/**
 * Service for creating ZIP archives of generated images
 */
export class ZipArchiveService {
  /**
   * Create ZIP archive from multiple image buffers
   * Uses streaming for memory efficiency
   * @param images - Array of image buffers with filenames
   * @returns Promise resolving to ZIP buffer
   */
  async createZip(images: ImageForZip[]): Promise<Buffer> {
    return new Promise((resolve, reject) => {
      // Create archiver instance with maximum compression
      const archive = archiver('zip', {
        zlib: { level: 9 }, // Maximum compression
      })

      // Array to collect chunks
      const chunks: Buffer[] = []

      // Collect data chunks
      archive.on('data', (chunk: Buffer) => {
        chunks.push(chunk)
      })

      // Handle completion
      archive.on('end', () => {
        const buffer = Buffer.concat(chunks)
        resolve(buffer)
      })

      // Handle errors
      archive.on('error', (err: Error) => {
        reject(new Error(`ZIP creation failed: ${err.message}`))
      })

      // Add each image to the archive
      for (const image of images) {
        // Create a readable stream from the buffer
        const stream = Readable.from(image.buffer)
        archive.append(stream, { name: image.fileName })
      }

      // Finalize the archive (this triggers the 'end' event)
      archive.finalize()
    })
  }

  /**
   * Generate filename for ZIP archive
   * Format: template-name-YYYYMMDD-HHMMSS.zip
   * @param templateName - Name of the template used
   * @returns ZIP filename string
   */
  generateZipFilename(templateName: string): string {
    const sanitizedTemplateName = this.sanitizeFilename(templateName)
    const timestamp = this.formatTimestamp(new Date())

    return `${sanitizedTemplateName}-${timestamp}.zip`
  }

  /**
   * Generate filename for individual participant image
   * Pattern: {participantName}-{templateName}-{timestamp}.png
   * @param participantName - Name of the participant
   * @param templateName - Name of the template
   * @returns Image filename string
   */
  generateImageFilename(participantName: string, templateName: string): string {
    const sanitizedParticipantName = this.sanitizeFilename(participantName)
    const sanitizedTemplateName = this.sanitizeFilename(templateName)
    const timestamp = Date.now()

    return `${sanitizedParticipantName}-${sanitizedTemplateName}-${timestamp}.png`
  }

  /**
   * Sanitize a string for use in filenames
   * Removes special characters and replaces with dashes
   * @param name - String to sanitize
   * @returns Sanitized string safe for filenames
   */
  private sanitizeFilename(name: string): string {
    return name
      .replace(/[^a-zA-Z0-9-_]/g, '-') // Replace special chars with dash
      .replace(/-+/g, '-') // Replace multiple dashes with single dash
      .replace(/^-|-$/g, '') // Remove leading/trailing dashes
      .toLowerCase()
  }

  /**
   * Format timestamp for filename
   * Format: YYYYMMDD-HHMMSS
   * @param date - Date to format
   * @returns Formatted timestamp string
   */
  private formatTimestamp(date: Date): string {
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const day = String(date.getDate()).padStart(2, '0')
    const hours = String(date.getHours()).padStart(2, '0')
    const minutes = String(date.getMinutes()).padStart(2, '0')
    const seconds = String(date.getSeconds()).padStart(2, '0')

    return `${year}${month}${day}-${hours}${minutes}${seconds}`
  }
}
