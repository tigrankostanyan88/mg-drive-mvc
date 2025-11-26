const DB = require("../models");
const redis = require("../utils/redisClient");
const AppError = require("../utils/appError");

const { Contact } = DB.models;

// ---------------------- GET CONTACT ----------------------
exports.getContacts = async (req, res, next) => {
    try {
        const cacheKey = "contacts:data";

        // ---- CHECK REDIS CACHE ----
        const cached = await redis.get(cacheKey);
        if (cached) {
            return res.status(200).json({
                status: "success",
                fromCache: true,
                time: `${Date.now() - req.time} ms`,
                contact: JSON.parse(cached)
            });
        }

        // ---- GET FROM DB ----
        const contact = await Contact.findOne();

        if (!contact) {
            return next(new AppError("Կոնտակտային տվյալները չեն գտնվել։", 404));
        }

        const plain = contact.get({ plain: true });

        // ---- SAVE TO CACHE ----
        await redis.set(cacheKey, JSON.stringify(plain), { EX: 60 });

        res.status(200).json({
            status: "success",
            fromCache: false,
            time: `${Date.now() - req.time} ms`,
            contact: plain
        });

    } catch (err) {
        next(new AppError("Սերվերի ներքին սխալ (GET contacts)", 500));
    }
};

// ---------------------- UPDATE CONTACT ----------------------
exports.updateContacts = async (req, res, next) => {
    try {
        let contact = await Contact.findOne();
        let message = "";
        let status = 200;

        if (!contact) {
            // ---- IF NOT EXIST → CREATE ----
            try {
                contact = await Contact.create(req.body);
            } catch (createErr) {
                return next(new AppError("Կոնտակտային տվյալները ստեղծելու սխալ", 400));
            }
            message = "Կոնտակտային տվյալները հաջողությամբ ստեղծվեցին։";
            status = 201;

        } else {
            // ---- UPDATE ----
            try {
                await contact.update(req.body);
            } catch (updateErr) {
                return next(new AppError("Կոնտակտային տվյալները թարմացնելու սխալ", 400));
            }
            message = "Կոնտակտային տվյալները հաջողությամբ թարմացվեցին։";
        }

        // ---- CLEAR CACHE ----
        await redis.del("contacts:data");

        res.status(status).json({
            status: "success",
            time: `${Date.now() - req.time} ms`,
            message,
            contact
        });

    } catch (err) {
        next(new AppError(err, 500));
    }
};
