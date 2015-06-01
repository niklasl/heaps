import $ from 'jquery'
import Vue from 'vue'
import Dropbox from 'dropbox'
import './dragdrop'


const indexFile = "index.json"


var dbClient

$(function () {

  dbClient = dummyClient
  //dbClient = new Dropbox.Client({key: "6gw3z865hpl8h65"})

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


function initVue(data) {

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
      }

    }
  })
}


let dummyClient = {
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
  writeFile(path, data, cb) {
    cb(null, {dummy: true})
  }
}
