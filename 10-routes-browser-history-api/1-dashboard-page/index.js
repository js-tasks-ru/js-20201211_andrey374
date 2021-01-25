import RangePicker from './components/range-picker/src/index.js';
import SortableTable from './components/sortable-table/src/index.js';
import ColumnChart from './components/column-chart/src/index.js';
import header from './bestsellers-header.js';

import fetchJson from './utils/fetch-json.js';

const BACKEND_URL = 'https://course-js.javascript.ru/';

export default class Page {
    subElements = {};
    components = {};
    element = {};

    async render() {
        const element = document.createElement('div');

        element.innerHTML = this.template();

        this.element = element.firstElementChild;

        this.subElements = this.getSubElements(this.element);

        this.initComponents();
        this.renderComponents();
        
        this.addEventListeners();

        return this.element;
    }

    template () {
        return `
        <div class="dashboard">
            <div class="content__top-panel">
                <h2 class="page-title">Dashboard</h2>

                <div data-element="rangePicker"></div>
            </div>
            <div data-element="chartsRoot" class="dashboard__charts">
                <div data-element="ordersChart" class="dashboard__chart_orders"></div>
                <div data-element="salesChart" class="dashboard__chart_sales"></div>
                <div data-element="customersChart" class="dashboard__chart_customers"></div>
            </div>

            <h3 class="block-title">Best sellers</h3>

            <div data-element="sortableTable"></div>
        </div>
        `
    }

    initComponents () {
        const to = new Date();
        const from = new Date(new Date().setDate(to.getDate() - 30));

        const rangePicker = new RangePicker({from, to});

        const sortableTable = new SortableTable(header, {
            url: `api/dashboard/bestsellers?_start=1&_end=20&from=${from.toISOString()}&to=${to.toISOString()}`,
            isSortLocally: true
        });

        const ordersChart = new ColumnChart({
            url: 'api/dashboard/orders',
            range: { from, to },
            label: 'orders',
            link: '#'
        });

        const salesChart = new ColumnChart({
            url: 'api/dashboard/sales',
            label: 'sales',
            range: { from, to }
        });

        const customersChart = new ColumnChart({
            url: 'api/dashboard/customers',
            label: 'customers',
            range: { from, to }
        });

        this.components.sortableTable = sortableTable;
        this.components.ordersChart = ordersChart;
        this.components.salesChart = salesChart;
        this.components.customersChart = customersChart;
        this.components.rangePicker  = rangePicker;
    }

    renderComponents () {
        Object.keys(this.components).forEach((component) => {
            const root = this.subElements[component];
            const { element } = this.components[component];

            root.append(element);
        });
    }

    getSubElements (element) {
        const elements = element.querySelectorAll('[data-element]');

        return [...elements].reduce((accum, subElement) => {
            accum[subElement.dataset.element] = subElement;
            return accum;
          }, {}); 
      }

    addEventListeners () {
        this.components.rangePicker.element.addEventListener('date-select', event => {
            const {from, to } = event.detail;

            this.updateComponents(from, to);
        });
    }

    async updateComponents (from, to) {
        const url = new URL(`${BACKEND_URL}api/dashboard/bestsellers`);
        url.searchParams.set('from', from.toISOString());
        url.searchParams.set('to', to.toISOString());
        url.searchParams.set('_sort', 'title');
        url.searchParams.set('_order', 'asc');
        url.searchParams.set('_start', 1);
        url.searchParams.set('_end', 20);

        const data = await fetchJson(url.toString());

        this.components.sortableTable.addRows(data);
        this.components.sortableTable.update(data);
        this.components.ordersChart.update(from, to);
        this.components.salesChart.update(from, to);
        this.components.customersChart.update(from, to);
        this.components.rangePicker.update(from, to);
    }

    createBestsellersUrl (from, to) {
        
    }

    remove () {
        this.element.remove();
    }

    destroy () {
        this.remove();
        Object.values(this.components).forEach((component) => {
            component.destroy();
        });
    }
}
