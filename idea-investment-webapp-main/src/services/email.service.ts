// Copyright IBM Corp. 2020. All Rights Reserved.
// Node module: loopback4-example-shopping
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {bind, BindingScope} from '@loopback/core';
import {createTransport, SentMessageInfo} from 'nodemailer';
import {EmailTemplate, User} from '../models';

@bind({scope: BindingScope.TRANSIENT})
export class EmailService {
  /**
   * If using gmail see https://nodemailer.com/usage/using-gmail/
   */
  private static async setupTransporter() {
    const options: any = {
      host: process.env.SMTP_SERVER,
      port: Number(process.env.SMTP_PORT),
      secure: true,
      // upgrade later with STARTTLS
      auth: {
        user: process.env.SMTP_USERNAME,
        pass: process.env.SMTP_PASSWORD,
      },
    };

    return createTransport(options);
  }

  async sendVerificationTokenMail(user: User): Promise<SentMessageInfo> {
    const transporter = await EmailService.setupTransporter();

    const emailTemplate = new EmailTemplate({
      to: user.email,
      subject: '[Idea Investment Nepal] Account Verification Request',
      html: `<div>
            <p>Hello,</p>
            <p style="color: green;">We have successfully registered your account with email address: ${user.email}</p>
            <p>To verify your account please use provided OTP below</p>
            <p>Your OTP for account verification opt is: ${user.token}</p>
            <p>If you didn’t request to reset your password, please ignore this email or reset your password to protect your account.</p>
      </div>`,
    });

    return await transporter.sendMail(emailTemplate);
  }

  async sendResetPasswordMail(user: User): Promise<SentMessageInfo> {
    const transporter = await EmailService.setupTransporter();
    const emailTemplate = new EmailTemplate({
      to: user.email,
      subject: '[Shoppy] Reset Password Request',
      html: `<div>
                <p>Hello,</p>
                <p style="color: red;">We received a request to reset the password for your account with email address: ${user.email}</p>
                <p>To reset your account please use provided OTP below.</p>
                <p>Your OTP for reset password OTP is: ${user.token}</p>
                <p>If you didn’t request to reset your password, please ignore this email or reset your password to protect your account.</p>
            </div>`,
    });
    return transporter.sendMail(emailTemplate);
  }
}
