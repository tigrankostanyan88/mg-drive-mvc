// Models
const DB = require('../models');
const { Test, Group, Question, File, User, Contact, Registration } = DB.models;

const cache = require("../utils/cache");
const helpers = require("../utils/helpers");

const { Op } = DB.Sequelize;

// ---------- COMMON DB QUERIES ---------- //
async function getCached(key, fetchFn, ttl = 5, force = false) {
    const cached = await cache.get(key);
    if (cached) return cached;

    const fresh = await fetchFn();
    await cache.set(key, fresh, ttl);
    return fresh; 
}

// Fast centralized getters
async function getAllTests() {
    const testService = require('../services/test.service');
    return await testService.listAdmin();
}
async function getAllGroups() {
    const groupService = require('../services/group.service');
    return await groupService.listAdmin();
}
async function getAllStudents() {
    return getCached("students_all", () =>
        User.findAll({ where: { role: "student" }, raw: true })
    );
}
async function getAllQuestions() {
    const questionService = require('../services/question.service');
    const { questions } = await questionService.listNormalized();
    return questions;
}
async function getAllTestsQuestions() {
    return getCached("questions_all", () =>
        Question.findAll({
            where: {table_name: 'tests'},
            attributes: ["id", "table_name"],
        })
    );
}
async function getContact() {
    return getCached("contact_all", () =>
        Contact.findOne()
    );
}
async function getGroupQuestions() {
    return getCached("questions_all", () =>
        Question.findAll({
            where: {table_name: 'groups'},
            attributes: ["id", "table_name"],
        })
    );
}

// CONTROLLERS
exports.getDashboard = async (req, res) => {
    try {
        const [groups, tests, students] = await Promise.all([
            getAllGroups(),
            getAllTests(),
            getAllStudents()
        ]);

        res.render("admin/layouts/default", {
            title: "Գլխավոր",
            nav_active: "dashboard",
            getGroups: groups,
            getTests: tests,
            getStudents: students,
            url: req.url
        });

    } catch (e) {
        console.error(e);
        res.status(500).send("Server error");
    }
};

exports.getTests = async (req, res) => {
    try {
        const tests = await getAllTests();
        const testsAllQuestions = await getAllTestsQuestions();
        const totalTests = tests.length;
        const totalQuestions = tests.reduce((acc, t) => acc + (t.questions?.length || 0), 0);
        const averageQuestions = totalTests > 0 ? (totalQuestions / totalTests).toFixed(1) : 0;

        res.render("admin/pages/tests", {
            title: "Թեստեր",
            nav_active: "tests",
            testsAllQuestions,
            averageQuestions,
            helpers,
            getTests: tests
        });

    } catch (e) {
        console.error(e);
        res.status(500).send("Server error");
    }
};

exports.getGroups = async (req, res) => {
    try {
        const groups = await getAllGroups();
        const groupQuestions = await getGroupQuestions();
        const groupCount = groups.length;
        const questionCount = groups.reduce((sum, g) => sum + g.questions.length, 0);
        const avgGroupQuestions = groupCount > 0 ? (questionCount / groupCount).toFixed(1) : 0;

        
        res.render("admin/pages/groups", {
            title: "Խմբեր",
            nav_active: "groups",
            groups,
            groupQuestions,
            avgGroupQuestions,
            helpers
        });
    } catch (e) {
        console.error(e);
        res.status(500).send("Server error");
    }
};

exports.getQuestions = async (req, res) => {
    try {
        const questions = await getAllQuestions();
        const tests = await getAllTests();
        const groups = await getAllGroups();
        res.render("admin/pages/questions", {
            title: "Հարցեր",
            nav_active: "questions",
            questions,
            tests,
            groups,
            url: req.url
        });
    } catch (e) {
        console.error(e);
        res.status(500).send("Server error");
    }
};

exports.getGallery = async (req, res) => {
    try {
        const galleryService = require('../services/gallery.service');
        const { items } = await galleryService.getAll();

        res.render("admin/pages/gallery", {
            title: "Նկարներ",
            nav_active: "gallery",
            gallery: items,
            helpers,
            url: req.url
        });

    } catch (e) {
        res.status(500).send("Server error");
    }
};

exports.getUsers = async (req, res) => {
    try {
        const userService = require('../services/user.service');
        const { users } = await userService.getAll({ excludeRoles: ['admin','student'] });

        res.render("admin/pages/users", {
            title: "Օգտատերեր",
            nav_active: "users",
            users,
            url: req.url
        });

    } catch (e) {
        console.error(e);
        res.status(500).send("Server error");
    }
};

exports.getAnalytics = (req, res) => {
    res.render("admin/pages/analytics", {
        title: "Վերլուծություններ",
        nav_active: "analytics",
        url: req.url
    });
};

exports.getFaqs = async (req, res) => {
    try {
        const faqService = require('../services/faq.service');
        const { faqs } = await faqService.getAll();
        res.render("admin/pages/faqs", {
            title: "ՀՏՀ",
            nav_active: "faq",
            page: req.url,
            faqs
        });
    } catch (e) {
        res.status(500).send("Server error");
    }
};

exports.getContacts = async (req, res) => {
    try {
        const contactService = require('../services/contact.service');
        const { contact } = await contactService.get();
        let wh = contact.workingHours;
        if (typeof wh === "string") {
            try { wh = JSON.parse(wh); } catch { wh = []; }
        }
        if (!Array.isArray(wh)) wh = [];
        contact.workingHours = wh;
        res.render("admin/pages/contacts", {
            title: "Կոնտակտներ",
            nav_active: "contacts",
            contact,
            url: req.url
        });

    } catch (e) {
        res.status(500).send("Server error");
    }
};

exports.getRegistrations = async (req, res) => {
    try {
        const registrations = await Registration.findAll({
            order: [["id", "DESC"]]
        });

        res.render("admin/pages/registrations", {
            title: "Գրանցումներ",
            nav_active: "registrations",
            registrations,
            helpers,
            url: req.url
        });

    } catch (e) {
        console.error(e);
        res.status(500).send("Server error");
    }
};
