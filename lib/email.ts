import nodemailer from "nodemailer"
import prisma from "@/lib/db"

// Create a transporter with settings from the database
const createTransporter = async () => {
  // Get email settings from database
  const emailSettings = await prisma.emailSettings.findFirst()

  // For production, use SMTP settings from database
  if (emailSettings?.smtpServer && emailSettings?.smtpPort && emailSettings?.smtpUser && emailSettings?.smtpPassword) {
    return nodemailer.createTransport({
      host: emailSettings.smtpServer,
      port: Number(emailSettings.smtpPort),
      secure: Number(emailSettings.smtpPort) === 465,
      auth: {
        user: emailSettings.smtpUser,
        pass: emailSettings.smtpPassword,
      },
    })
  }

  // For development, use Ethereal (fake SMTP service)
  return nodemailer.createTransport({
    host: "smtp.ethereal.email",
    port: 587,
    secure: false,
    auth: {
      user: process.env.ETHEREAL_EMAIL || "ethereal.user@ethereal.email",
      pass: process.env.ETHEREAL_PASSWORD || "ethereal_password",
    },
  })
}

// Get email configuration from database
const getEmailConfig = async () => {
  const emailSettings = await prisma.emailSettings.findFirst()
  return {
    from: emailSettings?.emailFrom || process.env.EMAIL_FROM || "Your Portfolio <noreply@yourdomain.com>",
    adminEmail: emailSettings?.adminEmail || process.env.ADMIN_EMAIL || "admin@yourdomain.com",
    sendAutoReply: emailSettings?.sendAutoReply || false,
  }
}

// Send email notification for new contact
export async function sendContactNotification(contact: {
  name: string
  email: string
  subject?: string
  message: string
}) {
  try {
    const transporter = await createTransporter()
    const emailConfig = await getEmailConfig()

    // Create email content
    const mailOptions = {
      from: emailConfig.from,
      to: emailConfig.adminEmail,
      subject: `New Contact Form Submission: ${contact.subject || "No Subject"}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #333; border-bottom: 1px solid #eee; padding-bottom: 10px;">New Contact Form Submission</h2>
          
          <div style="margin: 20px 0;">
            <p><strong>Name:</strong> ${contact.name}</p>
            <p><strong>Email:</strong> ${contact.email}</p>
            <p><strong>Subject:</strong> ${contact.subject || "No Subject"}</p>
          </div>
          
          <div style="background-color: #f9f9f9; padding: 15px; border-radius: 5px; margin-bottom: 20px;">
            <h3 style="margin-top: 0; color: #555;">Message:</h3>
            <p style="white-space: pre-wrap;">${contact.message}</p>
          </div>
          
          <div style="margin-top: 30px; padding-top: 15px; border-top: 1px solid #eee; font-size: 12px; color: #777;">
            <p>This is an automated email from your portfolio website's contact form.</p>
          </div>
        </div>
      `,
      text: `
        New Contact Form Submission
        
        Name: ${contact.name}
        Email: ${contact.email}
        Subject: ${contact.subject || "No Subject"}
        
        Message:
        ${contact.message}
        
        This is an automated email from your portfolio website's contact form.
      `,
    }

    // Send the email
    const info = await transporter.sendMail(mailOptions)

    // For development with Ethereal, log the preview URL
    if (process.env.NODE_ENV !== "production" && info.messageId) {
      console.log("Email preview URL: %s", nodemailer.getTestMessageUrl(info))
    }

    return { success: true, messageId: info.messageId }
  } catch (error) {
    console.error("Error sending email notification:", error)
    return { success: false, error }
  }
}

// Send auto-reply to the contact
export async function sendContactAutoReply(contact: {
  name: string
  email: string
}) {
  try {
    const transporter = await createTransporter()
    const emailConfig = await getEmailConfig()

    // Only send auto-reply if enabled in settings
    if (!emailConfig.sendAutoReply) {
      return { success: false, skipped: true }
    }

    // Create email content
    const mailOptions = {
      from: emailConfig.from,
      to: contact.email,
      subject: "Thank you for your message",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #333; border-bottom: 1px solid #eee; padding-bottom: 10px;">Thank You for Your Message</h2>
          
          <div style="margin: 20px 0;">
            <p>Dear ${contact.name},</p>
            <p>Thank you for contacting me. I have received your message and will get back to you as soon as possible.</p>
            <p>This is an automated response, so please do not reply to this email.</p>
          </div>
          
          <div style="margin-top: 30px; padding-top: 15px; border-top: 1px solid #eee; font-size: 12px; color: #777;">
            <p>Best regards,</p>
            <p>Tim Hauke</p>
          </div>
        </div>
      `,
      text: `
        Thank You for Your Message
        
        Dear ${contact.name},
        
        Thank you for contacting me. I have received your message and will get back to you as soon as possible.
        
        This is an automated response, so please do not reply to this email.
        
        Best regards,
        Tim Hauke
      `,
    }

    // Send the email
    const info = await transporter.sendMail(mailOptions)
    return { success: true, messageId: info.messageId }
  } catch (error) {
    console.error("Error sending auto-reply:", error)
    return { success: false, error }
  }
}

// Send a test email
export async function sendTestEmail(email: string) {
  try {
    const transporter = await createTransporter()
    const emailConfig = await getEmailConfig()

    // Create email content
    const mailOptions = {
      from: emailConfig.from,
      to: email,
      subject: "Test Email from Your Portfolio",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #333; border-bottom: 1px solid #eee; padding-bottom: 10px;">Test Email</h2>
          
          <div style="margin: 20px 0;">
            <p>This is a test email from your portfolio website.</p>
            <p>If you're receiving this, your email settings are configured correctly.</p>
          </div>
          
          <div style="margin-top: 30px; padding-top: 15px; border-top: 1px solid #eee; font-size: 12px; color: #777;">
            <p>Best regards,</p>
            <p>Your Portfolio Website</p>
          </div>
        </div>
      `,
      text: `
        Test Email
        
        This is a test email from your portfolio website.
        If you're receiving this, your email settings are configured correctly.
        
        Best regards,
        Your Portfolio Website
      `,
    }

    // Send the email
    const info = await transporter.sendMail(mailOptions)

    // For development with Ethereal, log the preview URL
    if (process.env.NODE_ENV !== "production" && info.messageId) {
      console.log("Email preview URL: %s", nodemailer.getTestMessageUrl(info))
    }

    return { success: true, messageId: info.messageId }
  } catch (error) {
    console.error("Error sending test email:", error)
    return { success: false, error }
  }
}
