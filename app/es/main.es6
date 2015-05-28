

function makeClient(backend=null) {
  if (backend === 'dummy') {
    return {
      authenticate(cb) {
        cb(null, {})
      },
      getAccountInfo(cb) {
        cb(null, {})
      },
      readFile(path, cb) {
        $.ajax("data/tasks.json", {dataType: 'text'}).
          done(data => cb(null, data))
      },
      saveFile(path, cb) {
        cb(null, {})
      }
    }
  }
  return new Dropbox.Client({key: "6gw3z865hpl8h65"})
}


var indexFile = "index.json"


function initVue(data) {
  var dragNode,
    dragElem,
    insertIndex,
    placeholder,
    currentItems

  window.vue = new Vue({
    el: '#heaps',
    data: data,
    methods: {

      save() {
        let repr = JSON.stringify(this.$data, null, 2)
        dbClient.writeFile(indexFile, repr, (error, stat) => {
          if (error) {
            console.log(error)
            return
          }
          console.log(`Saved ${indexFile}`, stat)
        })
      },

      toggleClass(event, cls) {
        let el = event.target.parentNode
        el.classList.toggle(cls)
      },

      // Drag-and-Drop based on <http://codepen.io/safx/pen/dasnt>

      dragstart(event, items) {
        if (currentItems && currentItems != items)
          return
        dragElem = event.targetVM
        dragNode = event.target
        dragNode.classList.add('dragging')
        currentItems = items
        let container = event.target.parentNode // this.$el
        let tag = dragNode.nodeName
        placeholder = $(`<${tag} id="placeholder"></${tag}>`).appendTo(container)[0]
      },

      dragend(event, items) {
        // FIXME: placeholder is detached, it should not be
        if (placeholder.parentNode)
          placeholder.parentNode.removeChild(placeholder)
        if (dragNode)
          dragNode.classList.remove('dragging')
        dragNode = null
        dragElem = null
        currentItems = null
        event.preventDefault()
      },

      drop(event, items) {
        if (!dragElem)
          return
        let sourceIndex = dragElem.$index
        if (sourceIndex === insertIndex)
          return
        let removed = items.splice(sourceIndex, 1)
        items.splice(insertIndex, 0, removed[0])
        this.dragend(event, items)
      },

      dragover(event) {
        event.preventDefault()
        return true
      },

      dragenter(event, items) {
        if (currentItems !== items)
          return
        let sourceIndex = dragElem.$index
        insertIndex = event.targetVM.$index
        let posElem = sourceIndex < insertIndex
          ? event.target
          : event.target.previousSibling
        posElem.nextSibling.parentNode.insertBefore(placeholder, posElem.nextSibling)
        event.preventDefault()
        return true
      }

    }
  })
}


$(function () {

  var dbClient = makeClient('dummy')

  dbClient.authenticate((error, data) => {
    if (error) {
      console.log(error)
      return
    }
    dbClient.getAccountInfo((error, userInfo) => {
      if (error) {
          console.log(error)
          return
      }
      console.log(userInfo)
    })
  })

  dbClient.readFile(indexFile, (error, data) => {
    if (error) {
      console.log(error)
      return
    }
    let root = JSON.parse(data)
    initVue(root)
  })

})
