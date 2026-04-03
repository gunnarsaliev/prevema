import {
  Palette,
  Type,
  Image as ImageIcon,
  Shapes,
  Variable,
  Settings,
  Layers,
  Paintbrush,
} from 'lucide-react'
import type { DubSidebarConfig } from '@/components/layout/dub-sidebar'

export const imageGeneratorSidebarConfig: DubSidebarConfig = {
  railIcons: [
    { moduleId: 'design-tools', label: 'Design Tools', icon: Palette, defaultPath: '/image-generator' },
    { moduleId: 'canvas-settings', label: 'Canvas Settings', icon: Settings, defaultPath: '/image-generator' },
    { moduleId: 'background-colors', label: 'Background Colors', icon: Paintbrush, defaultPath: '/image-generator' },
    { moduleId: 'layers', label: 'Layers', icon: Layers, defaultPath: '/image-generator' },
  ],
  modules: [
    {
      id: 'design-tools',
      label: 'Design Tools',
      icon: Palette,
      defaultPath: '/image-generator',
      sections: [],
    },
    {
      id: 'canvas-settings',
      label: 'Canvas Settings',
      icon: Settings,
      defaultPath: '/image-generator',
      sections: [],
    },
    {
      id: 'background-colors',
      label: 'Background Colors',
      icon: Paintbrush,
      defaultPath: '/image-generator',
      sections: [],
    },
    {
      id: 'layers',
      label: 'Layers',
      icon: Layers,
      defaultPath: '/image-generator',
      sections: [],
    },
  ],
  utilities: [],
}
