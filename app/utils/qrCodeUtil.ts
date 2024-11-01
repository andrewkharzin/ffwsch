import QRCode from 'qrcode'

export async function generateQRCode(data: string): Promise<string | null> {
  try {
    const qrCodeUrl = await QRCode.toDataURL(data)
    return qrCodeUrl
  } catch (error) {
    console.error('Error generating QR code:', error)
    return null
  }
}
