const app = require('express')();
const http = require('http').createServer(app)
// const io = require('socket.io')(http)

app.get('/videoThumbnail', (req: any, res: any) => {
  // const { tableId, docId } = req.query
})

// io.on('connection', (soket: any) => {
//   console.log(`user connect ${soket}`)
// })

// if use soket, must set port 443 or 80 for security
app.listen(443, () => {})

// ffmpeg -i input -vframes 1 scale=200:-1 -vcodec gif -vf thumbnail=500 -y result.gif