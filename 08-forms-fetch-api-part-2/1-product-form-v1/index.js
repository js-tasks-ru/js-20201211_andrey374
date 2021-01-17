import escapeHtml from './utils/escape-html.js';
import fetchJson from './utils/fetch-json.js';

const IMGUR_CLIENT_ID = '28aaa2e823b03b1';
const BACKEND_URL = 'https://course-js.javascript.ru';

export default class ProductForm {
  constructor (productId) {
    this.productId = productId;
    this.subElements = {};

    this.defaultFormData = {
      title: '',
      description: '',
      quantity: 1,
      subcategory: '',
      status: 1,
      images: [],
      price: 100,
      discount: 0
    };
  }

  async render () {
    const categoriesPromise = this.getCategories();

    const productPromise = this.productId
      ? this.getProductById(this.productId)
      : [this.defaultFormData];

    const [categoriesData, productResponse] = await Promise.all([categoriesPromise, productPromise]);
    const [productData] = productResponse;

    this.categories = categoriesData;
    this.formData = productData;

    this.renderForm();

    this.fillForm();
    this.addEventListeners();

    return this.element;
  }

  renderForm () {
    const element = document.createElement('div');

    element.innerHTML = this.formData
    ? this.getTemplate()
    : this.getEmptyTemplate();

    this.element = element.firstElementChild;

    this.subElements = this.getSubElements(this.element);
  }

  getTemplate () {
    return `
    <div class="product-form">

      <form data-element="productForm" class="form-grid">
        <div class="form-group form-group__half_left">
          <fieldset>
            <label class="form-label">Название товара</label>
            <input id="title" required="" type="text" name="title" class="form-control" placeholder="Название товара" value=''>
          </fieldset>
        </div>

        <div class="form-group form-group__wide">
          <label class="form-label">Описание</label>
          <textarea id="description" required="" class="form-control" name="description" data-element="productDescription" placeholder="Описание товара"></textarea>
        </div>

        <div class="form-group form-group__wide" data-element="sortable-list-container">
          <label class="form-label">Фото</label>
          <div>
            <ul class="sortable-list" data-element="imageListContainer">
            ${this.createImages()}
            </ul>
          </div>
          <button type="button" data-element="uploadImage" class="button-primary-outline"><span>Загрузить</span></button>
        </div>

        <div class="form-group form-group__half_left">
          <label class="form-label">Категория</label>
          <select id="subcategory" class="form-control" name="subcategory">
            ${this.createOptions()}
          </select>
        </div>

        <div class="form-group form-group__half_left form-group__two-col">
          <fieldset>
            <label class="form-label">Цена ($)</label>
            <input id="price" required="" type="number" name="price" class="form-control" placeholder="${this.defaultFormData.price}" value=''>
          </fieldset>
          <fieldset>
            <label class="form-label">Скидка ($)</label>
            <input id="discount" required="" type="number" name="discount" class="form-control" placeholder="${this.defaultFormData.discount}" value=''>
          </fieldset>
        </div>

        <div class="form-group form-group__part-half">
          <label class="form-label">Количество</label>
          <input id="quantity" required="" type="number" class="form-control" name="quantity" placeholder="${this.defaultFormData.quantity}" value=''>
        </div>
        
        <div class="form-group form-group__part-half">
          <label class="form-label">Статус</label>
          <select id="status" class="form-control" name="status">
            <option value="1">Активен</option>
            <option value="0">Неактивен</option>
          </select>
        </div>

        <div class="form-buttons">
          <button type="submit" name="save" class="button-primary-outline">
            ${this.productId? 'Сохранить': 'Добавить'} товар
          </button>
        </div>
      </form>
    </div>
    `
  }
  
  getEmptyTemplate () {
    return `<div>
      <h1 class="page-title">Страница не найдена</h1>
      <p>Извините, данный товар не существует</p>
    </div>`;
  }

  getSubElements (element) {
    const elements = element.querySelectorAll('[data-element]');
    return [...elements].reduce((accum, subElement) => {
        accum[subElement.dataset.element] = subElement;
        return accum;
      }, {}); 
  }

  createOptions () {
    return this.categories.map((category) => {
      return category.subcategories.map((subcategory) => {
        return `<option value="${subcategory.id}" selected=${this.formData.title === subcategory.title? "selected": ''}>
                   ${category.title} > ${subcategory.title}
                </option>`;
      }).join('');
    }).join('');
  }

  async getProductById (productId) {
    const url = new URL(`${BACKEND_URL}/api/rest/products`);
    url.searchParams.set('id', productId);
    return fetchJson(url.toString());
  }

  async getCategories () {
    const url = new URL(`${BACKEND_URL}/api/rest/categories`);
    url.searchParams.set('_sort', 'weight');
    url.searchParams.set('_refs', 'subcategory');
    return fetchJson(url.toString());
  }

