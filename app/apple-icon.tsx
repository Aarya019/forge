import { ImageResponse } from 'next/og'

export const size = { width: 180, height: 180 }
export const contentType = 'image/png'

export default function AppleIcon() {
  return new ImageResponse(
    <div
      style={{
        width: 180,
        height: 180,
        background: '#09090b',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <div
        style={{
          width: 100,
          height: 100,
          background: 'linear-gradient(135deg, #fb923c 0%, #ea580c 100%)',
          borderRadius: 20,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <span style={{ color: 'white', fontSize: 66, fontWeight: 900, lineHeight: 1, fontFamily: 'sans-serif' }}>
          F
        </span>
      </div>
    </div>,
    { width: 180, height: 180 },
  )
}
