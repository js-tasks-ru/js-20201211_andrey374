export default class ColumnChart {
    subElements = {};
    chartHeight = 50;

    constructor ({
        data = [],
        label = '',
        link = '',
        value = 0 } = {}
    ) {
        this.data = data;
        this.label = label;
        this.link = link;
        this.value = value;
        this.render();
    }

    render () {
        const element = document.createElement('div');
        
        element.innerHTML = this.template;

        this.element = element.firstElementChild;

        if (this.data.length) {
            this.element.classList.remove('column-chart_loading');
        }

        this.subElements = this.getSubElements(this.element);
    }

    getSubElements (element) {
        const elements = element.querySelectorAll('[data-element]');

        return [...elements].reduce((accum, subElement) => {
            accum[subElement.dataset.element] = subElement;
            return accum;
          }, {}); 
    }

    get template() {
        return `
        <div class="column-chart column-chart_loading" style="--chart-height: ${this.chartHeight}">
        <div class="column-chart__title">
          Total ${this.label}
          ${this.getLink()}
        </div>
        <div class="column-chart__container">
          <div data-element="header" class="column-chart__header">${this.value}</div>
          <div data-element="body" class="column-chart__chart">
            ${this.getColumnBody(this.data)}
          </div>
        </div>
      </div>
        `
    }

    getLink() {
        return this.link ? `<a href="${this.link}" class="column-chart__link">View all</a>`: '';
    }

    getColumnBody(data) {
        const maxValue = Math.max(...this.data);
        const scale = this.chartHeight / maxValue;
        
        return data
            .map(item => {
                const percent = (item / maxValue * 100).toFixed(0);
                const value = String(Math.floor(item * scale));
                return `<div style="--value: ${value}" data-tooltip="${percent}%"></div>`;
            })
            .join('');       
    }

    update (data) {
        this.data = data;
        this.subElements.body.innerHTML = this.getColumnBody(this.data);
    }

    initEventListeners () {
        // NOTE: в данном методе добавляем обработчики событий, если они есть
    }
    
    remove () {
        this.element.remove();
    }

    destroy() {
        this.remove();
        this.element = null;
        this.subElements = {};
        // NOTE: удаляем обработчики событий, если они есть
    }
}
