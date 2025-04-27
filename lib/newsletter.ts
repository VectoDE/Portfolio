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
        from: emailSettings?.emailFrom || process.env.EMAIL_FROM || "Tim Hauke <noreply@timhauke.com>",
        adminEmail: emailSettings?.adminEmail || process.env.ADMIN_EMAIL || "admin@timhauke.com",
    }
}

// Send subscription confirmation email
export async function sendSubscriptionConfirmation(email: string, name: string, token: string) {
    try {
        const transporter = await createTransporter()
        const emailConfig = await getEmailConfig()
        const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"
        const confirmUrl = `${baseUrl}/api/newsletter/confirm?token=${token}`

        // Create email content
        const mailOptions = {
            from: emailConfig.from,
            to: email,
            subject: "Confirm Your Newsletter Subscription",
            html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #333; border-bottom: 1px solid #eee; padding-bottom: 10px;">Confirm Your Subscription</h2>
          
          <div style="margin: 20px 0;">
            <p>Hello ${name || "there"},</p>
            <p>Thank you for subscribing to my newsletter! To complete your subscription, please click the button below:</p>
          </div>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${confirmUrl}" style="background-color: #7c3aed; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; display: inline-block; font-weight: bold;">
              Confirm Subscription
            </a>
          </div>
          
          <div style="margin: 20px 0;">
            <p>If the button doesn't work, you can also copy and paste this link into your browser:</p>
            <p style="word-break: break-all; color: #5b21b6;">${confirmUrl}</p>
          </div>
          
          <div style="margin-top: 30px; padding-top: 15px; border-top: 1px solid #eee; font-size: 12px; color: #777;">
            <p>If you didn't request this subscription, you can safely ignore this email.</p>
          </div>
        </div>
      `,
            text: `
        Confirm Your Subscription
        
        Hello ${name || "there"},
        
        Thank you for subscribing to my newsletter! To complete your subscription, please visit the following link:
        
        ${confirmUrl}
        
        If you didn't request this subscription, you can safely ignore this email.
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
        console.error("Error sending subscription confirmation:", error)
        return { success: false, error }
    }
}

// Send welcome email after confirmation
export async function sendWelcomeEmail(email: string, name: string) {
    try {
        const transporter = await createTransporter()
        const emailConfig = await getEmailConfig()
        const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"
        const unsubscribeUrl = `${baseUrl}/unsubscribe`

        // Create email content
        const mailOptions = {
            from: emailConfig.from,
            to: email,
            subject: "Welcome to My Newsletter!",
            html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #333; border-bottom: 1px solid #eee; padding-bottom: 10px;">Welcome to My Newsletter!</h2>
          
          <div style="margin: 20px 0;">
            <p>Hello ${name || "there"},</p>
            <p>Thank you for confirming your subscription to my newsletter! You'll now receive updates about:</p>
            <ul style="margin-top: 10px;">
              <li>New projects I'm working on</li>
              <li>Skills and technologies I'm learning</li>
              <li>Career updates and professional achievements</li>
              <li>Certificates and qualifications I earn</li>
            </ul>
          </div>
          
          <div style="background-color: #f9f9f9; padding: 15px; border-radius: 5px; margin: 20px 0;">
            <p style="margin-top: 0;">You can manage your subscription preferences or unsubscribe at any time by visiting:</p>
            <p style="word-break: break-all; margin-bottom: 0;"><a href="${unsubscribeUrl}" style="color: #5b21b6;">${unsubscribeUrl}</a></p>
          </div>
          
          <div style="margin-top: 30px; padding-top: 15px; border-top: 1px solid #eee; font-size: 12px; color: #777;">
            <p>Best regards,</p>
            <p>Tim Hauke</p>
          </div>
        </div>
      `,
            text: `
        Welcome to My Newsletter!
        
        Hello ${name || "there"},
        
        Thank you for confirming your subscription to my newsletter! You'll now receive updates about:
        
        - New projects I'm working on
        - Skills and technologies I'm learning
        - Career updates and professional achievements
        - Certificates and qualifications I earn
        
        You can manage your subscription preferences or unsubscribe at any time by visiting:
        ${unsubscribeUrl}
        
        Best regards,
        Tim Hauke
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
        console.error("Error sending welcome email:", error)
        return { success: false, error }
    }
}

// Send unsubscribe confirmation
export async function sendUnsubscribeConfirmation(email: string, name: string) {
    try {
        const transporter = await createTransporter()
        const emailConfig = await getEmailConfig()

        // Create email content
        const mailOptions = {
            from: emailConfig.from,
            to: email,
            subject: "You've Been Unsubscribed",
            html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #333; border-bottom: 1px solid #eee; padding-bottom: 10px;">Unsubscribe Confirmation</h2>
          
          <div style="margin: 20px 0;">
            <p>Hello ${name || "there"},</p>
            <p>You have been successfully unsubscribed from my newsletter. You will no longer receive emails from me.</p>
            <p>If you unsubscribed by mistake or would like to resubscribe in the future, you can do so on my website.</p>
          </div>
          
          <div style="margin-top: 30px; padding-top: 15px; border-top: 1px solid #eee; font-size: 12px; color: #777;">
            <p>Best regards,</p>
            <p>Tim Hauke</p>
          </div>
        </div>
      `,
            text: `
        Unsubscribe Confirmation
        
        Hello ${name || "there"},
        
        You have been successfully unsubscribed from my newsletter. You will no longer receive emails from me.
        
        If you unsubscribed by mistake or would like to resubscribe in the future, you can do so on my website.
        
        Best regards,
        Tim Hauke
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
        console.error("Error sending unsubscribe confirmation:", error)
        return { success: false, error }
    }
}

// Send newsletter to subscribers
export async function sendNewsletter(newsletter: {
    subject: string
    content: string
    type: string
    projectId?: string | null
}) {
    try {
        const transporter = await createTransporter()
        const emailConfig = await getEmailConfig()
        const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"

        // Get all confirmed subscribers with their preferences
        const subscribers = await prisma.subscriber.findMany({
            where: { isConfirmed: true },
            include: { preferences: true },
        })

        // Filter subscribers based on newsletter type and preferences
        const filteredSubscribers = subscribers.filter((subscriber) => {
            if (!subscriber.preferences) return true

            switch (newsletter.type) {
                case "project":
                    return subscriber.preferences.projects
                case "certificate":
                    return subscriber.preferences.certificates
                case "skill":
                    return subscriber.preferences.skills
                case "career":
                    return subscriber.preferences.careers
                default:
                    return true
            }
        })

        // Create and save newsletter record
        const savedNewsletter = await prisma.newsletter.create({
            data: {
                subject: newsletter.subject,
                content: newsletter.content,
                type: newsletter.type,
                projectId: newsletter.projectId,
                status: "sent",
                sentAt: new Date(),
            },
        })

        // Send to each subscriber
        const results = await Promise.all(
            filteredSubscribers.map(async (subscriber) => {
                const unsubscribeUrl = `${baseUrl}/unsubscribe?token=${subscriber.token}`

                // Create email content
                const mailOptions = {
                    from: emailConfig.from,
                    to: subscriber.email,
                    subject: newsletter.subject,
                    html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
              ${newsletter.content}
              
              <div style="margin-top: 30px; padding-top: 15px; border-top: 1px solid #eee; font-size: 12px; color: #777;">
                <p>You're receiving this email because you subscribed to my newsletter.</p>
                <p>To unsubscribe or manage your preferences, <a href="${unsubscribeUrl}" style="color: #5b21b6;">click here</a>.</p>
              </div>
            </div>
          `,
                    text: `
            ${newsletter.content.replace(/<[^>]*>/g, "")}
            
            You're receiving this email because you subscribed to my newsletter.
            To unsubscribe or manage your preferences, visit: ${unsubscribeUrl}
          `,
                }

                // Send the email
                const info = await transporter.sendMail(mailOptions)
                return { email: subscriber.email, messageId: info.messageId }
            }),
        )

        return {
            success: true,
            newsletterId: savedNewsletter.id,
            sentCount: results.length,
        }
    } catch (error) {
        console.error("Error sending newsletter:", error)
        return { success: false, error }
    }
}

// Generate newsletter content for new project
export async function generateProjectNewsletterContent(projectId: string) {
    try {
        const project = await prisma.project.findUnique({
            where: { id: projectId },
            include: { features: true },
        })

        if (!project) {
            throw new Error("Project not found")
        }

        const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"
        const projectUrl = `${baseUrl}/projects/${project.id}`

        // Generate HTML content
        const content = `
      <h2 style="color: #333; border-bottom: 1px solid #eee; padding-bottom: 10px;">New Project: ${project.title}</h2>
      
      <div style="margin: 20px 0;">
        <p>I'm excited to share my latest project with you!</p>
        
        ${project.imageUrl
                ? `
          <div style="text-align: center; margin: 20px 0;">
            <img src="${project.imageUrl}" alt="${project.title}" style="max-width: 100%; border-radius: 8px; max-height: 300px; object-fit: cover;">
          </div>
        `
                : ""
            }
        
        <h3 style="color: #444; margin-top: 20px;">About the Project</h3>
        <p>${project.description}</p>
        
        <div style="margin: 15px 0;">
          <strong>Technologies used:</strong> ${project.technologies}
        </div>
        
        ${project.features && project.features.length > 0
                ? `
          <h3 style="color: #444; margin-top: 20px;">Key Features</h3>
          <ul style="padding-left: 20px;">
            ${project.features
                    .map(
                        (feature) => `
              <li style="margin-bottom: 8px;">
                <strong>${feature.name}</strong>${feature.description ? `: ${feature.description}` : ""}
              </li>
            `,
                    )
                    .join("")}
          </ul>
        `
                : ""
            }
      </div>
      
      <div style="text-align: center; margin: 30px 0;">
        <a href="${projectUrl}" style="background-color: #7c3aed; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; display: inline-block; font-weight: bold;">
          View Project Details
        </a>
      </div>
    `

        return {
            subject: `New Project: ${project.title}`,
            content,
            type: "project",
            projectId: project.id,
        }
    } catch (error) {
        console.error("Error generating project newsletter content:", error)
        throw error
    }
}

// Generate newsletter content for new certificate
export async function generateCertificateNewsletterContent(certificateId: string) {
    try {
        const certificate = await prisma.certificate.findUnique({
            where: { id: certificateId },
        })

        if (!certificate) {
            throw new Error("Certificate not found")
        }

        // Format date
        const date = new Date(certificate.date)
        const formattedDate = date.toLocaleDateString("en-US", {
            year: "numeric",
            month: "long",
            day: "numeric",
        })

        // Generate HTML content
        const content = `
      <h2 style="color: #333; border-bottom: 1px solid #eee; padding-bottom: 10px;">New Certificate: ${certificate.name}</h2>
      
      <div style="margin: 20px 0;">
        <p>I'm pleased to share that I've earned a new certification!</p>
        
        ${certificate.imageUrl
                ? `
          <div style="text-align: center; margin: 20px 0;">
            <img src="${certificate.imageUrl}" alt="${certificate.name}" style="max-width: 100%; border-radius: 8px; max-height: 300px; object-fit: cover;">
          </div>
        `
                : ""
            }
        
        <div style="background-color: #f9f9f9; padding: 15px; border-radius: 5px; margin: 20px 0;">
          <p style="margin-top: 0;"><strong>Certificate:</strong> ${certificate.name}</p>
          <p style="margin-bottom: 0;"><strong>Issuer:</strong> ${certificate.issuer}</p>
          <p style="margin-bottom: 0;"><strong>Date:</strong> ${formattedDate}</p>
          ${certificate.link ? `<p style="margin-bottom: 0;"><strong>Verification:</strong> <a href="${certificate.link}" style="color: #5b21b6;">View Certificate</a></p>` : ""}
        </div>
        
        <p>This certification represents my commitment to continuous learning and professional development.</p>
      </div>
    `

        return {
            subject: `New Certificate: ${certificate.name}`,
            content,
            type: "certificate",
            projectId: null,
        }
    } catch (error) {
        console.error("Error generating certificate newsletter content:", error)
        throw error
    }
}

// Generate newsletter content for new skill
export async function generateSkillNewsletterContent(skillId: string) {
    try {
        const skill = await prisma.skill.findUnique({
            where: { id: skillId },
        })

        if (!skill) {
            throw new Error("Skill not found")
        }

        // Generate HTML content
        const content = `
      <h2 style="color: #333; border-bottom: 1px solid #eee; padding-bottom: 10px;">New Skill: ${skill.name}</h2>
      
      <div style="margin: 20px 0;">
        <p>I've recently added a new skill to my portfolio!</p>
        
        <div style="background-color: #f9f9f9; padding: 15px; border-radius: 5px; margin: 20px 0;">
          <p style="margin-top: 0;"><strong>Skill:</strong> ${skill.name}</p>
          <p style="margin-bottom: 0;"><strong>Category:</strong> ${skill.category}</p>
          <p style="margin-bottom: 0;"><strong>Level:</strong> ${skill.level}</p>
          <p style="margin-bottom: 0;"><strong>Experience:</strong> ${skill.years} ${skill.years === 1 ? "year" : "years"}</p>
        </div>
        
        <p>I'm excited to apply this skill to future projects and continue expanding my expertise.</p>
      </div>
    `

        return {
            subject: `New Skill Added: ${skill.name}`,
            content,
            type: "skill",
            projectId: null,
        }
    } catch (error) {
        console.error("Error generating skill newsletter content:", error)
        throw error
    }
}

// Generate newsletter content for new career entry
export async function generateCareerNewsletterContent(careerId: string) {
    try {
        const career = await prisma.career.findUnique({
            where: { id: careerId },
        })

        if (!career) {
            throw new Error("Career entry not found")
        }

        // Format date
        const startDate = new Date(career.startDate)
        const formattedStartDate = startDate.toLocaleDateString("en-US", {
            year: "numeric",
            month: "long",
        })

        // Generate HTML content
        const content = `
      <h2 style="color: #333; border-bottom: 1px solid #eee; padding-bottom: 10px;">Career Update: ${career.position} at ${career.company}</h2>
      
      <div style="margin: 20px 0;">
        <p>I'm excited to share a new update in my professional journey!</p>
        
        ${career.logoUrl
                ? `
          <div style="text-align: center; margin: 20px 0;">
            <img src="${career.logoUrl}" alt="${career.company} logo" style="max-width: 200px; max-height: 100px; object-fit: contain;">
          </div>
        `
                : ""
            }
        
        <div style="background-color: #f9f9f9; padding: 15px; border-radius: 5px; margin: 20px 0;">
          <p style="margin-top: 0;"><strong>Position:</strong> ${career.position}</p>
          <p style="margin-bottom: 0;"><strong>Company:</strong> ${career.company}</p>
          <p style="margin-bottom: 0;"><strong>Started:</strong> ${formattedStartDate}</p>
          ${career.location ? `<p style="margin-bottom: 0;"><strong>Location:</strong> ${career.location}</p>` : ""}
        </div>
        
        <h3 style="color: #444; margin-top: 20px;">About the Role</h3>
        <p>${career.description}</p>
      </div>
    `

        return {
            subject: `Career Update: ${career.position} at ${career.company}`,
            content,
            type: "career",
            projectId: null,
        }
    } catch (error) {
        console.error("Error generating career newsletter content:", error)
        throw error
    }
}
