import { Component, type ErrorInfo, type ReactNode } from 'react'
import { Card } from './Card'
import { Button } from './Button'

interface ErrorBoundaryProps {
  children: ReactNode
  fallback?: ReactNode
}

interface ErrorBoundaryState {
  hasError: boolean
  error: Error | null
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props)
    this.state = { hasError: false, error: null }
  }
  
  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error }
  }
  
  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo)
  }
  
  handleReset = () => {
    this.setState({ hasError: false, error: null })
  }
  
  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback
      }
      
      return (
        <div className="min-h-screen flex items-center justify-center p-4">
          <Card className="max-w-lg w-full" title="Something went wrong">
            <div className="space-y-4">
              <p className="text-nexus-text-secondary">
                An error occurred while rendering this component.
              </p>
              {this.state.error && (
                <div className="bg-nexus-bg p-4 rounded-md overflow-auto">
                  <code className="text-sm text-nexus-danger font-mono">
                    {this.state.error.message}
                  </code>
                </div>
              )}
              <Button onClick={this.handleReset} variant="primary">
                Try again
              </Button>
            </div>
          </Card>
        </div>
      )
    }
    
    return this.props.children
  }
}
