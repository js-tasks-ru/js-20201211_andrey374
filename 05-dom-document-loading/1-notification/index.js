export default class NotificationMessage {
    constructor (message = '', {duration = 0, type = ''} = {}) {
        this.message = message;
        this.duration = duration;
        this.type = type;
        this.render();
    }

    render() {
        const element = document.createElement('div');
        element.innerHTML = this.template;
        this.element = element.firstElementChild;
    }

    get template() {
        return `
        <div class="notification ${this.type}" style="--value:${this.duration}s">
            <div class="timer"></div>
            <div class="inner-wrapper">
                <div class="notification-header">${this.type}</div>
                <div class="notification-body">
                ${this.message}
                </div>
            </div>
        </div>
        `
    }
    
    show(renderTarget) {
        if(document.body.querySelector('.notification')){
            this.remove();
        }
        this.element = renderTarget? renderTarget: this.element;

        document.body.append(this.element);

        this.timerId = setTimeout(() => {
            this.remove();
        }, this.duration);
        
    }

    remove() {
        clearTimeout(this.timerId);
        this.element.remove();
    }

    destroy() {
        this.remove();
        NotificationMessage.renderTarget = null;
        // NOTE: удаляем обработчики событий, если они есть
    }
}
