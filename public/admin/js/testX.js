/* =======================
 * DEPENDENCY IMPLEMENTATION
 * ======================= */

// Placeholder for notification system
function showNotification(message, type) {
    console.log(`[Notification - ${type.toUpperCase()}]: ${message}`);
}

// Class for handling pagination logic
class PaginationManager {
    constructor(containerElement, itemsPerPage = 6) {
        this.container = containerElement;
        this.itemsPerPage = itemsPerPage;
        this._totalItems = 0;
        this._currentPage = 1;
        this.onPageChange = (page) => {
            console.log(`Page changed to: ${page}`);
        };
    }

    set totalItems(count) {
        this._totalItems = count;
    }

    set currentPage(page) {
        this._currentPage = page;
    }

    get totalPages() {
        return Math.ceil(this._totalItems / this.itemsPerPage);
    }

    render() {
        // Update URL before rendering pagination links
        if (typeof questionsUIManager !== 'undefined' && questionsUIManager.writeURL) {
            questionsUIManager.writeURL();
        }

        const totalPages = this.totalPages;
        this.container.innerHTML = '';
        if (totalPages <= 1) return;

        const nav = document.createElement('nav');
        const ul = document.createElement('ul');
        ul.className = 'pagination justify-content-center';
        nav.appendChild(ul);

        this.appendPageItem(ul, '<<', this._currentPage - 1, this._currentPage === 1);

        const maxPagesToShow = 5;
        let startPage = Math.max(1, this._currentPage - Math.floor(maxPagesToShow / 2));
        let endPage = Math.min(totalPages, startPage + maxPagesToShow - 1);

        if (endPage - startPage + 1 < maxPagesToShow) {
            startPage = Math.max(1, endPage - maxPagesToShow + 1);
        }

        for (let i = startPage; i <= endPage; i++) {
            this.appendPageItem(ul, i, i, i === this._currentPage);
        }

        this.appendPageItem(ul, '>>', this._currentPage + 1, this._currentPage === totalPages);

        this.container.appendChild(nav);
    }

    // Helper to create page link items
    appendPageItem(ul, text, pageIndex, isDisabled) {
        const li = document.createElement('li');
        li.className = `page-item ${isDisabled ? 'disabled' : ''} ${pageIndex === this._currentPage ? 'active' : ''}`;

        const a = document.createElement('a');
        a.className = 'page-link';
        a.href = '#';
        a.textContent = text;

        if (!isDisabled && pageIndex >= 1 && pageIndex <= this.totalPages) {
            a.onclick = (e) => {
                e.preventDefault();
                this._currentPage = pageIndex;
                this.onPageChange(this._currentPage);
            };
        }

        li.appendChild(a);
        ul.appendChild(li);
    }
}

// Class for filtering cards based on search input
class SearchEngine {
    constructor({ inputSelector, containerSelector, itemSelector, urlParam }) {
        this.input = document.querySelector(inputSelector);
        this.container = document.querySelector(containerSelector);
        this.itemSelector = itemSelector;
        this.urlParam = urlParam;

        this.items = [...this.container.querySelectorAll(this.itemSelector)];
        
        // Read initial search term from URL
        const p = new URLSearchParams(location.search);
        this.initialSearchTerm = p.get(this.urlParam) || '';
        this.input.value = this.initialSearchTerm;

        this.applyFilter(this.initialSearchTerm);
        this.input.addEventListener('input', this.handleInput.bind(this));
    }

    handleInput() {
        const searchTerm = this.input.value.toLowerCase().trim();
        this.applyFilter(searchTerm);
    }

    // Apply filter and flag items as hidden/visible
    applyFilter(searchTerm) {
        this.items.forEach(item => {
            const cardText = item.dataset.question ? item.dataset.question.toLowerCase() : '';
            const isMatch = !searchTerm || cardText.includes(searchTerm);
            
            // Flag item for UIManager filtering
            item.dataset.searchHidden = isMatch ? "0" : "1";
        });

        // Reset to page 1 and trigger UIManager apply
        if (typeof questionsUIManager !== 'undefined' && questionsUIManager.apply) {
             questionsUIManager.state.page = 1;
             questionsUIManager.paginator.currentPage = 1;
             questionsUIManager.apply();
        }
    }
}


