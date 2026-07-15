import { NextResponse } from 'next/server';
import nodemailer from 'nodemailer';

export async function POST(request: Request) {
  try {
    const { name, email, location, inquiry, message } = await request.json();

    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_APP_PASSWORD,
      },
    });

    const mailOptions = {
      from: `"Bella House Website" <${process.env.GMAIL_USER}>`,
      to: process.env.GMAIL_USER, // Sends the contact form directly to your official email!
      replyTo: email, 
      subject: `New Bella House Inquiry: ${inquiry} from ${name}`,
      html: `
        <div style="font-family: sans-serif; color: #111; max-width: 600px; margin: 0 auto; border: 2px solid #E02915; padding: 40px;">
          <h2 style="color: #E02915; text-transform: uppercase;">New Contact Submission</h2>
          <p><strong>Name:</strong> ${name}</p>
          <p><strong>Email:</strong> ${email}</p>
          <p><strong>Location:</strong> ${location}</p>
          <p><strong>Topic:</strong> ${inquiry}</p>
          <hr style="border: none; border-top: 1px solid #E02915; margin: 20px 0;" />
          <p><strong>Message:</strong></p>
          <p style="white-space: pre-wrap; background: #f9f9f9; padding: 15px; border-left: 4px solid #E02915;">${message}</p>
        </div>
      `,
    };

    await transporter.sendMail(mailOptions);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Contact Form Error:", error);
    return NextResponse.json({ error: 'Failed to send message' }, { status: 500 });
  }
}