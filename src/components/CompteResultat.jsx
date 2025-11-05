import React, { useState, useEffect } from 'react'
import './CompteResultat.css'

function CompteResultat() {
  const [showForm, setShowForm] = useState(false)
  const [editingLine, setEditingLine] = useState(null) // { id, section } pour la ligne en cours d'édition
  const [formData, setFormData] = useState({
    label: '',
    value: '',
    section: 'produits' // 'produits' ou 'charges'
  })
  const [addedLines, setAddedLines] = useState({
    produits: [],
    charges: []
  })

  // Lignes fixes du tableau avec structure complète
  const [fixedLines, setFixedLines] = useState({
    produits: [
      { id: 'cotisations', label: 'Cotisations', value: '', level: 0 },
      { id: 'ventes_biens_services', label: 'Ventes de biens et services', value: '', level: 0 },
      { id: 'ventes_biens', label: 'Ventes de biens', value: '', level: 1 },
      { id: 'dons_nature', label: '- dont ventes de dons en nature', value: '', level: 2 },
      { id: 'ventes_sociales_biens', label: '- dont ventes relatives aux activités sociales et médico-sociales', value: '', level: 2 },
      { id: 'ventes_prestations', label: 'Ventes de prestations de services', value: '', level: 1 },
      { id: 'parrainages', label: '- dont parrainages', value: '', level: 2 },
      { id: 'ventes_sociales_prestations', label: '- dont ventes relatives aux activités sociales et médico-sociales', value: '', level: 2 },
      { id: 'produits_financeurs', label: 'Produits de tiers financeurs', value: '', level: 0 },
      { id: 'concours_publics', label: 'Concours publics', value: '', level: 1 },
      { id: 'concours_sociaux', label: '- dont concours publics aux activités sociales et médico-sociales', value: '', level: 2 },
      { id: 'subventions', label: 'Subventions d\'exploitation', value: '', level: 0 },
      { id: 'versements_fondateurs', label: 'Versements des fondateurs ou consommations de la dotation consomptible', value: '', level: 0 },
      { id: 'ressources_generosite', label: 'Ressources liées à la générosité du public', value: '', level: 0 },
      { id: 'dons_manuels', label: 'Dons manuels', value: '', level: 1 },
      { id: 'mecenats', label: 'Mécénats', value: '', level: 1 },
      { id: 'legs', label: 'Legs, donations et assurances-vie', value: '', level: 1 },
      { id: 'contributions', label: 'Contributions financières', value: '', level: 0 },
      { id: 'reprises', label: 'Reprises sur amortissements, dépréciations, provisions et transferts de charges', value: '', level: 0 },
      { id: 'fonds_dedies', label: 'Utilisations des fonds dédiés', value: '', level: 0 },
      { id: 'autres_produits', label: 'Autres produits', value: '', level: 0 }
    ],
    charges: [
      { id: 'achats_marchandises', label: 'Achats de marchandises', value: '', level: 0 },
      { id: 'variation_stocks', label: 'Variation de stocks', value: '', level: 0 },
      { id: 'autres_achats', label: 'Autres achats et charges externes', value: '', level: 0 },
      { id: 'aides_financieres', label: 'Aides financières', value: '', level: 0 },
      { id: 'impots', label: 'Impôts, taxes et versements assimilés', value: '', level: 0 },
      { id: 'salaires', label: 'Salaires et traitements', value: '', level: 0 },
      { id: 'charges_sociales', label: 'Charges sociales', value: '', level: 0 },
      { id: 'amortissements', label: 'Dotations aux amortissements et dépréciations', value: '', level: 0 },
      { id: 'provisions', label: 'Dotations aux provisions', value: '', level: 0 },
      { id: 'reports_fonds', label: 'Reports en fonds dédiés', value: '', level: 0 },
      { id: 'autres_charges', label: 'Autres charges', value: '', level: 0 }
    ]
  })
  const [dates, setDates] = useState({
    date: '31/12/2024'
  })

  const handleAddClick = () => {
    setEditingLine(null)
    setShowForm(true)
    setFormData({
      label: '',
      value: '',
      section: 'produits'
    })
  }

  const handleEditClick = (lineId, section, isFixed = false) => {
    let line
    if (isFixed) {
      line = fixedLines[section].find(l => l.id === lineId)
      if (line) {
        setEditingLine({ id: lineId, section, isFixed: true })
        setFormData({
          label: line.label,
          value: line.value,
          section: section
        })
        setShowForm(true)
      }
    } else {
      line = addedLines[section].find(l => l.id === lineId)
      if (line) {
        setEditingLine({ id: lineId, section, isFixed: false })
        setFormData({
          label: line.label,
          value: line.value,
          section: section
        })
        setShowForm(true)
      }
    }
  }

  const handleDeleteClick = (lineId, section) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer cette ligne ?')) {
      setAddedLines(prev => ({
        ...prev,
        [section]: prev[section].filter(line => line.id !== lineId)
      }))
    }
  }

  const handleContextMenu = (e, lineId, section) => {
    e.preventDefault()
    if (window.confirm('Êtes-vous sûr de vouloir supprimer cette ligne ?')) {
      handleDeleteClick(lineId, section)
    }
  }

  const handleMoveLine = (lineId, section, direction) => {
    const lines = [...addedLines[section]]
    const index = lines.findIndex(l => l.id === lineId)
    
    if (direction === 'up' && index > 0) {
      [lines[index], lines[index - 1]] = [lines[index - 1], lines[index]]
    } else if (direction === 'down' && index < lines.length - 1) {
      [lines[index], lines[index + 1]] = [lines[index + 1], lines[index]]
    }

    setAddedLines(prev => ({
      ...prev,
      [section]: lines
    }))
  }

  const handleMoveToOtherSection = (lineId, currentSection) => {
    const line = addedLines[currentSection].find(l => l.id === lineId)
    if (line) {
      const newSection = currentSection === 'produits' ? 'charges' : 'produits'
      setAddedLines(prev => ({
        ...prev,
        [currentSection]: prev[currentSection].filter(l => l.id !== lineId),
        [newSection]: [...prev[newSection], line]
      }))
    }
  }

  const handleCloseForm = () => {
    setShowForm(false)
    setEditingLine(null)
    setFormData({
      label: '',
      value: '',
      section: 'produits'
    })
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!formData.label.trim()) {
      alert('Veuillez entrer un libellé')
      return
    }

    if (editingLine) {
      // Modifier une ligne existante
      if (editingLine.isFixed) {
        // Modifier une ligne fixe
        setFixedLines(prev => ({
          ...prev,
          [formData.section]: prev[formData.section].map(l =>
            l.id === editingLine.id
              ? {
                  ...l,
                  value: formData.value
                }
              : l
          )
        }))
      } else {
        // Modifier une ligne ajoutée dynamiquement
        const line = addedLines[editingLine.section].find(l => l.id === editingLine.id)
        
        if (line) {
          // Si la section change, déplacer la ligne vers la nouvelle section
          if (editingLine.section !== formData.section) {
            setAddedLines(prev => ({
              ...prev,
              [editingLine.section]: prev[editingLine.section].filter(l => l.id !== editingLine.id),
              [formData.section]: [...prev[formData.section], {
                ...line,
                label: formData.label,
                value: formData.value
              }]
            }))
          } else {
            // Sinon, modifier la ligne dans la même section
            setAddedLines(prev => ({
              ...prev,
              [formData.section]: prev[formData.section].map(l =>
                l.id === editingLine.id
                  ? {
                      ...l,
                      label: formData.label,
                      value: formData.value
                    }
                  : l
              )
            }))
          }
        }
      }
    } else {
      // Ajouter une nouvelle ligne
      const newLine = {
        id: Date.now(),
        label: formData.label,
        value: formData.value
      }

      setAddedLines(prev => ({
        ...prev,
        [formData.section]: [...prev[formData.section], newLine]
      }))
    }

    handleCloseForm()
  }

  const formatValue = (value) => {
    if (!value || value.trim() === '') return ''
    const num = parseFloat(value.replace(/\s/g, '').replace('€', '').trim())
    if (isNaN(num) || num === 0) return ''
    return num.toLocaleString('fr-FR') + ' €'
  }

  const formatValueWithZero = (value) => {
    if (!value || value.trim() === '') return ''
    const num = parseFloat(value.replace(/\s/g, '').replace('€', '').trim())
    if (isNaN(num)) return ''
    return num.toLocaleString('fr-FR') + ' €'
  }

  // Fonction pour parser une valeur en nombre
  const parseValue = (value) => {
    if (!value || value.trim() === '') return 0
    const num = parseFloat(value.replace(/\s/g, '').replace('€', '').trim())
    return isNaN(num) ? 0 : num
  }

  // Calculer les totaux des produits
  const calculateTotalProduits = () => {
    const fixedTotal = fixedLines.produits.reduce((sum, line) => {
      return sum + parseValue(line.value)
    }, 0)
    const addedTotal = addedLines.produits.reduce((sum, line) => {
      return sum + parseValue(line.value)
    }, 0)
    return fixedTotal + addedTotal
  }

  // Calculer les totaux des charges
  const calculateTotalCharges = () => {
    const fixedTotal = fixedLines.charges.reduce((sum, line) => {
      return sum + parseValue(line.value)
    }, 0)
    const addedTotal = addedLines.charges.reduce((sum, line) => {
      return sum + parseValue(line.value)
    }, 0)
    return fixedTotal + addedTotal
  }

  // Calculer le résultat d'exploitation
  const calculateResult = () => {
    const produits = calculateTotalProduits()
    const charges = calculateTotalCharges()
    return produits - charges
  }

  const totalProduits = calculateTotalProduits()
  const totalCharges = calculateTotalCharges()
  const result = calculateResult()

  // Fonction pour sauvegarder uniquement dans localStorage (sans PDF)
  const handleSaveOnly = () => {
    const dataToSave = {
      fixedLines,
      addedLines,
      dates,
      savedAt: new Date().toISOString()
    }
    localStorage.setItem('compteResultat_data', JSON.stringify(dataToSave))
    alert('Données enregistrées avec succès !')
  }

  // Fonction pour sauvegarder dans localStorage ET générer le PDF (2 pages seulement)
  const handleSave = async () => {
    try {
      console.log('Début de la sauvegarde et génération du PDF (2 pages)...')
      
      const dataToSave = {
        fixedLines,
        addedLines,
        dates,
        savedAt: new Date().toISOString()
      }
      localStorage.setItem('compteResultat_data', JSON.stringify(dataToSave))
      console.log('Données sauvegardées dans localStorage')
      
      // Générer le PDF avec seulement 2 pages (page de garde + tableau première page)
      console.log('Début de la génération du PDF (2 pages)...')
      await generatePDF()
      console.log('PDF généré avec succès (2 pages)')
      
      alert('Données enregistrées et PDF généré avec succès !')
    } catch (error) {
      console.error('Erreur lors de la génération du PDF:', error)
      console.error('Stack trace:', error.stack)
      alert('Erreur lors de la génération du PDF. Vérifiez la console pour plus de détails. Erreur: ' + error.message)
    }
  }
  
  // Fonction pour générer le PDF avec 2 pages seulement (page de garde + tableau première page)
  const generatePDFSimple = async () => {
    const { jsPDF } = await import('jspdf')
    const doc = new jsPDF('p', 'mm', 'a4')
    
    // Première page - Logo et titre
    const pageWidth = doc.internal.pageSize.getWidth()
    const pageHeight = doc.internal.pageSize.getHeight()
    const centerY = pageHeight / 2
    
    doc.setFontSize(32)
    doc.setFont('helvetica', 'bold')
    doc.setTextColor(0, 0, 0)
    doc.text('AAPISE', pageWidth / 2, centerY - 15, { align: 'center' })
    
    doc.setFontSize(14)
    doc.setFont('helvetica', 'normal')
    doc.text('ASSOCIATION AAPISE', pageWidth / 2, centerY, { align: 'center' })
    
    doc.setLineWidth(0.5)
    doc.setDrawColor(100, 100, 100)
    doc.line(pageWidth / 2 - 30, centerY + 5, pageWidth / 2 + 30, centerY + 5)
    
    doc.setFontSize(22)
    doc.setFont('helvetica', 'bold')
    doc.text('Compte de résultat', pageWidth / 2, centerY + 20, { align: 'center' })
    
    doc.setFontSize(12)
    doc.setFont('helvetica', 'normal')
    doc.text('Comptes annuels', pageWidth / 2, centerY + 30, { align: 'center' })
    
    doc.setFontSize(11)
    doc.text(dates.date, pageWidth / 2, centerY + 38, { align: 'center' })
    
    // Deuxième page - Tableau première page
    doc.addPage()
    
    const marginLeft = 20
    const marginRight = 20
    const dateColX = pageWidth - marginRight
    const lineHeight = 6
    
    doc.setFontSize(10)
    doc.setFont('helvetica', 'normal')
    doc.text('ASSOCIATION AAPISE | Comptes annuels', marginLeft, 15)
    doc.text(dates.date, pageWidth - marginLeft, 15, { align: 'right' })
    
    doc.setFontSize(14)
    doc.setFont('helvetica', 'bold')
    doc.text('Produits d\'exploitation', marginLeft, 25)
    
    let yPosition = 35
    doc.setFontSize(10)
    doc.setFont('helvetica', 'bold')
    doc.text('Libellé', marginLeft, yPosition)
    doc.text(dates.date, dateColX, yPosition, { align: 'right' })
    yPosition += lineHeight
    
    doc.setLineWidth(0.5)
    doc.setDrawColor(0, 0, 0)
    doc.line(marginLeft, yPosition, pageWidth - marginLeft, yPosition)
    yPosition += lineHeight + 2
    
    doc.setFontSize(9)
    doc.setFont('helvetica', 'normal')
    fixedLines.produits.forEach(line => {
      if (yPosition > pageHeight - 30) {
        doc.addPage()
        doc.setFontSize(10)
        doc.setFont('helvetica', 'normal')
        doc.text('ASSOCIATION AAPISE | Comptes annuels', marginLeft, 15)
        doc.text(dates.date, pageWidth - marginLeft, 15, { align: 'right' })
        yPosition = 25
      }
      const indent = line.level * 5
      let label = line.label
      const maxWidth = dateColX - marginLeft - indent - 90
      if (doc.getTextWidth(label) > maxWidth) {
        label = doc.splitTextToSize(label, maxWidth)[0] + '...'
      }
      doc.text(label, marginLeft + indent, yPosition)
      if (line.value && line.value.trim() !== '') {
        doc.text(formatValueForPDF(line.value), dateColX, yPosition, { align: 'right' })
      }
      yPosition += lineHeight
    })
    
    addedLines.produits.forEach(line => {
      if (yPosition > pageHeight - 30) {
        doc.addPage()
        doc.setFontSize(10)
        doc.setFont('helvetica', 'normal')
        doc.text('ASSOCIATION AAPISE | Comptes annuels', marginLeft, 15)
        doc.text(dates.date, pageWidth - marginLeft, 15, { align: 'right' })
        yPosition = 25
      }
      let label = line.label
      const maxWidth = dateColX - marginLeft - 90
      if (doc.getTextWidth(label) > maxWidth) {
        label = doc.splitTextToSize(label, maxWidth)[0] + '...'
      }
      doc.text(label, marginLeft, yPosition)
      if (line.value && line.value.trim() !== '') {
        doc.text(formatValueForPDF(line.value), dateColX, yPosition, { align: 'right' })
      }
      yPosition += lineHeight
    })
    
    // TOTAL I
    yPosition += 3
    const totalRowY1 = yPosition - 2
    doc.setFillColor(240, 240, 240)
    doc.rect(marginLeft, totalRowY1 - 3, pageWidth - marginLeft - marginRight, lineHeight + 4, 'F')
    doc.setFont('helvetica', 'bold')
    doc.setTextColor(0, 0, 0)
    doc.text('TOTAL I', marginLeft, yPosition)
    doc.text(formatValueWithZeroForPDF(totalProduits.toString()), dateColX, yPosition, { align: 'right' })
    yPosition += lineHeight + 5
    
    // Charges d'exploitation
    yPosition += 3
    doc.setFontSize(14)
    doc.setFont('helvetica', 'bold')
    doc.text('Charges d\'exploitation', marginLeft, yPosition)
    yPosition += lineHeight + 3
    
    doc.setFontSize(9)
    doc.setFont('helvetica', 'normal')
    fixedLines.charges.forEach(line => {
      if (yPosition > pageHeight - 30) {
        doc.addPage()
        doc.setFontSize(10)
        doc.setFont('helvetica', 'normal')
        doc.text('ASSOCIATION AAPISE | Comptes annuels', marginLeft, 15)
        doc.text(dates.date, pageWidth - marginLeft, 15, { align: 'right' })
        yPosition = 25
      }
      let label = line.label
      const maxWidth = dateColX - marginLeft - 90
      if (doc.getTextWidth(label) > maxWidth) {
        label = doc.splitTextToSize(label, maxWidth)[0] + '...'
      }
      doc.text(label, marginLeft, yPosition)
      if (line.value && line.value.trim() !== '') {
        doc.text(formatValueForPDF(line.value), dateColX, yPosition, { align: 'right' })
      }
      yPosition += lineHeight
    })
    
    addedLines.charges.forEach(line => {
      if (yPosition > pageHeight - 30) {
        doc.addPage()
        doc.setFontSize(10)
        doc.setFont('helvetica', 'normal')
        doc.text('ASSOCIATION AAPISE | Comptes annuels', marginLeft, 15)
        doc.text(dates.date, pageWidth - marginLeft, 15, { align: 'right' })
        yPosition = 25
      }
      let label = line.label
      const maxWidth = dateColX - marginLeft - 90
      if (doc.getTextWidth(label) > maxWidth) {
        label = doc.splitTextToSize(label, maxWidth)[0] + '...'
      }
      doc.text(label, marginLeft, yPosition)
      if (line.value && line.value.trim() !== '') {
        doc.text(formatValueForPDF(line.value), dateColX, yPosition, { align: 'right' })
      }
      yPosition += lineHeight
    })
    
    // TOTAL II
    yPosition += 3
    const totalRowY2 = yPosition - 2
    doc.setFillColor(240, 240, 240)
    doc.rect(marginLeft, totalRowY2 - 3, pageWidth - marginLeft - marginRight, lineHeight + 4, 'F')
    doc.setFont('helvetica', 'bold')
    doc.setTextColor(0, 0, 0)
    doc.text('TOTAL II', marginLeft, yPosition)
    doc.text(formatValueWithZeroForPDF(totalCharges.toString()), dateColX, yPosition, { align: 'right' })
    yPosition += lineHeight + 5
    
    // Résultat d'exploitation
    const resultRowY = yPosition - 2
    doc.setFillColor(232, 232, 232)
    doc.rect(marginLeft, resultRowY - 3, pageWidth - marginLeft - marginRight, lineHeight + 4, 'F')
    doc.text('RÉSULTAT D\'EXPLOITATION (I-II)', marginLeft, yPosition)
    const resultFormatted = formatValueWithZeroForPDF(result.toString())
    if (result < 0) {
      doc.setTextColor(211, 47, 47)
    } else if (result > 0) {
      doc.setTextColor(40, 167, 69)
    } else {
      doc.setTextColor(0, 0, 0)
    }
    doc.setFont('helvetica', 'bold')
    doc.text(resultFormatted, dateColX, yPosition, { align: 'right' })
    doc.setTextColor(0, 0, 0)
    doc.setFont('helvetica', 'normal')
    
    // Sauvegarder le PDF
    const fileName = `Compte_Resultat_${dates.date.replace(/\//g, '-')}.pdf`
    console.log('PDF (2 pages) sauvegardé:', fileName)
    doc.save(fileName)
  }

  // Fonction pour générer le PDF
  const generatePDF = async () => {
    const { jsPDF } = await import('jspdf')
    const doc = new jsPDF('p', 'mm', 'a4')
    
    // Première page - Logo et titre
    const pageWidth = doc.internal.pageSize.getWidth()
    const pageHeight = doc.internal.pageSize.getHeight()
    
    // Centre vertical de la page
    const centerY = pageHeight / 2
    
    // Logo AAPISE (texte stylisé centré)
    doc.setFontSize(32)
    doc.setFont('helvetica', 'bold')
    doc.setTextColor(0, 0, 0)
    doc.text('AAPISE', pageWidth / 2, centerY - 15, { align: 'center' })
    
    // Sous-titre Association
    doc.setFontSize(14)
    doc.setFont('helvetica', 'normal')
    doc.text('ASSOCIATION AAPISE', pageWidth / 2, centerY, { align: 'center' })
    
    // Ligne de séparation décorative
    doc.setLineWidth(0.5)
    doc.setDrawColor(100, 100, 100)
    doc.line(pageWidth / 2 - 30, centerY + 5, pageWidth / 2 + 30, centerY + 5)
    
    // Titre principal "Compte de résultat"
    doc.setFontSize(22)
    doc.setFont('helvetica', 'bold')
    doc.text('Compte de résultat', pageWidth / 2, centerY + 20, { align: 'center' })
    
    // Sous-titre Comptes annuels
    doc.setFontSize(12)
    doc.setFont('helvetica', 'normal')
    doc.text('Comptes annuels', pageWidth / 2, centerY + 30, { align: 'center' })
    
    // Date
    doc.setFontSize(11)
    doc.text(dates.date, pageWidth / 2, centerY + 38, { align: 'center' })
    
    // Nouvelle page pour le tableau
    doc.addPage()
    
    // Variables pour le tableau
    const marginLeft = 20
    const marginRight = 20
    const dateColX = pageWidth - marginRight // Position à l'extrême droite
    const lineHeight = 6
    
    // En-tête de page avec logo et date
    doc.setFontSize(10)
    doc.setFont('helvetica', 'normal')
    doc.text('ASSOCIATION AAPISE | Comptes annuels', marginLeft, 15)
    doc.text(dates.date, pageWidth - marginLeft, 15, { align: 'right' })
    
    // En-tête du tableau
    doc.setFontSize(14)
    doc.setFont('helvetica', 'bold')
    doc.text('Produits d\'exploitation', marginLeft, 25)
    
    let yPosition = 35
    
    // En-tête des colonnes
    doc.setFontSize(10)
    doc.setFont('helvetica', 'bold')
    doc.text('Libellé', marginLeft, yPosition)
    doc.text(dates.date, dateColX, yPosition, { align: 'right' })
    yPosition += lineHeight
    
    // Ligne de séparation
    doc.setLineWidth(0.5)
    doc.setDrawColor(0, 0, 0)
    doc.line(marginLeft, yPosition, pageWidth - marginLeft, yPosition)
    yPosition += lineHeight + 2
    
    // Lignes fixes - Produits
    doc.setFontSize(9)
    doc.setFont('helvetica', 'normal')
    fixedLines.produits.forEach(line => {
      if (yPosition > pageHeight - 30) {
        doc.addPage()
        // Répéter l'en-tête sur chaque nouvelle page
        doc.setFontSize(10)
        doc.setFont('helvetica', 'normal')
        doc.text('ASSOCIATION AAPISE | Comptes annuels', marginLeft, 15)
        doc.text(dates.date, pageWidth - marginLeft, 15, { align: 'right' })
        yPosition = 25
      }
      
      const indent = line.level * 5
      // Tronquer le texte si trop long (laisser de la place pour les valeurs à droite)
      const maxWidth = dateColX - marginLeft - indent - 90 // Plus d'espace pour les valeurs
      let label = line.label
      if (doc.getTextWidth(label) > maxWidth) {
        label = doc.splitTextToSize(label, maxWidth)[0] + '...'
      }
      doc.text(label, marginLeft + indent, yPosition)
      
      if (line.value && line.value.trim() !== '') {
        const formattedValue = formatValueForPDF(line.value)
        doc.text(formattedValue, dateColX, yPosition, { align: 'right' })
      }
      
      yPosition += lineHeight
    })
    
    // Lignes ajoutées - Produits
    addedLines.produits.forEach(line => {
      if (yPosition > pageHeight - 30) {
        doc.addPage()
        doc.setFontSize(10)
        doc.setFont('helvetica', 'normal')
        doc.text('ASSOCIATION AAPISE | Comptes annuels', marginLeft, 15)
        doc.text(dates.date, pageWidth - marginLeft, 15, { align: 'right' })
        yPosition = 25
      }
      
      let label = line.label
      const maxWidth = dateColX - marginLeft - 90 // Plus d'espace pour les valeurs
      if (doc.getTextWidth(label) > maxWidth) {
        label = doc.splitTextToSize(label, maxWidth)[0] + '...'
      }
      doc.text(label, marginLeft, yPosition)
      if (line.value && line.value.trim() !== '') {
        const formattedValue = formatValueForPDF(line.value)
        doc.text(formattedValue, dateColX, yPosition, { align: 'right' })
      }
      yPosition += lineHeight
    })
    
    // TOTAL I avec fond gris
    yPosition += 3
    const totalRowY = yPosition - 2
    // Dessiner le fond gris pour TOTAL I
    doc.setFillColor(240, 240, 240) // #f0f0f0 - même couleur que .total-row
    doc.rect(marginLeft, totalRowY - 3, pageWidth - marginLeft - marginRight, lineHeight + 4, 'F')
    doc.setFont('helvetica', 'bold')
    doc.setTextColor(0, 0, 0)
    doc.text('TOTAL I', marginLeft, yPosition)
    const totalProduitsFormatted = formatValueWithZeroForPDF(totalProduits.toString())
    doc.text(totalProduitsFormatted, dateColX, yPosition, { align: 'right' })
    yPosition += lineHeight + 5
    
    // Charges d'exploitation
    yPosition += 3
    doc.setFontSize(14)
    doc.setFont('helvetica', 'bold')
    doc.text('Charges d\'exploitation', marginLeft, yPosition)
    yPosition += lineHeight + 3
    
    // Lignes fixes - Charges
    doc.setFontSize(9)
    doc.setFont('helvetica', 'normal')
    fixedLines.charges.forEach(line => {
      if (yPosition > pageHeight - 30) {
        doc.addPage()
        doc.setFontSize(10)
        doc.setFont('helvetica', 'normal')
        doc.text('ASSOCIATION AAPISE | Comptes annuels', marginLeft, 15)
        doc.text(dates.date, pageWidth - marginLeft, 15, { align: 'right' })
        yPosition = 25
      }
      
      let label = line.label
      const maxWidth = dateColX - marginLeft - 90 // Plus d'espace pour les valeurs
      if (doc.getTextWidth(label) > maxWidth) {
        label = doc.splitTextToSize(label, maxWidth)[0] + '...'
      }
      doc.text(label, marginLeft, yPosition)
      if (line.value && line.value.trim() !== '') {
        const formattedValue = formatValueForPDF(line.value)
        doc.text(formattedValue, dateColX, yPosition, { align: 'right' })
      }
      yPosition += lineHeight
    })
    
    // Lignes ajoutées - Charges
    addedLines.charges.forEach(line => {
      if (yPosition > pageHeight - 30) {
        doc.addPage()
        doc.setFontSize(10)
        doc.setFont('helvetica', 'normal')
        doc.text('ASSOCIATION AAPISE | Comptes annuels', marginLeft, 15)
        doc.text(dates.date, pageWidth - marginLeft, 15, { align: 'right' })
        yPosition = 25
      }
      
      let label = line.label
      const maxWidth = dateColX - marginLeft - 90 // Plus d'espace pour les valeurs
      if (doc.getTextWidth(label) > maxWidth) {
        label = doc.splitTextToSize(label, maxWidth)[0] + '...'
      }
      doc.text(label, marginLeft, yPosition)
      if (line.value && line.value.trim() !== '') {
        const formattedValue = formatValueForPDF(line.value)
        doc.text(formattedValue, dateColX, yPosition, { align: 'right' })
      }
      yPosition += lineHeight
    })
    
    // TOTAL II avec fond gris
    yPosition += 3
    const totalRowY2 = yPosition - 2
    // Dessiner le fond gris pour TOTAL II
    doc.setFillColor(240, 240, 240) // #f0f0f0 - même couleur que .total-row
    doc.rect(marginLeft, totalRowY2 - 3, pageWidth - marginLeft - marginRight, lineHeight + 4, 'F')
    doc.setFont('helvetica', 'bold')
    doc.setTextColor(0, 0, 0)
    doc.text('TOTAL II', marginLeft, yPosition)
    const totalChargesFormatted = formatValueWithZeroForPDF(totalCharges.toString())
    doc.text(totalChargesFormatted, dateColX, yPosition, { align: 'right' })
    yPosition += lineHeight + 5
    
    // Résultat d'exploitation avec fond gris et couleur (mêmes couleurs que le site)
    const resultRowY = yPosition - 2
    // Dessiner le fond gris pour le résultat (plus foncé que total-row)
    doc.setFillColor(232, 232, 232) // #e8e8e8 - même couleur que .result-row
    doc.rect(marginLeft, resultRowY - 3, pageWidth - marginLeft - marginRight, lineHeight + 4, 'F')
    doc.text('RÉSULTAT D\'EXPLOITATION (I-II)', marginLeft, yPosition)
    const resultFormatted = formatValueWithZeroForPDF(result.toString())
    // Appliquer les couleurs exactes du CSS : rouge #d32f2f si négatif, vert #28a745 si positif
    if (result < 0) {
      doc.setTextColor(211, 47, 47) // #d32f2f - Rouge exact du CSS (.negative)
    } else if (result > 0) {
      doc.setTextColor(40, 167, 69) // #28a745 - Vert exact du CSS (.positive)
    } else {
      doc.setTextColor(0, 0, 0) // Noir
    }
    doc.setFont('helvetica', 'bold') // Gras comme sur le site
    doc.text(resultFormatted, dateColX, yPosition, { align: 'right' })
    doc.setTextColor(0, 0, 0) // Remettre en noir
    doc.setFont('helvetica', 'normal') // Remettre en normal
    
    // Sauvegarder le PDF avec 2 pages seulement
    const fileName = `Compte_Resultat_${dates.date.replace(/\//g, '-')}.pdf`
    console.log('PDF (2 pages) sauvegardé:', fileName)
    doc.save(fileName)
  }
  
  // Fonction pour générer le PDF complet avec les 3 pages
  const generateCompletePDF = async () => {
    try {
      console.log('generateCompletePDF: Début de la génération...')
      const doc = await generatePDFForComplete() // Génère les 2 premières pages
      console.log('generateCompletePDF: PDF de base généré, doc =', doc)
      
      if (!doc) {
        console.error('Erreur: generatePDF n\'a pas retourné de document')
        throw new Error('generatePDF n\'a pas retourné de document')
      }
      
      // Charger les données de la deuxième page
      const pageSuivanteData = localStorage.getItem('pageSuivante_data')
      console.log('generateCompletePDF: Données page suivante trouvées:', !!pageSuivanteData)
      
      if (!pageSuivanteData) {
        // Si pas de deuxième page, sauvegarder le PDF tel quel
        const fileName = `Compte_Resultat_${dates.date.replace(/\//g, '-')}.pdf`
        console.log('generateCompletePDF: Sauvegarde du PDF sans page suivante:', fileName)
        doc.save(fileName)
        console.log('generateCompletePDF: PDF sauvegardé')
        return
      }
      
      const data = JSON.parse(pageSuivanteData)
      
      // Ajouter la troisième page avec le contenu de PageSuivante
      doc.addPage()
      
      const pageWidth = doc.internal.pageSize.getWidth()
      const pageHeight = doc.internal.pageSize.getHeight()
      const marginLeft = 20
      const marginRight = 20
      const dateColX = pageWidth - marginRight
      const lineHeight = 6
      
      // En-tête de page
      doc.setFontSize(10)
      doc.setFont('helvetica', 'normal')
      doc.text('ASSOCIATION AAPISE | Comptes annuels', marginLeft, 15)
      doc.text(data.dates?.date || dates.date, pageWidth - marginLeft, 15, { align: 'right' })
      
      let yPosition = 25
      
      // Fonctions helper pour formater les valeurs
      const formatValueForPDF = (value) => {
        if (!value || value.trim() === '') return ''
        const num = parseValue(value)
        if (isNaN(num) || num === 0) return ''
        const intValue = Math.round(num)
        const numStr = intValue.toString()
        let formatted = ''
        let count = 0
        for (let i = numStr.length - 1; i >= 0; i--) {
          if (count === 3 && i >= 0) {
            formatted = ' ' + formatted
            count = 0
          }
          formatted = numStr[i] + formatted
          count++
        }
        return formatted + ' €'
      }
      
      const formatValueWithZeroForPDF = (value) => {
        if (!value || value.trim() === '') return ''
        const num = parseValue(value)
        if (isNaN(num)) return ''
        const intValue = Math.round(num)
        const numStr = intValue.toString()
        let formatted = ''
        let count = 0
        for (let i = numStr.length - 1; i >= 0; i--) {
          if (count === 3 && i >= 0) {
            formatted = ' ' + formatted
            count = 0
          }
          formatted = numStr[i] + formatted
          count++
        }
        return formatted + ' €'
      }
      
      // Calculer les totaux de la deuxième page
      const parseValue = (value) => {
        if (!value || value.trim() === '') return 0
        const num = parseFloat(value.replace(/\s/g, '').replace('€', '').trim())
        return isNaN(num) ? 0 : num
      }
      
      const totalProduitsFinanciers = (data.fixedLines?.produits_financiers || []).reduce((sum, line) => sum + parseValue(line.value), 0) +
                                      (data.addedLines?.produits_financiers || []).reduce((sum, line) => sum + parseValue(line.value), 0)
      
      const totalChargesFinancieres = (data.fixedLines?.charges_financieres || []).reduce((sum, line) => sum + parseValue(line.value), 0) +
                                      (data.addedLines?.charges_financieres || []).reduce((sum, line) => sum + parseValue(line.value), 0)
      
      const resultatFinancier = totalProduitsFinanciers - totalChargesFinancieres
      
      // Calculer résultat d'exploitation depuis première page
      const produitsExploitation = (fixedLines.produits || []).reduce((sum, line) => sum + parseValue(line.value), 0) +
                                  (addedLines.produits || []).reduce((sum, line) => sum + parseValue(line.value), 0)
      const chargesExploitation = (fixedLines.charges || []).reduce((sum, line) => sum + parseValue(line.value), 0) +
                                 (addedLines.charges || []).reduce((sum, line) => sum + parseValue(line.value), 0)
      const resultatExploitation = produitsExploitation - chargesExploitation
      const resultatCourant = resultatExploitation + resultatFinancier
      
      const totalProduitsExceptionnels = (data.fixedLines?.produits_exceptionnels || []).reduce((sum, line) => sum + parseValue(line.value), 0) +
                                         (data.addedLines?.produits_exceptionnels || []).reduce((sum, line) => sum + parseValue(line.value), 0)
      
      const totalChargesExceptionnelles = (data.fixedLines?.charges_exceptionnelles || []).reduce((sum, line) => sum + parseValue(line.value), 0) +
                                          (data.addedLines?.charges_exceptionnelles || []).reduce((sum, line) => sum + parseValue(line.value), 0)
      
      const resultatExceptionnel = totalProduitsExceptionnels - totalChargesExceptionnelles
      
      const participationSalaries = parseValue(data.fixedLines?.autres?.find(l => l.id === 'participation_salaries')?.value || '')
      const impots = parseValue(data.fixedLines?.autres?.find(l => l.id === 'impots_benefices')?.value || '')
      
      const totalProduits = produitsExploitation + totalProduitsFinanciers + totalProduitsExceptionnels
      const totalCharges = chargesExploitation + totalChargesFinancieres + totalChargesExceptionnelles + participationSalaries + impots
      const excedent = totalProduits - totalCharges
      
      // PRODUITS FINANCIERS
      doc.setFontSize(14)
      doc.setFont('helvetica', 'bold')
      doc.text('Produits financiers', marginLeft, yPosition)
      yPosition += lineHeight + 3
      
      doc.setFontSize(9)
      doc.setFont('helvetica', 'normal')
      ;(data.fixedLines?.produits_financiers || []).forEach(line => {
        if (yPosition > pageHeight - 30) {
          doc.addPage()
          doc.setFontSize(10)
          doc.setFont('helvetica', 'normal')
          doc.text('ASSOCIATION AAPISE | Comptes annuels', marginLeft, 15)
          doc.text(data.dates?.date || dates.date, pageWidth - marginLeft, 15, { align: 'right' })
          yPosition = 25
        }
        let label = line.label
        const maxWidth = dateColX - marginLeft - 90
        if (doc.getTextWidth(label) > maxWidth) {
          label = doc.splitTextToSize(label, maxWidth)[0] + '...'
        }
        doc.text(label, marginLeft, yPosition)
        if (line.value && line.value.trim() !== '') {
          doc.text(formatValueForPDF(line.value), dateColX, yPosition, { align: 'right' })
        }
        yPosition += lineHeight
      })
      
      ;(data.addedLines?.produits_financiers || []).forEach(line => {
        if (yPosition > pageHeight - 30) {
          doc.addPage()
          doc.setFontSize(10)
          doc.setFont('helvetica', 'normal')
          doc.text('ASSOCIATION AAPISE | Comptes annuels', marginLeft, 15)
          doc.text(data.dates?.date || dates.date, pageWidth - marginLeft, 15, { align: 'right' })
          yPosition = 25
        }
        let label = line.label
        const maxWidth = dateColX - marginLeft - 90
        if (doc.getTextWidth(label) > maxWidth) {
          label = doc.splitTextToSize(label, maxWidth)[0] + '...'
        }
        doc.text(label, marginLeft, yPosition)
        if (line.value && line.value.trim() !== '') {
          doc.text(formatValueForPDF(line.value), dateColX, yPosition, { align: 'right' })
        }
        yPosition += lineHeight
      })
      
      // TOTAL III avec fond gris
      yPosition += 3
      const totalRowY3 = yPosition - 2
      doc.setFillColor(240, 240, 240)
      doc.rect(marginLeft, totalRowY3 - 3, pageWidth - marginLeft - marginRight, lineHeight + 4, 'F')
      doc.setFont('helvetica', 'bold')
      doc.setTextColor(0, 0, 0)
      doc.text('TOTAL III', marginLeft, yPosition)
      doc.text(formatValueWithZeroForPDF(totalProduitsFinanciers.toString()), dateColX, yPosition, { align: 'right' })
      yPosition += lineHeight + 5
      
      // CHARGES FINANCIÈRES
      yPosition += 3
      doc.setFontSize(14)
      doc.setFont('helvetica', 'bold')
      doc.text('Charges financières', marginLeft, yPosition)
      yPosition += lineHeight + 3
      
      doc.setFontSize(9)
      doc.setFont('helvetica', 'normal')
      ;(data.fixedLines?.charges_financieres || []).forEach(line => {
        if (yPosition > pageHeight - 30) {
          doc.addPage()
          doc.setFontSize(10)
          doc.setFont('helvetica', 'normal')
          doc.text('ASSOCIATION AAPISE | Comptes annuels', marginLeft, 15)
          doc.text(data.dates?.date || dates.date, pageWidth - marginLeft, 15, { align: 'right' })
          yPosition = 25
        }
        let label = line.label
        const maxWidth = dateColX - marginLeft - 90
        if (doc.getTextWidth(label) > maxWidth) {
          label = doc.splitTextToSize(label, maxWidth)[0] + '...'
        }
        doc.text(label, marginLeft, yPosition)
        if (line.value && line.value.trim() !== '') {
          doc.text(formatValueForPDF(line.value), dateColX, yPosition, { align: 'right' })
        }
        yPosition += lineHeight
      })
      
      ;(data.addedLines?.charges_financieres || []).forEach(line => {
        if (yPosition > pageHeight - 30) {
          doc.addPage()
          doc.setFontSize(10)
          doc.setFont('helvetica', 'normal')
          doc.text('ASSOCIATION AAPISE | Comptes annuels', marginLeft, 15)
          doc.text(data.dates?.date || dates.date, pageWidth - marginLeft, 15, { align: 'right' })
          yPosition = 25
        }
        let label = line.label
        const maxWidth = dateColX - marginLeft - 90
        if (doc.getTextWidth(label) > maxWidth) {
          label = doc.splitTextToSize(label, maxWidth)[0] + '...'
        }
        doc.text(label, marginLeft, yPosition)
        if (line.value && line.value.trim() !== '') {
          doc.text(formatValueForPDF(line.value), dateColX, yPosition, { align: 'right' })
        }
        yPosition += lineHeight
      })
      
      // TOTAL IV avec fond gris
      yPosition += 3
      const totalRowY4 = yPosition - 2
      doc.setFillColor(240, 240, 240)
      doc.rect(marginLeft, totalRowY4 - 3, pageWidth - marginLeft - marginRight, lineHeight + 4, 'F')
      doc.setFont('helvetica', 'bold')
      doc.setTextColor(0, 0, 0)
      doc.text('TOTAL IV', marginLeft, yPosition)
      doc.text(formatValueWithZeroForPDF(totalChargesFinancieres.toString()), dateColX, yPosition, { align: 'right' })
      yPosition += lineHeight + 5
      
      // RÉSULTAT FINANCIER avec couleur
      const resultRowYF = yPosition - 2
      doc.setFillColor(232, 232, 232)
      doc.rect(marginLeft, resultRowYF - 3, pageWidth - marginLeft - marginRight, lineHeight + 4, 'F')
      doc.text('RÉSULTAT FINANCIER (III - IV)', marginLeft, yPosition)
      if (resultatFinancier < 0) {
        doc.setTextColor(211, 47, 47)
      } else if (resultatFinancier > 0) {
        doc.setTextColor(40, 167, 69)
      } else {
        doc.setTextColor(0, 0, 0)
      }
      doc.setFont('helvetica', 'bold')
      doc.text(formatValueWithZeroForPDF(resultatFinancier.toString()), dateColX, yPosition, { align: 'right' })
      doc.setTextColor(0, 0, 0)
      doc.setFont('helvetica', 'normal')
      yPosition += lineHeight + 5
      
      // RÉSULTAT COURANT
      const resultRowYC = yPosition - 2
      doc.setFillColor(232, 232, 232)
      doc.rect(marginLeft, resultRowYC - 3, pageWidth - marginLeft - marginRight, lineHeight + 4, 'F')
      doc.text('RÉSULTAT COURANT AVANT IMPÔTS (I-II + III - IV)', marginLeft, yPosition)
      if (resultatCourant < 0) {
        doc.setTextColor(211, 47, 47)
      } else if (resultatCourant > 0) {
        doc.setTextColor(40, 167, 69)
      } else {
        doc.setTextColor(0, 0, 0)
      }
      doc.setFont('helvetica', 'bold')
      doc.text(formatValueWithZeroForPDF(resultatCourant.toString()), dateColX, yPosition, { align: 'right' })
      doc.setTextColor(0, 0, 0)
      doc.setFont('helvetica', 'normal')
      yPosition += lineHeight + 5
      
      // PRODUITS EXCEPTIONNELS
      yPosition += 3
      doc.setFontSize(14)
      doc.setFont('helvetica', 'bold')
      doc.text('Produits exceptionnels', marginLeft, yPosition)
      yPosition += lineHeight + 3
      
      doc.setFontSize(9)
      doc.setFont('helvetica', 'normal')
      ;(data.fixedLines?.produits_exceptionnels || []).forEach(line => {
        if (yPosition > pageHeight - 30) {
          doc.addPage()
          doc.setFontSize(10)
          doc.setFont('helvetica', 'normal')
          doc.text('ASSOCIATION AAPISE | Comptes annuels', marginLeft, 15)
          doc.text(data.dates?.date || dates.date, pageWidth - marginLeft, 15, { align: 'right' })
          yPosition = 25
        }
        let label = line.label
        const maxWidth = dateColX - marginLeft - 90
        if (doc.getTextWidth(label) > maxWidth) {
          label = doc.splitTextToSize(label, maxWidth)[0] + '...'
        }
        doc.text(label, marginLeft, yPosition)
        if (line.value && line.value.trim() !== '') {
          doc.text(formatValueForPDF(line.value), dateColX, yPosition, { align: 'right' })
        }
        yPosition += lineHeight
      })
      
      ;(data.addedLines?.produits_exceptionnels || []).forEach(line => {
        if (yPosition > pageHeight - 30) {
          doc.addPage()
          doc.setFontSize(10)
          doc.setFont('helvetica', 'normal')
          doc.text('ASSOCIATION AAPISE | Comptes annuels', marginLeft, 15)
          doc.text(data.dates?.date || dates.date, pageWidth - marginLeft, 15, { align: 'right' })
          yPosition = 25
        }
        let label = line.label
        const maxWidth = dateColX - marginLeft - 90
        if (doc.getTextWidth(label) > maxWidth) {
          label = doc.splitTextToSize(label, maxWidth)[0] + '...'
        }
        doc.text(label, marginLeft, yPosition)
        if (line.value && line.value.trim() !== '') {
          doc.text(formatValueForPDF(line.value), dateColX, yPosition, { align: 'right' })
        }
        yPosition += lineHeight
      })
      
      // TOTAL V avec fond gris
      yPosition += 3
      const totalRowY5 = yPosition - 2
      doc.setFillColor(240, 240, 240)
      doc.rect(marginLeft, totalRowY5 - 3, pageWidth - marginLeft - marginRight, lineHeight + 4, 'F')
      doc.setFont('helvetica', 'bold')
      doc.setTextColor(0, 0, 0)
      doc.text('TOTAL V', marginLeft, yPosition)
      doc.text(formatValueWithZeroForPDF(totalProduitsExceptionnels.toString()), dateColX, yPosition, { align: 'right' })
      yPosition += lineHeight + 5
      
      // CHARGES EXCEPTIONNELLES
      yPosition += 3
      doc.setFontSize(14)
      doc.setFont('helvetica', 'bold')
      doc.text('Charges exceptionnelles', marginLeft, yPosition)
      yPosition += lineHeight + 3
      
      doc.setFontSize(9)
      doc.setFont('helvetica', 'normal')
      ;(data.fixedLines?.charges_exceptionnelles || []).forEach(line => {
        if (yPosition > pageHeight - 30) {
          doc.addPage()
          doc.setFontSize(10)
          doc.setFont('helvetica', 'normal')
          doc.text('ASSOCIATION AAPISE | Comptes annuels', marginLeft, 15)
          doc.text(data.dates?.date || dates.date, pageWidth - marginLeft, 15, { align: 'right' })
          yPosition = 25
        }
        let label = line.label
        const maxWidth = dateColX - marginLeft - 90
        if (doc.getTextWidth(label) > maxWidth) {
          label = doc.splitTextToSize(label, maxWidth)[0] + '...'
        }
        doc.text(label, marginLeft, yPosition)
        if (line.value && line.value.trim() !== '') {
          doc.text(formatValueForPDF(line.value), dateColX, yPosition, { align: 'right' })
        }
        yPosition += lineHeight
      })
      
      ;(data.addedLines?.charges_exceptionnelles || []).forEach(line => {
        if (yPosition > pageHeight - 30) {
          doc.addPage()
          doc.setFontSize(10)
          doc.setFont('helvetica', 'normal')
          doc.text('ASSOCIATION AAPISE | Comptes annuels', marginLeft, 15)
          doc.text(data.dates?.date || dates.date, pageWidth - marginLeft, 15, { align: 'right' })
          yPosition = 25
        }
        let label = line.label
        const maxWidth = dateColX - marginLeft - 90
        if (doc.getTextWidth(label) > maxWidth) {
          label = doc.splitTextToSize(label, maxWidth)[0] + '...'
        }
        doc.text(label, marginLeft, yPosition)
        if (line.value && line.value.trim() !== '') {
          doc.text(formatValueForPDF(line.value), dateColX, yPosition, { align: 'right' })
        }
        yPosition += lineHeight
      })
      
      // TOTAL VI avec fond gris
      yPosition += 3
      const totalRowY6 = yPosition - 2
      doc.setFillColor(240, 240, 240)
      doc.rect(marginLeft, totalRowY6 - 3, pageWidth - marginLeft - marginRight, lineHeight + 4, 'F')
      doc.setFont('helvetica', 'bold')
      doc.setTextColor(0, 0, 0)
      doc.text('TOTAL VI', marginLeft, yPosition)
      doc.text(formatValueWithZeroForPDF(totalChargesExceptionnelles.toString()), dateColX, yPosition, { align: 'right' })
      yPosition += lineHeight + 5
      
      // RÉSULTAT EXCEPTIONNEL avec couleur
      const resultRowYE = yPosition - 2
      doc.setFillColor(232, 232, 232)
      doc.rect(marginLeft, resultRowYE - 3, pageWidth - marginLeft - marginRight, lineHeight + 4, 'F')
      doc.text('RÉSULTAT EXCEPTIONNEL (V - VI)', marginLeft, yPosition)
      if (resultatExceptionnel < 0) {
        doc.setTextColor(211, 47, 47)
      } else if (resultatExceptionnel > 0) {
        doc.setTextColor(40, 167, 69)
      } else {
        doc.setTextColor(0, 0, 0)
      }
      doc.setFont('helvetica', 'bold')
      doc.text(formatValueWithZeroForPDF(resultatExceptionnel.toString()), dateColX, yPosition, { align: 'right' })
      doc.setTextColor(0, 0, 0)
      doc.setFont('helvetica', 'normal')
      yPosition += lineHeight + 5
      
      // TOTAL DES PRODUITS avec fond gris
      yPosition += 3
      const totalRowYP = yPosition - 2
      doc.setFillColor(240, 240, 240)
      doc.rect(marginLeft, totalRowYP - 3, pageWidth - marginLeft - marginRight, lineHeight + 4, 'F')
      doc.setFont('helvetica', 'bold')
      doc.setTextColor(0, 0, 0)
      doc.text('TOTAL DES PRODUITS (I + III + V)', marginLeft, yPosition)
      doc.text(formatValueWithZeroForPDF(totalProduits.toString()), dateColX, yPosition, { align: 'right' })
      yPosition += lineHeight + 5
      
      // TOTAL DES CHARGES avec fond gris
      yPosition += 3
      const totalRowYC = yPosition - 2
      doc.setFillColor(240, 240, 240)
      doc.rect(marginLeft, totalRowYC - 3, pageWidth - marginLeft - marginRight, lineHeight + 4, 'F')
      doc.setFont('helvetica', 'bold')
      doc.setTextColor(0, 0, 0)
      doc.text('TOTAL DES CHARGES (II + IV + VI + VII + VIII)', marginLeft, yPosition)
      doc.text(formatValueWithZeroForPDF(totalCharges.toString()), dateColX, yPosition, { align: 'right' })
      yPosition += lineHeight + 5
      
      // EXCÉDENT OU DÉFICIT avec couleur
      const resultRowYEx = yPosition - 2
      doc.setFillColor(232, 232, 232)
      doc.rect(marginLeft, resultRowYEx - 3, pageWidth - marginLeft - marginRight, lineHeight + 4, 'F')
      doc.text('EXCÉDENT OU DÉFICIT (Total des produits - Total des charges)', marginLeft, yPosition)
      if (excedent < 0) {
        doc.setTextColor(211, 47, 47)
      } else if (excedent > 0) {
        doc.setTextColor(40, 167, 69)
      } else {
        doc.setTextColor(0, 0, 0)
      }
      doc.setFont('helvetica', 'bold')
      doc.text(formatValueWithZeroForPDF(excedent.toString()), dateColX, yPosition, { align: 'right' })
      doc.setTextColor(0, 0, 0)
      doc.setFont('helvetica', 'normal')
      yPosition += lineHeight + 3
      
      // DONT EXCÉDENT OU DÉFICIT
      doc.setFontSize(9)
      doc.text('- dont excédent ou déficit des activités sociales et médico-sociales sous gestion contrôlée', marginLeft, yPosition)
      
      // Page 4 - PARTICIPATION DES SALARIÉS et IMPÔTS
      doc.addPage()
      
      doc.setFontSize(10)
      doc.setFont('helvetica', 'normal')
      doc.text('ASSOCIATION AAPISE | Comptes annuels', marginLeft, 15)
      doc.text(data.dates?.date || dates.date, pageWidth - marginLeft, 15, { align: 'right' })
      
      yPosition = 35
      
      // En-tête des colonnes
      doc.setFontSize(10)
      doc.setFont('helvetica', 'bold')
      doc.text('Libellé', marginLeft, yPosition)
      doc.text(data.dates?.date || dates.date, dateColX, yPosition, { align: 'right' })
      yPosition += lineHeight
      
      // Ligne de séparation
      doc.setLineWidth(0.5)
      doc.setDrawColor(0, 0, 0)
      doc.line(marginLeft, yPosition, pageWidth - marginLeft, yPosition)
      yPosition += lineHeight + 2
      
      // PARTICIPATION DES SALARIÉS
      const participationLine = data.fixedLines?.autres?.find(l => l.id === 'participation_salaries')
      if (participationLine) {
        doc.setFontSize(9)
        doc.setFont('helvetica', 'normal')
        doc.text(participationLine.label, marginLeft, yPosition)
        if (participationLine.value && participationLine.value.trim() !== '') {
          doc.text(formatValueForPDF(participationLine.value), dateColX, yPosition, { align: 'right' })
        }
        yPosition += lineHeight + 3
        doc.setFont('helvetica', 'bold')
        doc.text('VII', marginLeft, yPosition)
        yPosition += lineHeight + 5
      }
      
      // IMPÔTS SUR LES BÉNÉFICES
      const impotsLine = data.fixedLines?.autres?.find(l => l.id === 'impots_benefices')
      if (impotsLine) {
        doc.setFontSize(9)
        doc.setFont('helvetica', 'normal')
        doc.text(impotsLine.label, marginLeft, yPosition)
        if (impotsLine.value && impotsLine.value.trim() !== '') {
          doc.text(formatValueForPDF(impotsLine.value), dateColX, yPosition, { align: 'right' })
        }
        yPosition += lineHeight + 3
        doc.setFont('helvetica', 'bold')
        doc.text('VIII', marginLeft, yPosition)
      }
      
      // Page 5 - Graphiques circulaires des statistiques
      doc.addPage()
      
      doc.setFontSize(10)
      doc.setFont('helvetica', 'normal')
      doc.text('ASSOCIATION AAPISE | Comptes annuels', marginLeft, 15)
      doc.text(data.dates?.date || dates.date, pageWidth - marginLeft, 15, { align: 'right' })
      
      doc.setFontSize(18)
      doc.setFont('helvetica', 'bold')
      doc.text('Statistiques et Répartition', pageWidth / 2, 30, { align: 'center' })
      
      // Calculer les statistiques pour les graphiques
      const statsProduitsExploitation = produits.reduce((sum, line) => sum + parseValue(line.value), 0) +
                                       (firstPageData.addedLines?.produits || []).reduce((sum, line) => sum + parseValue(line.value), 0)
      const statsProduitsFinanciers = totalProduitsFinanciers
      const statsProduitsExceptionnels = totalProduitsExceptionnels
      const totalProduitsAll = statsProduitsExploitation + statsProduitsFinanciers + statsProduitsExceptionnels
      
      const statsChargesExploitation = charges.reduce((sum, line) => sum + parseValue(line.value), 0) +
                                      (firstPageData.addedLines?.charges || []).reduce((sum, line) => sum + parseValue(line.value), 0)
      const statsChargesFinancieres = totalChargesFinancieres
      const statsChargesExceptionnelles = totalChargesExceptionnelles
      const totalChargesAll = statsChargesExploitation + statsChargesFinancieres + statsChargesExceptionnelles
      
      yPosition = 50
      
      // Graphique 1 : Répartition des Produits
      doc.setFontSize(14)
      doc.setFont('helvetica', 'bold')
      doc.text('Répartition des Produits', pageWidth / 2, yPosition, { align: 'center' })
      yPosition += 10
      
      const chart1X = pageWidth / 2
      const chart1Y = yPosition + 25
      const chart1Radius = 25
      
      const produitsData = [statsProduitsExploitation, statsProduitsFinanciers, statsProduitsExceptionnels]
      const produitsLabels = ['Produits d\'exploitation', 'Produits financiers', 'Produits exceptionnels']
      const produitsColors = [[52, 152, 219], [46, 204, 113], [155, 89, 182]]
      
      if (totalProduitsAll > 0) {
        let currentAngle = -90 // Commencer en haut (-90 degrés)
        produitsData.forEach((value, index) => {
          if (value > 0) {
            const angle = (value / totalProduitsAll) * 360
            const startRad = (currentAngle * Math.PI) / 180
            const endRad = ((currentAngle + angle) * Math.PI) / 180
            
            doc.setFillColor(produitsColors[index][0], produitsColors[index][1], produitsColors[index][2])
            doc.setDrawColor(produitsColors[index][0], produitsColors[index][1], produitsColors[index][2])
            
            // Dessiner le secteur avec des lignes pour créer un effet rempli
            for (let a = currentAngle; a <= currentAngle + angle; a += 3) {
              const rad = (a * Math.PI) / 180
              const x1 = chart1X + chart1Radius * 0.6 * Math.cos(rad)
              const y1 = chart1Y + chart1Radius * 0.6 * Math.sin(rad)
              const x2 = chart1X + chart1Radius * Math.cos(rad)
              const y2 = chart1Y + chart1Radius * Math.sin(rad)
              doc.line(x1, y1, x2, y2)
            }
            
            // Lignes radiales
            const xStart = chart1X + chart1Radius * 0.6 * Math.cos(startRad)
            const yStart = chart1Y + chart1Radius * 0.6 * Math.sin(startRad)
            const xEnd = chart1X + chart1Radius * Math.cos(startRad)
            const yEnd = chart1Y + chart1Radius * Math.sin(startRad)
            doc.line(chart1X, chart1Y, xStart, yStart)
            doc.line(xStart, yStart, xEnd, yEnd)
            
            const xStart2 = chart1X + chart1Radius * 0.6 * Math.cos(endRad)
            const yStart2 = chart1Y + chart1Radius * 0.6 * Math.sin(endRad)
            const xEnd2 = chart1X + chart1Radius * Math.cos(endRad)
            const yEnd2 = chart1Y + chart1Radius * Math.sin(endRad)
            doc.line(chart1X, chart1Y, xStart2, yStart2)
            doc.line(xStart2, yStart2, xEnd2, yEnd2)
            
            const percent = ((value / totalProduitsAll) * 100).toFixed(1)
            const midAngle = currentAngle + angle / 2
            const midRad = (midAngle * Math.PI) / 180
            const labelX = chart1X + chart1Radius * 0.8 * Math.cos(midRad)
            const labelY = chart1Y + chart1Radius * 0.8 * Math.sin(midRad)
            
            doc.setFontSize(9)
            doc.setTextColor(0, 0, 0)
            doc.text(`${percent}%`, labelX, labelY)
            
            currentAngle += angle
          }
        })
        
        doc.setLineWidth(2)
        doc.setDrawColor(0, 0, 0)
        doc.circle(chart1X, chart1Y, chart1Radius)
        doc.circle(chart1X, chart1Y, chart1Radius * 0.6)
      }
      
      // Légende produits
      let legendY = chart1Y + chart1Radius + 20
      doc.setFontSize(9)
      doc.setFont('helvetica', 'normal')
      produitsData.forEach((value, index) => {
        if (value > 0) {
          const percent = ((value / totalProduitsAll) * 100).toFixed(1)
          doc.setFillColor(produitsColors[index][0], produitsColors[index][1], produitsColors[index][2])
          doc.rect(marginLeft, legendY - 2, 3, 3, 'F')
          doc.setTextColor(0, 0, 0)
          doc.text(`${produitsLabels[index]}: ${percent}%`, marginLeft + 6, legendY)
          legendY += 5
        }
      })
      
      // Graphique 2 : Répartition des Charges
      legendY += 10
      doc.setFontSize(14)
      doc.setFont('helvetica', 'bold')
      doc.text('Répartition des Charges', pageWidth / 2, legendY, { align: 'center' })
      legendY += 10
      
      const chart2X = pageWidth / 2
      const chart2Y = legendY + 25
      const chart2Radius = 25
      
      const chargesData = [statsChargesExploitation, statsChargesFinancieres, statsChargesExceptionnelles]
      const chargesLabels = ['Charges d\'exploitation', 'Charges financières', 'Charges exceptionnelles']
      const chargesColors = [[231, 76, 60], [241, 196, 15], [230, 126, 34]]
      
      if (totalChargesAll > 0) {
        let currentAngle = -90 // Commencer en haut
        chargesData.forEach((value, index) => {
          if (value > 0) {
            const angle = (value / totalChargesAll) * 360
            const startRad = (currentAngle * Math.PI) / 180
            const endRad = ((currentAngle + angle) * Math.PI) / 180
            
            doc.setFillColor(chargesColors[index][0], chargesColors[index][1], chargesColors[index][2])
            doc.setDrawColor(chargesColors[index][0], chargesColors[index][1], chargesColors[index][2])
            
            for (let a = currentAngle; a <= currentAngle + angle; a += 3) {
              const rad = (a * Math.PI) / 180
              const x1 = chart2X + chart2Radius * 0.6 * Math.cos(rad)
              const y1 = chart2Y + chart2Radius * 0.6 * Math.sin(rad)
              const x2 = chart2X + chart2Radius * Math.cos(rad)
              const y2 = chart2Y + chart2Radius * Math.sin(rad)
              doc.line(x1, y1, x2, y2)
            }
            
            const xStart = chart2X + chart2Radius * 0.6 * Math.cos(startRad)
            const yStart = chart2Y + chart2Radius * 0.6 * Math.sin(startRad)
            const xEnd = chart2X + chart2Radius * Math.cos(startRad)
            const yEnd = chart2Y + chart2Radius * Math.sin(startRad)
            doc.line(chart2X, chart2Y, xStart, yStart)
            doc.line(xStart, yStart, xEnd, yEnd)
            
            const xStart2 = chart2X + chart2Radius * 0.6 * Math.cos(endRad)
            const yStart2 = chart2Y + chart2Radius * 0.6 * Math.sin(endRad)
            const xEnd2 = chart2X + chart2Radius * Math.cos(endRad)
            const yEnd2 = chart2Y + chart2Radius * Math.sin(endRad)
            doc.line(chart2X, chart2Y, xStart2, yStart2)
            doc.line(xStart2, yStart2, xEnd2, yEnd2)
            
            const percent = ((value / totalChargesAll) * 100).toFixed(1)
            const midAngle = currentAngle + angle / 2
            const midRad = (midAngle * Math.PI) / 180
            const labelX = chart2X + chart2Radius * 0.8 * Math.cos(midRad)
            const labelY = chart2Y + chart2Radius * 0.8 * Math.sin(midRad)
            
            doc.setFontSize(9)
            doc.setTextColor(0, 0, 0)
            doc.text(`${percent}%`, labelX, labelY)
            
            currentAngle += angle
          }
        })
        
        doc.setLineWidth(2)
        doc.setDrawColor(0, 0, 0)
        doc.circle(chart2X, chart2Y, chart2Radius)
        doc.circle(chart2X, chart2Y, chart2Radius * 0.6)
      }
      
      // Légende charges
      legendY = chart2Y + chart2Radius + 20
      doc.setFontSize(9)
      doc.setFont('helvetica', 'normal')
      chargesData.forEach((value, index) => {
        if (value > 0) {
          const percent = ((value / totalChargesAll) * 100).toFixed(1)
          doc.setFillColor(chargesColors[index][0], chargesColors[index][1], chargesColors[index][2])
          doc.rect(marginLeft, legendY - 2, 3, 3, 'F')
          doc.setTextColor(0, 0, 0)
          doc.text(`${chargesLabels[index]}: ${percent}%`, marginLeft + 6, legendY)
          legendY += 5
        }
      })
      
      // Sauvegarder le PDF complet
      const fileName = `Compte_Resultat_${dates.date.replace(/\//g, '-')}.pdf`
      console.log('generateCompletePDF: Sauvegarde du PDF complet:', fileName)
      doc.save(fileName)
      console.log('generateCompletePDF: PDF complet sauvegardé avec succès')
    } catch (error) {
      console.error('Erreur lors de l\'ajout de la deuxième page:', error)
      // Sauvegarder quand même le PDF avec les 2 premières pages
      try {
        const doc = await generatePDF()
        if (doc) {
          doc.save(`Compte_Resultat_${dates.date.replace(/\//g, '-')}.pdf`)
        }
      } catch (err) {
        console.error('Erreur lors de la sauvegarde du PDF:', err)
      }
    }
  }

  // Fonction pour formater les valeurs pour le PDF (identique à formatValue)
  const formatValueForPDF = (value) => {
    if (!value || value.trim() === '') return ''
    // Utiliser la même fonction parseValue que pour l'affichage
    const num = parseValue(value)
    if (isNaN(num) || num === 0) return ''
    // Formater manuellement avec espaces normaux (pas d'espaces insécables)
    const intValue = Math.round(num)
    const numStr = intValue.toString()
    let formatted = ''
    let count = 0
    
    // Ajouter les espaces de droite à gauche (format français)
    for (let i = numStr.length - 1; i >= 0; i--) {
      if (count === 3 && i >= 0) {
        formatted = ' ' + formatted // Espace normal, pas insécable
        count = 0
      }
      formatted = numStr[i] + formatted
      count++
    }
    
    return formatted + ' €'
  }
  
  // Fonction pour formater les valeurs avec zéro pour le PDF (identique à formatValueWithZero)
  const formatValueWithZeroForPDF = (value) => {
    if (!value || value.trim() === '') return ''
    const num = parseValue(value)
    if (isNaN(num)) return ''
    // Formater manuellement avec espaces normaux
    const intValue = Math.round(num)
    const numStr = intValue.toString()
    let formatted = ''
    let count = 0
    
    // Ajouter les espaces de droite à gauche (format français)
    for (let i = numStr.length - 1; i >= 0; i--) {
      if (count === 3 && i >= 0) {
        formatted = ' ' + formatted // Espace normal
        count = 0
      }
      formatted = numStr[i] + formatted
      count++
    }
    
    return formatted + ' €'
  }

  // Fonction pour charger depuis localStorage
  const loadFromStorage = () => {
    const saved = localStorage.getItem('compteResultat_data')
    if (saved) {
      try {
        const data = JSON.parse(saved)
        if (data.fixedLines) setFixedLines(data.fixedLines)
        if (data.addedLines) setAddedLines(data.addedLines)
        if (data.dates) setDates(data.dates)
      } catch (error) {
        console.error('Erreur lors du chargement des données:', error)
      }
    }
  }

  // Charger les données au montage du composant
  useEffect(() => {
    loadFromStorage()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Fonction pour passer à la page suivante
  const handleNext = () => {
    // Sauvegarder seulement dans localStorage (sans PDF)
    const dataToSave = {
      fixedLines,
      addedLines,
      dates,
      savedAt: new Date().toISOString()
    }
    localStorage.setItem('compteResultat_data', JSON.stringify(dataToSave))
    // Naviguer vers la page suivante via un événement personnalisé
    window.dispatchEvent(new CustomEvent('navigateToNextPage'))
  }

  // Fonction pour supprimer toutes les valeurs
  const handleClear = () => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer toutes les valeurs ? Cette action est irréversible.')) {
      // Réinitialiser toutes les valeurs des lignes fixes
      setFixedLines(prev => ({
        produits: prev.produits.map(line => ({ ...line, value: '' })),
        charges: prev.charges.map(line => ({ ...line, value: '' }))
      }))
      // Supprimer toutes les lignes ajoutées dynamiquement
      setAddedLines({
        produits: [],
        charges: []
      })
      alert('Toutes les valeurs ont été supprimées !')
    }
  }

  return (
    <div className="compte-resultat">
      <div className="header">
        <h1 className="title">Compte de résultat</h1>
        <div className="subtitle">ASSOCIATION AAPISE | Comptes annuels</div>
        <button className="add-button" onClick={handleAddClick}>
          + Ajouter une ligne
        </button>
      </div>

      {/* Formulaire modal */}
      {showForm && (
        <div className="modal-overlay" onClick={handleCloseForm}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{editingLine ? 'Modifier une ligne' : 'Ajouter une ligne'}</h2>
              <button className="close-button" onClick={handleCloseForm}>×</button>
            </div>
            <form onSubmit={handleSubmit} className="add-form">
              <div className="form-group">
                <label htmlFor="label">Libellé *</label>
                <input
                  type="text"
                  id="label"
                  name="label"
                  value={formData.label}
                  onChange={handleInputChange}
                  placeholder="Ex: Cotisations"
                  required
                  disabled={editingLine?.isFixed}
                  style={editingLine?.isFixed ? { opacity: 0.6, cursor: 'not-allowed' } : {}}
                />
                {editingLine?.isFixed && (
                  <small style={{ color: '#888', fontSize: '12px', display: 'block', marginTop: '4px' }}>
                    Le libellé ne peut pas être modifié pour les lignes fixes
                  </small>
                )}
              </div>

              <div className="form-group">
                <label htmlFor="value">Valeur ({dates.date})</label>
                <input
                  type="text"
                  id="value"
                  name="value"
                  value={formData.value}
                  onChange={handleInputChange}
                  placeholder="Ex: 7970"
                />
              </div>

              <div className="form-group">
                <label htmlFor="section">Section *</label>
                <select
                  id="section"
                  name="section"
                  value={formData.section}
                  onChange={handleInputChange}
                  required
                >
                  <option value="produits">Produits d'exploitation</option>
                  <option value="charges">Charges d'exploitation</option>
                </select>
              </div>

              <div className="form-actions">
                <button type="button" onClick={handleCloseForm} className="cancel-button">
                  Annuler
                </button>
                <button type="submit" className="submit-button">
                  {editingLine ? 'Modifier' : 'Ajouter'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <table className="financial-table">
        <thead>
          <tr>
            <th className="label-column"></th>
            <th className="value-column">
              <input
                type="text"
                className="date-input"
                value={dates.date}
                onChange={(e) => setDates(prev => ({ ...prev, date: e.target.value }))}
                placeholder="31/12/2024"
              />
            </th>
          </tr>
        </thead>
        <tbody>
          {/* PRODUITS D'EXPLOITATION */}
          <tr className="section-header">
            <td colSpan="2"><strong>Produits d'exploitation</strong></td>
          </tr>
          
          {/* Lignes fixes */}
          {fixedLines.produits.map((line) => (
            <tr 
              key={line.id} 
              className={`editable-row ${line.level === 1 ? 'sub-item' : ''} ${line.level === 2 ? 'sub-detail' : ''}`}
            >
              <td 
                className={`label editable-label ${line.level === 1 ? 'sub-item' : ''} ${line.level === 2 ? 'sub-detail' : ''}`}
                onDoubleClick={() => handleEditClick(line.id, 'produits', true)}
                title="Double-cliquez pour modifier la valeur"
                style={{ paddingLeft: `${line.level * 20}px` }}
              >
                {line.label}
              </td>
              <td 
                className="value editable-value"
                onDoubleClick={() => handleEditClick(line.id, 'produits', true)}
                title="Double-cliquez pour modifier la valeur"
              >
                {formatValue(line.value)}
              </td>
            </tr>
          ))}
          
          {/* Lignes ajoutées dynamiquement */}
          {addedLines.produits.map((line, index) => (
            <tr 
              key={line.id} 
              className="editable-row"
              onContextMenu={(e) => handleContextMenu(e, line.id, 'produits')}
            >
              <td 
                className="label editable-label"
                onDoubleClick={() => handleEditClick(line.id, 'produits', false)}
                title="Double-cliquez pour modifier"
              >
                {line.label}
              </td>
              <td className="value">{formatValue(line.value)}</td>
            </tr>
          ))}
          
          <tr className="total-row">
            <td className="label"><strong>TOTAL I</strong></td>
            <td className="value"><strong>{formatValueWithZero(totalProduits.toString())}</strong></td>
          </tr>

          {/* CHARGES D'EXPLOITATION */}
          <tr className="section-header">
            <td colSpan="2"><strong>Charges d'exploitation</strong></td>
          </tr>
          
          {/* Lignes fixes */}
          {fixedLines.charges.map((line) => (
            <tr 
              key={line.id} 
              className="editable-row"
            >
              <td 
                className="label editable-label"
                onDoubleClick={() => handleEditClick(line.id, 'charges', true)}
                title="Double-cliquez pour modifier la valeur"
              >
                {line.label}
              </td>
              <td 
                className="value editable-value"
                onDoubleClick={() => handleEditClick(line.id, 'charges', true)}
                title="Double-cliquez pour modifier la valeur"
              >
                {formatValue(line.value)}
              </td>
            </tr>
          ))}
          
          {/* Lignes ajoutées dynamiquement */}
          {addedLines.charges.map((line, index) => (
            <tr 
              key={line.id} 
              className="editable-row"
              onContextMenu={(e) => handleContextMenu(e, line.id, 'charges')}
            >
              <td 
                className="label editable-label"
                onDoubleClick={() => handleEditClick(line.id, 'charges', false)}
                title="Double-cliquez pour modifier"
              >
                {line.label}
              </td>
              <td className="value">{formatValue(line.value)}</td>
            </tr>
          ))}
          
          <tr className="total-row">
            <td className="label"><strong>TOTAL II</strong></td>
            <td className="value"><strong>{formatValueWithZero(totalCharges.toString())}</strong></td>
          </tr>

          {/* RÉSULTAT D'EXPLOITATION */}
          <tr className="result-row">
            <td className="label"><strong>RÉSULTAT D'EXPLOITATION (I-II)</strong></td>
            <td className={`value ${result < 0 ? 'negative' : result > 0 ? 'positive' : ''}`}>
              <strong>{formatValueWithZero(result.toString())}</strong>
            </td>
          </tr>
        </tbody>
      </table>

      {/* Boutons d'action en bas */}
      <div className="action-buttons-bottom">
        <button className="clear-button" onClick={handleClear}>
          🗑️ Clear
        </button>
        <button className="save-button" onClick={handleSaveOnly}>
          💾 Enregistrer
        </button>
        <button className="save-pdf-button" onClick={handleSave}>
          📄 Enregistrer et PDF
        </button>
        <button className="next-button" onClick={handleNext}>
          Suivant ➡️
        </button>
      </div>
    </div>
  )
}

export default CompteResultat

