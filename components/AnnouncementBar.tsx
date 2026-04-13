const ITEMS = [
  "Envíos a todo el país",
  "Stock limitado",
  "Pagá con Mercado Pago o Transferencia",
  "Piezas únicas — retro y de colección",
];

const SEPARATOR = "✦";

function TickerContent() {
  return (
    <>
      {ITEMS.map((item, i) => (
        <span key={i} className="inline-flex items-center gap-6 mx-6">
          <span className="text-cream-bone/30 text-[10px]">{SEPARATOR}</span>
          <span>{item}</span>
        </span>
      ))}
    </>
  );
}

export default function AnnouncementBar() {
  return (
    <div className="fixed top-0 left-0 right-0 z-[60] h-8 bg-[#0A0A0A] border-b border-cream-bone/10 overflow-hidden flex items-center">
      {/* Duplicate content for seamless loop */}
      <div className="inline-flex whitespace-nowrap animate-marquee">
        <span className="inline-flex">
          <TickerContent />
        </span>
        <span className="inline-flex" aria-hidden="true">
          <TickerContent />
        </span>
      </div>
    </div>
  );
}