/* =======================
 * ANSWERS LOGIC
 * ======================= */

let answerCounter = 0;

// Function to add a new answer input row
function addAnswerInput(text = "", checked = false) {
    const c = document.getElementById("answersContainer");
    answerCounter++;

    const id = `correct-${answerCounter}`;

    const row = document.createElement("div");
    row.className = "answer-input-group d-flex align-items-center gap-2 mb-2";
    row.dataset.answerId = answerCounter;

    row.innerHTML = `
        <input type="text" class="form-control validate"
                name="answer_item"
                placeholder="Պատասխան ${answerCounter}"
                data-answer-text
                value="${(text || "").replace(/"/g, '&quot;')}">

        <div class="input-group-text">
            <input type="radio" name="correctAnswerIndex"
                    class="form-check-input mt-0"
                    id="${id}" value="${answerCounter}"
                    ${checked ? "checked" : ""}>
        </div>

        <label for="${id}" class="input-group-text answer-label" data-label>
            ${checked ? "Ճիշտ" : "Սխալ"}
        </label>

        <button type="button" class="btn btn-sm btn-outline-danger btn-remove-answer">
            <i class="bi bi-trash"></i>
        </button>
    `;

    // Remove button logic
    row.querySelector(".btn-remove-answer").onclick = () => {
        const radio = row.querySelector("input[type='radio']");
        if (radio.checked) {
            showNotification("Այս պատասխանը նշված է որպես Ճիշտ, ջնջել չի կարելի։", "warning");
            return;
        }
        row.remove();
        resetAnswerIndexes();
        updateCorrectLabels();
    };

    row.querySelector(`#${id}`).onchange = updateCorrectLabels;

    c.appendChild(row);
    updateCorrectLabels();
}

// Update "Ճիշտ/Սխալ" labels based on radio button state
function updateCorrectLabels() {
    document.querySelectorAll("input[name='correctAnswerIndex']").forEach(r => {
        const row = r.closest(".answer-input-group");
        if (!row) return; 
        
        const label = row.querySelector("[data-label]");
        if (!label) return; 

        const ok = r.checked;
        label.textContent = ok ? "Ճիշտ" : "Սխալ";
        label.classList.toggle("text-success", ok);
        label.classList.toggle("text-danger", !ok);
    });
}

// Re-index answer numbers and radio button values
function resetAnswerIndexes() {
    document.querySelectorAll(".answer-input-group").forEach((row, i) => {
        const num = i + 1;
        const input = row.querySelector("[data-answer-text]");
        const radio = row.querySelector("input[type='radio']");
        const label = row.querySelector("[data-label]");

        row.dataset.answerId = num;
        if(input) input.placeholder = `Պատասխան ${num}`;
        if(radio) {
             radio.value = num;
             radio.id = `correct-${num}`;
        }
        if(label && radio) label.setAttribute("for", radio.id);
    });

    answerCounter = document.querySelectorAll(".answer-input-group").length;
}

// Populate answer inputs from data
function setAnswers(options = [], correctIndex = 1) {
    const c = document.getElementById("answersContainer");
    if (!c) return;
    
    c.innerHTML = "";
    answerCounter = 0;

    if (!options.length) options = ["", ""];

    options.forEach((opt, i) =>
        addAnswerInput(opt, i + 1 === Number(correctIndex))
    );
}

/* =======================
 * MODAL LOGIC
 * ======================= */

const modalEl = document.getElementById("questionModal");
const formEl  = document.getElementById("questionForm");

const titleEl   = document.getElementById("questionModalTitle");
const submitBtn = document.getElementById("questionModalSubmitBtn");

const editorDiv = document.getElementById("delivery-text");
const editorTa  = document.getElementById("delivery-textarea");

const modalTest  = document.getElementById("modalFilterTest");
const modalGroup = document.getElementById("modalFilterGroup");
const tableInput = document.getElementById("table_name");
const methodOverride = document.getElementById("methodOverride");
const idInput    = document.getElementById("question_id");

const isModalReady = modalEl && formEl && titleEl && submitBtn && editorDiv && editorTa && modalTest && modalGroup && tableInput && methodOverride && idInput;

