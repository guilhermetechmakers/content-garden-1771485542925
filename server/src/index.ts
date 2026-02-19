import express from 'express'
import cors from 'cors'
import seedsRouter from './routes/seeds.js'
import runwayRouter from './routes/runway.js'
import libraryRouter from './routes/library.js'
import dropsRouter from './routes/drops.js'

const app = express()
const PORT = Number(process.env.PORT) || 3001

app.use(cors({ origin: true, credentials: true }))
app.use(express.json())

app.use('/api/seeds', seedsRouter)
app.use('/api/runway', runwayRouter)
app.use('/api/library', libraryRouter)
app.use('/api/drops', dropsRouter)

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok' })
})

app.listen(PORT, () => {
  console.log(`Content Garden API listening on port ${PORT}`)
})
