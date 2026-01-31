/**
 * Canvas element structure from image templates
 */
export interface CanvasElement {
  id: string
  type: 'image' | 'text' | 'image-variable' | 'text-variable'
  x: number
  y: number
  width: number
  height: number
  rotation?: number
  variableName?: string
  text?: string
  fontSize?: number
  fontFamily?: string
  fontWeight?: string
  color?: string
  textAlign?: 'left' | 'center' | 'right'
  imageUrl?: string
  image?: any // HTMLImageElement (client-side only)
}
