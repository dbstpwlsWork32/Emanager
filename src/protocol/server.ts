import express from 'express'

let isOpen = false
let server: any = null
const app = express()
app.use(express.json())

app.post('/videoStream', (request, response) => {
  console.log('body')
})

export default {
  async open () {
    if (isOpen) return true
    // if use soket, must set port 443 or 80 for security
    await new Promise(resolve => {
      server = app.listen(443, () => {
        resolve()
      })
    })

    isOpen = true
  },
  async close () {
    if (!isOpen) return true
    await new Promise(resolve => {
      server.close(() => {
        resolve()
      })
    })
    isOpen = true
  }
}
