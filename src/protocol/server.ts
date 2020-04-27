const app = require('express')()
const http = require('http').createServer(app)

app.get('/videoThumbnail', (req: any, res: any) => {
   const { tableId, docId } = req.query
})

// if use soket, must set port 443 or 80 for security
app.listen(443, () => {})

// ffmpeg -i input -vframes 1 scale=200:-1 -vcodec gif -vf thumbnail=500 -y result.gif