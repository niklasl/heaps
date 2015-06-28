import Vue from 'vue'


var dragState = null

Vue.directive('draggable', {

  bind() {
    this.el.draggable = true
    this.handlers = {}
    for (let eventName of ['dragstart', 'dragenter', 'dragend']) {
      let handler = this[eventName].bind(this)
      this.el.addEventListener(eventName, handler)
      this.handlers[eventName] = handler
    }
  },
  unbind() {
    for (let eventName in this.handlers) {
      this.el.removeEventListener(eventName, this.handlers[eventName])
    }
  },
  update(value) {
    this.container = value
  },

  dragstart(event) {
    if (dragState && dragState.currentItems !== this.container)
      return
    this.el.classList.add('dragging')
    let container = this.el.parentNode // event.target
    let tag = this.el.nodeName
    let placeholder = document.createElement(tag)
    placeholder.id = 'placeholder'
    dragState = {
      currentItems: this.container,
      draggedIndex : this.vm.$index,
      placeholder
    }
  },

  dragenter(event) {
    if (!dragState || dragState.currentItems !== this.container)
      return
    let {draggedIndex, insertIndex} = dragState
    dragState.insertIndex = this.vm.$index
    let posElem = draggedIndex < dragState.insertIndex
      ? this.el
      : this.el.previousSibling
    if (draggedIndex - dragState.insertIndex) {
      posElem.nextSibling.parentNode.insertBefore(dragState.placeholder,
                                                  posElem.nextSibling)
    }
    event.preventDefault()
    return true
  },

  dragend(event) {
    if (dragState) {
      if (dragState.placeholder.parentNode) {
        dragState.placeholder.parentNode.removeChild(dragState.placeholder)
      }
      this.el.classList.remove('dragging')
    }
    dragState = null
    event.preventDefault()
  }

})

Vue.directive('droppable', {

  bind() {
    this.el.draggable = true
    this.handlers = {}
    for (let eventName of ['dragover', 'drop']) {
      let handler = this[eventName].bind(this)
      this.el.addEventListener(eventName, handler)
      this.handlers[eventName] = handler
    }
  },
  unbind() {
    for (let eventName in this.handlers) {
      this.el.removeEventListener(eventName, this.handlers[eventName])
    }
  },
  update(value) {
    this.container = value
  },

  dragover(event) {
    event.preventDefault()
    return true
  },

  drop(event) {
    if (!dragState)
      return
    let {draggedIndex, insertIndex} = dragState
    if (draggedIndex === insertIndex)
      return
    if (dragState.currentItems === this.container) {
      let removed = this.container.splice(draggedIndex, 1)
      this.container.splice(insertIndex, 0, removed[0])
    }
  }

})
