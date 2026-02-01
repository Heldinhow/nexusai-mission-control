import { FileCode, Settings, BookOpen, FlaskConical, ClipboardList, Eye, FileText } from 'lucide-react'
import type { MissionArtifact } from '../types/mission'

interface ArtifactGalleryProps {
  artifacts: MissionArtifact[]
}

export function ArtifactGallery({ artifacts }: ArtifactGalleryProps) {
  if (!artifacts || artifacts.length === 0) {
    return (
      <div className="text-sm text-nexus-text-muted italic">
        Nenhum artefato gerado
      </div>
    )
  }
  
  const getArtifactIcon = (type: string) => {
    switch (type) {
      case 'code': return <FileCode className="w-5 h-5" />
      case 'config': return <Settings className="w-5 h-5" />
      case 'documentation': return <BookOpen className="w-5 h-5" />
      case 'test': return <FlaskConical className="w-5 h-5" />
      case 'specification': return <ClipboardList className="w-5 h-5" />
      case 'review': return <Eye className="w-5 h-5" />
      default: return <FileText className="w-5 h-5" />
    }
  }
  
  const getArtifactColor = (type: string) => {
    switch (type) {
      case 'code': return 'bg-nexus-primary-500/10 text-nexus-primary-400 border-nexus-primary-500/20'
      case 'config': return 'bg-nexus-warning/10 text-nexus-warning border-nexus-warning/20'
      case 'documentation': return 'bg-nexus-primary-600/10 text-nexus-primary-500 border-nexus-primary-600/20'
      case 'test': return 'bg-nexus-success/10 text-nexus-success border-nexus-success/20'
      case 'specification': return 'bg-nexus-primary-400/10 text-nexus-primary-300 border-nexus-primary-400/20'
      case 'review': return 'bg-nexus-text-muted/10 text-nexus-text-secondary border-nexus-text-muted/20'
      default: return 'bg-nexus-text-muted/10 text-nexus-text-muted border-nexus-text-muted/20'
    }
  }
  
  const getArtifactLabel = (type: string) => {
    switch (type) {
      case 'code': return 'Código'
      case 'config': return 'Configuração'
      case 'documentation': return 'Documentação'
      case 'test': return 'Teste'
      case 'specification': return 'Especificação'
      case 'review': return 'Revisão'
      default: return type
    }
  }
  
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
      {artifacts.map((artifact) => (
        <div 
          key={artifact.id}
          className={`p-3 rounded-lg border ${getArtifactColor(artifact.type)} hover:opacity-80 transition-opacity cursor-pointer`}
        >
          <div className="flex items-start gap-3">
            <span className="shrink-0">{getArtifactIcon(artifact.type)}</span>
            <div className="flex-1 min-w-0">
              <div className="text-sm font-medium truncate text-nexus-text-primary">
                {artifact.path.split('/').pop()}
              </div>
              {artifact.description && (
                <div className="text-xs text-nexus-text-secondary mt-1">
                  {artifact.description}
                </div>
              )}
              <div className="flex items-center gap-2 mt-2">
                <span className="text-xs text-nexus-text-muted">{getArtifactLabel(artifact.type)}</span>
                <span className="text-xs text-nexus-text-muted">•</span>
                <span className="text-xs text-nexus-text-muted">{artifact.createdBy}</span>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}