if (isModalReady) {
    // Set modal to 'Add New Question' state
    function resetModalToAdd() {
        titleEl.textContent = "Ավելացնել հարց";
        submitBtn.textContent = "ՈՒղարկել";
        formEl.action = "/api/v1/question";
        methodOverride.value = "post";
        idInput.value = "";
        editorDiv.innerHTML = "";
        editorTa.value = "";
        modalTest.value = "";
        modalGroup.value = "";
        // Set names for 'tests' by default
        modalTest.setAttribute("name", "row_id");
        modalGroup.removeAttribute("name");
        tableInput.value = "tests";
        setAnswers(["", ""], 1);
    }

    // Reset row_id names for filter logic
    function resetModalSelectNames() {
        modalTest.removeAttribute("name");
        modalGroup.removeAttribute("name");
    }

    // Populate modal fields for 'Edit Question' state
    function fillModalToEdit(card) {
        titleEl.textContent = "Խմբագրել հարցը";
        submitBtn.textContent = "Թարմացնել";

        const id = card.dataset.id;
        const q = card.dataset.question;
        const opts = JSON.parse(card.dataset.options || "[]");
        const correct = Number(card.dataset.correct || 1);
        const table = card.dataset.table;
        const row = card.dataset.row;

        formEl.action = `/api/v1/question/${id}`;
        methodOverride.value = "patch";
        idInput.value = id;

        editorDiv.innerHTML = q;
        editorTa.value = q;

        if (table === "tests") {
            modalTest.value = row;
            modalGroup.value = "";
            modalTest.setAttribute("name", "row_id");
            tableInput.value = "tests";
        } else {
            modalGroup.value = row;
            modalTest.value = "";
            modalGroup.setAttribute("name", "row_id");
            tableInput.value = "groups";
        }

        setAnswers(opts, correct);
    }

    // Handle modal open event
    modalEl.addEventListener("show.bs.modal", e => {
        const btn = e.relatedTarget;
        const mode = btn?.dataset.mode || "add";

        if (mode === "edit") {
            const card = btn.closest(".question-col-card"); 
            if (card) {
               fillModalToEdit(card);
            } else {
               resetModalToAdd();
               showNotification("Could not find card, defaulting to 'Add' mode.", "error");
            }
        } else {
            resetModalToAdd();
        }
    });

    /* =======================
     * MODAL SELECT FILTER LOGIC
     * ======================= */

    // Test filter change logic
    modalTest.addEventListener("change", () => {
        resetModalSelectNames();
        if (modalTest.value) {
            modalTest.setAttribute("name", "row_id");
            modalGroup.value = "";
            tableInput.value = "tests"; // Set table_name to 'tests'
        }
    });

    // Group filter change logic
    modalGroup.addEventListener("change", () => {
        resetModalSelectNames();
        if (modalGroup.value) {
            modalGroup.setAttribute("name", "row_id");
            modalTest.value = "";
            tableInput.value = "groups"; // Set table_name to 'groups'
        }
    });
}


/* =======================
 * ADD ANSWER BUTTON LISTENER
 * ======================= */

document.getElementById("addAnswerBtn")
    ?.addEventListener("click", () => addAnswerInput("", false));

/* =======================
 * FILTERS + PAGINATION MANAGER
 * ======================= */

// Main class to manage UI state, filtering, and pagination
class QuestionsUIManager {
    constructor() {
        this.cards = [...document.querySelectorAll(".question-col-card")];
        this.test  = document.getElementById("filterTest");
        this.group = document.getElementById("filterGroup");

        const paginatorEl = document.getElementById("questionsPag");
        if (!paginatorEl) {
             console.error("questionsPag element not found.");
             this.paginator = { itemsPerPage: 6, totalItems: 0, render: () => {}, onPageChange: () => {} };
        } else {
             this.paginator = new PaginationManager(paginatorEl);
        }
        
        this.state = { table: null, row: null, page: 1 };

        this.readURL();
        this.bind();
        this.apply();
    }

