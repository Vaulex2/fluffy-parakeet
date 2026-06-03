import {
  reservationConfirmationHtml,
  reservationReminderHtml,
  waitlistNotifyHtml,
  orderConfirmationHtml,
} from './templates';

const FROM = 'SushiGO <noreply@sushigo.uz>';
const RESEND_API = 'https://api.resend.com/emails';

async function sendEmail(to: string, subject: string, html: string) {
  const res = await fetch(RESEND_API, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ from: FROM, to, subject, html }),
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Resend error ${res.status}: ${text}`);
  }
}

export async function sendReservationConfirmation(
  to: string,
  data: {
    name: string;
    date: string;
    startTime: string;
    endTime: string;
    guestCount: number;
    phone: string;
    manageUrl: string;
  }
) {
  await sendEmail(
    to,
    'Your SushiGO Reservation is Confirmed',
    reservationConfirmationHtml(data)
  );
}

export async function sendReservationReminder(
  to: string,
  data: {
    name: string;
    date: string;
    startTime: string;
    endTime: string;
    guestCount: number;
    manageUrl: string;
  }
) {
  await sendEmail(
    to,
    'Reminder: your SushiGO reservation is tomorrow',
    reservationReminderHtml(data)
  );
}

export async function sendWaitlistNotification(
  to: string,
  data: {
    name: string;
    date: string;
    startTime: string;
    endTime: string;
    guestCount: number;
    bookingUrl: string;
  }
) {
  await sendEmail(
    to,
    'A table just opened up at SushiGO',
    waitlistNotifyHtml(data)
  );
}

export async function sendOrderConfirmation(
  to: string,
  data: {
    orderId: string;
    items: Array<{ name: string; quantity: number; price: number }>;
    total: number;
    type: 'delivery' | 'pickup';
    address?: string;
  }
) {
  await sendEmail(
    to,
    'Your SushiGO Order is Confirmed',
    orderConfirmationHtml(data)
  );
}
