export default class QuestionsUIManager {
    constructor({ cards, paginator }) {
        this.cards = cards;
        this.paginator = paginator;

        this.paginator.onPageChange = () => this.refresh();
    }

    refresh(visibleCards) {
        const page = this.paginator.currentPage;
        const per = this.paginator.itemsPerPage;

        const start = (page - 1) * per;
        const end = start + per;

        this.cards.forEach(c => c.style.display = "none");

        visibleCards.slice(start, end).forEach(c => {
            c.style.display = "";
        });

        this.paginator.setTotal(visibleCards.length);
        this.paginator.render();
    }

}