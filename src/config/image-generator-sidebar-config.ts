import {
  Palette,
  Type,
  Image as ImageIcon,
  Shapes,
  Variable,
  Settings,
  Layers,
} from 'lucide-react'
import type { DubSidebarConfig } from '@/components/layout/dub-sidebar'

export const imageGeneratorSidebarConfig: DubSidebarConfig = {
  railIcons: [
    { moduleId: 'design', label: 'Design', icon: Palette, defaultPath: '/image-generator' },
  ],
  modules: [
    {
      id: 'design',
      label: 'Design Tools',
      icon: Palette,
      defaultPath: '/image-generator',
      sections: [
        {
          id: 'tools',
          label: 'Tools',
          items: [
            { id: 'text', label: 'Add Text', icon: Type, path: '/image-generator' },
            { id: 'image', label: 'Add Image', icon: ImageIcon, path: '/image-generator' },
            { id: 'shapes', label: 'Add Shapes', icon: Shapes, path: '/image-generator' },
            { id: 'text-variables', label: 'Text Variables', icon: Variable, path: '/image-generator' },
            { id: 'image-variables', label: 'Image Variables', icon: Variable, path: '/image-generator' },
          ],
        },
        {
          id: 'canvas',
          label: 'Canvas Settings',
          items: [
            { id: 'canvas-size', label: 'Canvas Size', icon: Settings, path: '/image-generator' },
            { id: 'background', label: 'Background', icon: Palette, path: '/image-generator' },
          ],
        },
        {
          id: 'layers',
          label: 'Layers',
          items: [
            { id: 'layer-management', label: 'Manage Layers', icon: Layers, path: '/image-generator' },
          ],
        },
      ],
    },
  ],
  utilities: [],
}
