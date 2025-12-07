import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import { BrowserRouter } from 'react-router-dom'

// Example test - you can delete this and create your own tests
describe('Example Test', () => {
  it('should pass', () => {
    expect(true).toBe(true)
  })

  it('should render a simple component', () => {
    const TestComponent = () => <div>Hello Test</div>
    
    render(
      <BrowserRouter>
        <TestComponent />
      </BrowserRouter>
    )
    
    expect(screen.getByText('Hello Test')).toBeInTheDocument()
  })
})
