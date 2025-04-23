import nodemailer from "nodemailer"

// Email configuration
const emailConfig = {
    from: process.env.EMAIL_FROM || "Your Portfolio <noreply@yourdomain.com>",
    adminEmail: process.env.ADMIN_EMAIL || "admin@yourdomain.com",
}

// Create a transporter
const createTransporter = () => {
    // For production, use SMTP settings
    if (process.env.EMAIL_SERVER && process.env.EMAIL_PORT && process.env.EMAIL_USER && process.env.EMAIL_PASSWORD) {
        return nodemailer.createTransport({
            host: process.env.EMAIL_SERVER,
            port: Number(process.env.EMAIL_PORT),
            secure: Number(process.env.EMAIL_PORT) === 465,
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASSWORD,
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

// Send email notification for new contact
export async function sendContactNotification(contact: {
    name: string
    email: string
    subject?: string
    message: string
}) {
    try {
        const transporter = createTransporter()

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
        const transporter = createTransporter()

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
            <p>Your Name</p>
            <p>Portfolio Website</p>
          </div>
        </div>
      `,
            text: `
        Thank You for Your Message
        
        Dear ${contact.name},
        
        Thank you for contacting me. I have received your message and will get back to you as soon as possible.
        
        This is an automated response, so please do not reply to this email.
        
        Best regards,
        Your Name
        Portfolio Website
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
