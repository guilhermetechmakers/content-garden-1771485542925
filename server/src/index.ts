import express from 'express'
import cors from 'cors'
import seedsRouter from './routes/seeds.js'

const app = express()
const PORT = Number(process.env.PORT) || 3001

app.use(cors({ origin: true, credentials: true }))
app.use(express.json())

app.use('/api/seeds', seedsRouter)

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok' })
})

app.listen(PORT, () => {
  console.log(`Content Garden API listening on port ${PORT}`)
})
