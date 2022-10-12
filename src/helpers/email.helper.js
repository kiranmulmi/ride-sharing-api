
const express = require('express');
const nodemailer = require('nodemailer');
const hbs = require('nodemailer-express-handlebars');
const path = require('path');
const viewPath = path.resolve(__dirname, '../templates/email/views/');
const partialsPath = path.resolve(__dirname, '../templates/email/partials');
const loggerHelper = require("./logger.helper");

const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: process.env.SMTP_PORT,
    auth: {
        user: process.env.SMPT_USER,
        pass: process.env.SMTP_PASS
    }
});

transporter.use('compile', hbs({
    viewEngine: {
        extName: '.handlebars',
        // partialsDir: viewPath,
        layoutsDir: viewPath,
        defaultLayout: false,
        partialsDir: partialsPath,
        express
    },
    viewPath: viewPath,
    extName: '.handlebars',
}))

const sendPickupRequest = (pickupDetails) => {
    return new Promise(async (resolve, reject) => {

        try {
            const mailOptions = {
                from: pickupDetails.passenger.email,
                to: pickupDetails.rider.email,
                subject: 'Confirm Pickup Request: Ride Sharing App',
                template: 'pickupRequest',
                context: {
                    riderName: pickupDetails.rider.name,
                    passengerName: pickupDetails.passenger.name,
                    passengerEmail: pickupDetails.passenger.email,
                    location: pickupDetails.origin,
                    destination: pickupDetails.destination,
                    calculatedPrice: pickupDetails.calculatedPrice,
                    url: `${process.env.FRONTEND_HOST_URL}/rideRequest?bookingID=${pickupDetails.bookingID}`
                }
            };

            await sendEmail(mailOptions);
            resolve("success")
        } catch (e) {
            reject(e)
        }
    });
}

const confirmPickupRequest = (pickupDetails) => {
    return new Promise(async (resolve, reject) => {
        try {
            const mailOptions = {
                from: pickupDetails.rider.email,
                to: pickupDetails.passenger.email,
                subject: 'Pickup Request Success: Ride Sharing App',
                template: 'confirmRequest',
                context: {
                    riderName: pickupDetails.rider.name,
                    passengerName: pickupDetails.passenger.name,
                    riderEmail: pickupDetails.rider.email,
                    location: pickupDetails.origin,
                    destination: pickupDetails.destination,
                    calculatedPrice: pickupDetails.calculatedPrice,
                }
            };
            await sendEmail(mailOptions);
            resolve("success")
        } catch (e) {
            reject(e)
        }

    });
}

const sendEmail = (mailOptions) => {
    return new Promise((resolve, reject) => {
        transporter.sendMail(mailOptions, function (error, info) {
            if (error) {
                reject(error);
            } else {
                loggerHelper.log('Email sent: ' + info.response);
                resolve("success");
            }
        });
    })
}

module.exports = {
    sendPickupRequest,
    confirmPickupRequest
}