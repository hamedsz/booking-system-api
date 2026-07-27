import nodemailer from 'nodemailer';
import fs from 'fs/promises';
import path from 'path';
import handlebars from 'handlebars';
import { DateTime } from 'luxon';
import { EMAIL_CONFIG } from '../../config/email';

class EmailService {
  constructor() {
    // Target directory where HTML files live
    this.templateDir = path.join(process.cwd(), 'src', 'templates');
    this.compiledTemplates = new Map();
    this.transporter = null; // Will be set during init
  }

  /**
   * Asynchronous initializer to handle async setup safely outside the constructor
   */
  async init() {
    if (EMAIL_CONFIG.testMode) {
      const testAccount = await nodemailer.createTestAccount();
      this.transporter = nodemailer.createTransport({
        host: 'smtp.ethereal.email',
        port: 587,
        secure: false,
        auth: {
          user: testAccount.user,
          pass: testAccount.pass,
        },
      });
    } else {
      this.transporter = nodemailer.createTransport(EMAIL_CONFIG);
    }
    return this; // Return the instance for chaining if needed
  }

  /**
   * Internal helper to load and compile templates into memory.
   */
  async getCompiledTemplate(templateName) {
    if (this.compiledTemplates.has(templateName)) {
      return this.compiledTemplates.get(templateName);
    }

    try {
      const filePath = path.join(this.templateDir, `${templateName}.html`);
      const rawHtml = await fs.readFile(filePath, 'utf-8');
      const compiled = handlebars.compile(rawHtml);

      this.compiledTemplates.set(templateName, compiled);
      return compiled;
    } catch (error) {
      throw new Error(`Failed to load email template [${templateName}]: ${error.message}`);
    }
  }

  /**
   * Main method called by your queue worker
   */
  async sendTemplate({
    to, subject, templateName, context,
  }) {
    // Ensure the transporter exists before trying to use it
    if (!this.transporter) {
      throw new Error('EmailService has not been initialized. Call await emailService.init() first.');
    }

    if (context.date) {
      context.formattedDate = DateTime.fromISO(context.date).toFormat('ffff');
    }

    const renderBody = await this.getCompiledTemplate(templateName);
    const renderLayout = await this.getCompiledTemplate('layouts/main');

    const bodyHtml = renderBody(context);

    const finalHtml = renderLayout({
      subject,
      body: bodyHtml,
    });

    return this.transporter.sendMail({
      from: process.env.EMAIL_FROM || '"Platform" <noreply@yourplatform.com>',
      to,
      subject,
      html: finalHtml,
    });
  }
}

// Create the instance
const emailService = new EmailService();

// Export the instance directly
export default emailService;
