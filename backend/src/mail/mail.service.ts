import { Injectable } from '@nestjs/common';
import * as nodemailer from 'nodemailer';

@Injectable()
export class MailService {
  private transporter;

  constructor() {
    this.transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || 'smtp.gmail.com',
      port: parseInt(process.env.SMTP_PORT || '587'),
      secure: process.env.SMTP_SECURE === 'true',
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });
  }

  async sendVerificationEmail(email: string, token: string) {
    const url = `${process.env.FRONTEND_URL}/auth/verify-email?token=${token}`;

    // Log for development if no SMTP configured
    if (!process.env.SMTP_USER) {
      console.log('--- DEVELOPMENT MAIL LOG ---');
      console.log(`To: ${email}`);
      console.log(`Subject: Vérification de votre compte`);
      console.log(`Link: ${url}`);
      console.log('----------------------------');
      return;
    }

    try {
      const info = await this.transporter.sendMail({
        from: `"Immo Sénégal" <${process.env.SMTP_USER}>`,
        to: email,
        subject: 'Vérifiez votre compte - Immo Sénégal',
        html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e1e1e1; border-radius: 10px;">
              <h2 style="color: #2563eb;">Bienvenue chez Immo Sénégal !</h2>
              <p>Merci de vous être inscrit. Pour activer votre compte, veuillez cliquer sur le bouton ci-dessous :</p>
              <div style="text-align: center; margin: 30px 0;">
                <a href="${url}" style="background-color: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; font-weight: bold;">Vérifier mon compte</a>
              </div>
              <p>Ou copiez et collez ce lien dans votre navigateur :</p>
              <p style="color: #666; word-break: break-all;">${url}</p>
              <hr style="border: 0; border-top: 1px solid #eee; margin: 20px 0;">
              <p style="font-size: 12px; color: #999;">Si vous n'avez pas créé de compte, vous pouvez ignorer cet e-mail.</p>
            </div>
          `,
      });
      console.log('Verification email sent successfully:', info.messageId);
    } catch (error) {
      console.error('FAILED to send verification email:', error);
    }
  }

  async sendPasswordResetEmail(email: string, token: string) {
    const url = `${process.env.FRONTEND_URL}/auth/reset-password?token=${token}`;

    // Log for development if no SMTP configured
    if (!process.env.SMTP_USER) {
      console.log('--- DEVELOPMENT MAIL LOG ---');
      console.log(`To: ${email}`);
      console.log(`Subject: Réinitialisation de mot de passe`);
      console.log(`Link: ${url}`);
      console.log('----------------------------');
      return;
    }

    try {
      const info = await this.transporter.sendMail({
        from: `"Immo Sénégal" <${process.env.SMTP_USER}>`,
        to: email,
        subject: 'Réinitialisation de votre mot de passe - Immo Sénégal',
        html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e1e1e1; border-radius: 10px;">
              <h2 style="color: #2563eb;">Réinitialisation de mot de passe</h2>
              <p>Vous avez demandé la réinitialisation de votre mot de passe. Cliquez sur le bouton ci-dessous pour en définir un nouveau :</p>
              <div style="text-align: center; margin: 30px 0;">
                <a href="${url}" style="background-color: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; font-weight: bold;">Réinitialiser mon mot de passe</a>
              </div>
              <p>Ce lien expirera dans une heure.</p>
              <p>Ou copiez et collez ce lien dans votre navigateur :</p>
              <p style="color: #666; word-break: break-all;">${url}</p>
              <hr style="border: 0; border-top: 1px solid #eee; margin: 20px 0;">
              <p style="font-size: 12px; color: #999;">Si vous n'avez pas demandé de réinitialisation, vous pouvez ignorer cet e-mail en toute sécurité.</p>
            </div>
          `,
      });
      console.log('Password reset email sent successfully:', info.messageId);
    } catch (error) {
      console.error('FAILED to send password reset email:', error);
    }
  }
}
