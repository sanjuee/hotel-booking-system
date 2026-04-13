import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function sendBookingEmails(booking: any, roomNumber: string) {
  try {
    // 1. SEND TO MANAGEMENT (Front Desk)
    await resend.emails.send({
      from: 'Hotel Booking System <onboarding@resend.dev>',
      to: 'sanjaysathish168@gmail.com', 
      subject: `🚨 NEW BOOKING: Room ${roomNumber}`,
      html: `
        <h2>New Booking Received!</h2>
        <p><strong>Guest Name:</strong> ${booking.guestName}</p>
        <p><strong>Room Assigned:</strong> ${roomNumber}</p>
        <p><strong>Check-in:</strong> ${new Date(booking.checkInDate).toLocaleDateString()}</p>
        <p><strong>Check-out:</strong> ${new Date(booking.checkOutDate).toLocaleDateString()}</p>
        <p><strong>Total Price:</strong> ₹${booking.totalPrice}</p>
        <p><strong>Phone:</strong> ${booking.phone}</p>
        <p><strong>Special Requests:</strong> ${booking.specialReq || 'None'}</p>
      `,
    });

    // 2. SEND TO CUSTOMER
    await resend.emails.send({
      from: 'The Hotel Management <onboarding@resend.dev>',
      to: booking.email, 
      subject: 'Hotel Booking Confirmation',
      html: `
        <div style="font-family: sans-serif; color: #333;">
          <h2>Booking Confirmed!</h2>
          <p>Hi ${booking.guestName},</p>
          <p>Thank you for choosing us! Your booking is confirmed.</p>
          <div style="background-color: #f4f4f4; padding: 15px; border-radius: 5px;">
            <p><strong>Room Number:</strong> ${roomNumber}</p>
            <p><strong>Check-in:</strong> ${new Date(booking.checkInDate).toLocaleDateString()}</p>
            <p><strong>Check-out:</strong> ${new Date(booking.checkOutDate).toLocaleDateString()}</p>
          </div>
          <p>We look forward to hosting you!</p>
        </div>
      `,
    });

    console.log("Emails sent successfully!");
    
  } catch (error) {
    console.error("Failed to send emails:", error);
  }
}