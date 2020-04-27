import fs from 'fs'
import path from 'path'
import { spawn } from 'child_process'
import express, { request } from 'express'

const app = express()
app.use(express.json())

app.post('/videoThumbnail', (request, response) => {
  const task = (nowPath: any) => {
    return new Promise((resolve, reject) => {
      const outputPath = path.join(`${path.parse(nowPath).name}.gif`)
      const bat = spawn('ffmpeg',
        [
          `-i ${nowPath}`,
          `-vframes 1`,
          `scale=200:-1`,
          `-vcodec gif`,
          `-vf thumbnail = 100`,
          `-n ${outputPath}`
        ]
      )

      bat.stderr.on('data', data => {
        throw new Error(data.toString())
      });

      bat.on('exit', async () => {
        resolve(outputPath)
      })
    })
  }

  console.log(request.body)
})

// if use soket, must set port 443 or 80 for security
app.listen(443, () => {
  console.log(`http://localhost:443`)
})