const DB = require('../models');
const Files = require('./File');
const dbCon = require('../utils/db');
const AppError = require('../utils/appError');
const redis = require('../utils/redisClient');

const { Gallery, File } = DB.models;
const sequelize = dbCon.con;

const GALLERY_CACHE_KEY = 'gallery:all';
const GALLERY_CACHE_TTL = 120;

const cacheGalleries = async (items) => {
    try {
        await redis.set(GALLERY_CACHE_KEY, JSON.stringify(items), { EX: GALLERY_CACHE_TTL });
    } catch {}
};

const clearGalleryCache = async () => {
    try {
        await redis.del(GALLERY_CACHE_KEY);
    } catch {}
};

const fetchAllGalleries = async () => {
    const itemsRaw = await Gallery.findAll({
        include: [{ association: 'files' }],
        order: [['id', 'DESC']]
    });
    return itemsRaw.map(i => i.get({ plain: true }));
};

const handleGalleryImageUpload = async (gallery, file, t) => {
    if (!gallery.files) {
        await gallery.reload({ include: [{ association: 'files' }], transaction: t });
    }
    const image = await new Files(gallery, file).replace('gallery_img');

    if (image.status !== 'success') {
        const msg = typeof image.message === 'object'
            ? Object.values(image.message).join(' ')
            : image.message;

        throw new AppError(msg || 'Նկար վերբեռնելու սխալ', 400);
    }

    await gallery.createFile(
        { ...image.table, row_id: gallery.id },
        { transaction: t }
    );
};

module.exports = {
    getGalleries: async (req, res, next) => {
        try {
            const cached = await redis.get(GALLERY_CACHE_KEY);

            if (cached) {
                const items = JSON.parse(cached);
                return res.status(200).json({
                    status: 'success',
                    fromCache: true,
                    time: `${Date.now() - req.time} ms`,
                    items
                });
            }

            const items = await fetchAllGalleries();
            await cacheGalleries(items);

            return res.status(200).json({
                status: 'success',
                fromCache: false,
                time: `${Date.now() - req.time} ms`,
                items
            });
        } catch (error) {
            return next(new AppError('Internal server error', 500));
        }
    },

    addGallery: async (req, res, next) => {
        const t = await sequelize.transaction();

        try {
            const { title, text } = req.body;

            if (!title || !title.trim()) {
                throw new AppError('Վերնագիր դաշտը պարտադիր է', 403);
            }

            const payload = { title: title.trim(), text };
            const gallery = await Gallery.create(payload, { transaction: t });

            if (req.files?.gallery_img) {
                await handleGalleryImageUpload(gallery, req.files.gallery_img, t);
            }

            await t.commit();

            const fullItem = await Gallery.findByPk(gallery.id, {
                include: [{ association: 'files' }]
            });

            await clearGalleryCache();

            return res.status(201).json({
                status: 'success',
                time: `${Date.now() - req.time} ms`,
                item: fullItem
            });

        } catch (error) {
            try { await t.rollback(); } catch {}
            return next(error instanceof AppError ? error : new AppError('Internal server error', 500));
        }
    },

    updateGallery: async (req, res, next) => {
        const t = await sequelize.transaction();

        try {
            const { id } = req.params;

            const item = await Gallery.findByPk(id, {
                include: [{ association: 'files' }],
                transaction: t
            });

            if (!item) {
                throw new AppError('Գալերիայի նյութը չի գտնվել', 404);
            }

            if (req.body.title !== undefined) {
                item.title = req.body.title.trim();
            }
            if (req.body.text !== undefined) {
                item.text = req.body.text;
            }

            await item.save({ transaction: t });

            if (req.files?.gallery_img) {
                await handleGalleryImageUpload(item, req.files.gallery_img, t);
            }

            await t.commit();

            const fullItem = await Gallery.findByPk(item.id, {
                include: [{ association: 'files' }]
            });

            await clearGalleryCache();

            return res.status(200).json({
                status: 'success',
                time: `${Date.now() - req.time} ms`,
                item: fullItem
            });

        } catch (error) {
            try { await t.rollback(); } catch {}
            return next(error instanceof AppError ? error : new AppError('Internal server error', 500));
        }
    },

    deleteGallery: async (req, res, next) => {
        const t = await sequelize.transaction();

        try {
            const { id } = req.params;

            const item = await Gallery.findByPk(id, { transaction: t });

            if (!item) {
                throw new AppError('Գալերիայի նյութը չի գտնվել', 404);
            }

            const files = await File.findAll({
                where: { row_id: id, table_name: 'gallery' },
                transaction: t
            });

            if (files.length) {
                await File.destroy({
                    where: { id: files.map(f => f.id) },
                    transaction: t
                });
            }

            await item.destroy({ transaction: t });

            await t.commit();
            await clearGalleryCache();

            return res.status(204).json({
                status: 'success',
                message: 'Deleted successfully'
            });

        } catch (error) {
            try { await t.rollback(); } catch {}
            return next(error instanceof AppError ? error : new AppError('Internal server error', 500));
        }
    }
};
