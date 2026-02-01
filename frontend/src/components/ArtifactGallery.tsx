import type { MissionArtifact } from '../types/mission'

interface ArtifactGalleryProps {
  artifacts: MissionArtifact[]
}

export function ArtifactGallery({ artifacts }: ArtifactGalleryProps) {
  if (!artifacts || artifacts.length === 0) {
    return (
      <div className="text-sm text-slate-500 italic">
        Nenhum artefato gerado
      </div>
    )
  }
  
  const getArtifactIcon = (type: string) => {
    switch (type) {
      case 'code': return '📝'
      case 'config': return '⚙️'
      case 'documentation': return '📚'
      case 'test': return '🧪'
      case 'specification': return '📋'
      case 'review': return '👁️'
      default: return '📄'
    }
  }
  
  const getArtifactColor = (type: string) => {
    switch (type) {
      case 'code': return 'bg-blue-500/10 text-blue-400 border-blue-500/20'
      case 'config': return 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20'
      case 'documentation': return 'bg-purple-500/10 text-purple-400 border-purple-500/20'
      case 'test': return 'bg-green-500/10 text-green-400 border-green-500/20'
      case 'specification': return 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20'
      case 'review': return 'bg-orange-500/10 text-orange-400 border-orange-500/20'
      default: return 'bg-slate-500/10 text-slate-400 border-slate-500/20'
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
            <span className="text-xl">{getArtifactIcon(artifact.type)}</span>
            <div className="flex-1 min-w-0">
              <div className="text-sm font-medium truncate">
                {artifact.path.split('/').pop()}
              </div>
              {artifact.description && (
                <div className="text-xs opacity-70 mt-1">
                  {artifact.description}
                </div>
              )}
              <div className="flex items-center gap-2 mt-2">
                <span className="text-xs opacity-50">{artifact.type}</span>
                <span className="text-xs opacity-30">•</span>
                <span className="text-xs opacity-50">{artifact.createdBy}</span>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}
