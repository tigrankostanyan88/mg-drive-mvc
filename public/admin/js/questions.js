import SearchEngine from "./ui/SearchEngine.js";
import PaginationManager from "./ui/PaginationManager.js";
import QuestionsUIManager from "./ui/QuestionsUIManager.js";
import FilterManager from "./ui/FilterManager.js";

document.addEventListener("DOMContentLoaded", () => {
    const cards = [...document.querySelectorAll(".question-col-card")];
    let visible = [...cards];

    const paginator = new PaginationManager({
        container: document.getElementById("questionsPag"),
        itemsPerPage: 6
    });

    const ui = new QuestionsUIManager({ cards, paginator});
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

    const filters = new FilterManager({
        testSelect: "#filterTest",
        groupSelect: "#filterGroup",
        selector: ".question-col-card",
        onFilter: (filteredResults) => {
            visible = filteredResults;
            ui.refresh(visible);
        }
    });

    paginator.onPageChange = (page) => {
        ui.refresh(visible);
    };
});