const nodemailer = require('nodemailer');
const ejs = require('ejs');
const path = require('path');
const { htmlToText } = require('html-to-text');
const { user } = require('../controllers');

const templatesPath = path.join(__dirname, '../../views/email');

class Email {
    constructor(user, url, data) {
        this.to = process.env.EMAIL_FROM_EMAIL;
        this.url = url;
        this.password = data.password;
        this.contact = data.data;
        this.phone = user.phone;
        this.email = user.email;
        this.client = user.register;
        this.checkout = data || null;
        this.from = `${process.env.EMAIL_FROM_NAME} <${process.env.EMAIL_FROM_EMAIL}>`;
    }

    newTransport() {
        // nodemailer-sendgrid - ?
         return nodemailer.createTransport({
            host: "smtp.gmail.com",
            port: 465,
            service: 'gmail',
            auth: {
                user: user.email,
                pass: "vnsb ggdm itfr llhs"
            }
        });

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
            password: this.password,
            phone: this.phone,
            url: this.url,
            checkout: this.checkout,
            contact: this.contact,
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

    async sendRegisterCourse() {
        await this.send('register', 'Նոր գրանցում')
    }
    async sendPasswordReset() {
        await this.send('sendRegister', 'Հաղորդագրություն՝ գաղտնաբառի վերականգնում');
    }
    async sendCheckout() {
        await this.send('checkout', 'Նոր պատվեր (checkout)');
    }
    async sendContact() {
        await this.send('contact', 'Հետադարձ կապ');
    }

}

module.exports = Email;