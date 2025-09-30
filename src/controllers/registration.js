const DB = require('../models');
const { google } = require('googleapis');

const Registration = DB.models.Registration;
const Email = require('../utils/Email');

const SPREADSHEET_ID = process.env.SPREADSHEET_ID;

async function getSheetsClient() {
    const auth = new google.auth.GoogleAuth({
        // check file name
        keyFile: 'credentials.json',
        scopes: 'https://www.googleapis.com/auth/spreadsheets'
    });

    const client = await auth.getClient();
    return google.sheets({ version: 'v4', auth: client });
}

module.exports = {
    addRegistration: async (req, res) => {
        try {
            const registration = await Registration.create(req.body);

            const googleSheets = await getSheetsClient();
            const rows = Object.entries(req.body);
            const values = Object.values(req.body); 

            const appendResponse = await googleSheets.spreadsheets.values.append({
                spreadsheetId: SPREADSHEET_ID,
                range: 'Sheet1!A:Z',
                valueInputOption: 'USER_ENTERED',
                resource: { values: [values] }
            });

            // await new Email(registration, `${req.protocol}://${req.get('host')}`).sendRegister();
            res.status(201).json({
                status: 'success',
                result: appendResponse.data,
                time: `${Date.now() - req.time} ms`,
                rows
            });

        } catch (e) {
            console.error(e);
            res.status(500).json({
                message: 'Internal server error!'
            });
        }
    },

    getRegistration: async (req, res) => {
        try {
            const registrations = await Registration.findAll();

            const googleSheets = await getSheetsClient();
            const getRows = await googleSheets.spreadsheets.values.get({
                spreadsheetId: SPREADSHEET_ID,
                range: 'Sheet1'
            });

            if (!registrations) {
                return res.status(404).json({ message: 'Registration not found!' });
            }

            let getSheetRows = getRows.data.values;


            res.status(200).json({
                status: 'success',
                time: `${Date.now() - req.time} ms`,
                getSheetRows,
                registrations
            });

        } catch (e) {
            console.error(e);
            res.status(500).json({
                message: 'Internal server error!'
            });
        }
    },

    updateRegistration: async (req, res) => {
        try {
            const registration = await Registration.findByPk(req.params.id);
            if (!registration) {
                return res.status(404).json({ message: 'Registration not found!' });
            }

            for (let key in req.body) {
                registration[key] = req.body[key];
            }
            await registration.save();

            res.status(200).json({
                status: 'success',
                time: `${Date.now() - req.time} ms`,
                registration
            });

        } catch (e) {
            console.error(e);
            res.status(500).json({
                message: 'Internal server error!'
            });
        }
    },

    deleteRegistration: async (req, res) => {
        try {
            const registration = await Registration.findByPk(req.params.id);
            if (!registration) {
                return res.status(404).json({ message: 'Registration not found!' });
            }

            await registration.destroy();

            res.status(200).json({
                message: 'Registration deleted successfully!'
            });

        } catch (e) {
            console.error(e);
            res.status(500).json({
                message: 'Internal server error!'
            });
        }
    }
};
