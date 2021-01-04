class Tooltip {
    tooltipOffset = 10;

    pointoverHandler = (event) => {
        this.anchorElem = event.target.closest('[data-tooltip]');

        if(this.anchorElem) {
            document.addEventListener('pointermove', this.pointermoveHandler);
            this.render(this.anchorElem.dataset.tooltip);
        }
    }

    pointoutHandler = () => {
        document.removeEventListener('pointermove', this.pointermoveHandler);
        this.element.remove();
    }

    pointermoveHandler = (event) => {
        const left = event.clientX;
        const top = event.clientY;

        this.element.style.left = left + this.tooltipOffset + 'px';
        this.element.style.top = top + this.tooltipOffset + 'px';
    }

    constructor() {
        if (Tooltip._instance) {
            return Tooltip._instance;
        }

        Tooltip._instance = this;
        this.initialize();
    }

    render(message = '') {
        this.element.innerHTML = message;
        document.body.append(this.element);
    }

    initialize() {
        this.element = document.createElement('div');
        this.element.className = 'tooltip';
        this.addEventListeners();
    }

    addEventListeners() {
        document.addEventListener('pointerover', this.pointoverHandler);
        document.addEventListener('pointerout', this.pointoutHandler);
    }

    remove() {
        this.element.remove();
    }

    destroy() {
        document.removeEventListener('pointerover', this.pointoverHandler);
        document.removeEventListener('pointerout', this.pointoutHandler);
        document.removeEventListener('pointermove', this.pointermoveHandler);
        this.remove();
    }
}

const tooltip = new Tooltip();

export default tooltip;
