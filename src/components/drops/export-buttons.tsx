/**
 * Export buttons: Export to Runway, CSV/JSON.
 */

import { useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { Download, FileJson, Send } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import {
  exportDropToRunway,
  exportDropCsv,
  exportDropJson,
} from '@/api/drops'

export interface ExportButtonsProps {
  dropId: string
  onExportRunway?: () => void
  isExporting?: boolean
}

export function ExportButtons({
  dropId,
  onExportRunway,
  isExporting = false,
}: ExportButtonsProps) {
  const navigate = useNavigate()

  const handleExportRunway = useCallback(async () => {
    try {
      await exportDropToRunway(dropId)
      toast.success('Drop exported to Runway')
      onExportRunway?.()
      navigate('/runway')
    } catch {
      toast.error('Failed to export to Runway')
    }
  }, [dropId, onExportRunway, navigate])

  const handleExportCsv = useCallback(async () => {
    try {
      const blob = await exportDropCsv(dropId)
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `drop-${dropId}.csv`
      a.click()
      URL.revokeObjectURL(url)
      toast.success('CSV downloaded')
    } catch {
      toast.error('Failed to export CSV')
    }
  }, [dropId])

  const handleExportJson = useCallback(async () => {
    try {
      const data = await exportDropJson(dropId)
      const blob = new Blob([JSON.stringify(data, null, 2)], {
        type: 'application/json',
      })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `drop-${dropId}.json`
      a.click()
      URL.revokeObjectURL(url)
      toast.success('JSON downloaded')
    } catch {
      toast.error('Failed to export JSON')
    }
  }, [dropId])

  return (
    <div className="flex flex-wrap gap-2">
      <Button
        className="transition-all duration-200 hover:scale-[1.02] shadow-glow-electric"
        onClick={handleExportRunway}
        disabled={isExporting}
      >
        <Send className="h-4 w-4 mr-2" />
        Export to Runway
      </Button>
      <Button variant="secondary" size="sm" onClick={handleExportCsv}>
        <Download className="h-4 w-4 mr-1" />
        CSV
      </Button>
      <Button variant="outline" size="sm" onClick={handleExportJson}>
        <FileJson className="h-4 w-4 mr-1" />
        JSON
      </Button>
    </div>
  )
}
