import SearchEngine from "./ui/SearchEngine.js";
import PaginationManager from "./ui/PaginationManager.js";
import FilterManager from "./ui/FilterManager.js";
import UIManager from "./ui/UIManager.js";
import showNotification from "./ui/NotificationManager.js";
 
function initQuestionModal() {
    let answerCounter = 0;

    const question = document.querySelector('#questions');
    if (!question) return;
    const tableNameInput = document.querySelector('#table_name');
    const testSelect = document.getElementById('modalFilterTest');
    const groupSelect = document.getElementById('modalFilterGroup');
    const addAnswerBtn = document.getElementById('addAnswerBtn');
    const answersContainer = document.getElementById('answersContainer');

    // (INTERNAL FUNCTION)
    function updateRowIdNames() {
        if (testSelect.value) {

            // TEST becomes active
            testSelect.setAttribute("name", "row_id");
            testSelect.classList.add("validate");

            // GROUP becomes inactive
            groupSelect.removeAttribute("name");
            groupSelect.classList.remove("validate");
        } else if (groupSelect.value) {

            // GROUP becomes active
            groupSelect.setAttribute("name", "row_id");
            groupSelect.classList.add("validate");

            // TEST becomes inactive
            testSelect.removeAttribute("name");
            testSelect.classList.remove("validate");
        }
    }

    // 1) SelectReset Logic
    testSelect.addEventListener('change', () => {
        if (testSelect.value) groupSelect.value = "";
        updateRowIdNames();
        updateTableName();
    });

    groupSelect.addEventListener('change', () => {
        if (groupSelect.value) testSelect.value = "";
        updateRowIdNames();
        updateTableName();
    });

    // 2) Add Answer
    addAnswerBtn.addEventListener('click', () => {
        answerCounter++;

        const div = document.createElement('div');
        div.className = 'answer-input-group input-group mb-2';
        div.dataset.answerId = answerCounter;

        div.innerHTML = `
            <input type="text" class="form-control" name="answer_item" placeholder="Պատասխան ${answerCounter}" data-answer-text>

            <div class="input-group-text">
                <input type="checkbox" name="correctAnswerIndex" class="form-check-input mt-0 answer-correct" 
                    data-answer-correct 
                    data-index="${answerCounter}">
            </div>

            <span class="input-group-text">Ճիշտ</span>

            <button type="button" class="btn btn-sm btn-outline-danger btn-remove-answer" data-remove-answer>
                <i class="bi bi-trash"></i>
            </button>
        `;

        answersContainer.appendChild(div);
    });

    // 3) Correct answer (radio-like)
    answersContainer.addEventListener('change', e => {
        if (e.target.matches('[data-answer-correct]')) {

            document.querySelectorAll('[data-answer-correct]').forEach(chk => {
                if (chk !== e.target) chk.checked = false;
            });

            e.target.value = e.target.dataset.index;
        }
    });

    // 4) Delete Answer
    answersContainer.addEventListener('click', e => {
        const btn = e.target.closest('[data-remove-answer]');
        if (!btn) return;

        const group = btn.closest('.answer-input-group');
        const checkbox = group.querySelector('[data-answer-correct]');

        if (checkbox.checked) {
            showDeleteError();
            return;
        }

        group.remove();
    });

    // 5) Error Toast / Alert
    function showDeleteError() {
        if (window.bootstrap && document.getElementById('deleteErrorToast')) {
            let toast = new bootstrap.Toast(document.getElementById('deleteErrorToast'));
            toast.show();
        } else {
            alert("Այս պատասխանը ընտրված է որպես ճիշտ, չես կարա ջնջես։");
        }
    }

    // Initial call
    updateRowIdNames();

    function updateTableName() {
        if (testSelect.value) {
            tableNameInput.value = "tests";
        } else if (groupSelect.value) {
            tableNameInput.value = "groups";
        }
    }
}