  fillForm () {
    const { productForm } = this.subElements;
    const excludedField = ['images'];
    const fields = Object.keys(this.defaultFormData).filter(item => !excludedField.includes(item));

    fields.forEach((field) => {
      const element = productForm.querySelector(`#${field}`);
      
      element.value = this.formData[field] || this.defaultFormData[field];
    })
  }

  getFormData () {
    const { productForm, imageListContainer } = this.subElements;
    const excludedFields = ['images'];
    const formatToNumber = ['price', 'quantity', 'discount', 'status'];
    const fields = Object.keys(this.defaultFormData).filter(item => !excludedFields.includes(item));
    const values = {};

    fields.forEach((field) => {
      values[field] = formatToNumber.includes(field)
      ? parseInt(productForm.querySelector(`#${field}`).value)
      : productForm.querySelector(`#${field}`).value;
    })

    values.id = this.productId;
    values.images = [];

    const imagesHTMLCollection = imageListContainer.querySelectorAll('.sortable-table__cell-img');
    imagesHTMLCollection.forEach((image) => {
      values.images.push({
        url: image.src,
        source: image.alt
      });
    })

    return values;
  }

  createImages () {
    return this.formData.images.map((image) => {
      return this.getImageItem(image.url, image.source).outerHTML;
    }).join('');
  }

  getImageItem (url, name) {
    const wrapper = document.createElement('div');

    wrapper.innerHTML = `
    <li class="products-edit__imagelist-item sortable-list__item" style="">
      <input type="hidden" name="url" value="${url}">
      <input type="hidden" name="source" value="${name}">
        <span>
          <img src="icon-grab.svg" data-grab-handle="" alt="grab">
          <img class="sortable-table__cell-img" alt="${escapeHtml(name)}" src="${escapeHtml(url)}">
          <span>${escapeHtml(name)}</span>
        </span>
      <button type="button">
        <img src="icon-trash.svg" data-delete-handle="" alt="delete">
      </button>
    </li>
    `
    return wrapper.firstElementChild;
  }

  addEventListeners() {
    const { productForm, uploadImage } = this.subElements;
    
    productForm.addEventListener('submit', (event) => this.onSubmit(event));
    uploadImage.addEventListener('click', (event) => this.uploadImage(event));
  }

  removeEventListeners() {
    const { productForm, uploadImage } = this.subElements;

    productForm.removeEventListener('submit', (event) => this.onSubmit(event));
    uploadImage.removeEventListener('click', (event) => this.uploadImage(event));
  }

  onSubmit(event) {
    event.preventDefault();

    this.save();
  }

  async save () {
    const bodyData = this.getFormData();

    const url = new URL(`${BACKEND_URL}/api/rest/products`);
    try {
      const data = await fetchJson(url.toString(), {
        method: this.productId ? 'PATCH' : 'PUT',
        headers: {
          'Content-Type': 'application/json;charset=utf-8'
        },
        body: JSON.stringify(bodyData)
      });
      this.dispatchEvent(data.id);
    } catch (error) {
      console.error(error);
    }
  }

  dispatchEvent (id) {
    const event = this.productId
      ? new CustomEvent('product-updated', { detail: id })
      : new CustomEvent('product-saved');

    this.element.dispatchEvent(event);
  }

  async imagePost(image) {
    const formData = new FormData();

    formData.append('image', image.file);
    formData.append('name', image.name);

    try {
      data = await fetch('https://api.imgur.com/3/image', {
        method: 'POST',
        headers: {
          Authorization: `Client-ID${IMGUR_CLIENT_ID}`
        },
        body: this.formData
      })
    } catch (error) {
      console.error(error);
    }
  }  

  uploadImage = () => {
    const handleOnChange = async () => {
      const [file] = fileInput.files;
      
      if (file) {
        const formData = new FormData();
        const { uploadImage, imageListContainer } = this.subElements;

        formData.append('image', file);

        uploadImage.classList.add('is-loading');
        uploadImage.disabled = true;

        const result = await fetchJson('https://api.imgur.com/3/image', {
          method: 'POST',
          headers: {
            Authorization: `Client-ID ${IMGUR_CLIENT_ID}`,
          },
          body: formData
        });
        console.log(imageListContainer)
        imageListContainer.append(this.getImageItem(result.data.link, file.name));

        uploadImage.classList.remove('is-loading');
        uploadImage.disabled = false;

        fileInput.remove();
      }
    };
    
    const fileInput = document.createElement('input');

    fileInput.type = 'file';
    fileInput.accept = 'image/*';

    fileInput.onchange = handleOnChange;
    
    fileInput.hidden = true;
    document.body.append(fileInput);

    fileInput.click();
  };


  remove () {
    this.element.remove();
    this.removeEventListeners();
}

  destroy() {
    this.remove();
    this.subElements = null;
}

}
