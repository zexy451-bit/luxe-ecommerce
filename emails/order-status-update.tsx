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
// Status catalog
// ---------------------------------------------------------------------------
export type OrderStatus =
  | "confirmed"
  | "packed"
  | "shipped"
  | "out_for_delivery"
  | "delivered"
  | "cancelled"
  | "refunded";

type Tone = "positive" | "info" | "warning" | "danger";

interface StatusConfig {
  pill: string;
  title: string;
  message: string;
  subject: (orderNumber: string) => string;
  tone: Tone;
}

const STATUS_CONFIG: Record<OrderStatus, StatusConfig> = {
  confirmed: {
    pill: "Confirmed",
    title: "Your order is confirmed",
    message:
      "We've received your order and started preparing it. You'll hear from us again the moment it ships.",
    subject: (n) => `Order ${n} confirmed`,
    tone: "positive",
  },
  packed: {
    pill: "Packed",
    title: "Your order is packed and ready",
    message:
      "Your items have been carefully packed in our atelier and are awaiting collection by our courier.",
    subject: (n) => `Order ${n} is packed and ready to ship`,
    tone: "info",
  },
  shipped: {
    pill: "Shipped",
    title: "Your order is on the way",
    message:
      "Your parcel has left our atelier. Use the tracking link below for live updates.",
    subject: (n) => `Your order ${n} has been shipped`,
    tone: "info",
  },
  out_for_delivery: {
    pill: "Out for delivery",
    title: "Arriving today",
    message:
      "Your parcel is with the courier and on its way to your door. Please be available to receive it.",
    subject: (n) => `Order ${n} is out for delivery`,
    tone: "info",
  },
  delivered: {
    pill: "Delivered",
    title: "Your order has arrived",
    message:
      "Your parcel has been delivered. We hope you love every detail — let us know how it feels.",
    subject: (n) => `Order ${n} delivered`,
    tone: "positive",
  },
  cancelled: {
    pill: "Cancelled",
    title: "Your order has been cancelled",
    message:
      "We've cancelled this order at your request. If a charge was made, a refund will follow shortly.",
    subject: (n) => `Order ${n} cancelled`,
    tone: "warning",
  },
  refunded: {
    pill: "Refunded",
    title: "Your refund has been issued",
    message:
      "We've processed your refund. Depending on your payment method, it may take 5–10 business days to appear.",
    subject: (n) => `Order ${n} refunded`,
    tone: "warning",
  },
};

export const orderStatusUpdateSubject = (
  status: OrderStatus,
  orderNumber: string
) => STATUS_CONFIG[status].subject(orderNumber);

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------
export interface OrderStatusUpdateEmailProps {
  customerName: string;
  customerEmail: string;
  orderNumber: string;
  status: OrderStatus;
  estimatedDelivery?: string;
  trackingCarrier?: string;
  trackingNumber?: string;
  trackingUrl?: string;
  orderUrl: string;
  supportEmail: string;
  supportPhone?: string;
  storeName?: string;
  storeAddress?: string;
  storeLogoUrl?: string;
  /** Optional override of the default per-status message. */
  customMessage?: string;
}

// ---------------------------------------------------------------------------
// Style tokens
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
  positiveBg: "#ecfdf5",
  positiveFg: "#065f46",
  infoBg: "#eff6ff",
  infoFg: "#1e3a8a",
  warningBg: "#fef3c7",
  warningFg: "#92400e",
  dangerBg: "#fef2f2",
  dangerFg: "#991b1b",
} as const;

const TONE_STYLES: Record<Tone, { bg: string; fg: string }> = {
  positive: { bg: colors.positiveBg, fg: colors.positiveFg },
  info: { bg: colors.infoBg, fg: colors.infoFg },
  warning: { bg: colors.warningBg, fg: colors.warningFg },
  danger: { bg: colors.dangerBg, fg: colors.dangerFg },
};

const serifStack =
  '"Cormorant Garamond", "Times New Roman", Georgia, "Bodoni MT", serif';
