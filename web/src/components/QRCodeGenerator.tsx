interface QRCodeGeneratorProps {
  value: string;
  size?: number;
  className?: string;
}

export function QRCodeGenerator({ value, size = 200, className = '' }: QRCodeGeneratorProps) {
  // Por ahora usamos un placeholder visual
  // TODO: Integrar una librería de QR como 'qrcode.react' cuando esté disponible
  return (
    <div 
      className={`border-4 border-gray-300 bg-white p-4 rounded-lg ${className}`}
      style={{ width: size, height: size }}
    >
      <div className="w-full h-full bg-gray-100 rounded flex items-center justify-center">
        <div className="text-center p-4">
          <div className="text-xs font-mono text-gray-600 break-all">
            {value}
          </div>
          <p className="text-xs text-gray-400 mt-2">
            QR Code
          </p>
        </div>
      </div>
    </div>
  );
}
