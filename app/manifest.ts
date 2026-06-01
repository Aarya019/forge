import type { MetadataRoute } from 'next'

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Forge — Personal Growth',
    short_name: 'Forge',
    description: 'Track habits, challenges, and workouts. Your personal growth dashboard.',
    start_url: '/dashboard',
    display: 'standalone',
    orientation: 'portrait',
    background_color: '#09090b',
    theme_color: '#f97316',
    categories: ['health', 'fitness', 'lifestyle'],
    icons: [
      { src: '/icon.png', sizes: '192x192', type: 'image/png', purpose: 'any' },
      { src: '/icon.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
    ],
  }
}
