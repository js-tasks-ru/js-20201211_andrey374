export default class NotificationMessage {
    static renderTarget;
    static timerId = 0;
    LAG_TIME = 100;

    constructor (message = '', {duration = 0, type = ''} = {}) {
        this.message = message;
        this.duration = duration;
        this.type = type;
        this.init();
    }

    init() {
        const element = document.createElement('div');
        element.innerHTML = this.template;
        this.element = element.firstElementChild;
    }

    get template() {
        return `
        <div class="notification ${this.type}" style="--value:${this.duration/1000}s">
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
    
    show(renderTarget = this.element) {
         this.remove();
        
        this.element = renderTarget;
        
        NotificationMessage.renderTarget = renderTarget;
        
        document.body.append(NotificationMessage.renderTarget);

        NotificationMessage.timerId = setTimeout(() => {
            this.remove();
        }, this.duration - this.LAG_TIME);
    }

    remove() {
        if(NotificationMessage.renderTarget){
            NotificationMessage.renderTarget.remove();
            NotificationMessage.renderTarget = null;
            clearTimeout(NotificationMessage.timerId);
        }
    }

    destroy() {
        this.remove();
        this.element.remove();
        // NOTE: удаляем обработчики событий, если они есть
    }
}
