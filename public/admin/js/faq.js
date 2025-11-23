const FAQ_CONFIG = {
    API_BASE_URL: '',
    USE_API: false,
    STORAGE_KEY: 'faqData'
};

const FaqDataService = (() => {
    const KEY = FAQ_CONFIG.STORAGE_KEY;

    const local = {
        getAll() {
            try {
                const s = localStorage.getItem(KEY);
                return s ? JSON.parse(s) : [];
            } catch {
                localStorage.removeItem(KEY);
                return [];
            }
        },
        saveAll(list) {
            localStorage.setItem(KEY, JSON.stringify(list));
        },
        create(data) {
            const list = this.getAll();
            const id = list.length ? Math.max(...list.map(i => i.id)) + 1 : 1;
            const item = { id, ...data };
            list.push(item);
            this.saveAll(list);
            return item;
        },
        update(id, data) {
            const list = this.getAll();
            const i = list.findIndex(f => f.id === id);
            if (i === -1) return null;
            list[i] = { ...list[i], ...data };
            this.saveAll(list);
            return list[i];
        },
        delete(id) {
            const list = this.getAll();
            const filtered = list.filter(f => f.id !== id);
            if (filtered.length === list.length) return false;
            this.saveAll(filtered);
            return true;
        }
    };

    async function apiGet(url, opts) {
        const r = await fetch(url, opts);
        if (!r.ok) throw new Error(`API error: ${opts?.method || 'GET'}`);
        return r.json();
    }

    const api = {
        getAll() {
            return apiGet(`${FAQ_CONFIG.API_BASE_URL}/api/faq`);
        },
        create(data) {
            return apiGet(`${FAQ_CONFIG.API_BASE_URL}/api/faq`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(data)
            });
        },
        update(id, data) {
            return apiGet(`${FAQ_CONFIG.API_BASE_URL}/api/faq/${id}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(data)
            });
        },
        async delete(id) {
            const r = await fetch(`${FAQ_CONFIG.API_BASE_URL}/api/faq/${id}`, { method: "DELETE" });
            if (!r.ok) throw new Error("API delete failed");
            return true;
        }
    };

    function useApi() {
        return FAQ_CONFIG.USE_API && FAQ_CONFIG.API_BASE_URL;
    }

    return {
        async getAll() {
            return useApi() ? api.getAll() : local.getAll();
        },
        async create(data) {
            return useApi() ? api.create(data) : local.create(data);
        },
        async update(id, data) {
            return useApi() ? api.update(id, data) : local.update(id, data);
        },
        async delete(id) {
            return useApi() ? api.delete(id) : local.delete(id);
        },
        initDefaults() {
            if (useApi()) return;
            const items = local.getAll();
            if (items.length) return;
            local.saveAll([
                { id: 1, question: "Ինչպե՞ս գրանցվել…", answer: "Կայքով կամ զանգով…" },
                { id: 2, question: "Որքա՞ն է արժեքը…", answer: "Կախված փաթեթից…" },
                { id: 3, question: "Որքա՞ն է տևում…", answer: "Սովորաբար 2-3 ամիս…" }
            ]);
        }
    };
})();

const Utils = {
    escape(t = "") {
        const d = document.createElement("div");
        d.textContent = t;
        return d.innerHTML;
    },
    toast(type, msg) {
        const box = document.createElement("div");
        box.className = `alert alert-${type} alert-dismissible fade show position-fixed top-0 start-50 translate-middle-x mt-3`;
        box.style.zIndex = "9999";
        box.innerHTML = `${msg}<button type="button" class="btn-close" data-bs-dismiss="alert"></button>`;
        document.body.appendChild(box);
        setTimeout(() => box.remove(), 3000);
    },
    success(msg) { this.toast("success", msg); },
    error(msg) { this.toast("danger", msg); }
};

// Controller
const FaqController = (() => {
    let items = [];

    const el = {
        list: () => document.getElementById("faqList"),
        addQ: () => document.getElementById("faqQuestion"),
        addA: () => document.getElementById("faqAnswer"),
        addForm: () => document.getElementById("faqForm"),
        addBtn: () => document.getElementById("saveFaqBtn"),

        editId: () => document.getElementById("editFaqId"),
        editQ: () => document.getElementById("editFaqQuestion"),
        editA: () => document.getElementById("editFaqAnswer"),
        editBtn: () => document.getElementById("updateFaqBtn"),

        addModal: () => document.getElementById("addFaqModal"),
        editModal: () => document.getElementById("editFaqModal")
    };

    function render() {
        const c = el.list();
        if (!c) return;

        if (!items.length) {
            c.innerHTML = `
                <div class="faq-empty">
                    <i class="bi bi-question-circle"></i>
                    <h3>Հարցեր չկան</h3>
                    <p>Ավելացրեք առաջին հարցը</p>
                </div>
            `;
            return;
        }

        c.innerHTML = "";
        items.forEach(f => {
            const div = document.createElement("div");
            div.className = "faq-item";
            div.innerHTML = `
                <div class="faq-question">
                    <p>${Utils.escape(f.question)}</p>
                    <div class="faq-actions">
                        <button class="btn btn-sm btn-outline-primary" data-act="edit" data-id="${f.id}">
                            <i class="bi bi-pencil"></i>
                        </button>
                        <button class="btn btn-sm btn-outline-danger" data-act="del" data-id="${f.id}">
                            <i class="bi bi-trash"></i>
                        </button>
                    </div>
                </div>
                <div class="faq-answer">${Utils.escape(f.answer)}</div>
            `;
            c.appendChild(div);
        });
    }

    async function load() {
        items = await FaqDataService.getAll();
        render();
    }

    async function add() {
        const q = el.addQ().value.trim();
        const a = el.addA().value.trim();
        if (!q || !a) return Utils.error("Լրացրեք բոլոր դաշտերը");

        const created = await FaqDataService.create({ question: q, answer: a });
        items.push(created);

        render();

        el.addForm().reset();
        bootstrap.Modal.getInstance(el.addModal()).hide();

        Utils.success("Ավելացվեց");
    }

    async function edit(id) {
        const item = items.find(i => i.id === id);
        if (!item) return Utils.error("Չի գտնվել");

        el.editId().value = item.id;
        el.editQ().value = item.question;
        el.editA().value = item.answer;

        new bootstrap.Modal(el.editModal()).show();
    }

    async function update() {
        const id = parseInt(el.editId().value);
        const q = el.editQ().value.trim();
        const a = el.editA().value.trim();

        if (!q || !a) return Utils.error("Լրացրեք բոլոր դաշտերը");

        const updated = await FaqDataService.update(id, { question: q, answer: a });
        items = items.map(i => i.id === id ? updated : i);

        render();

        bootstrap.Modal.getInstance(el.editModal()).hide();
        Utils.success("Թարմացվեց");
    }

    async function remove(id) {
        if (!confirm("Ջնջե՞լ հարցը")) return;

        const ok = await FaqDataService.delete(id);
        if (!ok) return Utils.error("Չի գտնվել");

        items = items.filter(i => i.id !== id);
        render();

        Utils.success("Ջնջվեց");
    }

    function bindEvents() {
        el.addBtn()?.addEventListener("click", add);
        el.editBtn()?.addEventListener("click", update);

        el.list()?.addEventListener("click", e => {
            const btn = e.target.closest("button[data-act]");
            if (!btn) return;

            const id = parseInt(btn.dataset.id);
            const act = btn.dataset.act;

            if (act === "edit") edit(id);
            else if (act === "del") remove(id);
        });

        el.addModal()?.addEventListener("hidden.bs.modal", () => el.addForm().reset());
    }

    return {
        init() {
            FaqDataService.initDefaults();
            bindEvents();
            load();
        }
    };
})();

// Init (no globals, no window attach)
document.addEventListener("DOMContentLoaded", () => {
    FaqController.init();
});