// Edit Modal
function editModal() {
    const editModalEl = document.getElementById("questionEditModal");
    const editForm = document.getElementById("questionEditForm");
    const editTestSelect = document.getElementById("editTestSelect");
    const editGroupSelect = document.getElementById("editGroupSelect");
    const editTableName = document.getElementById("editTableName");
    const editQuestionText = document.getElementById("editQuestionText");
    const editQuestionTextarea = document.getElementById('editQuestionTextarea');
    const editAnswersContainer = document.getElementById("editAnswersContainer");
    const editCorrect = document.getElementById("editCorrectAnswerIndex");
    const editImagePreview = document.getElementById("editImagePreview");

    // 1) TEST / GROUP SELECT LOGIC
    editTestSelect.addEventListener("change", () => {
        if (editTestSelect.value) {
            editTestSelect.setAttribute("name", "row_id");
            editGroupSelect.removeAttribute("name");
            editGroupSelect.value = "";

            editTableName.value = "tests";
        }
    });

    editGroupSelect.addEventListener("change", () => {
        if (editGroupSelect.value) {
            editGroupSelect.setAttribute("name", "row_id");
            editTestSelect.removeAttribute("name");
            editTestSelect.value = "";

            editTableName.value = "groups";
        }
    });

    // 2) ADD ANSWER ROW
    document.getElementById("editAddAnswerBtn").addEventListener("click", () => {
        addAnswerRow("");
        updateIndexes();
    });

    function addAnswerRow(text, isCorrect = false, index = null) {
        const i = index || editAnswersContainer.children.length + 1;

        const div = document.createElement("div");
        div.className = "input-group mb-2 answer-row";

        div.innerHTML = `
            <input type="text" name="answer_item" class="form-control" value="${text}">
            
            <span class="input-group-text">
                <input type="checkbox" class="form-check-input answer-correct" data-index="${i}" ${isCorrect ? "checked" : ""}>
            </span>

            <button type="button" class="btn btn-sm btn-outline-danger btn-remove-answer">
                <i class="bi bi-trash"></i>
            </button>
        `;

        editAnswersContainer.appendChild(div);
    }

    // 3) CORRECT ANSWER - RADIO MODE
    editAnswersContainer.addEventListener("change", (e) => {
        if (!e.target.classList.contains("answer-correct")) return;

        const index = e.target.dataset.index;

        editAnswersContainer.querySelectorAll(".answer-correct").forEach(chk => {
            if (chk !== e.target) chk.checked = false;
        });

        editCorrect.value = index;
    });



    // 4) DELETE ANSWER
    editAnswersContainer.addEventListener("click", (e) => {
        const btn = e.target.closest(".btn-remove-answer");
        if (!btn) return;

        const row = btn.closest(".answer-row");
        const chk = row.querySelector(".answer-correct");

        if (chk.checked) {
            showNotification("Չես կարա ջնջես ճիշտ պատասխանը։", "warning");
            return;
        }

        row.remove();
        updateIndexes();
    });


    // 5) REINDEX ANSWERS
    function updateIndexes() {
        let i = 1;

        editAnswersContainer.querySelectorAll(".answer-row").forEach(row => {
            const chk = row.querySelector(".answer-correct");
            chk.dataset.index = i;
            if (chk.checked) {
                editCorrect.value = i;
            }
            i++;
        });
    }


    // 6) POPULATE EDIT MODAL
    document.querySelectorAll(".btn-edit").forEach(btn => {
        btn.addEventListener("click", () => {

            const card = btn.closest(".question-col-card");

            const id = card.dataset.id;
            const table = card.dataset.table;   // ← ONLY for restoring
            const rowId = card.dataset.rowid;
            const question = card.dataset.question;

            // Set form action
            editForm.action = `/api/v1/question/${id}`;

            // Reset selects
            editTestSelect.removeAttribute("name");
            editGroupSelect.removeAttribute("name");
            editTestSelect.value = "";
            editGroupSelect.value = "";

            // Restore owner from card
            if (table === "tests") {
                editTestSelect.value = rowId;
                editTestSelect.setAttribute("name", "row_id");

                editTableName.value = "tests";
            } else {
                editGroupSelect.value = rowId;
                editGroupSelect.setAttribute("name", "row_id");

                editTableName.value = "groups";
            }

            // Set question
            editQuestionText.innerHTML = question;
            editQuestionTextarea.value = question;

            // Image preview
            editImagePreview.innerHTML = "";
            const img = card.querySelector(".question-image img");
            if (img) {
                editImagePreview.innerHTML = `
                    <img src="${img.src}" class="img-fluid rounded mb-2" style="max-height:250px;">
                    <button type="button" class="btn btn-outline-danger mt-2 fs-6"
                            id="editRemoveImageBtn">
                        Ջնջել նկարը
                    </button>
                    <hr>
                `;
            }

            // Answers
            editAnswersContainer.innerHTML = "";
            editCorrect.value = "";

            const answers = card.querySelectorAll(".answer-item");
            let i = 1;

            answers.forEach(item => {
                const text = item.querySelector("span").innerText;
                const isCorrect = item.classList.contains("correct");

                addAnswerRow(text, isCorrect, i);

                if (isCorrect) editCorrect.value = i;

                i++;
            });

            updateIndexes();

            new bootstrap.Modal(editModalEl).show();
        });
    });
}

const removeImageBtn = document.getElementById('removeImageBtn');
if (removeImageBtn) {
    removeImageBtn.addEventListener('click', () => {
        // Reset preview
        let imagCrop = document.querySelector('.img-cropper-container');
        let img = imagCrop.querySelector('img')
        let input = imagCrop.querySelector('input[type="file"]');

        input.remove();
        img.remove();
    });
}

document.addEventListener("DOMContentLoaded", () => {
    // Initialize modal behavior
    initQuestionModal();
    editModal();
    const cards = [...document.querySelectorAll(".question-col-card")];
    let visible = [...cards];
    let isInitialLoad = true;
    let isInitialSearchLoad = true;

    const paginator = new PaginationManager({
        container: document.getElementById("questionsPag"),
        itemsPerPage: 4
    });

    const ui = new UIManager({ cards, paginator});
    ui.refresh(visible);

    // Correct SearchEngine usage
    new SearchEngine({
        input: "#searchInput",
        selector: ".question-col-card",
        urlParam: "search",

        onSearch: (results, fromUser = false) => {
            visible = results;

            if (!isInitialSearchLoad && fromUser) {
                paginator.setPage(1);
            }

            ui.refresh(visible);

            isInitialSearchLoad = false;
        }
    });

    new FilterManager({
        testSelect: "#filterTest",
        groupSelect: "#filterGroup",
        selector: ".question-col-card",
        onFilter: (filtered) => {
            visible = filtered;
            if (!isInitialLoad) paginator.setPage(1); 
            ui.refresh(visible);
            isInitialLoad = false;
        }
    });

    paginator.onPageChange = (page) => {
        ui.refresh(visible);
    };
});

