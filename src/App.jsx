import { useState, useEffect } from 'react'
import './App.css'
import CompteResultat from './components/CompteResultat'
import PageSuivante from './components/PageSuivante'

function App() {
  const [currentPage, setCurrentPage] = useState('compte-resultat')

  useEffect(() => {
    const handleNavigate = () => {
      setCurrentPage('page-suivante')
    }
    
    window.addEventListener('navigateToNextPage', handleNavigate)
    
    return () => {
      window.removeEventListener('navigateToNextPage', handleNavigate)
    }
  }, [])

  return (
    <div className="app">
      {currentPage === 'compte-resultat' ? (
        <CompteResultat />
      ) : (
        <PageSuivante onBack={() => setCurrentPage('compte-resultat')} />
      )}
    </div>
  )
}

export default App

