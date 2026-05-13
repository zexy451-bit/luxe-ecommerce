import { Card } from "@/components/ui/card";

const testimonials = [
  {
    quote: "The cashmere is unreal. Lighter than air, but it keeps me warm in NYC winters.",
    author: "Eva R.",
    role: "Verified buyer",
  },
  {
    quote: "Service was thoughtful and the packaging felt like a gift to myself.",
    author: "Marcus W.",
    role: "Verified buyer",
  },
  {
    quote: "Found my forever trench. Every detail is exactly right.",
    author: "Hana K.",
    role: "Verified buyer",
  },
];

export function Testimonials() {
  return (
    <section className="container-wide my-24">
      <p className="mb-2 text-center text-[11px] uppercase tracking-[0.28em] text-muted-foreground">
        Customer letters
      </p>
      <h2 className="heading-display mb-12 text-center text-3xl font-light md:text-4xl">
        Words from our community
      </h2>
      <div className="grid gap-6 md:grid-cols-3">
        {testimonials.map((t) => (
          <Card key={t.author} className="p-8">
            <p className="heading-display text-xl font-light leading-snug">"{t.quote}"</p>
            <div className="mt-6 text-sm">
              <div className="font-medium">{t.author}</div>
              <div className="text-xs text-muted-foreground">{t.role}</div>
            </div>
          </Card>
        ))}
      </div>
    </section>
  );
}
