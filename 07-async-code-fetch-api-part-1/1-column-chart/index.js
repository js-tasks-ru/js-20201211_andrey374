import fetchJSON from './utils/fetch-json.js'

const BASE_URL = 'https://course-js.javascript.ru/';
export default class ColumnChart {
    subElements = {};
    chartHeight = 50;
    data = [];    

    constructor ({
        label = '',
        link = '',
        value = 0,
        url = '',
        range = {
            from: new Date(), 
            to: new Date()
        }
        } = {}
    ) {
        this.label = label;
        this.link = link;
        this.value = value;
        this.url = url;
        this.range = range;

        this.render();
        this.update(this.range.from, this.range.to);
    }

    render () {

        const element = document.createElement('div');
        
        element.innerHTML = this.template;

        this.element = element.firstElementChild;

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
        if(!data.length) return;

        const maxValue = Math.max(...data);
        const scale = this.chartHeight / maxValue;
        
        return data
            .map(item => {
                const percent = (item / maxValue * 100).toFixed(0);
                const value = String(Math.floor(item * scale));
                return `<div style="--value: ${value}" data-tooltip="${percent}%"></div>`;
            })
            .join('');       
    }

    async update (from , to) {
        const url = new URL(`${BASE_URL}${this.url}`);
        url.searchParams.set('from', from.toISOString());
        url.searchParams.set('to', to.toISOString());
        const data = await fetchJSON(url, {});
        this.data = Object.values(data);
        
        if (this.data.length) {
            this.element.classList.remove('column-chart_loading');
        } else {
            this.element.classList.add('column-chart_loading');
        }

        this.subElements.body.innerHTML = this.getColumnBody(Object.values(this.data));     
    }
    
    remove () {
        this.element.remove();
    }

    destroy() {
        this.remove();
        this.subElements = {};
    }
}
