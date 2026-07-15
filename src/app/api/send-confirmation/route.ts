import { NextResponse } from 'next/server';
import nodemailer from 'nodemailer';

export async function POST(request: Request) {
  try {
    const { email, firstName, total } = await request.json();

    // Configure the Gmail login
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_APP_PASSWORD,
      },
    });

    // Send the email
    const mailOptions = {
      from: '"Bella House" <arjunkotwal153@gmail.com>',
      to: email, // This will now send to ANY customer email!
      subject: 'Order Confirmed - Bella House',
      html: `
        <div style="font-family: sans-serif; color: #E02915; max-width: 600px; margin: 0 auto; border: 2px solid #E02915; padding: 40px;">
          <h1 style="text-transform: uppercase; font-size: 32px;">Order Confirmed</h1>
          <p>Thank you for your purchase, ${firstName}!</p>
          <p>We have successfully received your order and payment of <strong>₹${total}</strong>.</p>
          <p>We will notify you every detail regarding your order delivery by email and whatsapp.</p>
          <br/>
          <p style="font-size: 12px; opacity: 0.8;">++ BELLA HOUSE</p>
        </div>
      `,
    };

    await transporter.sendMail(mailOptions);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Failed to send email' }, { status: 500 });
  }
}