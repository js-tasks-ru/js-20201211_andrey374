export default class SortableList {
    onPointerDown (event) {
        const moveAt = (pageX, pageY) => {
            const translationX =  pageX - shiftX;
            const translationY =  pageY - shiftY;
            
            draggableItem.style.top = translationY + 'px';
            draggableItem.style.left = translationX + 'px';
            
            if (liAfterPlaceholder instanceof Element && translationY > liAfterPlaceholder.getBoundingClientRect().y) {
                placeholder.before(liAfterPlaceholder)
                liAfterPlaceholder = placeholder.nextSibling;
                liBeforePlaceholder = placeholder.previousSibling;
            }

            if (liBeforePlaceholder instanceof Element && translationY < liBeforePlaceholder.getBoundingClientRect().y) {
                placeholder.after(liBeforePlaceholder)
                liAfterPlaceholder = placeholder.nextSibling;
                liBeforePlaceholder = placeholder.previousSibling;
            }

        }

        const onPointerMove = (event) => {
            moveAt(event.pageX, event.pageY);
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
        const shiftY = event.pageY - draggableItem.getBoundingClientRect().y;
        const shiftX = event.pageX - draggableItem.getBoundingClientRect().x;

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
        moveAt(event.pageX, event.pageY);

        document.addEventListener('pointermove', onPointerMove);
        document.addEventListener('pointerup', onPointerUp);
    }

    constructor ({items} = {}) {
        this.items = items;
        this.render();
        this.addEventListeners();
    }

    render () {
        this.element = document.createElement('ul');
        this.element.className = 'sortable-list';

        this.addItems();
    }

    addItems() {
        for (const item of this.items) {
            item.classList.add('sortable-list__item');
        }

        this.element.append(...this.items);
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
        this.element.remove();
    }
    
    destroy () {
        this.remove()
        this.removeEventListeners();
    }
}
