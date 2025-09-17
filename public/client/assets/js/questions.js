class Questions {
    constructor(object, containerSelector) {
        this.object = object;
        this.container = document.querySelector(containerSelector);
        this.correctAnswers = object.map(item => item.correctAnswerIndex);
        this.answeredQuestions = new Set();
        this.score = 0;
        this.resultBox = document.createElement('div');
        this.resultBox.id = 'resultBox';
        this.init();
    }
    generateAnswer(option, i, qIndex) {
        return `
            <li class="question_answer" data-question="${qIndex}" data-index="${i}">
              <span class="count">0${i + 1}</span> ${option}
            </li>`;
    }
    renderQuestionCard(item, index) {
        let answersHTML = '';
        let options = this.isValidJSON(item.options);
        
        options.forEach((option, i) => {
            answersHTML += this.generateAnswer(option, i, index);
        });

        return `
            <div class="questionCard">
              <div class="image" id="lightgallery">
                <a href="https://caradas.com/wp-content/uploads/2024/09/AdobeStock_224332680-scaled.jpeg" class="gallery_item scroll_animate">
                    <canvas class="question_image"></canvas>
                </a>
              </div>
              <div class="card_body">
                <h3 class="title">${item.question}</h3>
                <ul class="question_answers">${answersHTML}</ul>
              </div>
            </div>`;
    }
    isValidJSON(obj) {
        try {
            JSON.stringify(obj);
            return JSON.parse(obj);
        } catch (e) {
            return obj;
        }
    }
    renderQuestions() {
        this.object.forEach((item, index) => {
            this.container.innerHTML += this.renderQuestionCard(item, index);
        });

        if (this.container) this.container.appendChild(this.resultBox);
    }
    invisibleImage() {
        const canvas = document.querySelectorAll(".question_image");
        canvas.forEach(el => {
            const ctx = el.getContext("2d");

            const img = new Image();
            img.src = "https://caradas.com/wp-content/uploads/2024/09/AdobeStock_224332680-scaled.jpeg";

            img.onload = function () {
                ctx.drawImage(img, 0, 0, el.width, el.height);

                // Ջրանիշ ավելացնելու օրինակ
                ctx.font = "24px roboto";
                ctx.fillStyle = "rgba(10, 10, 10, 0.9)";
                ctx.fillText("© MSpace", 20, el.height - 20);
            };

            // blur when the page loses focus
            window.addEventListener("blur", () => {
                el.style.filter = "blur(3px)";
            });

            window.addEventListener("focus", () => {
                el.style.filter = "none";
            });
        })
    }
    handleClicks() {
        const allAnswers = document.querySelectorAll('.question_answer');
        allAnswers.forEach(answer => {
            answer.addEventListener('click', () => {
                const qIndex = parseInt(answer.dataset.question);
                const selected = parseInt(answer.dataset.index);
                const correct = this.correctAnswers[qIndex];

                const allInQuestion = answer.parentElement.querySelectorAll('.question_answer');
                if (this.answeredQuestions.has(qIndex)) return;

                allInQuestion.forEach((ans, i) => {
                    ans.style.pointerEvents = 'none';

                    if (i === correct) {
                        ans.style.backgroundColor = '#d4edda';
                        ans.style.color = '#155724';
                    }

                    if (i === selected && selected !== correct) {
                        ans.style.backgroundColor = '#f8d7da';
                        ans.style.color = '#721c24';
                    }
                });

                this.answeredQuestions.add(qIndex);
                if (selected === correct) this.score++;

                if (this.answeredQuestions.size == this.object.length) {
                    this.resultBox.innerHTML = `<div class="result"><i class=" fa-solid fa-circle-check" style="font-size: 20px; color: #00DE3B"></i> Դու պատասխանել ես ${this.object.length}-ից <strong>${this.score}</strong> ճիշտ հարցի։</div>`;
                }
            });
        });
    }
    init() {
        this.renderQuestions();
        this.handleClicks();
        this.invisibleImage();
    }
}

let testsRow = document.querySelector('.tests_page');
let groupRow = document.querySelector('.group_page');


const selectQuestion = document.querySelector('#select_questions');
const testMap = {};
async function render(api) {
    return await axios.get(api);
} 

// new Questions(tests, '.tests_page .container');
if(selectQuestion) {

    axios.get('/api/v1/tests').then(response => {
    response.data.tests.forEach(item => {
        const option = document.createElement('option');
        option.innerHTML = item.slug;
        option.dataset.key = crypto.randomUUID();
        selectQuestion.appendChild(option);
        testMap[item.slug] = item.id;
    });
})
.catch(error => {
    console.error('Սխալ:', error);
});

    selectQuestion.addEventListener('change', async (e) => {
        const selectedSlug = e.target.value; // օրինակ՝ "test-1"
        const selectedId = testMap[selectedSlug]; // օրինակ՝ "64383fa9a445..."
        try {
            const response = await render(`/api/v1/tests/${selectedId}`);
            const questions = response.data.test.questions;
    
            if (questions.length > 0) {
                new Questions(questions, '.tests_page .container');
            }
        } catch (error) {
            console.log(error.message);
            console.log(error);
        }
    });
}

