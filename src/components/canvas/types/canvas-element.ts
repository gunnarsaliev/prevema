export interface CanvasElement {
  id: string
  type: 'image' | 'text' | 'image-variable' | 'text-variable' | 'shape'
  x: number
  y: number
  width?: number
  height?: number
  text?: string
  fontSize?: number
  fontFamily?: string
  fontWeight?: string
  fontStyle?: string
  fill?: string
  image?: HTMLImageElement
  imageData?: {
    src: string
    width: number
    height: number
  }
  draggable: boolean
  visible?: boolean
  rotation?: number
  aspectRatio?: number
  originalWidth?: number
  originalHeight?: number
  variableName?: string // For variable types
  variableType?: string // Specific variable type (e.g., "COMPANY_LOGO", "COMPANY_NAME")
  loadError?: boolean // Flag indicating image failed to load from imageData.src
  borderRadius?: number // Border radius for images in pixels
  shapeType?: 'square' | 'circle' | 'triangle' | 'star' // For shape elements
  stroke?: string // Stroke color for shapes
  strokeWidth?: number // Stroke width for shapes
}

export interface Template {
  id: string
  name: string
  backgroundImage: string
  width: number
  height: number
}

// Predefined variable types
export const IMAGE_VARIABLES = [
  { id: 'PROFILE_IMAGE', name: 'Profile Image', displayName: '{{PROFILE_IMAGE}}' },
  { id: 'COMPANY_LOGO', name: 'Company Logo', displayName: '{{COMPANY_LOGO}}' },
  { id: 'COMPANY_BANNER', name: 'Company Banner', displayName: '{{COMPANY_BANNER}}' },
]

export const TEXT_VARIABLES = [
  { id: 'NAME', name: 'Name', displayName: '{{NAME}}' },
  { id: 'COMPANY_NAME', name: 'Company Name', displayName: '{{COMPANY_NAME}}' },
  { id: 'PHONE_NUMBER', name: 'Phone Number', displayName: '{{PHONE_NUMBER}}' },
  { id: 'EMAIL', name: 'Email', displayName: '{{EMAIL}}' },
  { id: 'COMPANY_POSITION', name: 'Company Position', displayName: '{{COMPANY_POSITION}}' },
]