    // Read state from URL parameters
    readURL() {
        const p = new URLSearchParams(location.search);
        const test  = p.get("test");
        const group = p.get("group");
        const page  = parseInt(p.get("page")) || 1;

        if (test) {
            this.state.table = "tests";
            this.state.row   = test;
            if (this.test) this.test.value   = test;
            if (this.group) this.group.value = "";
        } else if (group) {
            this.state.table = "groups";
            this.state.row   = group;
            if (this.group) this.group.value = group;
            if (this.test) this.test.value   = "";
        } else {
             this.state.table = null;
             this.state.row = null;
             if (this.test) this.test.value = "";
             if (this.group) this.group.value = "";
        }

        this.state.page = page;
        this.paginator.currentPage = page;
    }

    // Write current state to URL
    writeURL() {
        const url = new URL(location.href);

        if (this.state.table === "tests" && this.state.row) {
            url.searchParams.set("test", this.state.row);
            url.searchParams.delete("group");
        } else if (this.state.table === "groups" && this.state.row) {
            url.searchParams.set("group", this.state.row);
            url.searchParams.delete("test");
        } else {
            url.searchParams.delete("test");
            url.searchParams.delete("group");
        }

        if (this.state.page > 1) url.searchParams.set("page", this.state.page);
        else url.searchParams.delete("page");

        history.replaceState({}, "", url);
    }

    // Apply filtering and display logic
    apply() {
        const per = this.paginator.itemsPerPage;
        let page = this.state.page;
        
        this.writeURL();

        // 1. FILTER visible cards based on state and search
        let visible = this.cards.filter(c => {
            // Test/Group filter logic: Matches table_name (data-table) and row_id (data-row)
            if (this.state.table && this.state.row) {
                if (c.dataset.table !== this.state.table || 
                    c.dataset.row != this.state.row) 
                    return false;
            }
            // Search filter logic
            if (c.dataset.searchHidden === "1") return false; 
            return true;
        });
        
        // 2. Adjust page number if needed (e.g., if total pages decreased)
        const totalPages = Math.ceil(visible.length / per);
        if (page > totalPages && totalPages > 0) {
            this.state.page = totalPages;
            this.paginator.currentPage = totalPages;
            return this.apply(); // Re-apply with corrected page
        } else if (totalPages === 0) {
             this.state.page = 1;
             this.paginator.currentPage = 1;
        }

        // 3. PAGINATION slicing and display
        const start = (page - 1) * per;
        const end = start + per;

        this.cards.forEach(c => c.style.display = "none");
        visible.forEach((c, i) => {
            if (i >= start && i < end) c.style.display = "";
        });

        // 4. Update paginator UI
        this.paginator.totalItems = visible.length;
        this.paginator.render();
    }

    // Bind event handlers for filters and pagination
    bind() {
        if (this.test) {
            this.test.onchange = () => {
                const id = this.test.value;
                if (id) {
                    this.state.table = "tests"; // table_name = "tests"
                    this.state.row   = id;      // row_id = selected ID
                    this.group.value = "";
                } else {
                    this.state.table = null;
                    this.state.row   = null;
                }
                this.state.page = 1;
                this.paginator.currentPage = 1;
                this.apply();
            };
        }

        if (this.group) {
            this.group.onchange = () => {
                const id = this.group.value;
                if (id) {
                    this.state.table = "groups"; // table_name = "groups"
                    this.state.row   = id;       // row_id = selected ID
                    this.test.value  = "";
                } else {
                    this.state.table = null;
                    this.state.row   = null;
                }
                this.state.page = 1;
                this.paginator.currentPage = 1;
                this.apply();
            };
        }

        this.paginator.onPageChange = (page) => {
            this.state.page = page;
            this.apply();
        };

        // Handle browser back/forward buttons
        window.addEventListener("popstate", () => {
            this.readURL();
            this.apply();
        });
    }
}

// Global reference for UIManager
let questionsUIManager;

// Initialize classes on DOM load
document.addEventListener("DOMContentLoaded", () => {
    
    // Init SearchEngine
    if (document.getElementById("searchInput") && document.getElementById("questionsList")) {
         new SearchEngine({
             inputSelector: "#searchInput",
             containerSelector: "#questionsList",
             itemSelector: ".question-col-card",
             urlParam: "search"
         });
    }

    // Init QuestionsUIManager
    if (document.getElementById("questionsPag")) {
        questionsUIManager = new QuestionsUIManager();
    }
});