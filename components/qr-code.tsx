import { qrSvg } from '@/lib/server/exhibitors';

/** QR code renderizado no servidor como SVG inline. */
export async function QrCode({ value, size = 180 }: { value: string; size?: number }) {
  const svg = await qrSvg(value);
  return (
    <div
      className="overflow-hidden rounded-xl border border-bid-text/10 bg-white p-2"
      style={{ width: size, height: size }}
      // SVG gerado pela lib qrcode a partir de URL nossa — sem conteúdo do usuário.
      dangerouslySetInnerHTML={{ __html: svg.replace('<svg ', '<svg width="100%" height="100%" ') }}
    />
  );
}
