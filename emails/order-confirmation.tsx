import {
  Body,
  Button,
  Column,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Img,
  Link,
  Preview,
  Row,
  Section,
  Text,
} from "@react-email/components";
import * as React from "react";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------
export interface OrderLineItem {
  name: string;
  variant?: string | null;
  quantity: number;
  unitPrice: number;
  lineTotal: number;
  imageUrl?: string | null;
}

export interface OrderConfirmationEmailProps {
  customerName: string;
  customerEmail: string;
  orderNumber: string;
  orderDate: string; // ISO or formatted
  items: OrderLineItem[];
  subtotal: number;
  discount?: number;
  couponCode?: string | null;
  shippingFee: number;
  tax?: number;
  codFee?: number;
  total: number;
  currencySymbol?: string;
  paymentMethod: string;
  paymentStatus?: string;
  shippingAddress: {
    fullName?: string;
    line1: string;
    line2?: string | null;
    city: string;
    state: string;
    postalCode: string;
    country: string;
    phone?: string;
  };
  estimatedDelivery: string;
  trackOrderUrl: string;
  supportEmail: string;
  supportPhone?: string;
  storeName?: string;
  storeAddress?: string;
  storeLogoUrl?: string;
  baseUrl?: string;
}

// ---------------------------------------------------------------------------
// Subject + preview
// ---------------------------------------------------------------------------
export const orderConfirmationSubject = (orderNumber?: string) =>
  orderNumber
    ? `Your order ${orderNumber} has been confirmed`
    : "Your order has been confirmed";

// ---------------------------------------------------------------------------
// Style tokens (inline — for maximum email-client compatibility)
// ---------------------------------------------------------------------------
const colors = {
  bg: "#faf7f2",
  card: "#ffffff",
  fg: "#15110d",
  muted: "#8a8077",
  hairline: "#ece5d8",
  gold: "#c8a96a",
  goldDark: "#a78a52",
  inkSoft: "#3d3730",
} as const;

const serifStack =
  '"Cormorant Garamond", "Times New Roman", Georgia, "Bodoni MT", serif';
const sansStack =
  '-apple-system, BlinkMacSystemFont, "Helvetica Neue", Helvetica, Arial, "Segoe UI", sans-serif';

