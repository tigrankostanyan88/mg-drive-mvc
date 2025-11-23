export default class FilterManager {
    constructor({ testSelect, groupSelect, selector, onFilter }) {
        this.testSelect = document.querySelector(testSelect);
        this.groupSelect = document.querySelector(groupSelect);
        this.selector = selector;
        this.onFilter = onFilter || function(){};

        this.testSelect.addEventListener("change", () => this._filter());
        this.groupSelect.addEventListener("change", () => this._filter());

        // initial load
        this._filter();
    }

    _filter() {
        const testId = this.testSelect.value;
        const groupId = this.groupSelect.value;

        const allCards = [...document.querySelectorAll(this.selector)];

        const filtered = allCards.filter(card => {
            // console.log(card)
            const table = card.dataset.table;
            const rowId = card.dataset.rowid;

            console.log(table)
            console.log(rowId)
            // Test filter
            if (testId && !(table === "tests" && rowId === testId)) {
                return false;
            }

            // Group filter
            if (groupId && !(table === "groups" && rowId === groupId)) {
                return false;
            }
            return true;
        });

        this.onFilter(filtered);
    }
}
