import fetchJson from './utils/fetch-json.js';

const BACKEND_URL = 'https://course-js.javascript.ru';
export default class SortableTable {
    subElements = {};
    headerElements = {};

    onScroll = () => {
        let pageBottom = document.documentElement.getBoundingClientRect().bottom;
        let winBottom = document.documentElement.clientHeight;
        
        if (pageBottom < winBottom + 100) {
            this.sortOnServer(this.currentSortedParams.id, this.currentSortedParams.order);
        }    
    }

    sortHandler = (event) => {
        const column = event.target.closest('[data-sortable="true"]');

        if(!column) return;

        const toggleOrder = order => {
            const orders = {
              asc: 'desc',
              desc: 'asc'
            };
      
            return order? orders[order]: 'desc';
        };

        this.currentSortedParams = column.dataset;
        this.sortOnServer(this.currentSortedParams.id, toggleOrder(this.currentSortedParams.order));
    }

    constructor (
        header = [], 
        {url = ''}
        ) {
        this.header = header;
        this.url = url;

        this.data = [];
        this.render();
    }

    async getData(id, order) {
        const url = new URL(`${BACKEND_URL}/${this.url}`);
        url.searchParams.set('_embed', 'subcategory.category');
        url.searchParams.set('_sort', id);
        url.searchParams.set('_order', order);
        url.searchParams.set('_start', 0);
        url.searchParams.set('_end', 30);

        this.sortableTable.classList.add('sortable-table_loading');
        const data = await fetchJson(url, {});
        this.data = Object.values(data);
        
        if (this.data.length) {
            this.subElements.emptyPlaceholder.classList.remove('sortable-table_empty');
        } else {
            this.element.classList.add('sortable-table_empty');
        }
        
        this.sortableTable.classList.remove('sortable-table_loading');
        return this.data;  
    }

    async render() {
        const element = document.createElement('div');

        element.innerHTML = this.template;

        this.element = element.firstElementChild;
        
        this.subElements = this.getSubElements(this.element, 'element');
        this.subElements.arrow = this.createArrow();
        this.sortableTable = this.element.firstElementChild;

        this.headerElements = this.getSubElements(this.subElements.header, 'id');

        const defaultSortElemId = Object.values(this.headerElements).find(item => item.dataset.sortable === 'true').dataset.id;

        this.currentSortedParams = {id: defaultSortElemId, order:'asc'};
        await this.sortOnServer(defaultSortElemId, 'asc');
        this.addEventListeners();
    }

    addEventListeners() {
        this.subElements.header.addEventListener('pointerdown', this.sortHandler);
        window.addEventListener('scroll', this.onScroll);
    }

    removeEventListeners() {
        this.subElements.header.removeEventListener('pointerdown', this.sortHandler);
        window.removeEventListener('scroll', this.onScroll);
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
                
                <div data-element="loading" class="loading-line sortable-table__loading-line"></div>
    
                <div data-element="emptyPlaceholder" class="sortable-table__empty-placeholder">
                  <div>
                    <p>No products satisfies your filter criteria</p>
                    <button type="button" class="button-primary-outline">Reset all filters</button>
                  </div>
                </div>
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

    getTableBody(data) {
        return data.map(item => {
          return `
            <a href="/products/${item.id}" class="sortable-table__row">
              ${this.getTableRow(item)}
            </a>`;
        }).join('');
      }

      getTableRow(item) {
        const cells = this.header.map(({id, template}) => {
          return {
            id,
            template
          };
        });
    
        return cells.map(({id, template}) => {
          return template
            ? template(item[id])
            : `<div class="sortable-table__cell">${item[id]}</div>`;
        }).join('');
      }

    getQuantityCell (quantity) {
        return quantity? `<div class="sortable-table__cell">${quantity}</div>`: '';
    }

    async sortOnServer (id, order) { 
       const sortedData = await this.getData(id, order);

       this.subElements.body.innerHTML = this.getTableBody(sortedData);
       this.setArrow(id, order);
    }

    sortData({fieldValue, orderValue}) {
        const arr = [...this.data];
        const column = this.header.find(item => item.id === fieldValue);
        const {sortType, customSorting} = column;
        const direction = orderValue === 'desc'? -1: 1;
        
        return arr.sort((a, b) =>{
            switch (sortType) {
                case 'number':
                    return direction * (a[fieldValue] - b[fieldValue]);
                case 'string':
                    return direction * a[fieldValue].localeCompare(b[fieldValue], 'ru');
                case 'custom':
                    return direction * customSorting(a, b);
                default:
                    return direction * (a[fieldValue] - b[fieldValue]);
            }
        });
    }

    setArrow (fieldValue, orderValue) {
        for (const key of Object.keys(this.headerElements)) {
            if ('order' in this.headerElements[key].dataset) delete this.headerElements[key].dataset.order;
            if (key === fieldValue) {
                this.headerElements[key].dataset.order = orderValue;
                const elementWithArrow = this.element.querySelector(`[data-id=${key}]`);
                elementWithArrow.appendChild(this.subElements.arrow);
            }
        }
    }

    remove() {
        this.element.remove();
    }

    destroy() {
        this.remove();
        this.removeEventListeners();
    }
}
