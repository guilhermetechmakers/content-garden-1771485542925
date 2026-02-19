import express from 'express'
import cors from 'cors'
import seedsRouter from './routes/seeds.js'
import runwayRouter from './routes/runway.js'
import libraryRouter from './routes/library.js'
import dropsRouter from './routes/drops.js'
import aiToolsRouter from './routes/ai-tools.js'
import { authMiddleware } from './middleware/auth.js'

const app = express()
const PORT = Number(process.env.PORT) || 3001

app.use(cors({ origin: true, credentials: true }))
app.use(express.json())

app.use('/api/seeds', authMiddleware, seedsRouter)
app.use('/api/runway', authMiddleware, runwayRouter)
app.use('/api/library', authMiddleware, libraryRouter)
app.use('/api/drops', authMiddleware, dropsRouter)
app.use('/api/ai-tools', authMiddleware, aiToolsRouter)

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok' })
})

app.listen(PORT, () => {
  console.log(`Content Garden API listening on port ${PORT}`)
})
