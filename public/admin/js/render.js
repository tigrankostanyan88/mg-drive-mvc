function formatDate(date) {
    const d = new Date(date);
    return `${d.getDate().toString().padStart(2, '0')}.${(d.getMonth() + 1).toString().padStart(2, '0')}.${d.getFullYear()} ${d.getHours().toString().padStart(2, '0')}:${d.getMinutes().toString().padStart(2, '0')}`;
}

async function renderTest() {
    const testEl = document.querySelector('.test_row');

    try {
        const response = await doAxios('/api/v1/tests', 'get');

        if (!testEl) return;

        testEl.innerHTML = response.data.tests.map(test => {
            const questionCount = test.questions.length;
            const label = questionCount > 0 ?
                `<span class='text-success'>${questionCount} հարց</span>` :
                `<span class="text-danger">Հարցեր դեռ չի ավելացվել</span>`;

            return `
                    <tr>
                        <td>
                            <a href="/admin/test/${test.id}">${test.slug}</a>
                        </td>
                        <td>${formatDate(test.createdAt)}</td>
                        <td>${formatDate(test.updatedAt)}</td>
                        <td class="text-primary"> ${test.questions.length} հարց </td>
                        <td class="text-warning">
                            <a href="/admin/test/${test.id}">Թեստի հարցերը</a>
                        </td>
                        <td>
                            <button type="submit" data-id="${test.id}" class="removeTest btn btn-danger">Ջնջել</button>
                        </td>
                    </tr>    
                `;
        }).join('');

        let removeTestBtns = document.querySelectorAll('.removeTest');
        removeTestBtns.forEach(el => {
            let getId = el.getAttribute('data-id')
            el.addEventListener('click', async () => {
                const config = await doAxios(`/api/v1/tests/${getId}`, 'delete');

                console.log(config)
                if (config.status == 204) {
                    handlerNotify( 'Հաջողությամբ ջնջվեց', 'success', '#1aff00');
                    setTimeout(() => window.location.reload(), 1000);
                    el.disabled = true;
                } else {
                    handlerNotify('Սխալ է տեղի ունեցել', 'error', "#ff9900");
                    renderTest?.();
                    renderGroup?.();
                }
            })
        })

    } catch (error) {
        console.error("Error fetching:", error);
        if (testEl) {
            testEl.innerHTML = `<div class="text-danger">Տվյալները բեռնելիս սխալ տեղի ունեցավ։</div>`;
        }
    }
}

async function renderGroup() {
    const groupRow = document.querySelector('.group_row');

    try {
        const response = await doAxios('/api/v1/groups', 'get');

        if (groupRow) {
            groupRow.innerHTML = response.data.groups.map((group) => {
                return `
                    <tr>
                        <td>
                            <a href="/admin/group/${group.id}">${group.slug}</a>
                        </td>
                        <td>${formatDate(group.createdAt)}</td>
                        <td>${formatDate(group.updatedAt)}</td>
                        <td class="text-primary"> ${group.questions.length} հարց </td>
                        <td class="text-warning">
                            <a href="/admin/group/${group.id}">Թեստի հարցերը</a>
                        </td>
                        <td>
                            <button type="submit" data-id="${group.id}" class="removeGroup btn btn-danger">Ջնջել</button>
                        </td>
                    </tr>`;
            }).join('');

            let removeGroupBtns = document.querySelectorAll('.removeGroup');
            removeGroupBtns.forEach(el => {
                let getId = el.getAttribute('data-id')
                el.addEventListener('click', async () => {
                    const config = await doAxios(`/api/v1/groups/${getId}`, 'delete');

                    if (config.status == 204) {
                        handlerNotify( 'Հաջողությամբ ջնջվեց', 'success', '#1aff00');
                        setTimeout(() => window.location.reload(), 1000);
                        el.disabled = true;
                    } else {
                        handlerNotify('Սխալ է տեղի ունեցել', 'error', "#ff9900");
                        renderTest?.();
                        renderGroup?.();
                    }
                })
            })
        }
        
    } catch (error) {
        console.error("Error fetching:", error);
    }
}

renderTest();
renderGroup();