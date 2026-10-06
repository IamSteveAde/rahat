import type { Booking, Apartment, Payment } from "@prisma/client";
import { CAUTION_ARRIVAL_NOTE } from "./payment-policy";

export function escapeHtml(value: string) {
  return value.replace(/[&<>"']/g, (char) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[char]!));
}

export function buildReceipt(booking: Booking & { apartment: Apartment }, payment: Payment, admin: boolean) {
  if (!payment.paidAt || payment.status !== "PAID") throw new Error("A receipt requires a paid payment.");
  const money = (amount: number) => new Intl.NumberFormat("en-NG", { style: "currency", currency: "NGN" }).format(amount);
  const date = (value: Date) => new Intl.DateTimeFormat("en-NG", { dateStyle: "long", timeZone: "Africa/Lagos" }).format(value);
  const paidAt = new Intl.DateTimeFormat("en-NG", { dateStyle: "long", timeStyle: "medium", timeZone: "Africa/Lagos" }).format(payment.paidAt) + " WAT (UTC+01:00)";
  const nights = Math.round((booking.checkOut.getTime() - booking.checkIn.getTime()) / 86400000);
  const rows: [string, string][] = [
    ["Booking reference", booking.bookingReference], ["Payment reference", payment.reference],
    ["Payment status", "Paid"], ["Payment date and time", paidAt], ["Payment method", payment.provider],
    ["Guest", booking.guestName], ["Guest email", booking.guestEmail],
    ["Apartment", booking.apartment.name], ["Check-in", date(booking.checkIn)], ["Check-out", date(booking.checkOut)],
    ["Nights / guests", `${nights} / ${booking.guests}`],
    ["Accommodation", money(booking.subtotal)],
    ...(booking.cleaningFee > 0 ? [["Cleaning fee", money(booking.cleaningFee)] as [string, string]] : []),
    [booking.cautionFee > 0 ? "Service charge (2.5%)" : "Service charge", money(booking.serviceFee)], [booking.cautionFee > 0 ? "Tax (7.5%)" : "Tax", money(booking.taxes)],
    ...(booking.discount ? [["Discount", `-${money(booking.discount)}`] as [string, string]] : []),
    ["Total paid (NGN)", money(payment.amount)],
  ];
  if (admin && booking.guestPhone) rows.push(["Guest phone", booking.guestPhone]);
  if (admin && booking.arrivalTime) rows.push(["Arrival time", booking.arrivalTime]);
  if (admin && booking.specialRequests) rows.push(["Special requests", booking.specialRequests]);
  const title = admin ? "New confirmed booking" : "Your booking is confirmed";
  const intro = admin ? "A payment has been confirmed for the following reservation." : `Hello ${booking.guestName}, thank you for choosing Rahat. Your reservation is confirmed. Please keep this payment receipt for your records.`;
  const text = `${title}\n\n${intro}\n\n${rows.map(([label, value]) => `${label}: ${value}`).join("\n")}\n\n${CAUTION_ARRIVAL_NOTE}\n\nFor booking enquiries, contact bookings@rahatapartment.com.\nRahat Luxury Apartment · Ikota GRA, Lagos`;
  const html = `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${title}</title></head><body style="margin:0;background:#f5f3ef;font-family:Arial,sans-serif;color:#202020"><table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr><td style="padding:24px 12px"><table role="presentation" width="100%" style="max-width:600px;margin:auto;background:white;border-radius:12px" cellpadding="0" cellspacing="0"><tr><td style="padding:32px;background:#171717;color:#d5b270"><strong style="font-size:24px;letter-spacing:4px">RAHAT</strong><p style="color:white">Luxury Apartment</p></td></tr><tr><td style="padding:32px"><h1 style="font-size:24px">${title}</h1><p style="line-height:1.7">${escapeHtml(intro)}</p><h2 style="font-size:18px">Payment receipt</h2><table width="100%" cellpadding="10" cellspacing="0" style="border-collapse:collapse;font-size:14px">${rows.map(([label, value]) => `<tr><th scope="row" align="left" style="border-bottom:1px solid #eee;font-weight:normal;color:#666">${escapeHtml(label)}</th><td align="right" style="border-bottom:1px solid #eee;overflow-wrap:anywhere">${escapeHtml(value)}</td></tr>`).join("")}</table><p style="font-size:13px;line-height:1.7;background:#faf7f0;padding:16px">${CAUTION_ARRIVAL_NOTE}</p><p style="font-size:13px;line-height:1.7">For booking enquiries, reply to this email or contact <a href="mailto:bookings@rahatapartment.com">bookings@rahatapartment.com</a>.</p><p style="font-size:12px;color:#777">Rahat Luxury Apartment · Ikota GRA, Lagos</p></td></tr></table></td></tr></table></body></html>`;
  return { subject: `${admin ? "New paid booking" : "Booking confirmation & payment receipt"} — ${booking.bookingReference}`, html, text };
}
