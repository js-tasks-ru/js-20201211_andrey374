export default class SortableTable {
    subElements = {};
    headerElements = {};

    constructor (header, {data} = {}){
        this.header = header;
        this.data = data;
        this.render();
    }

    render() {
        const element = document.createElement('div');

        element.innerHTML = this.template;

        this.element = element.firstElementChild;
        
        this.subElements = this.getSubElements(this.element, 'element');
        this.subElements.arrow = this.createArrow();

        this.headerElements = this.getSubElements(this.subElements.header, 'id');
    }

    getSubElements(element, selector) {
        const elements = element.querySelectorAll(`[data-${selector}]`);

        return [...elements].reduce((accum, subElement) => {
            accum[subElement.dataset[selector]] = subElement;
            return accum;
          }, {}); 
    }

    get template() {
        return `
        <div data-element="productsContainer" class="products-list__container">
            <div class="sortable-table">
                <div data-element="header" class="sortable-table__header sortable-table__row">
                    ${this.getTableHeader(this.header)}
                </div>
                <div data-element="body" class="sortable-table__body">
                    ${this.getTableBody(this.data)}
                </div>
            </div>
        </div>

        <div data-element="loading" class="loading-line sortable-table__loading-line"></div>

        <div data-element="emptyPlaceholder" class="sortable-table__empty-placeholder">
          <div>
            <p>No products satisfies your filter criteria</p>
            <button type="button" class="button-primary-outline">Reset all filters</button>
          </div>
        </div>
        `;
    }

    createArrow() {
        const arrow = document.createElement('div');
        arrow.innerHTML = `
        <span data-element="arrow" class="sortable-table__sort-arrow">
            <span class="sort-arrow"></span>
        </span>
        `
        return arrow.firstElementChild;
    }

    getTableHeader (header) {
        return header
        .map(item =>
            `
            <div class="sortable-table__cell" data-id="${item.id}" data-sortable="${item.sortable}">
                <span>${item.title}</span>
            </div>
            `
        )
        .join('');
    }

    getTableBody (bodyData) {
        return bodyData.map(item =>{
            const link = `/products/${item.subcategory?.category?.id}/${item.subcategory?.id}/${item.id}/`;

            return `      
            <a href="${link}" class="sortable-table__row">
                ${this.getImageCell(item.images)}
                <div class="sortable-table__cell">${item.title}</div>

                ${this.getQuantityCell(item.quantity)}
                <div class="sortable-table__cell">${item.price}</div>
                <div class="sortable-table__cell">${item.sales}</div>
            </a>
            `
        })
        .join('');
    }

    getImageCell(images = []) {
        
        if (images.length === 0) return '';

        return `        
        <div class="sortable-table__cell">
            <img class="sortable-table-image" alt="Image" src="${images[0]?.url}">
        </div>
        `
    }

    getQuantityCell (quantity) {
        return quantity? `<div class="sortable-table__cell">${quantity}</div>`: '';
    }

    sort (fieldValue, orderValue) {
       const data = this.data;
       const sortType = this.header.find(item => item.id === fieldValue).sortType;

       const sortedData = this.sortData({data, sortType, fieldValue, orderValue});

       this.subElements.body.innerHTML = this.getTableBody(sortedData);

       this.setArrow(fieldValue, orderValue);
    }

    sortData({data, sortType, fieldValue, orderValue}) {
        const direction = orderValue === 'desc'? -1: 1;
        
        switch (sortType) {
            case 'number':
                return [...data].sort((a, b) => direction * (a[fieldValue] - b[fieldValue]));
            case 'string':
                return makeSort(data, direction, fieldValue);
        }

        function makeSort(data, direction, fieldValue) {
            const collator = new Intl.Collator('ru', {caseFirst: 'upper'}, 
                                               'en', {caseFirst: 'upper'});
                                                                        
            return [...data].sort((a, b) => direction * collator.compare(a[fieldValue], b[fieldValue]));
        }
    }

    setArrow (fieldValue, orderValue) {
        this.subElements.arrow.remove();

        for (const key of Object.keys(this.headerElements)) {
            if ('order' in this.headerElements[key].dataset) delete this.headerElements[key].dataset.order;
            if (key === fieldValue) {
                this.headerElements[key].dataset.order = orderValue;
                const elementWithArrow = document.querySelector(`[data-id=${key}]`);
                elementWithArrow.appendChild(this.subElements.arrow);
            }
        }
    }

    remove() {
        this.element.remove();
    }

    destroy() {
        this.remove();
        this.subElements = null;
        this.headerElements = null;
    }

}

