import { Resend } from "resend";
import { render } from "@react-email/components";
import OrderConfirmationEmail, {
  orderConfirmationSubject,
  type OrderConfirmationEmailProps,
} from "../../emails/order-confirmation";
import OrderStatusUpdateEmail, {
  orderStatusUpdateSubject,
  type OrderStatusUpdateEmailProps,
  type OrderStatus,
} from "../../emails/order-status-update";

let _resend: Resend | null = null;
function client() {
  if (!_resend) {
    if (!process.env.RESEND_API_KEY) {
      throw new Error("RESEND_API_KEY is not set");
    }
    _resend = new Resend(process.env.RESEND_API_KEY);
  }
  return _resend;
}

function from(storeName: string | undefined) {
  return process.env.RESEND_FROM || `${storeName || "Luxe"} <onboarding@resend.dev>`;
}

export async function sendOrderConfirmation(props: OrderConfirmationEmailProps) {
  const resend = client();
  const html = await render(<OrderConfirmationEmail {...props} />);
  return resend.emails.send({
    from: from(props.storeName),
    to: props.customerEmail,
    subject: orderConfirmationSubject(props.orderNumber),
    html,
  });
}

export async function sendOrderStatusUpdate(props: OrderStatusUpdateEmailProps) {
  const resend = client();
  const html = await render(<OrderStatusUpdateEmail {...props} />);
  return resend.emails.send({
    from: from(props.storeName),
    to: props.customerEmail,
    subject: orderStatusUpdateSubject(props.status, props.orderNumber),
    html,
  });
}

// Statuses that should auto-trigger an email when the admin moves the order.
// (pending is intentionally excluded — the confirmation email fires at checkout.)
export const STATUSES_WITH_EMAIL: OrderStatus[] = [
  "confirmed",
  "packed",
  "shipped",
  "delivered",
  "cancelled",
  "refunded",
];
