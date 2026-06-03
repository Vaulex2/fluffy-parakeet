function esc(str: string | null | undefined): string {
  return (str ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

const CAFE_PHONE = '+998 90 123 45 67';
const CAFE_NAME = 'SushiGO';

function formatPrice(uzs: number) {
  return uzs.toLocaleString('uz-UZ') + ' UZS';
}

function timeRange(startTime: string, endTime: string) {
  // Times may arrive as ISO strings or "HH:MM:SS" — handle both, render 12h.
  const fmt = (t: string) => {
    const hm = t.includes('T') ? new Date(t).toTimeString().slice(0, 5) : t.slice(0, 5);
    const [h, m] = hm.split(':').map(Number);
    const ampm = h >= 12 ? 'PM' : 'AM';
    return `${h % 12 || 12}:${String(m).padStart(2, '0')} ${ampm}`;
  };
  return `${fmt(startTime)} – ${fmt(endTime)}`;
}

function manageButton(manageUrl: string, label: string) {
  return `<a href="${manageUrl}" style="display:inline-block;background:#E11D2A;color:#F4ECD8;font-size:15px;font-weight:700;text-decoration:none;padding:12px 28px;border-radius:8px;">${label}</a>`;
}

export function reservationConfirmationHtml(data: {
  name: string;
  date: string;
  startTime: string;
  endTime: string;
  guestCount: number;
  phone: string;
  manageUrl: string;
}) {
  return `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#0B0B0B;font-family:'Manrope',Arial,sans-serif;color:#F4ECD8;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#0B0B0B;padding:40px 0;">
    <tr><td align="center">
      <table width="560" cellpadding="0" cellspacing="0" style="background:#111;border-radius:12px;overflow:hidden;border:1px solid rgba(244,236,216,0.08);">
        <tr><td style="background:#E11D2A;padding:24px 32px;">
          <h1 style="margin:0;font-size:28px;font-weight:700;color:#F4ECD8;letter-spacing:-0.02em;">${CAFE_NAME}</h1>
          <p style="margin:6px 0 0;font-size:14px;color:rgba(244,236,216,0.7);">Reservation Confirmed</p>
        </td></tr>
        <tr><td style="padding:32px;">
          <p style="margin:0 0 24px;font-size:16px;line-height:1.6;">Hi <strong>${esc(data.name)}</strong>, your table is reserved!</p>
          <table width="100%" cellpadding="0" cellspacing="0" style="background:rgba(244,236,216,0.04);border-radius:8px;padding:20px;margin-bottom:24px;">
            <tr><td style="padding:6px 0;font-size:14px;color:rgba(244,236,216,0.55);">Date</td><td style="padding:6px 0;font-size:14px;text-align:right;">${data.date}</td></tr>
            <tr><td style="padding:6px 0;font-size:14px;color:rgba(244,236,216,0.55);">Time</td><td style="padding:6px 0;font-size:14px;text-align:right;">${timeRange(data.startTime, data.endTime)}</td></tr>
            <tr><td style="padding:6px 0;font-size:14px;color:rgba(244,236,216,0.55);">Guests</td><td style="padding:6px 0;font-size:14px;text-align:right;">${data.guestCount} ${data.guestCount === 1 ? 'person' : 'people'}</td></tr>
          </table>
          <div style="text-align:center;margin-bottom:24px;">
            ${manageButton(data.manageUrl, 'View or cancel your reservation')}
          </div>
          <p style="margin:0 0 24px;font-size:13px;color:rgba(244,236,216,0.55);text-align:center;">Plans changed? You can cancel or reschedule anytime using the button above — or call us at <a href="tel:${CAFE_PHONE.replace(/\s/g,'')}" style="color:#E11D2A;text-decoration:none;">${CAFE_PHONE}</a>.</p>
          <p style="margin:0;font-size:13px;color:rgba(244,236,216,0.45);">We look forward to seeing you at ${CAFE_NAME}. This confirmation was sent automatically — please do not reply to this email.</p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;
}

export function reservationReminderHtml(data: {
  name: string;
  date: string;
  startTime: string;
  endTime: string;
  guestCount: number;
  manageUrl: string;
}) {
  return `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#0B0B0B;font-family:'Manrope',Arial,sans-serif;color:#F4ECD8;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#0B0B0B;padding:40px 0;">
    <tr><td align="center">
      <table width="560" cellpadding="0" cellspacing="0" style="background:#111;border-radius:12px;overflow:hidden;border:1px solid rgba(244,236,216,0.08);">
        <tr><td style="background:#E11D2A;padding:24px 32px;">
          <h1 style="margin:0;font-size:28px;font-weight:700;color:#F4ECD8;letter-spacing:-0.02em;">${CAFE_NAME}</h1>
          <p style="margin:6px 0 0;font-size:14px;color:rgba(244,236,216,0.7);">See you tomorrow?</p>
        </td></tr>
        <tr><td style="padding:32px;">
          <p style="margin:0 0 24px;font-size:16px;line-height:1.6;">Hi <strong>${esc(data.name)}</strong>, this is a friendly reminder about your reservation at ${CAFE_NAME}.</p>
          <table width="100%" cellpadding="0" cellspacing="0" style="background:rgba(244,236,216,0.04);border-radius:8px;padding:20px;margin-bottom:24px;">
            <tr><td style="padding:6px 0;font-size:14px;color:rgba(244,236,216,0.55);">Date</td><td style="padding:6px 0;font-size:14px;text-align:right;">${data.date}</td></tr>
            <tr><td style="padding:6px 0;font-size:14px;color:rgba(244,236,216,0.55);">Time</td><td style="padding:6px 0;font-size:14px;text-align:right;">${timeRange(data.startTime, data.endTime)}</td></tr>
            <tr><td style="padding:6px 0;font-size:14px;color:rgba(244,236,216,0.55);">Guests</td><td style="padding:6px 0;font-size:14px;text-align:right;">${data.guestCount} ${data.guestCount === 1 ? 'person' : 'people'}</td></tr>
          </table>
          <p style="margin:0 0 16px;font-size:15px;text-align:center;">Can you still make it?</p>
          <div style="text-align:center;margin-bottom:24px;">
            ${manageButton(data.manageUrl, 'Confirm or cancel')}
          </div>
          <p style="margin:0;font-size:13px;color:rgba(244,236,216,0.45);text-align:center;">If your plans changed, please cancel so we can offer the table to someone else. Thank you!</p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;
}

export function waitlistNotifyHtml(data: {
  name: string;
  date: string;
  startTime: string;
  endTime: string;
  guestCount: number;
  bookingUrl: string;
}) {
  return `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#0B0B0B;font-family:'Manrope',Arial,sans-serif;color:#F4ECD8;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#0B0B0B;padding:40px 0;">
    <tr><td align="center">
      <table width="560" cellpadding="0" cellspacing="0" style="background:#111;border-radius:12px;overflow:hidden;border:1px solid rgba(244,236,216,0.08);">
        <tr><td style="background:#E11D2A;padding:24px 32px;">
          <h1 style="margin:0;font-size:28px;font-weight:700;color:#F4ECD8;letter-spacing:-0.02em;">${CAFE_NAME}</h1>
          <p style="margin:6px 0 0;font-size:14px;color:rgba(244,236,216,0.7);">A table just opened up!</p>
        </td></tr>
        <tr><td style="padding:32px;">
          <p style="margin:0 0 24px;font-size:16px;line-height:1.6;">Good news, <strong>${esc(data.name)}</strong> — a table matching your waitlist request is now available:</p>
          <table width="100%" cellpadding="0" cellspacing="0" style="background:rgba(244,236,216,0.04);border-radius:8px;padding:20px;margin-bottom:24px;">
            <tr><td style="padding:6px 0;font-size:14px;color:rgba(244,236,216,0.55);">Date</td><td style="padding:6px 0;font-size:14px;text-align:right;">${data.date}</td></tr>
            <tr><td style="padding:6px 0;font-size:14px;color:rgba(244,236,216,0.55);">Time</td><td style="padding:6px 0;font-size:14px;text-align:right;">${timeRange(data.startTime, data.endTime)}</td></tr>
            <tr><td style="padding:6px 0;font-size:14px;color:rgba(244,236,216,0.55);">Guests</td><td style="padding:6px 0;font-size:14px;text-align:right;">${data.guestCount} ${data.guestCount === 1 ? 'person' : 'people'}</td></tr>
          </table>
          <p style="margin:0 0 16px;font-size:15px;text-align:center;">Tables go fast — book now to claim it:</p>
          <div style="text-align:center;margin-bottom:24px;">
            ${manageButton(data.bookingUrl, 'Book this table')}
          </div>
          <p style="margin:0;font-size:13px;color:rgba(244,236,216,0.45);text-align:center;">This table is not held — it's first come, first served. Please do not reply to this email.</p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;
}

export function orderConfirmationHtml(data: {
  orderId: string;
  items: Array<{ name: string; quantity: number; price: number }>;
  total: number;
  type: 'delivery' | 'pickup';
  address?: string;
}) {
  const itemRows = data.items
    .map(
      (item) => `
      <tr>
        <td style="padding:8px 0;font-size:14px;">${esc(item.name)} × ${item.quantity}</td>
        <td style="padding:8px 0;font-size:14px;text-align:right;">${formatPrice(item.price * item.quantity)}</td>
      </tr>`
    )
    .join('');

  return `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#0B0B0B;font-family:'Manrope',Arial,sans-serif;color:#F4ECD8;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#0B0B0B;padding:40px 0;">
    <tr><td align="center">
      <table width="560" cellpadding="0" cellspacing="0" style="background:#111;border-radius:12px;overflow:hidden;border:1px solid rgba(244,236,216,0.08);">
        <tr><td style="background:#E11D2A;padding:24px 32px;">
          <h1 style="margin:0;font-size:28px;font-weight:700;color:#F4ECD8;letter-spacing:-0.02em;">${CAFE_NAME}</h1>
          <p style="margin:6px 0 0;font-size:14px;color:rgba(244,236,216,0.7);">Order Received</p>
        </td></tr>
        <tr><td style="padding:32px;">
          <p style="margin:0 0 4px;font-size:13px;color:rgba(244,236,216,0.45);">Order #${data.orderId.slice(0, 8).toUpperCase()}</p>
          <p style="margin:0 0 24px;font-size:16px;">Your order is <strong>confirmed</strong> and being prepared!</p>
          <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:16px;">
            ${itemRows}
            <tr><td colspan="2" style="border-top:1px solid rgba(244,236,216,0.08);padding-top:8px;"></td></tr>
            <tr>
              <td style="padding:8px 0;font-size:15px;font-weight:700;">Total</td>
              <td style="padding:8px 0;font-size:15px;font-weight:700;text-align:right;">${formatPrice(data.total)}</td>
            </tr>
          </table>
          <p style="margin:0 0 4px;font-size:14px;color:rgba(244,236,216,0.55);">Type: <strong style="color:#F4ECD8;">${data.type === 'delivery' ? 'Delivery' : 'Pickup'}</strong></p>
          ${data.address ? `<p style="margin:0 0 24px;font-size:14px;color:rgba(244,236,216,0.55);">Address: <strong style="color:#F4ECD8;">${esc(data.address)}</strong></p>` : '<div style="margin-bottom:24px;"></div>'}
          <p style="margin:0;font-size:13px;color:rgba(244,236,216,0.45);">Questions? Call us: <a href="tel:${CAFE_PHONE.replace(/\s/g,'')}" style="color:#E11D2A;">${CAFE_PHONE}</a></p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;
}
