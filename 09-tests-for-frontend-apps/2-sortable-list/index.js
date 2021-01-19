export default class SortableList {
    onPointerDown (event) {
        const moveAt = (pageY) => {
            const translation =  pageY - shiftY;
            draggableItem.style.top = translation + 'px';
            
            if (liAfterPlaceholder instanceof Element && translation > liAfterPlaceholder.getBoundingClientRect().top) {
                placeholder.before(liAfterPlaceholder)
                liAfterPlaceholder = placeholder.nextSibling;
                liBeforePlaceholder = placeholder.previousSibling;
            }

            if (liBeforePlaceholder instanceof Element && translation < liBeforePlaceholder.getBoundingClientRect().top) {
                placeholder.after(liBeforePlaceholder)
                liAfterPlaceholder = placeholder.nextSibling;
                liBeforePlaceholder = placeholder.previousSibling;
            }

        }

        const onPointerMove = (event) => {
            moveAt(event.pageY);
        }

        const onPointerUp = () => {
            document.removeEventListener('pointermove', onPointerMove);
            document.removeEventListener('pointerup', onPointerUp);
            draggableItem.classList.remove('sortable-list__item_dragging');
            this.element.insertBefore(draggableItem, placeholder);
            draggableItem.removeAttribute("style");
            placeholder.remove();
        }

        event.preventDefault();
        
        if(event.target.hasAttribute('data-delete-handle')) {
            const deletedElement = event.target.closest('.sortable-list__item');
            deletedElement.remove();
            return;
        }

        if(!event.target.hasAttribute('data-grab-handle')) return;
        
        const draggableItem = event.target.closest('.sortable-list__item');
        const shiftY = event.clientY - draggableItem.getBoundingClientRect().top;

        const placeholder = document.createElement('div');
        placeholder.classList.add('sortable-list__placeholder');
        placeholder.style.width = draggableItem.offsetWidth + 'px';
        placeholder.style.height = draggableItem.offsetHeight + 'px';
        
        
        draggableItem.style.width = draggableItem.offsetWidth + 'px';
        draggableItem.classList.add('sortable-list__item_dragging');
        
        draggableItem.replaceWith(placeholder);
        this.element.append(draggableItem);

        let liAfterPlaceholder = placeholder.nextSibling;
        let liBeforePlaceholder = placeholder.previousSibling;
        moveAt(event.pageY);

        document.addEventListener('pointermove', onPointerMove);
        document.addEventListener('pointerup', onPointerUp);
    }

    constructor ({items} = {}) {
        this.items = items;
        this.render();
        this.addEventListeners();
    }

    render () {
        const element = document.createElement('div');

        element.innerHTML = this.template();

        this.element = element.firstElementChild;
    }

    template () {
        return `
        <ul class="sortable-list" data-element="imageListContainer">
            ${this.createList()}
        </ul>`
    }

    createList () {
        return this.items.map((item) => {
          return this.getImageItem(item).outerHTML;
        }).join('');
      }
    
    getImageItem (item) {
    const wrapper = document.createElement('div');

    wrapper.innerHTML = `
    <li class="categories__sortable-list-item sortable-list__item" style="">
        ${item.innerHTML}
    </li>
    `
    return wrapper.firstElementChild;
    }

    addEventListeners() {
        document.addEventListener('pointerdown', (event) => this.onPointerDown(event));
    }

    removeEventListeners() {
        document.removeEventListener('pointerdown', (event) => this.onPointerDown(event));
    }

    remove () {
        this.removeEventListeners();
        this.element.remove();
    }

    destroy () {
        this.remove()

    }
}
