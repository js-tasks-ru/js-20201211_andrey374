export default class NotificationMessage {
    static renderTarget;
    LAG_TIME = 100;

    constructor (message, {duration = 2000, type = 'success'} = {}) {

        if(NotificationMessage.renderTarget){
            NotificationMessage.renderTarget.remove();
        }

        this.message = message;
        this.duration = duration;
        this.durationInSeconds = (duration / 1000) + 's';
        this.type = type;
        this.render();
    }

    render() {
        const element = document.createElement('div');
        element.innerHTML = this.template;
        this.element = element.firstElementChild;
        NotificationMessage.renderTarget = this.element;
    }

    get template() {
        return `
        <div class="notification ${this.type}" style="--value:${this.durationInSeconds}">
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
    
    show(parent = document.body) {
         parent.append(this.element);

        setTimeout(() => {
            this.remove();
        }, this.duration - this.LAG_TIME);
    }

    remove() {
        this.element.remove();
    }

    destroy() {
        this.remove();
        NotificationMessage.renderTarget = null;
    }
}
