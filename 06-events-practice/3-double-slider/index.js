export default class DoubleSlider {
    boundaries = {};
    thumb = {};
    scale;
    leftThumbOffset;
    rightThumbOffset;

    thumbPointerDown = (event) => {
        if (event.target.classList.contains('range-slider__thumb-left') ||
            event.target.classList.contains('range-slider__thumb-right')) {
                
            this.thumb = event.target;

            document.addEventListener('pointermove', this.thumbPointerMove);
            this.element.classList.add('range-slider_dragging');
        }
    }

    thumbPointerMove = (event) => {
        if (this.thumb.classList.contains('range-slider__thumb-left')) {
            let price = event.clientX === 0 ? 0 : (event.clientX - this.leftThumbOffset) * this.scale; //заглушка
            
            if ( Math.round(price) < 0 ) {
                price = 0;
            }
            
            if ( Math.round(price) + this.min > this.selected.to ) {
                price = this.selected.to - this.min;
            }

            const left = Math.round((price)/(this.max - this.min) * 100);
            
            this.selected.from = this.min + Math.round(price);
            this.boundaries.from.innerHTML = this.formatValue(this.selected.from);

            this.thumb.style.left =  left + '%';
            this.progress.style.left = this.thumb.style.left;
        }   

        if (this.thumb.classList.contains('range-slider__thumb-right')) {
            let price = (this.rightThumbOffset - event.clientX) * this.scale;
            
            if ( Math.round(price) < 0 ) {
                price = 0;
            }
            
            if ( Math.round(price) > this.max - this.selected.from ) {
                price = this.max - this.selected.from;
            }
            
            const right = Math.round(price/(this.max - this.min) * 100);
            
            this.selected.to = this.max - Math.round(price);
            this.boundaries.to.innerHTML = this.formatValue(this.selected.to);

            this.thumb.style.right =  right + '%';
            this.progress.style.right = this.thumb.style.right;
        }   
    }

    thumbPointerUp = () =>{
        this.element.classList.remove('range-slider_dragging');
        document.removeEventListener('pointermove', this.thumbPointerMove);
        
        let event = new CustomEvent("range-select", { bubbles: true, detail: { from: 130, to: 150 }});  //заглушка
        this.element.dispatchEvent(event);
    }

    constructor({
        min = 100,
        max = 200,
        formatValue = value => '$' + value,
        selected = {
          from: min,
          to: max
        }
      } = {}) {
    this.min = min;
    this.max = max;
    this.formatValue = formatValue;
    this.selected = selected;
    
     this.render(); 
     this.addEventListeners();
     this.getFields();
    }

    render() {
        const element = document.createElement('div');
        element.innerHTML = this.getTemplate();
        this.element = element.firstElementChild;
        document.body.append(this.element);

        this.progress = document.querySelector('.range-slider__progress');
    }

    getTemplate() {
        return `
        <div class="range-slider">
            ${this.getBoundaryElement('from')}
            <div class="range-slider__inner">
            <span class="range-slider__progress" style="left: ${(this.selected.from - this.min)* 100 / (this.max - this.min)}%; right: ${(this.max - this.selected.to)* 100 / (this.max - this.min)}%"></span>
            <span class="range-slider__thumb-left" style="left: ${(this.selected.from - this.min)* 100 / (this.max - this.min)}%"></span>
            <span class="range-slider__thumb-right" style="right: ${(this.max - this.selected.to)* 100 / (this.max - this.min)}%"></span>
            </div>
            ${this.getBoundaryElement('to')}
        </div>
        `
    }

    getBoundaryElement(type) {
        return `<span data-element="${type}">${this.formatValue(this.selected[type])}</span>`
    }

    getFields() {
        const slider = document.querySelector('.range-slider__inner');
        this.scale = (this.max - this.min) / slider.offsetWidth;
        this.leftThumbOffset = slider.getBoundingClientRect().left;
        this.rightThumbOffset = slider.getBoundingClientRect().right;
        this.boundaries = this.getBoundaries(this.element);
    }

    getBoundaries(element) {
        const elements = element.querySelectorAll('[data-element]');

        return [...elements].reduce((accum, boundaryElement) => {
            accum[boundaryElement.dataset['element']] = boundaryElement;
            return accum;
          }, {}); 
    }

    addEventListeners() {
        document.addEventListener('pointerdown', this.thumbPointerDown);
        document.addEventListener('pointerup', this.thumbPointerUp);
    }

    removeEventListeners() {
        document.removeEventListener('pointerdown', this.thumbPointerDown);
        document.removeEventListener('pointermove', this.thumbPointerMove);
        document.removeEventListener('pointerup', this.thumbPointerUp);
    }

    remove() {
        this.element.remove();
    }

    destroy() {
        this.removeEventListeners();
        this.remove();
    }
    
}
