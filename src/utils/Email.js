const nodemailer = require('nodemailer');
const ejs = require('ejs');
const path = require('path');
const { htmlToText } = require('html-to-text');

const templatesPath = path.join(__dirname, '../../views/email');

class Email {
    constructor(user, url) {
        this.to = process.env.EMAIL_FROM_EMAIL;
        this.name = user.name.split(' ')[0];
        this.url = url;
        this.phone = user.phone,
        this.email = user.email,
        this.client = user.register,
        this.from = `${process.env.EMAIL_FROM_NAME} <${process.env.EMAIL_FROM_EMAIL}>`;
    }

    newTransport() {
        if (process.env.NODE_ENV === 'production') {
            // nodemailer-sendgrid - ?
             return nodemailer.createTransport({
                host: process.env.SENDPULSE_HOST,
                port: process.env.SENDPULSE_PORT,
                auth: {
                    user: process.env.SENDPULSE_USERNAME,
                    pass: process.env.SENDPULSE_PASSWORD
                }
            });
        }

        // mailtrap
         return nodemailer.createTransport({
            host: process.env.EMAIL_HOST,
            port: process.env.EMAIL_PORT,
            auth: {
                user: process.env.EMAIL_USERNAME,
                pass: process.env.EMAIL_PASSWORD
            }
        });
    }

    async send(template, subject) {
        // 1) Render  HTML based on ejs template
        const data = {
            name: this.name,
            email: this.email,
            phone: this.phone,
            url: this.url,
            subject,
            template
        }

        await ejs.renderFile(`${templatesPath}/${template}.ejs`, data, async (err, html) => {
            // html => Rendered HTML string

            // 2) Define email options
            const mailOptions = {
                from: this.from,
                to: this.to,
                subject,
                html,
                text: htmlToText(html)
            };
    
            // 3) Create a transport and send email
            await this.newTransport().sendMail(mailOptions);
        }); 
    }

    async sendRegister() {
        console.log(this.to);
        
        await this.send('register', 'Նոր գրանցում')
    }

}

module.exports = Email;