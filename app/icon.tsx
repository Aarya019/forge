import { ImageResponse } from 'next/og'

export const size = { width: 192, height: 192 }
export const contentType = 'image/png'

export default function Icon() {
  return new ImageResponse(
    <div
      style={{
        width: 192,
        height: 192,
        background: '#09090b',
        borderRadius: 38,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <div
        style={{
          width: 110,
          height: 110,
          background: 'linear-gradient(135deg, #fb923c 0%, #ea580c 100%)',
          borderRadius: 22,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <span
          style={{
            color: 'white',
            fontSize: 72,
            fontWeight: 900,
            lineHeight: 1,
            fontFamily: 'sans-serif',
          }}
        >
          F
        </span>
      </div>
    </div>,
    { width: 192, height: 192 },
  )
}
