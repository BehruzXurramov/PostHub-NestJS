import { Injectable, InternalServerErrorException } from '@nestjs/common';
import * as nodemailer from 'nodemailer';
import { Transporter } from 'nodemailer';
import { ConfigService } from '@nestjs/config';
import { errorHandler } from '../utils/error_handler';

@Injectable()
export class EmailService {
  private transporter: Transporter;

  constructor(private configService: ConfigService) {
    this.transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: this.configService.get<string>('EMAIL_USER'),
        pass: this.configService.get<string>('EMAIL_PASSWORD'),
      },
    });
  }

  async sendActivationEmail(
    to: string,
    username: string,
    activationToken: string,
  ): Promise<void> {
    const activationUrl = `${this.configService.get<string>('THE_URL')}/auth/activate?token=${activationToken}`;

    const subject = 'Activate Your Account';

    const htmlContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background-color: #4CAF50; color: white; padding: 20px; text-align: center; }
            .content { padding: 20px; background-color: #f9f9f9; }
            .button { 
              display: inline-block; 
              padding: 12px 24px; 
              background-color: #4CAF50; 
              color: white; 
              text-decoration: none; 
              border-radius: 4px;
              margin: 20px 0;
            }
            .footer { padding: 20px; text-align: center; font-size: 12px; color: #666; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>Welcome to Our Platform!</h1>
            </div>
            <div class="content">
              <h2>Hello, ${username}!</h2>
              <p>Thank you for registering. Please activate your account by clicking the button below:</p>
              <div style="text-align: center;">
                <a href="${activationUrl}" class="button">Activate Account</a>
              </div>
              <p>Or copy and paste this link into your browser:</p>
              <p style="word-break: break-all; color: #4CAF50;">${activationUrl}</p>
              <p><strong>This link will expire in 24 hours.</strong></p>
              <p><strong>If you don't activate within 24 hours, your account will be automatically deleted and you'll need to register again.</strong></p>
              <p>If you didn't create an account, please ignore this email.</p>
            </div>
            <div class="footer">
              <p>&copy; ${new Date().getFullYear()} PostHub. All rights reserved.</p>
            </div>
          </div>
        </body>
      </html>
    `;

    const textContent = `
Hello, ${username}!

Thank you for registering. Please activate your account by visiting this link:

${activationUrl}

This link will expire in 24 hours.
If you don't activate within 24 hours, your account will be automatically deleted and you'll need to register again.

If you didn't create an account, please ignore this email.

© ${new Date().getFullYear()} PostHub. All rights reserved.
    `;

    await this.sendEmail(to, subject, textContent, htmlContent);
  }

  private async sendEmail(
    to: string,
    subject: string,
    text: string,
    html?: string,
  ): Promise<void> {
    const mailOptions: nodemailer.SendMailOptions = {
      from: `"PostHUb" <${this.configService.get<string>('EMAIL_USER')}>`,
      to,
      subject,
      text,
      html,
    };

    try {
      await this.transporter.sendMail(mailOptions);
    } catch (error) {
      errorHandler(error, "EmailService.sendEmail")
    }
  }
}
