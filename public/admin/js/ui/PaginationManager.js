export default class PaginationManager {
    constructor({ container, itemsPerPage = 6, urlParam = "page" }) {
        this.container = container;
        this.itemsPerPage = itemsPerPage;
        this.urlParam = urlParam;

        const params = new URLSearchParams(location.search);
        this.currentPage = parseInt(params.get(this.urlParam)) || 1;

        this.totalItems = 0;
        this.onPageChange = () => {}; // callback only
    }

    setTotal(total) {
        this.totalItems = total;
    }

    setPage(page) {
        this.currentPage = page;
        this._writeURL(page);

        this.onPageChange(page);
    }

    get totalPages() {
        return Math.ceil(this.totalItems / this.itemsPerPage);
    }

    _writeURL(page) {
        const url = new URL(window.location);

        if (page > 1) {
            url.searchParams.set(this.urlParam, page);
        } else {
            url.searchParams.delete(this.urlParam);
        }

        history.replaceState({}, "", url);
    }

    render() {
        this.container.innerHTML = "";
        const totalPages = this.totalPages;

        if (totalPages <= 1) return;

        const nav = document.createElement("nav");
        const ul = document.createElement("ul");
        ul.className = "pagination justify-content-center";

        const addBtn = (label, page, disabled) => {
            const li = document.createElement("li");
            li.className = `page-item ${disabled ? "disabled" : ""} ${page === this.currentPage ? "active" : ""}`;

            const a = document.createElement("a");
            a.href = "#";
            a.className = "page-link";
            a.textContent = label;

            if (!disabled) {
                a.onclick = (e) => {
                    e.preventDefault();
                    this.setPage(page);   
                    this.render(); 
                };
            }

            li.appendChild(a);
            ul.appendChild(li);
        };

        addBtn("<<", this.currentPage - 1, this.currentPage === 1);

        for (let i = 1; i <= totalPages; i++) {
            addBtn(i, i, false);
        }

        addBtn(">>", this.currentPage + 1, this.currentPage === totalPages);

        nav.appendChild(ul);
        this.container.appendChild(nav);
    }
}
