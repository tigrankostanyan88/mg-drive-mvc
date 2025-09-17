const selectQuestion = document.getElementById('question_add_type');
const selectedRow = document.querySelector('.selected_row');
const addAnswer = document.querySelector('.add_answer');
const image = document.querySelector('.question_image');
const file = document.querySelector('.questionImageFile');

if(selectQuestion) { 
    selectQuestion.addEventListener('change', async function() {
        selectedRow.innerHTML = '';
    
        const select = document.createElement('select');
        select.classList.add('form-control', 'text-white');
        select.name = 'row_id';
    
        let url = '';
        let dataKey = '';
    
        if (selectQuestion.value === 'test') {
            url = '/api/v1/tests/';
            dataKey = 'tests';
        } else if (selectQuestion.value === 'group') {
            url = '/api/v1/groups/';
            dataKey = 'groups';
        } else {
            return;
        }
    
        try {
            const response = await axios.get(url);
            const dataList = response.data[dataKey];
    
            if (!dataList || dataList.length === 0) {
                const option = document.createElement('option');
                option.disabled = true;
                option.selected = true;
                option.textContent = 'Ոչինչ չի գտնվել';
                select.appendChild(option);
            } else {
                dataList.forEach(item => {
                    const option = document.createElement('option');
                    option.classList.add('text-white');
                    option.value = item.id;
                    option.textContent = item.title;
                    select.appendChild(option);
                });
            }
    
            selectedRow.appendChild(select);
        } catch (error) {
            console.error('Error fetching data:', error);
            selectedRow.textContent = 'Սխալ է տեղի ունեցել։';
        }
    });
}

if(addAnswer) {
    addAnswer.addEventListener('click', () => {
        const ul = document.querySelector('.answer_list_items');
    
        // 1) create elements
        const textarea = document.createElement('textarea');
        const li = document.createElement('li');
        const removeBtn = document.createElement('button');
    
        textarea.placeholder = 'Պատասխան․․․';
        textarea.name = 'answer';
        removeBtn.innerHTML = 'Ջնջել';
        textarea.classList.add('mb-3', 'form-control');
        li.classList.add('text-control', 'answer_list_item', 'd-flex');
        removeBtn.classList.add('btn', 'btn-danger', 'py-3', 'remove_answer');
    
        li.appendChild(textarea);
        li.appendChild(removeBtn);
        ul.appendChild(li);
    
        // remove list item
        removeBtn.addEventListener('click', () => {
            li.remove();
            checkAnswerQty();
        });
        checkAnswerQty()
    });
}

const removeQuestionAnswerBtns = document.querySelectorAll('.remove_answer');
if(removeQuestionAnswerBtns) {
    removeQuestionAnswerBtns.forEach(remove => {
        remove.addEventListener('click', () => {
            console.log()
            remove.parentElement.remove();
            checkAnswerQty();
        });
    })
}


function checkAnswerQty() {
    let items = document.querySelectorAll('.answer_list_item');
    let correctAnswerIndex = document.querySelector('.correctAnswerIndex');
    correctAnswerIndex.innerHTML = '';

    if (items.length === 0) {
        const option = document.createElement('option');
        option.classList.add('form-control')
        option.selected = true;
        option.textContent = 'Պատասխաններ չկան';
        correctAnswerIndex.appendChild(option);
        return;
    }

    items.forEach((el, index) => {
        let option = document.createElement('option');
        option.classList.add('form-control');
        option.value = index + 1;
        option.textContent = `Պատասխան ${index + 1}`;

        correctAnswerIndex.appendChild(option)
    });
}

if(file) {
    file.addEventListener('change', (e) => {
        const filePath = file.files[0];
        if(filePath) {
            image.style.opacity = 1;
            const imageUrl = URL.createObjectURL(filePath);
            image.src = imageUrl;
        }
    });
}