const fmt = (n: number, sym: string) =>
  `${sym} ${(Number(n) || 0).toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------
export const OrderConfirmationEmail: React.FC<OrderConfirmationEmailProps> = ({
  customerName,
  customerEmail,
  orderNumber,
  orderDate,
  items,
  subtotal,
  discount = 0,
  couponCode,
  shippingFee,
  tax = 0,
  codFee = 0,
  total,
  currencySymbol = "Rs.",
  paymentMethod,
  paymentStatus,
  shippingAddress,
  estimatedDelivery,
  trackOrderUrl,
  supportEmail,
  supportPhone,
  storeName = "Luxe",
  storeAddress,
  storeLogoUrl,
  baseUrl,
}) => {
  const formattedDate = (() => {
    const d = new Date(orderDate);
    if (Number.isNaN(d.getTime())) return orderDate;
    return d.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  })();

  return (
    <Html lang="en">
      <Head>
        <meta name="color-scheme" content="light only" />
        <meta name="supported-color-schemes" content="light" />
      </Head>
      <Preview>
        Order {orderNumber} confirmed · {fmt(total, currencySymbol)} · {estimatedDelivery}
      </Preview>

      <Body
        style={{
          backgroundColor: colors.bg,
          fontFamily: sansStack,
          margin: 0,
          padding: 0,
          color: colors.fg,
          WebkitFontSmoothing: "antialiased",
        }}
      >
        <Container
          style={{
            maxWidth: 620,
            margin: "0 auto",
            padding: "32px 16px",
          }}
        >
          {/* Brand bar */}
          <Section style={{ textAlign: "center", padding: "8px 0 24px" }}>
            {storeLogoUrl ? (
              <Img
                src={storeLogoUrl}
                alt={storeName}
                height={32}
                style={{ display: "inline-block" }}
              />
            ) : (
              <Text
                style={{
                  fontFamily: serifStack,
                  fontSize: 28,
                  letterSpacing: "0.04em",
                  margin: 0,
                  color: colors.fg,
                  fontWeight: 500,
                }}
              >
                {storeName}
              </Text>
            )}
          </Section>

          {/* Card */}
          <Section
            style={{
              backgroundColor: colors.card,
              borderRadius: 18,
              border: `1px solid ${colors.hairline}`,
              padding: "44px 40px",
            }}
          >
            {/* Eyebrow */}
            <Text
              style={{
                margin: 0,
                fontSize: 10,
                letterSpacing: "0.3em",
                textTransform: "uppercase",
                color: colors.muted,
              }}
            >
              Order confirmed
            </Text>

            {/* Heading */}
            <Heading
              as="h1"
              style={{
                fontFamily: serifStack,
                fontWeight: 400,
                fontSize: 38,
                lineHeight: 1.1,
                margin: "12px 0 16px",
                color: colors.fg,
                letterSpacing: "-0.01em",
              }}
            >
              Thank you, {customerName.split(" ")[0] || customerName}.
            </Heading>

            <Text
              style={{
                margin: 0,
                fontSize: 15,
                lineHeight: 1.6,
                color: colors.inkSoft,
              }}
            >
              Your order has been received. We'll send another note the moment it ships.
            </Text>

            {/* Order meta */}
            <Section style={{ marginTop: 28 }}>
              <Row>
                <Column style={{ width: "50%", verticalAlign: "top" }}>
                  <MetaLabel>Order number</MetaLabel>
                  <MetaValue mono>{orderNumber}</MetaValue>
                </Column>
                <Column style={{ width: "50%", verticalAlign: "top" }}>
                  <MetaLabel>Order date</MetaLabel>
                  <MetaValue>{formattedDate}</MetaValue>
                </Column>
              </Row>
            </Section>

            <Hr style={hr} />

            {/* Items */}
            <Text style={sectionTitle}>Your items</Text>
            <Section style={{ marginTop: 12 }}>
              {items.map((it, i) => (
                <Row key={i} style={{ marginBottom: 14 }}>
                  {it.imageUrl && (
                    <Column style={{ width: 72, verticalAlign: "top" }}>
                      <Img
                        src={it.imageUrl}
                        alt={it.name}
                        width={56}
                        height={70}
                        style={{
                          borderRadius: 8,
                          objectFit: "cover",
                          border: `1px solid ${colors.hairline}`,
                        }}
                      />
                    </Column>
                  )}
                  <Column style={{ verticalAlign: "top", paddingRight: 12 }}>
                    <Text
                      style={{
                        margin: 0,
                        fontSize: 14,
                        fontWeight: 500,
                        color: colors.fg,
                        lineHeight: 1.35,
                      }}
                    >
                      {it.name}
                    </Text>
                    {it.variant && (
                      <Text
                        style={{
                          margin: "2px 0 0",
                          fontSize: 12,
                          color: colors.muted,
                        }}
                      >
                        {it.variant}
                      </Text>
                    )}
                    <Text
                      style={{
                        margin: "6px 0 0",
                        fontSize: 12,
                        color: colors.muted,
                      }}
                    >
                      Qty {it.quantity} · {fmt(it.unitPrice, currencySymbol)} each
                    </Text>
                  </Column>
                  <Column
                    style={{
                      verticalAlign: "top",
                      textAlign: "right",
                      whiteSpace: "nowrap",
                      width: 110,
                    }}
                  >
                    <Text
                      style={{
                        margin: 0,
                        fontSize: 14,
                        fontWeight: 600,
                        color: colors.fg,
                      }}
                    >
                      {fmt(it.lineTotal, currencySymbol)}
                    </Text>
                  </Column>
                </Row>
              ))}
            </Section>

            <Hr style={hr} />

            {/* Totals */}
            <Section>
              <TotalRow label="Subtotal" value={fmt(subtotal, currencySymbol)} />
              {discount > 0 && (
                <TotalRow
                  label={`Discount${couponCode ? ` (${couponCode})` : ""}`}
                  value={`− ${fmt(discount, currencySymbol)}`}
                />
              )}
              <TotalRow
                label="Shipping"
                value={shippingFee === 0 ? "Free" : fmt(shippingFee, currencySymbol)}
              />
              {tax > 0 && <TotalRow label="Tax" value={fmt(tax, currencySymbol)} />}
              {codFee > 0 && (
                <TotalRow label="COD fee" value={fmt(codFee, currencySymbol)} />
              )}
              <Row>
                <Column>
                  <Hr style={{ ...hr, borderTopWidth: 2, borderColor: colors.fg, margin: "10px 0" }} />
                </Column>
              </Row>
              <TotalRow label="Total" value={fmt(total, currencySymbol)} bold />
            </Section>

            <Hr style={hr} />

            {/* Payment + shipping */}
            <Row>
              <Column style={{ width: "50%", verticalAlign: "top", paddingRight: 16 }}>
                <Text style={sectionTitle}>Payment</Text>
                <Text style={infoLine}>{paymentMethod.toUpperCase()}</Text>
                {paymentStatus && (
                  <Text style={{ ...infoLine, color: colors.muted }}>
                    {paymentStatus}
                  </Text>
                )}
              </Column>
              <Column style={{ width: "50%", verticalAlign: "top" }}>
                <Text style={sectionTitle}>Shipping to</Text>
                <Text style={infoLine}>
                  {shippingAddress.fullName || customerName}
                </Text>
                <Text style={infoLine}>
                  {shippingAddress.line1}
                  {shippingAddress.line2 ? `, ${shippingAddress.line2}` : ""}
                </Text>
                <Text style={infoLine}>
                  {shippingAddress.city}, {shippingAddress.state}{" "}
                  {shippingAddress.postalCode}
                </Text>
                <Text style={infoLine}>{shippingAddress.country}</Text>
                {shippingAddress.phone && (
                  <Text style={{ ...infoLine, color: colors.muted }}>
                    {shippingAddress.phone}
                  </Text>
                )}
              </Column>
            </Row>

            <Hr style={hr} />

            {/* ETA */}
            <Section
              style={{
                backgroundColor: colors.bg,
                borderRadius: 12,
                padding: "18px 20px",
                marginTop: 4,
              }}
            >
              <Text
                style={{
                  margin: 0,
                  fontSize: 10,
                  letterSpacing: "0.22em",
                  textTransform: "uppercase",
                  color: colors.muted,
                }}
              >
                Estimated delivery
              </Text>
              <Text
                style={{
                  margin: "6px 0 0",
                  fontSize: 18,
                  fontFamily: serifStack,
                  fontWeight: 500,
                  color: colors.fg,
                }}
              >
                {estimatedDelivery}
              </Text>
            </Section>

            {/* CTA */}
            <Section style={{ textAlign: "center", marginTop: 32 }}>
              <Button
                href={trackOrderUrl}
                style={{
                  backgroundColor: colors.gold,
                  color: "#1a1410",
                  borderRadius: 999,
                  padding: "14px 36px",
                  fontSize: 12,
                  fontWeight: 600,
                  letterSpacing: "0.18em",
                  textTransform: "uppercase",
                  textDecoration: "none",
                  display: "inline-block",
                }}
              >
                Track your order
              </Button>
              <Text
                style={{
                  margin: "16px 0 0",
                  fontSize: 12,
                  color: colors.muted,
                }}
              >
                Or visit your account at{" "}
                <Link href={baseUrl || trackOrderUrl} style={linkStyle}>
                  {(baseUrl || trackOrderUrl).replace(/^https?:\/\//, "")}
                </Link>
              </Text>
            </Section>
          </Section>

          {/* Support */}
          <Section
            style={{
              padding: "28px 8px 8px",
              textAlign: "center",
            }}
          >
            <Text
              style={{
                margin: 0,
                fontSize: 13,
                color: colors.inkSoft,
              }}
            >
              Need help with your order?
            </Text>
            <Text
              style={{
                margin: "6px 0 0",
                fontSize: 13,
                color: colors.muted,
              }}
            >
              Email{" "}
              <Link href={`mailto:${supportEmail}`} style={linkStyle}>
                {supportEmail}
              </Link>
              {supportPhone ? ` · Call ${supportPhone}` : ""}
            </Text>
          </Section>

          {/* Footer */}
          <Section style={{ paddingTop: 24, textAlign: "center" }}>
            <Hr style={{ ...hr, margin: "0 0 18px" }} />
            <Text
              style={{
                margin: 0,
                fontSize: 11,
                color: colors.muted,
                letterSpacing: "0.08em",
              }}
            >
              {storeName}
              {storeAddress ? ` · ${storeAddress}` : ""}
            </Text>
            <Text
              style={{
                margin: "6px 0 0",
                fontSize: 10,
                color: colors.muted,
              }}
            >
              © {new Date().getFullYear()} {storeName}. Sent to {customerEmail}.
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  );
};

// ---------------------------------------------------------------------------
// Helpers (typed inline subcomponents)
// ---------------------------------------------------------------------------
const sectionTitle: React.CSSProperties = {
  margin: 0,
  fontSize: 10,
  letterSpacing: "0.22em",
  textTransform: "uppercase",
  color: colors.muted,
  marginBottom: 8,
};
const infoLine: React.CSSProperties = {
  margin: 0,
  fontSize: 13,
  lineHeight: 1.5,
  color: colors.inkSoft,
};
const hr: React.CSSProperties = {
  borderColor: colors.hairline,
  borderTopWidth: 1,
  margin: "28px 0",
};
const linkStyle: React.CSSProperties = {
  color: colors.goldDark,
  textDecoration: "underline",
};

function MetaLabel({ children }: { children: React.ReactNode }) {
  return (
    <Text
      style={{
        margin: 0,
        fontSize: 10,
        letterSpacing: "0.22em",
        textTransform: "uppercase",
        color: colors.muted,
      }}
    >
      {children}
    </Text>
  );
}
function MetaValue({ children, mono }: { children: React.ReactNode; mono?: boolean }) {
  return (
    <Text
      style={{
        margin: "6px 0 0",
        fontSize: 14,
        color: colors.fg,
        fontFamily: mono
          ? '"SF Mono", Menlo, Consolas, monospace'
          : sansStack,
        fontWeight: 600,
      }}
    >
      {children}
    </Text>
  );
}
function TotalRow({
  label,
  value,
  bold,
}: {
  label: string;
  value: string;
  bold?: boolean;
}) {
  return (
    <Row>
      <Column>
        <Text
          style={{
            margin: "4px 0",
            fontSize: bold ? 16 : 13,
            color: bold ? colors.fg : colors.inkSoft,
            fontWeight: bold ? 600 : 400,
          }}
        >
          {label}
        </Text>
      </Column>
      <Column style={{ textAlign: "right" }}>
        <Text
          style={{
            margin: "4px 0",
            fontSize: bold ? 18 : 13,
            color: colors.fg,
            fontWeight: bold ? 600 : 500,
          }}
        >
          {value}
        </Text>
      </Column>
    </Row>
  );
}

// ---------------------------------------------------------------------------
// Preview default (used by `react-email dev`)
// ---------------------------------------------------------------------------
OrderConfirmationEmail.PreviewProps = {
  customerName: "Pankaj Roniyar",
  customerEmail: "pankajroniyar5@gmail.com",
  orderNumber: "LUX-261113-08421",
  orderDate: new Date().toISOString(),
  items: [
    {
      name: "Camel Wool Trench",
      variant: "Size M / Camel",
      quantity: 1,
      unitPrice: 89000,
      lineTotal: 89000,
      imageUrl: "https://images.unsplash.com/photo-1539109136881-3be0616acf4b?w=240",
    },
    {
      name: "Cashmere Crew Sweater",
      variant: "Size S / Ivory",
      quantity: 2,
      unitPrice: 34000,
      lineTotal: 68000,
      imageUrl: "https://images.unsplash.com/photo-1576566588028-4147f3842f27?w=240",
    },
  ],
  subtotal: 157000,
  discount: 15700,
  couponCode: "WELCOME10",
  shippingFee: 0,
  tax: 0,
  codFee: 500,
  total: 141800,
  currencySymbol: "Rs.",
  paymentMethod: "Cash on Delivery",
  paymentStatus: "Unpaid",
  shippingAddress: {
    fullName: "Pankaj Roniyar",
    line1: "Thamel Marg 22",
    city: "Kathmandu",
    state: "Bagmati",
    postalCode: "44600",
    country: "Nepal",
    phone: "+977 98XXXXXXXX",
  },
  estimatedDelivery: "3–5 business days",
  trackOrderUrl: "https://luxe.com/account/orders/abc",
  supportEmail: "hello@luxe.com",
  supportPhone: "+977 1 4444 555",
  storeName: "Luxe",
  storeAddress: "Lalitpur, Nepal",
  baseUrl: "https://luxe.com",
} as OrderConfirmationEmailProps;

export default OrderConfirmationEmail;
