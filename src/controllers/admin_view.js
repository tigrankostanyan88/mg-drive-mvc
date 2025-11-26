// Models
const DB = require('../models');
const { Test, Group, Question, File, User, Registration } = DB.models;

const cache = require("../utils/cache");
const helpers = require("../utils/helpers");

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
    return getCached("tests_all", () => 
        Test.findAll({
            order: [["number", "ASC"]],
            include: [
                {
                    model: Question,
                    as: "questions",
                }
            ]
        }), 
    5);
}
async function getAllGroups() {
    return getCached("groups_all", () => Group.findAll({
        order: [["number", "ASC"]],
        include: [
            {
                model: Question,
                as: "questions",
            }
        ]
    }));
}
async function getAllStudents() {
    return getCached("students_all", () =>
        User.findAll({ where: { role: "student" }, raw: true })
    );
}
async function getAllQuestions() {
    return getCached("questions_all", () =>
        Question.findAll({
            attributes: ["id", "question", "row_id", "options", "correctAnswerIndex", "table_name"],
            include: [
                { model: File, as: "files", attributes: ["table_name", "row_id", "ext", 'name'] },
                { model: Test, as: "test", attributes: ["id", "title", "number"] },
                { model: Group, as: "group", attributes: ["id", "title", "number"] }
            ]
        })
    );
}
async function getAllTestsQuestions() {
    return getCached("questions_all", () =>
        Question.findAll({
            where: {table_name: 'tests'},
            attributes: ["id", "table_name"],
        })
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
        const totalQuestions = tests.reduce((acc, t) => acc + t.questions.length, 0);
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
        
        const normalized = questions.map(q => {
            let owner = null;
            if (q.table_name === "tests") owner = { type: "test", data: q.test };
            if (q.table_name === "groups") owner = { type: "group", data: q.group };

            let options = q.options;
            options = JSON.parse(options);
            options = JSON.parse(options);
            return {
                id: q.id,
                question: q.question,
                options: options,
                row_id: q.row_id,
                table_name: q.table_name,
                files: q.files,
                correctAnswerIndex: q.correctAnswerIndex,
                owner
            };
        });

        // console.log(normalized[0])

        res.render("admin/pages/questions", {
            title: "Հարցեր",
            nav_active: "questions",
            questions: normalized,
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
        const questions = await getAllQuestions();

        res.render("admin/pages/gallery", {
            title: "Նկարներ",
            nav_active: "gallery",
            questions,
            url: req.url
        });

    } catch (e) {
        res.status(500).send("Server error");
    }
};

exports.getUsers = async (req, res) => {
    try {
        const users = await getCached(
            "users_instructors",
            () => User.findAll({
                where: { role: { [DB.Sequelize.Op.notIn]: ["admin", "student"] }},
                include: "files"
            }),
            120
        );

        res.render("admin/pages/users", {
            title: "Օգտատերեր",
            nav_active: "users",
            users
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

exports.getFaqs = (req, res) => {
    res.render("admin/pages/faqs", {
        title: "ՀՏՀ",
        nav_active: "faqs",
        page: req.url
    });
};

exports.getContacts = async (req, res) => {
    try {
        const questions = await getAllQuestions();

        res.render("admin/pages/contacts", {
            title: "Կոնտակտներ",
            nav_active: "contacts",
            questions,
            url: req.url
        });

    } catch (e) {
        res.status(500).send("Server error");
    }
};