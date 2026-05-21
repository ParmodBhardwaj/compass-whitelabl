import nodemailer from 'nodemailer';
export interface MailConfig {
    host: string;
    port: number;
    user?: string;
    pass?: string;
    from: string;
}
export declare function initMail(cfg: MailConfig): nodemailer.Transporter;
export interface MailOptions {
    to: string | string[];
    cc?: string | string[];
    bcc?: string | string[];
    subject: string;
    html: string;
    text?: string;
}
export declare function sendMail(opts: MailOptions): Promise<any>;
