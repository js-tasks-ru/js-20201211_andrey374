export default class ColumnChart {
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
        element.innerHTML = `
            <div style="--chart-height: ${this.chartHeight}">
            </div>
        `        
        const renderedElement = element.firstElementChild;

        const title = document.createElement('div');
        title.className = 'column-chart__title';
        title.innerHTML = 'Total ' + this.label;
        renderedElement.append(title);
        
        if(this.link) {
            const linkNode = document.createElement('a');
            linkNode.className = 'column-chart__link';
            linkNode.href = this.link;
            linkNode.innerHTML = 'View all';
            title.append(linkNode);
        }

        const container = document.createElement('div');
        container.className = 'column-chart__container';
        renderedElement.append(container);

        const chartHeader = document.createElement('div');
        chartHeader.dataset.element = 'header';
        chartHeader.className = 'column-chart__header';
        chartHeader.innerHTML = this.value;
        container.append(chartHeader);

        const chartBody = document.createElement('div');
        chartBody.dataset.element = 'body';
        chartBody.className = 'column-chart__chart';
        container.append(chartBody);
        
        this.element = renderedElement;
        
        this.update(this.data);
    }

    update (data) {
        this.data = data;

        if (this.data.length === 0) {
            this.element.className = "column-chart column-chart_loading";
        } else {
            this.element.className = "column-chart";
        }

        const maxValue = Math.max(...this.data);
        const scale = this.chartHeight / maxValue;
        const chartBody = this.element.querySelector('.column-chart__chart');
        const oldRows = chartBody.querySelectorAll('div');

        for (let i = 0; i < oldRows.length; i++) {
            oldRows[i].remove();
        }
        
        this.data.forEach(item => {
                const percent = (item / maxValue * 100).toFixed(0) + '%';
                const value = String(Math.floor(item * scale));
                const row = document.createElement('div');
                row.style = `--value: ${value}`;
                row.dataset.tooltip = percent;
                chartBody.append(row);
        });       
    }

    initEventListeners () {
        // NOTE: в данном методе добавляем обработчики событий, если они есть
      }
    
      remove () {
        this.element.remove();
      }
    
      destroy() {
        this.remove();
        // NOTE: удаляем обработчики событий, если они есть
      }
    
}
