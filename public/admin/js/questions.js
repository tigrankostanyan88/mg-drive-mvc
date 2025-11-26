import SearchEngine from "./ui/SearchEngine.js";
import PaginationManager from "./ui/PaginationManager.js";
import UIManager from "./ui/UIManager.js";

function initQuestionModal() {
    let answerCounter = 0;

    const question = document.querySelector('#questions');
    if (!question) return;
    const tableNameInput = document.querySelector('#table_name');
    const testSelect = document.getElementById('modalFilterTest');
    const groupSelect = document.getElementById('modalFilterGroup');
    const addAnswerBtn = document.getElementById('addAnswerBtn');
    const answersContainer = document.getElementById('answersContainer');
    const correctAnswerInput = document.getElementById('correctAnswerIndex');

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

document.addEventListener("DOMContentLoaded", () => {
    // Initialize modal behavior
    initQuestionModal();

    const cards = [...document.querySelectorAll(".question-col-card")];
    let visible = [...cards];

    const paginator = new PaginationManager({
        container: document.getElementById("questionsPag"),
        itemsPerPage: 4
    });

    const ui = new UIManager({
        cards,
        paginator
    });
    ui.refresh(visible);

    // Correct SearchEngine usage
    new SearchEngine({
        input: "#searchInput",
        selector: ".question-col-card",
        urlParam: "search",
        onSearch: (results) => {
            visible = results;
            ui.refresh(visible);
        }
    });

    paginator.onPageChange = (page) => {
        ui.refresh(visible);
    };
});


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