const sansStack =
  '-apple-system, BlinkMacSystemFont, "Helvetica Neue", Helvetica, Arial, "Segoe UI", sans-serif';

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------
export const OrderStatusUpdateEmail: React.FC<OrderStatusUpdateEmailProps> = ({
  customerName,
  customerEmail,
  orderNumber,
  status,
  estimatedDelivery,
  trackingCarrier,
  trackingNumber,
  trackingUrl,
  orderUrl,
  supportEmail,
  supportPhone,
  storeName = "Luxe",
  storeAddress,
  storeLogoUrl,
  customMessage,
}) => {
  const cfg = STATUS_CONFIG[status];
  const tone = TONE_STYLES[cfg.tone];
  const message = customMessage || cfg.message;
  const isShipping = status === "shipped" || status === "out_for_delivery";

  return (
    <Html lang="en">
      <Head>
        <meta name="color-scheme" content="light only" />
        <meta name="supported-color-schemes" content="light" />
      </Head>
      <Preview>
        {cfg.subject(orderNumber)}
        {estimatedDelivery ? ` · ${estimatedDelivery}` : ""}
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
          {/* Brand */}
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
            {/* Pill */}
            <Section style={{ textAlign: "center", marginBottom: 8 }}>
              <Text
                style={{
                  display: "inline-block",
                  margin: 0,
                  padding: "6px 14px",
                  fontSize: 10,
                  fontWeight: 600,
                  letterSpacing: "0.24em",
                  textTransform: "uppercase",
                  borderRadius: 999,
                  backgroundColor: tone.bg,
                  color: tone.fg,
                }}
              >
                {cfg.pill}
              </Text>
            </Section>

            {/* Heading */}
            <Heading
              as="h1"
              style={{
                fontFamily: serifStack,
                fontWeight: 400,
                fontSize: 36,
                lineHeight: 1.12,
                margin: "10px 0 14px",
                textAlign: "center",
                color: colors.fg,
                letterSpacing: "-0.01em",
              }}
            >
              {cfg.title}
            </Heading>

            <Text
              style={{
                margin: "0 auto",
                fontSize: 15,
                lineHeight: 1.6,
                color: colors.inkSoft,
                textAlign: "center",
                maxWidth: 460,
              }}
            >
              {message}
            </Text>

            {/* Order meta */}
            <Section
              style={{
                marginTop: 28,
                backgroundColor: colors.bg,
                borderRadius: 12,
                padding: "16px 20px",
              }}
            >
              <Row>
                <Column style={{ verticalAlign: "middle" }}>
                  <Text
                    style={{
                      margin: 0,
                      fontSize: 10,
                      letterSpacing: "0.22em",
                      textTransform: "uppercase",
                      color: colors.muted,
                    }}
                  >
                    Order
                  </Text>
                  <Text
                    style={{
                      margin: "4px 0 0",
                      fontSize: 14,
                      fontFamily: '"SF Mono", Menlo, Consolas, monospace',
                      fontWeight: 600,
                      color: colors.fg,
                    }}
                  >
                    {orderNumber}
                  </Text>
                </Column>
                <Column style={{ textAlign: "right", verticalAlign: "middle" }}>
                  <Text
                    style={{
                      margin: 0,
                      fontSize: 12,
                      color: colors.muted,
                    }}
                  >
                    Sent to
                  </Text>
                  <Text
                    style={{
                      margin: "4px 0 0",
                      fontSize: 13,
                      color: colors.fg,
                    }}
                  >
                    {customerName}
                  </Text>
                </Column>
              </Row>
            </Section>

            {/* Tracking details (when applicable) */}
            {(trackingNumber || trackingCarrier || estimatedDelivery) && (
              <>
                <Hr style={hr} />
                <Text style={sectionTitle}>Tracking</Text>
                <Row>
                  {trackingCarrier && (
                    <Column style={{ width: "50%", verticalAlign: "top" }}>
                      <Text style={infoLabel}>Carrier</Text>
                      <Text style={infoValue}>{trackingCarrier}</Text>
                    </Column>
                  )}
                  {trackingNumber && (
                    <Column style={{ width: "50%", verticalAlign: "top" }}>
                      <Text style={infoLabel}>Tracking number</Text>
                      <Text
                        style={{
                          ...infoValue,
                          fontFamily: '"SF Mono", Menlo, Consolas, monospace',
                        }}
                      >
                        {trackingNumber}
                      </Text>
                    </Column>
                  )}
                </Row>
                {estimatedDelivery && (
                  <Row style={{ marginTop: 10 }}>
                    <Column>
                      <Text style={infoLabel}>
                        {isShipping || status === "confirmed" || status === "packed"
                          ? "Estimated delivery"
                          : "Delivery window"}
                      </Text>
                      <Text
                        style={{
                          ...infoValue,
                          fontSize: 18,
                          fontFamily: serifStack,
                          fontWeight: 500,
                        }}
                      >
                        {estimatedDelivery}
                      </Text>
                    </Column>
                  </Row>
                )}
              </>
            )}

            {/* CTA */}
            <Section style={{ textAlign: "center", marginTop: 32 }}>
              <Button
                href={trackingUrl || orderUrl}
                style={{
                  backgroundColor: colors.fg,
                  color: "#ffffff",
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
                {trackingUrl ? "Track parcel" : "View order"}
              </Button>
              {trackingUrl && (
                <Text style={{ margin: "16px 0 0", fontSize: 12, color: colors.muted }}>
                  Or view it in your account at{" "}
                  <Link href={orderUrl} style={linkStyle}>
                    your account
                  </Link>
                  .
                </Text>
              )}
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
              Questions about your order?
            </Text>
            <Section style={{ marginTop: 12 }}>
              <Button
                href={`mailto:${supportEmail}`}
                style={{
                  backgroundColor: "transparent",
                  color: colors.fg,
                  borderRadius: 999,
                  padding: "10px 24px",
                  fontSize: 11,
                  fontWeight: 600,
                  letterSpacing: "0.18em",
                  textTransform: "uppercase",
                  textDecoration: "none",
                  display: "inline-block",
                  border: `1px solid ${colors.fg}`,
                }}
              >
                Contact support
              </Button>
            </Section>
            {supportPhone && (
              <Text style={{ margin: "10px 0 0", fontSize: 11, color: colors.muted }}>
                Or call {supportPhone}
              </Text>
            )}
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
// Shared styles
// ---------------------------------------------------------------------------
const sectionTitle: React.CSSProperties = {
  margin: "0 0 8px",
  fontSize: 10,
  letterSpacing: "0.22em",
  textTransform: "uppercase",
  color: colors.muted,
};
const infoLabel: React.CSSProperties = {
  margin: 0,
  fontSize: 10,
  letterSpacing: "0.22em",
  textTransform: "uppercase",
  color: colors.muted,
};
const infoValue: React.CSSProperties = {
  margin: "4px 0 0",
  fontSize: 14,
  fontWeight: 600,
  color: colors.fg,
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

// ---------------------------------------------------------------------------
// Preview default
// ---------------------------------------------------------------------------
OrderStatusUpdateEmail.PreviewProps = {
  customerName: "Pankaj Roniyar",
  customerEmail: "pankajroniyar5@gmail.com",
  orderNumber: "LUX-261113-08421",
  status: "shipped",
  estimatedDelivery: "Wednesday, 19 May",
  trackingCarrier: "Pathao Courier",
  trackingNumber: "PTH-99213-7720",
  trackingUrl: "https://tracking.example.com/PTH-99213-7720",
  orderUrl: "https://luxe.com/account/orders/abc",
  supportEmail: "hello@luxe.com",
  supportPhone: "+977 1 4444 555",
  storeName: "Luxe",
  storeAddress: "Lalitpur, Nepal",
} as OrderStatusUpdateEmailProps;

export default OrderStatusUpdateEmail;
