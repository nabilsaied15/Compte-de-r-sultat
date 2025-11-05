import React, { useState, useEffect } from 'react'
import './CompteResultat.css'

function PageSuivante({ onBack }) {
  const [showForm, setShowForm] = useState(false)
  const [editingLine, setEditingLine] = useState(null)
  const [formData, setFormData] = useState({
    label: '',
    value: '',
    section: 'produits_financiers',
    type: 'produits' // 'produits' ou 'charges'
  })
  const [addedLines, setAddedLines] = useState({
    produits_financiers: [],
    charges_financieres: [],
    produits_exceptionnels: [],
    charges_exceptionnelles: []
  })

  // Lignes fixes pour la suite du compte de résultat
  const [fixedLines, setFixedLines] = useState({
    produits_financiers: [
      { id: 'produits_participation', label: 'Produits financiers de participation', value: '', level: 0 },
      { id: 'produits_valeurs', label: 'Produits des autres valeurs mobilières et créances de l\'actif immobilisé', value: '', level: 0 },
      { id: 'autres_interets', label: 'Autres intérêts et produits assimilés', value: '', level: 0 },
      { id: 'reprises_financieres', label: 'Reprises sur provisions, dépréciations et transferts de charges', value: '', level: 0 },
      { id: 'differences_positives', label: 'Différences positives de change', value: '', level: 0 },
      { id: 'produits_cessions', label: 'Produits nets sur cessions de valeurs mobilières de placement', value: '', level: 0 }
    ],
    charges_financieres: [
      { id: 'dotations_financieres', label: 'Dotations financières aux amortissements, dépréciations et provisions', value: '', level: 0 },
      { id: 'interets_charges', label: 'Intérêts et charges assimilées', value: '', level: 0 },
      { id: 'differences_negatives', label: 'Différences négatives de change', value: '', level: 0 },
      { id: 'charges_cessions', label: 'Charges nettes sur cessions de valeurs mobilières de placement', value: '', level: 0 }
    ],
    produits_exceptionnels: [
      { id: 'produits_gestion', label: 'Sur opérations de gestion', value: '', level: 0 },
      { id: 'produits_capital', label: 'Sur opérations en capital', value: '', level: 0 },
      { id: 'reprises_exceptionnelles', label: 'Reprises sur provisions, dépréciations et transferts de charges', value: '', level: 0 }
    ],
    charges_exceptionnelles: [
      { id: 'charges_gestion', label: 'Sur opérations de gestion', value: '', level: 0 },
      { id: 'charges_capital', label: 'Sur opérations en capital', value: '', level: 0 },
      { id: 'dotations_exceptionnelles', label: 'Dotations aux amortissements, dépréciations et provisions', value: '', level: 0 }
    ],
    autres: [
      { id: 'participation_salaries', label: 'Participation des salariés aux résultats', value: '', level: 0 },
      { id: 'impots_benefices', label: 'Impôts sur les bénéfices', value: '', level: 0 }
    ]
  })
  const [dates, setDates] = useState({
    date: '31/12/2024'
  })

  // Charger les données de la première page depuis localStorage
  const [firstPageData, setFirstPageData] = useState(null)

  useEffect(() => {
    const saved = localStorage.getItem('compteResultat_data')
    if (saved) {
      try {
        const data = JSON.parse(saved)
        setFirstPageData(data)
      } catch (error) {
        console.error('Erreur lors du chargement des données:', error)
      }
    }
  }, [])

  useEffect(() => {
    const saved = localStorage.getItem('pageSuivante_data')
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
  }, [])

  const handleAddClick = () => {
    setEditingLine(null)
    setShowForm(true)
    setFormData({
      label: '',
      value: '',
      section: 'produits_financiers',
      type: 'produits'
    })
  }

  const handleEditClick = (lineId, section, isFixed = false) => {
    let line
    if (isFixed) {
      if (section === 'autres') {
        line = fixedLines.autres?.find(l => l.id === lineId)
      } else {
        line = fixedLines[section]?.find(l => l.id === lineId)
      }
      if (line) {
        setEditingLine({ id: lineId, section: section === 'autres' ? 'autres' : section, isFixed: true })
        const type = section.includes('produits') ? 'produits' : 'charges'
        setFormData({
          label: line.label,
          value: line.value,
          section: section === 'autres' ? 'autres' : section,
          type: type
        })
        setShowForm(true)
      }
    } else {
      line = addedLines[section]?.find(l => l.id === lineId)
      if (line) {
        setEditingLine({ id: lineId, section, isFixed: false })
        const type = section.includes('produits') ? 'produits' : 'charges'
        setFormData({
          label: line.label,
          value: line.value,
          section: section,
          type: type
        })
        setShowForm(true)
      }
    }
  }

  const handleCloseForm = () => {
    setShowForm(false)
    setEditingLine(null)
    setFormData({
      label: '',
      value: '',
      section: 'produits_financiers',
      type: 'produits'
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
      if (editingLine.isFixed) {
        if (formData.section === 'autres') {
          setFixedLines(prev => ({
            ...prev,
            autres: prev.autres.map(l =>
              l.id === editingLine.id
                ? { ...l, value: formData.value }
                : l
            )
          }))
        } else {
          setFixedLines(prev => ({
            ...prev,
            [formData.section]: prev[formData.section].map(l =>
              l.id === editingLine.id
                ? { ...l, value: formData.value }
                : l
            )
          }))
        }
      } else {
        const line = addedLines[editingLine.section]?.find(l => l.id === editingLine.id)
        if (line) {
          setAddedLines(prev => ({
            ...prev,
            [editingLine.section]: prev[editingLine.section].map(l =>
              l.id === editingLine.id
                ? { ...l, label: formData.label, value: formData.value }
                : l
            )
          }))
        }
      }
    } else {
      // Déterminer la section finale en fonction du type et de la catégorie
      let finalSection = formData.section
      if (formData.type === 'produits') {
        finalSection = formData.section.includes('financiers') || formData.section.includes('financieres') 
          ? 'produits_financiers' 
          : 'produits_exceptionnels'
      } else {
        finalSection = formData.section.includes('financiers') || formData.section.includes('financieres')
          ? 'charges_financieres'
          : 'charges_exceptionnelles'
      }

      const newLine = {
        id: Date.now(),
        label: formData.label,
        value: formData.value
      }
      setAddedLines(prev => ({
        ...prev,
        [finalSection]: [...(prev[finalSection] || []), newLine]
      }))
    }

    handleCloseForm()
  }

  const formatValue = (value) => {
    if (!value || value.trim() === '') return ''
    const num = parseFloat(value.replace(/\s/g, '').replace('€', '').trim())
    if (isNaN(num) || num === 0) return ''
    return num.toLocaleString('fr-FR')
  }

  const formatValueWithZero = (value) => {
    if (!value || value.trim() === '') return ''
    const num = parseFloat(value.replace(/\s/g, '').replace('€', '').trim())
    if (isNaN(num)) return ''
    return num.toLocaleString('fr-FR')
  }

  const parseValue = (value) => {
    if (!value || value.trim() === '') return 0
    const num = parseFloat(value.replace(/\s/g, '').replace('€', '').trim())
    return isNaN(num) ? 0 : num
  }

  // Calculer les totaux
  const calculateTotalProduitsFinanciers = () => {
    const fixedTotal = (fixedLines.produits_financiers || []).reduce((sum, line) => sum + parseValue(line.value), 0)
    const addedTotal = (addedLines.produits_financiers || []).reduce((sum, line) => sum + parseValue(line.value), 0)
    return fixedTotal + addedTotal
  }

  const calculateTotalChargesFinancieres = () => {
    const fixedTotal = (fixedLines.charges_financieres || []).reduce((sum, line) => sum + parseValue(line.value), 0)
    const addedTotal = (addedLines.charges_financieres || []).reduce((sum, line) => sum + parseValue(line.value), 0)
    return fixedTotal + addedTotal
  }

  const calculateTotalProduitsExceptionnels = () => {
    const fixedTotal = (fixedLines.produits_exceptionnels || []).reduce((sum, line) => sum + parseValue(line.value), 0)
    const addedTotal = (addedLines.produits_exceptionnels || []).reduce((sum, line) => sum + parseValue(line.value), 0)
    return fixedTotal + addedTotal
  }

  const calculateTotalChargesExceptionnelles = () => {
    const fixedTotal = (fixedLines.charges_exceptionnelles || []).reduce((sum, line) => sum + parseValue(line.value), 0)
    const addedTotal = (addedLines.charges_exceptionnelles || []).reduce((sum, line) => sum + parseValue(line.value), 0)
    return fixedTotal + addedTotal
  }

  const calculateResultatFinancier = () => {
    return calculateTotalProduitsFinanciers() - calculateTotalChargesFinancieres()
  }

  // Calculer le résultat d'exploitation depuis la première page
  const calculateResultatExploitation = () => {
    if (!firstPageData) return 0
    const produits = (firstPageData.fixedLines?.produits || []).reduce((sum, line) => sum + parseValue(line.value), 0) +
                     (firstPageData.addedLines?.produits || []).reduce((sum, line) => sum + parseValue(line.value), 0)
    const charges = (firstPageData.fixedLines?.charges || []).reduce((sum, line) => sum + parseValue(line.value), 0) +
                    (firstPageData.addedLines?.charges || []).reduce((sum, line) => sum + parseValue(line.value), 0)
    return produits - charges
  }

  const calculateResultatCourant = () => {
    return calculateResultatExploitation() + calculateResultatFinancier()
  }

  const calculateResultatExceptionnel = () => {
    return calculateTotalProduitsExceptionnels() - calculateTotalChargesExceptionnelles()
  }

  const calculateParticipationSalaries = () => {
    return parseValue(fixedLines.autres?.find(l => l.id === 'participation_salaries')?.value || '')
  }

  const calculateImpots = () => {
    return parseValue(fixedLines.autres?.find(l => l.id === 'impots_benefices')?.value || '')
  }

  const calculateTotalProduits = () => {
    if (!firstPageData) return 0
    const produitsExploitation = (firstPageData.fixedLines?.produits || []).reduce((sum, line) => sum + parseValue(line.value), 0) +
                                 (firstPageData.addedLines?.produits || []).reduce((sum, line) => sum + parseValue(line.value), 0)
    return produitsExploitation + calculateTotalProduitsFinanciers() + calculateTotalProduitsExceptionnels()
  }

  const calculateTotalCharges = () => {
    if (!firstPageData) return 0
    const chargesExploitation = (firstPageData.fixedLines?.charges || []).reduce((sum, line) => sum + parseValue(line.value), 0) +
                                (firstPageData.addedLines?.charges || []).reduce((sum, line) => sum + parseValue(line.value), 0)
    return chargesExploitation + calculateTotalChargesFinancieres() + calculateTotalChargesExceptionnelles() + 
           calculateParticipationSalaries() + calculateImpots()
  }

  const calculateExcedent = () => {
    return calculateTotalProduits() - calculateTotalCharges()
  }

  const totalProduitsFinanciers = calculateTotalProduitsFinanciers()
  const totalChargesFinancieres = calculateTotalChargesFinancieres()
  const resultatFinancier = calculateResultatFinancier()
  const resultatCourant = calculateResultatCourant()
  const totalProduitsExceptionnels = calculateTotalProduitsExceptionnels()
  const totalChargesExceptionnelles = calculateTotalChargesExceptionnelles()
  const resultatExceptionnel = calculateResultatExceptionnel()
  const totalProduits = calculateTotalProduits()
  const totalCharges = calculateTotalCharges()
  const excedent = calculateExcedent()

  const handleSaveOnly = () => {
    const dataToSave = {
      fixedLines,
      addedLines,
      dates,
      savedAt: new Date().toISOString(),
      page: 'page-suivante'
    }
    localStorage.setItem('pageSuivante_data', JSON.stringify(dataToSave))
    alert('Données enregistrées avec succès !')
  }

  const handleSave = async () => {
    try {
      console.log('PageSuivante: Début de la sauvegarde et génération du PDF...')
      
      // Sauvegarder les données de la deuxième page
      const dataToSave = {
        fixedLines,
        addedLines,
        dates,
        savedAt: new Date().toISOString(),
        page: 'page-suivante'
      }
      localStorage.setItem('pageSuivante_data', JSON.stringify(dataToSave))
      console.log('PageSuivante: Données sauvegardées dans localStorage')
      
      // Charger les données de la première page
      const firstPageData = localStorage.getItem('compteResultat_data')
      if (!firstPageData) {
        alert('Veuillez d\'abord enregistrer les données de la première page !')
        return
      }
      
      const firstPage = JSON.parse(firstPageData)
      
      // Générer le PDF complet
      await generateCompletePDFFromPageSuivante(firstPage)
      
      alert('Données enregistrées et PDF généré avec succès !')
    } catch (error) {
      console.error('Erreur lors de la génération du PDF:', error)
      alert('Erreur lors de la génération du PDF. Vérifiez la console pour plus de détails. Erreur: ' + error.message)
    }
  }
  
  // Fonction pour générer le PDF complet depuis PageSuivante
  const generateCompletePDFFromPageSuivante = async (firstPageData) => {
    const { jsPDF } = await import('jspdf')
    const doc = new jsPDF('p', 'mm', 'a4')
    
    const pageWidth = doc.internal.pageSize.getWidth()
    const pageHeight = doc.internal.pageSize.getHeight()
    
    // Première page - Logo et titre
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
    doc.text(dates.date || firstPageData.dates?.date || '31/12/2024', pageWidth / 2, centerY + 38, { align: 'center' })
    
    // Fonctions helper
    const parseValue = (value) => {
      if (!value || value.trim() === '') return 0
      const num = parseFloat(value.replace(/\s/g, '').replace('€', '').trim())
      return isNaN(num) ? 0 : num
    }
    
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
      return formatted
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
      return formatted
    }
    
    // Page 2 - Tableau première page
    doc.addPage()
    const marginLeft = 20
    const marginRight = 20
    const dateColX = pageWidth - marginRight
    const lineHeight = 6
    
    doc.setFontSize(10)
    doc.setFont('helvetica', 'normal')
    doc.text('ASSOCIATION AAPISE | Comptes annuels', marginLeft, 15)
    doc.text(dates.date || firstPageData.dates?.date || '31/12/2024', pageWidth - marginLeft, 15, { align: 'right' })
    
    doc.setFontSize(14)
    doc.setFont('helvetica', 'bold')
    doc.text('Produits d\'exploitation', marginLeft, 25)
    
    let yPosition = 35
    doc.setFontSize(10)
    doc.setFont('helvetica', 'bold')
    doc.text('Libellé', marginLeft, yPosition)
    doc.text(dates.date || firstPageData.dates?.date || '31/12/2024', dateColX, yPosition, { align: 'right' })
    yPosition += lineHeight
    
    doc.setLineWidth(0.5)
    doc.setDrawColor(0, 0, 0)
    doc.line(marginLeft, yPosition, pageWidth - marginLeft, yPosition)
    yPosition += lineHeight + 2
    
    // Produits d'exploitation
    doc.setFontSize(9)
    doc.setFont('helvetica', 'normal')
    const produits = firstPageData.fixedLines?.produits || []
    const produitsAdded = firstPageData.addedLines?.produits || []
    
    produits.forEach(line => {
      if (yPosition > pageHeight - 30) {
        doc.addPage()
        doc.setFontSize(10)
        doc.setFont('helvetica', 'normal')
        doc.text('ASSOCIATION AAPISE | Comptes annuels', marginLeft, 15)
        doc.text(dates.date || firstPageData.dates?.date || '31/12/2024', pageWidth - marginLeft, 15, { align: 'right' })
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
      // Ligne de séparation après chaque ligne
      doc.setLineWidth(0.2)
      doc.setDrawColor(220, 220, 220)
      doc.line(marginLeft, yPosition + 2, pageWidth - marginRight, yPosition + 2)
      yPosition += lineHeight
    })
    
    produitsAdded.forEach(line => {
      if (yPosition > pageHeight - 30) {
        doc.addPage()
        doc.setFontSize(10)
        doc.setFont('helvetica', 'normal')
        doc.text('ASSOCIATION AAPISE | Comptes annuels', marginLeft, 15)
        doc.text(dates.date || firstPageData.dates?.date || '31/12/2024', pageWidth - marginLeft, 15, { align: 'right' })
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
      // Ligne de séparation après chaque ligne
      doc.setLineWidth(0.2)
      doc.setDrawColor(220, 220, 220)
      doc.line(marginLeft, yPosition + 2, pageWidth - marginRight, yPosition + 2)
      yPosition += lineHeight
    })
    
    // TOTAL I
    const totalProduits = produits.reduce((sum, line) => sum + parseValue(line.value), 0) +
                          produitsAdded.reduce((sum, line) => sum + parseValue(line.value), 0)
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
    const charges = firstPageData.fixedLines?.charges || []
    const chargesAdded = firstPageData.addedLines?.charges || []
    
    charges.forEach(line => {
      if (yPosition > pageHeight - 30) {
        doc.addPage()
        doc.setFontSize(10)
        doc.setFont('helvetica', 'normal')
        doc.text('ASSOCIATION AAPISE | Comptes annuels', marginLeft, 15)
        doc.text(dates.date || firstPageData.dates?.date || '31/12/2024', pageWidth - marginLeft, 15, { align: 'right' })
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
      // Ligne de séparation après chaque ligne
      doc.setLineWidth(0.2)
      doc.setDrawColor(220, 220, 220)
      doc.line(marginLeft, yPosition + 2, pageWidth - marginRight, yPosition + 2)
      yPosition += lineHeight
    })
    
    chargesAdded.forEach(line => {
      if (yPosition > pageHeight - 30) {
        doc.addPage()
        doc.setFontSize(10)
        doc.setFont('helvetica', 'normal')
        doc.text('ASSOCIATION AAPISE | Comptes annuels', marginLeft, 15)
        doc.text(dates.date || firstPageData.dates?.date || '31/12/2024', pageWidth - marginLeft, 15, { align: 'right' })
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
      // Ligne de séparation après chaque ligne
      doc.setLineWidth(0.2)
      doc.setDrawColor(220, 220, 220)
      doc.line(marginLeft, yPosition + 2, pageWidth - marginRight, yPosition + 2)
      yPosition += lineHeight
    })
    
    // TOTAL II
    const totalCharges = charges.reduce((sum, line) => sum + parseValue(line.value), 0) +
                         chargesAdded.reduce((sum, line) => sum + parseValue(line.value), 0)
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
    const result = totalProduits - totalCharges
    const resultRowY = yPosition - 2
    doc.setFillColor(232, 232, 232)
    doc.rect(marginLeft, resultRowY - 3, pageWidth - marginLeft - marginRight, lineHeight + 4, 'F')
    doc.text('RÉSULTAT D\'EXPLOITATION (I-II)', marginLeft, yPosition)
    if (result < 0) {
      doc.setTextColor(211, 47, 47)
    } else if (result > 0) {
      doc.setTextColor(40, 167, 69)
    } else {
      doc.setTextColor(0, 0, 0)
    }
    doc.setFont('helvetica', 'bold')
    doc.text(formatValueWithZeroForPDF(result.toString()), dateColX, yPosition, { align: 'right' })
    doc.setTextColor(0, 0, 0)
    doc.setFont('helvetica', 'normal')
    
    // Page 3 - Tableau deuxième page (utiliser la même logique que CompteResultat)
    doc.addPage()
    
    // Réduire les tailles pour que tout tienne sur une page
    const lineHeightSmall = 4.5 // Réduit de 6 à 4.5
    const marginTopSmall = 12 // Réduit de 15 à 12
    
    doc.setFontSize(9)
    doc.setFont('helvetica', 'normal')
    doc.text('ASSOCIATION AAPISE | Comptes annuels', marginLeft, marginTopSmall)
    doc.text(dates.date || firstPageData.dates?.date || '31/12/2024', pageWidth - marginLeft, marginTopSmall, { align: 'right' })
    
    yPosition = 20 // Réduit de 25 à 20
    
    // En-tête des colonnes
    doc.setFontSize(9) // Réduit de 10 à 9
    doc.setFont('helvetica', 'bold')
    doc.text('Libellé', marginLeft, yPosition)
    doc.text(dates.date || firstPageData.dates?.date || '31/12/2024', dateColX, yPosition, { align: 'right' })
    yPosition += lineHeightSmall
    
    // Ligne de séparation
    doc.setLineWidth(0.5)
    doc.setDrawColor(0, 0, 0)
    doc.line(marginLeft, yPosition, pageWidth - marginLeft, yPosition)
    yPosition += lineHeightSmall + 1 // Réduit l'espacement
    
    // Calculer les totaux de la deuxième page
    const totalProduitsFinanciers = (fixedLines.produits_financiers || []).reduce((sum, line) => sum + parseValue(line.value), 0) +
                                    (addedLines.produits_financiers || []).reduce((sum, line) => sum + parseValue(line.value), 0)
    
    const totalChargesFinancieres = (fixedLines.charges_financieres || []).reduce((sum, line) => sum + parseValue(line.value), 0) +
                                    (addedLines.charges_financieres || []).reduce((sum, line) => sum + parseValue(line.value), 0)
    
    const resultatFinancier = totalProduitsFinanciers - totalChargesFinancieres
    const resultatCourant = result + resultatFinancier
    
    const totalProduitsExceptionnels = (fixedLines.produits_exceptionnels || []).reduce((sum, line) => sum + parseValue(line.value), 0) +
                                      (addedLines.produits_exceptionnels || []).reduce((sum, line) => sum + parseValue(line.value), 0)
    
    const totalChargesExceptionnelles = (fixedLines.charges_exceptionnelles || []).reduce((sum, line) => sum + parseValue(line.value), 0) +
                                       (addedLines.charges_exceptionnelles || []).reduce((sum, line) => sum + parseValue(line.value), 0)
    
    const resultatExceptionnel = totalProduitsExceptionnels - totalChargesExceptionnelles
    
    const participationSalaries = parseValue(fixedLines.autres?.find(l => l.id === 'participation_salaries')?.value || '')
    const impots = parseValue(fixedLines.autres?.find(l => l.id === 'impots_benefices')?.value || '')
    
    const totalProduitsFinal = totalProduits + totalProduitsFinanciers + totalProduitsExceptionnels
    const totalChargesFinal = totalCharges + totalChargesFinancieres + totalChargesExceptionnelles + participationSalaries + impots
    const excedent = totalProduitsFinal - totalChargesFinal
    
    // PRODUITS FINANCIERS
    doc.setFontSize(11) // Réduit de 14 à 11
    doc.setFont('helvetica', 'bold')
    doc.text('Produits financiers', marginLeft, yPosition)
    yPosition += lineHeightSmall + 2 // Réduit l'espacement
    
    doc.setFontSize(8) // Réduit de 9 à 8
    doc.setFont('helvetica', 'normal')
    ;(fixedLines.produits_financiers || []).forEach(line => {
      let label = line.label
      const maxWidth = dateColX - marginLeft - 90
      if (doc.getTextWidth(label) > maxWidth) {
        label = doc.splitTextToSize(label, maxWidth)[0] + '...'
      }
      doc.text(label, marginLeft, yPosition)
      if (line.value && line.value.trim() !== '') {
        doc.text(formatValueForPDF(line.value), dateColX, yPosition, { align: 'right' })
      }
      // Ligne de séparation après chaque ligne
      doc.setLineWidth(0.2)
      doc.setDrawColor(220, 220, 220)
      doc.line(marginLeft, yPosition + 1.5, pageWidth - marginRight, yPosition + 1.5)
      yPosition += lineHeightSmall // Utilise la hauteur réduite
    })
    
    ;(addedLines.produits_financiers || []).forEach(line => {
      let label = line.label
      const maxWidth = dateColX - marginLeft - 90
      if (doc.getTextWidth(label) > maxWidth) {
        label = doc.splitTextToSize(label, maxWidth)[0] + '...'
      }
      doc.text(label, marginLeft, yPosition)
      if (line.value && line.value.trim() !== '') {
        doc.text(formatValueForPDF(line.value), dateColX, yPosition, { align: 'right' })
      }
      // Ligne de séparation après chaque ligne
      doc.setLineWidth(0.2)
      doc.setDrawColor(220, 220, 220)
      doc.line(marginLeft, yPosition + 1.5, pageWidth - marginRight, yPosition + 1.5)
      yPosition += lineHeightSmall // Utilise la hauteur réduite
    })
    
    // TOTAL III
    yPosition += 2 // Réduit l'espacement
    const totalRowY3 = yPosition - 2
    doc.setFillColor(240, 240, 240)
    doc.rect(marginLeft, totalRowY3 - 2, pageWidth - marginLeft - marginRight, lineHeightSmall + 2, 'F')
    doc.setFont('helvetica', 'bold')
    doc.setTextColor(0, 0, 0)
    doc.text('TOTAL III', marginLeft, yPosition)
    doc.text(formatValueWithZeroForPDF(totalProduitsFinanciers.toString()), dateColX, yPosition, { align: 'right' })
    yPosition += lineHeightSmall + 3 // Réduit l'espacement
    
    // CHARGES FINANCIÈRES
    yPosition += 2 // Réduit l'espacement
    doc.setFontSize(11) // Réduit de 14 à 11
    doc.setFont('helvetica', 'bold')
    doc.text('Charges financières', marginLeft, yPosition)
    yPosition += lineHeightSmall + 2 // Réduit l'espacement
    
    doc.setFontSize(8) // Réduit de 9 à 8
    doc.setFont('helvetica', 'normal')
    ;(fixedLines.charges_financieres || []).forEach(line => {
      let label = line.label
      const maxWidth = dateColX - marginLeft - 90
      if (doc.getTextWidth(label) > maxWidth) {
        label = doc.splitTextToSize(label, maxWidth)[0] + '...'
      }
      doc.text(label, marginLeft, yPosition)
      if (line.value && line.value.trim() !== '') {
        doc.text(formatValueForPDF(line.value), dateColX, yPosition, { align: 'right' })
      }
      // Ligne de séparation après chaque ligne
      doc.setLineWidth(0.2)
      doc.setDrawColor(220, 220, 220)
      doc.line(marginLeft, yPosition + 1.5, pageWidth - marginRight, yPosition + 1.5)
      yPosition += lineHeightSmall // Utilise la hauteur réduite
    })
    
    ;(addedLines.charges_financieres || []).forEach(line => {
      let label = line.label
      const maxWidth = dateColX - marginLeft - 90
      if (doc.getTextWidth(label) > maxWidth) {
        label = doc.splitTextToSize(label, maxWidth)[0] + '...'
      }
      doc.text(label, marginLeft, yPosition)
      if (line.value && line.value.trim() !== '') {
        doc.text(formatValueForPDF(line.value), dateColX, yPosition, { align: 'right' })
      }
      // Ligne de séparation après chaque ligne
      doc.setLineWidth(0.2)
      doc.setDrawColor(220, 220, 220)
      doc.line(marginLeft, yPosition + 1.5, pageWidth - marginRight, yPosition + 1.5)
      yPosition += lineHeightSmall // Utilise la hauteur réduite
    })
    
    ;(addedLines.charges_financieres || []).forEach(line => {
      let label = line.label
      const maxWidth = dateColX - marginLeft - 90
      if (doc.getTextWidth(label) > maxWidth) {
        label = doc.splitTextToSize(label, maxWidth)[0] + '...'
      }
      doc.text(label, marginLeft, yPosition)
      if (line.value && line.value.trim() !== '') {
        doc.text(formatValueForPDF(line.value), dateColX, yPosition, { align: 'right' })
      }
      // Ligne de séparation après chaque ligne
      doc.setLineWidth(0.2)
      doc.setDrawColor(220, 220, 220)
      doc.line(marginLeft, yPosition + 1.5, pageWidth - marginRight, yPosition + 1.5)
      yPosition += lineHeightSmall // Utilise la hauteur réduite
    })
    
    // TOTAL IV
    yPosition += 2 // Réduit l'espacement
    const totalRowY4 = yPosition - 2
    doc.setFillColor(240, 240, 240)
    doc.rect(marginLeft, totalRowY4 - 2, pageWidth - marginLeft - marginRight, lineHeightSmall + 2, 'F')
    doc.setFont('helvetica', 'bold')
    doc.setTextColor(0, 0, 0)
    doc.text('TOTAL IV', marginLeft, yPosition)
    doc.text(formatValueWithZeroForPDF(totalChargesFinancieres.toString()), dateColX, yPosition, { align: 'right' })
    yPosition += lineHeightSmall + 3 // Réduit l'espacement
    
    // RÉSULTAT FINANCIER
    const resultRowYF = yPosition - 2
    doc.setFillColor(232, 232, 232)
    doc.rect(marginLeft, resultRowYF - 2, pageWidth - marginLeft - marginRight, lineHeightSmall + 2, 'F')
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
    yPosition += lineHeightSmall + 3 // Réduit l'espacement
    
    // RÉSULTAT COURANT
    const resultRowYC = yPosition - 2
    doc.setFillColor(232, 232, 232)
    doc.rect(marginLeft, resultRowYC - 2, pageWidth - marginLeft - marginRight, lineHeightSmall + 2, 'F')
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
    yPosition += lineHeightSmall + 3 // Réduit l'espacement
    
    // PRODUITS EXCEPTIONNELS
    yPosition += 2 // Réduit l'espacement
    doc.setFontSize(11) // Réduit de 14 à 11
    doc.setFont('helvetica', 'bold')
    doc.text('Produits exceptionnels', marginLeft, yPosition)
    yPosition += lineHeightSmall + 2 // Réduit l'espacement
    
    doc.setFontSize(8) // Réduit de 9 à 8
    doc.setFont('helvetica', 'normal')
    ;(fixedLines.produits_exceptionnels || []).forEach(line => {
      let label = line.label
      const maxWidth = dateColX - marginLeft - 90
      if (doc.getTextWidth(label) > maxWidth) {
        label = doc.splitTextToSize(label, maxWidth)[0] + '...'
      }
      doc.text(label, marginLeft, yPosition)
      if (line.value && line.value.trim() !== '') {
        doc.text(formatValueForPDF(line.value), dateColX, yPosition, { align: 'right' })
      }
      // Ligne de séparation après chaque ligne
      doc.setLineWidth(0.2)
      doc.setDrawColor(220, 220, 220)
      doc.line(marginLeft, yPosition + 1.5, pageWidth - marginRight, yPosition + 1.5)
      yPosition += lineHeightSmall // Utilise la hauteur réduite
    })
    
    ;(addedLines.produits_exceptionnels || []).forEach(line => {
      let label = line.label
      const maxWidth = dateColX - marginLeft - 90
      if (doc.getTextWidth(label) > maxWidth) {
        label = doc.splitTextToSize(label, maxWidth)[0] + '...'
      }
      doc.text(label, marginLeft, yPosition)
      if (line.value && line.value.trim() !== '') {
        doc.text(formatValueForPDF(line.value), dateColX, yPosition, { align: 'right' })
      }
      // Ligne de séparation après chaque ligne
      doc.setLineWidth(0.2)
      doc.setDrawColor(220, 220, 220)
      doc.line(marginLeft, yPosition + 1.5, pageWidth - marginRight, yPosition + 1.5)
      yPosition += lineHeightSmall // Utilise la hauteur réduite
    })
    
    // TOTAL V
    yPosition += 2 // Réduit l'espacement
    const totalRowY5 = yPosition - 2
    doc.setFillColor(240, 240, 240)
    doc.rect(marginLeft, totalRowY5 - 2, pageWidth - marginLeft - marginRight, lineHeightSmall + 2, 'F')
    doc.setFont('helvetica', 'bold')
    doc.setTextColor(0, 0, 0)
    doc.text('TOTAL V', marginLeft, yPosition)
    doc.text(formatValueWithZeroForPDF(totalProduitsExceptionnels.toString()), dateColX, yPosition, { align: 'right' })
    yPosition += lineHeightSmall + 3 // Réduit l'espacement
    
    // CHARGES EXCEPTIONNELLES
    yPosition += 2 // Réduit l'espacement
    doc.setFontSize(11) // Réduit de 14 à 11
    doc.setFont('helvetica', 'bold')
    doc.text('Charges exceptionnelles', marginLeft, yPosition)
    yPosition += lineHeightSmall + 2 // Réduit l'espacement
    
    doc.setFontSize(8) // Réduit de 9 à 8
    doc.setFont('helvetica', 'normal')
    ;(fixedLines.charges_exceptionnelles || []).forEach(line => {
      let label = line.label
      const maxWidth = dateColX - marginLeft - 90
      if (doc.getTextWidth(label) > maxWidth) {
        label = doc.splitTextToSize(label, maxWidth)[0] + '...'
      }
      doc.text(label, marginLeft, yPosition)
      if (line.value && line.value.trim() !== '') {
        doc.text(formatValueForPDF(line.value), dateColX, yPosition, { align: 'right' })
      }
      // Ligne de séparation après chaque ligne
      doc.setLineWidth(0.2)
      doc.setDrawColor(220, 220, 220)
      doc.line(marginLeft, yPosition + 1.5, pageWidth - marginRight, yPosition + 1.5)
      yPosition += lineHeightSmall // Utilise la hauteur réduite
    })
    
    ;(addedLines.charges_exceptionnelles || []).forEach(line => {
      let label = line.label
      const maxWidth = dateColX - marginLeft - 90
      if (doc.getTextWidth(label) > maxWidth) {
        label = doc.splitTextToSize(label, maxWidth)[0] + '...'
      }
      doc.text(label, marginLeft, yPosition)
      if (line.value && line.value.trim() !== '') {
        doc.text(formatValueForPDF(line.value), dateColX, yPosition, { align: 'right' })
      }
      // Ligne de séparation après chaque ligne
      doc.setLineWidth(0.2)
      doc.setDrawColor(220, 220, 220)
      doc.line(marginLeft, yPosition + 1.5, pageWidth - marginRight, yPosition + 1.5)
      yPosition += lineHeightSmall // Utilise la hauteur réduite
    })
    
    // TOTAL VI
    yPosition += 2 // Réduit l'espacement
    const totalRowY6 = yPosition - 2
    doc.setFillColor(240, 240, 240)
    doc.rect(marginLeft, totalRowY6 - 2, pageWidth - marginLeft - marginRight, lineHeightSmall + 2, 'F')
    doc.setFont('helvetica', 'bold')
    doc.setTextColor(0, 0, 0)
    doc.text('TOTAL VI', marginLeft, yPosition)
    doc.text(formatValueWithZeroForPDF(totalChargesExceptionnelles.toString()), dateColX, yPosition, { align: 'right' })
    yPosition += lineHeightSmall + 3 // Réduit l'espacement
    
    // RÉSULTAT EXCEPTIONNEL
    const resultRowYE = yPosition - 2
    doc.setFillColor(232, 232, 232)
    doc.rect(marginLeft, resultRowYE - 2, pageWidth - marginLeft - marginRight, lineHeightSmall + 2, 'F')
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
    yPosition += lineHeightSmall + 3 // Réduit l'espacement
    
    // PARTICIPATION DES SALARIÉS (VII)
    const participationLine = fixedLines.autres?.find(l => l.id === 'participation_salaries')
    if (participationLine) {
      yPosition += 2 // Réduit l'espacement
      doc.setFontSize(8) // Réduit de 9 à 8
      doc.setFont('helvetica', 'normal')
      doc.text(participationLine.label, marginLeft, yPosition)
      if (participationLine.value && participationLine.value.trim() !== '') {
        doc.text(formatValueForPDF(participationLine.value), dateColX, yPosition, { align: 'right' })
      }
      yPosition += lineHeightSmall + 2 // Réduit l'espacement
      doc.setFont('helvetica', 'bold')
      doc.text('VII', marginLeft, yPosition)
      yPosition += lineHeightSmall + 3 // Réduit l'espacement
    }
    
    // IMPÔTS SUR LES BÉNÉFICES (VIII)
    const impotsLine = fixedLines.autres?.find(l => l.id === 'impots_benefices')
    if (impotsLine) {
      yPosition += 2 // Réduit l'espacement
      doc.setFontSize(8) // Réduit de 9 à 8
      doc.setFont('helvetica', 'normal')
      doc.text(impotsLine.label, marginLeft, yPosition)
      if (impotsLine.value && impotsLine.value.trim() !== '') {
        doc.text(formatValueForPDF(impotsLine.value), dateColX, yPosition, { align: 'right' })
      }
      yPosition += lineHeightSmall + 2 // Réduit l'espacement
      doc.setFont('helvetica', 'bold')
      doc.text('VIII', marginLeft, yPosition)
      yPosition += lineHeightSmall + 3 // Réduit l'espacement
    }
    
    // TOTAL DES PRODUITS
    yPosition += 2 // Réduit l'espacement
    const totalRowYP = yPosition - 2
    doc.setFillColor(240, 240, 240)
    doc.rect(marginLeft, totalRowYP - 2, pageWidth - marginLeft - marginRight, lineHeightSmall + 2, 'F')
    doc.setFont('helvetica', 'bold')
    doc.setTextColor(0, 0, 0)
    doc.text('TOTAL DES PRODUITS (I + III + V)', marginLeft, yPosition)
    doc.text(formatValueWithZeroForPDF(totalProduitsFinal.toString()), dateColX, yPosition, { align: 'right' })
    yPosition += lineHeightSmall + 3 // Réduit l'espacement
    
    // TOTAL DES CHARGES (sans VII et VIII pour l'instant)
    yPosition += 2 // Réduit l'espacement
    const totalRowYC2 = yPosition - 2
    doc.setFillColor(240, 240, 240)
    doc.rect(marginLeft, totalRowYC2 - 2, pageWidth - marginLeft - marginRight, lineHeightSmall + 2, 'F')
    doc.setFont('helvetica', 'bold')
    doc.setTextColor(0, 0, 0)
    doc.text('TOTAL DES CHARGES (II + IV + VI + VII + VIII)', marginLeft, yPosition)
    doc.text(formatValueWithZeroForPDF(totalChargesFinal.toString()), dateColX, yPosition, { align: 'right' })
    yPosition += lineHeightSmall + 3 // Réduit l'espacement
    
    // EXCÉDENT OU DÉFICIT
    const resultRowYEx = yPosition - 2
    doc.setFillColor(232, 232, 232)
    doc.rect(marginLeft, resultRowYEx - 2, pageWidth - marginLeft - marginRight, lineHeightSmall + 2, 'F')
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
    yPosition += lineHeightSmall + 2 // Réduit l'espacement
    
    // DONT EXCÉDENT OU DÉFICIT
    doc.setFontSize(8) // Réduit de 9 à 8
    doc.text('- dont excédent ou déficit des activités sociales et médico-sociales sous gestion contrôlée', marginLeft, yPosition)
    
    // Sauvegarder le PDF
    const fileName = `Compte_Resultat_${dates.date.replace(/\//g, '-')}.pdf`
    console.log('PageSuivante: Sauvegarde du PDF:', fileName)
    doc.save(fileName)
    console.log('PageSuivante: PDF sauvegardé avec succès')
  }

  // Fonction pour supprimer toutes les valeurs
  const handleClear = () => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer toutes les valeurs ? Cette action est irréversible.')) {
      // Réinitialiser toutes les valeurs des lignes fixes
      setFixedLines(prev => ({
        ...prev,
        produits_financiers: (prev.produits_financiers || []).map(line => ({ ...line, value: '' })),
        charges_financieres: (prev.charges_financieres || []).map(line => ({ ...line, value: '' })),
        produits_exceptionnels: (prev.produits_exceptionnels || []).map(line => ({ ...line, value: '' })),
        charges_exceptionnelles: (prev.charges_exceptionnelles || []).map(line => ({ ...line, value: '' })),
        autres: (prev.autres || []).map(line => ({ ...line, value: '' }))
      }))
      // Supprimer toutes les lignes ajoutées dynamiquement
      setAddedLines({
        produits_financiers: [],
        charges_financieres: [],
        produits_exceptionnels: [],
        charges_exceptionnelles: []
      })
      alert('Toutes les valeurs ont été supprimées !')
    }
  }

  return (
    <div className="compte-resultat">
      <div className="header">
        <h1 className="title">Compte de résultat (Suite)</h1>
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
                  placeholder="Ex: Autres intérêts"
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
                  placeholder="Ex: 475"
                />
              </div>

              <div className="form-group">
                <label>Type *</label>
                <div className="type-buttons">
                  <button
                    type="button"
                    className={`type-button ${formData.type === 'produits' ? 'active' : ''}`}
                    onClick={() => setFormData(prev => ({ ...prev, type: 'produits' }))}
                  >
                    Produits
                  </button>
                  <button
                    type="button"
                    className={`type-button ${formData.type === 'charges' ? 'active' : ''}`}
                    onClick={() => setFormData(prev => ({ ...prev, type: 'charges' }))}
                  >
                    Charges
                  </button>
                </div>
              </div>

              <div className="form-group">
                <label>Catégorie *</label>
                <div className="category-buttons">
                  <button
                    type="button"
                    className={`category-button ${formData.section.includes('financiers') || formData.section.includes('financieres') ? 'active' : ''}`}
                    onClick={() => {
                      const newSection = formData.type === 'produits' ? 'produits_financiers' : 'charges_financieres'
                      setFormData(prev => ({ ...prev, section: newSection }))
                    }}
                  >
                    Financiers
                  </button>
                  <button
                    type="button"
                    className={`category-button ${formData.section.includes('exceptionnels') || formData.section.includes('exceptionnelles') ? 'active' : ''}`}
                    onClick={() => {
                      const newSection = formData.type === 'produits' ? 'produits_exceptionnels' : 'charges_exceptionnelles'
                      setFormData(prev => ({ ...prev, section: newSection }))
                    }}
                  >
                    Exceptionnels
                  </button>
                </div>
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
          {/* PRODUITS FINANCIERS */}
          <tr className="section-header">
            <td colSpan="2"><strong>Produits financiers</strong></td>
          </tr>
          
          {fixedLines.produits_financiers?.map((line) => (
            <tr key={line.id} className="editable-row">
              <td 
                className="label editable-label"
                onDoubleClick={() => handleEditClick(line.id, 'produits_financiers', true)}
                title="Double-cliquez pour modifier la valeur"
              >
                {line.label}
              </td>
              <td 
                className="value editable-value"
                onDoubleClick={() => handleEditClick(line.id, 'produits_financiers', true)}
                title="Double-cliquez pour modifier la valeur"
              >
                {formatValue(line.value)}
              </td>
            </tr>
          ))}
          
          {addedLines.produits_financiers?.map((line) => (
            <tr key={line.id} className="editable-row">
              <td 
                className="label editable-label"
                onDoubleClick={() => handleEditClick(line.id, 'produits_financiers', false)}
                title="Double-cliquez pour modifier"
              >
                {line.label}
              </td>
              <td className="value">{formatValue(line.value)}</td>
            </tr>
          ))}
          
          <tr className="total-row">
            <td className="label"><strong>TOTAL III</strong></td>
            <td className="value"><strong>{formatValueWithZero(totalProduitsFinanciers.toString())}</strong></td>
          </tr>

          {/* CHARGES FINANCIÈRES */}
          <tr className="section-header">
            <td colSpan="2"><strong>Charges financières</strong></td>
          </tr>
          
          {fixedLines.charges_financieres?.map((line) => (
            <tr key={line.id} className="editable-row">
              <td 
                className="label editable-label"
                onDoubleClick={() => handleEditClick(line.id, 'charges_financieres', true)}
                title="Double-cliquez pour modifier la valeur"
              >
                {line.label}
              </td>
              <td 
                className="value editable-value"
                onDoubleClick={() => handleEditClick(line.id, 'charges_financieres', true)}
                title="Double-cliquez pour modifier la valeur"
              >
                {formatValue(line.value)}
              </td>
            </tr>
          ))}
          
          {addedLines.charges_financieres?.map((line) => (
            <tr key={line.id} className="editable-row">
              <td 
                className="label editable-label"
                onDoubleClick={() => handleEditClick(line.id, 'charges_financieres', false)}
                title="Double-cliquez pour modifier"
              >
                {line.label}
              </td>
              <td className="value">{formatValue(line.value)}</td>
            </tr>
          ))}
          
          <tr className="total-row">
            <td className="label"><strong>TOTAL IV</strong></td>
            <td className="value"><strong>{formatValueWithZero(totalChargesFinancieres.toString())}</strong></td>
          </tr>

          {/* RÉSULTAT FINANCIER */}
          <tr className="result-row">
            <td className="label"><strong>RÉSULTAT FINANCIER (III - IV)</strong></td>
            <td className={`value ${resultatFinancier < 0 ? 'negative' : resultatFinancier > 0 ? 'positive' : ''}`}>
              <strong>{formatValueWithZero(resultatFinancier.toString())}</strong>
            </td>
          </tr>

          {/* RÉSULTAT COURANT */}
          <tr className="result-row">
            <td className="label"><strong>RÉSULTAT COURANT AVANT IMPÔTS (I-II + III - IV)</strong></td>
            <td className={`value ${resultatCourant < 0 ? 'negative' : resultatCourant > 0 ? 'positive' : ''}`}>
              <strong>{formatValueWithZero(resultatCourant.toString())}</strong>
            </td>
          </tr>

          {/* PRODUITS EXCEPTIONNELS */}
          <tr className="section-header">
            <td colSpan="2"><strong>Produits exceptionnels</strong></td>
          </tr>
          
          {fixedLines.produits_exceptionnels?.map((line) => (
            <tr key={line.id} className="editable-row">
              <td 
                className="label editable-label"
                onDoubleClick={() => handleEditClick(line.id, 'produits_exceptionnels', true)}
                title="Double-cliquez pour modifier la valeur"
              >
                {line.label}
              </td>
              <td 
                className="value editable-value"
                onDoubleClick={() => handleEditClick(line.id, 'produits_exceptionnels', true)}
                title="Double-cliquez pour modifier la valeur"
              >
                {formatValue(line.value)}
              </td>
            </tr>
          ))}
          
          {addedLines.produits_exceptionnels?.map((line) => (
            <tr key={line.id} className="editable-row">
              <td 
                className="label editable-label"
                onDoubleClick={() => handleEditClick(line.id, 'produits_exceptionnels', false)}
                title="Double-cliquez pour modifier"
              >
                {line.label}
              </td>
              <td className="value">{formatValue(line.value)}</td>
            </tr>
          ))}
          
          <tr className="total-row">
            <td className="label"><strong>TOTAL V</strong></td>
            <td className="value"><strong>{formatValueWithZero(totalProduitsExceptionnels.toString())}</strong></td>
          </tr>

          {/* CHARGES EXCEPTIONNELLES */}
          <tr className="section-header">
            <td colSpan="2"><strong>Charges exceptionnelles</strong></td>
          </tr>
          
          {fixedLines.charges_exceptionnelles?.map((line) => (
            <tr key={line.id} className="editable-row">
              <td 
                className="label editable-label"
                onDoubleClick={() => handleEditClick(line.id, 'charges_exceptionnelles', true)}
                title="Double-cliquez pour modifier la valeur"
              >
                {line.label}
              </td>
              <td 
                className="value editable-value"
                onDoubleClick={() => handleEditClick(line.id, 'charges_exceptionnelles', true)}
                title="Double-cliquez pour modifier la valeur"
              >
                {formatValue(line.value)}
              </td>
            </tr>
          ))}
          
          {addedLines.charges_exceptionnelles?.map((line) => (
            <tr key={line.id} className="editable-row">
              <td 
                className="label editable-label"
                onDoubleClick={() => handleEditClick(line.id, 'charges_exceptionnelles', false)}
                title="Double-cliquez pour modifier"
              >
                {line.label}
              </td>
              <td className="value">{formatValue(line.value)}</td>
            </tr>
          ))}
          
          <tr className="total-row">
            <td className="label"><strong>TOTAL VI</strong></td>
            <td className="value"><strong>{formatValueWithZero(totalChargesExceptionnelles.toString())}</strong></td>
          </tr>

          {/* RÉSULTAT EXCEPTIONNEL */}
          <tr className="result-row">
            <td className="label"><strong>RÉSULTAT EXCEPTIONNEL (V - VI)</strong></td>
            <td className={`value ${resultatExceptionnel < 0 ? 'negative' : resultatExceptionnel > 0 ? 'positive' : ''}`}>
              <strong>{formatValueWithZero(resultatExceptionnel.toString())}</strong>
            </td>
          </tr>

          {/* PARTICIPATION DES SALARIÉS */}
          {fixedLines.autres?.filter(l => l.id === 'participation_salaries').map((line) => (
            <tr key={line.id} className="editable-row">
              <td 
                className="label editable-label"
                onDoubleClick={() => handleEditClick(line.id, 'autres', true)}
                title="Double-cliquez pour modifier la valeur"
              >
                {line.label}
              </td>
              <td 
                className="value editable-value"
                onDoubleClick={() => handleEditClick(line.id, 'autres', true)}
                title="Double-cliquez pour modifier la valeur"
              >
                {formatValue(line.value)}
              </td>
            </tr>
          ))}
          <tr>
            <td className="label"><strong>VII</strong></td>
            <td className="value"></td>
          </tr>

          {/* IMPÔTS SUR LES BÉNÉFICES */}
          {fixedLines.autres?.filter(l => l.id === 'impots_benefices').map((line) => (
            <tr key={line.id} className="editable-row">
              <td 
                className="label editable-label"
                onDoubleClick={() => handleEditClick(line.id, 'autres', true)}
                title="Double-cliquez pour modifier la valeur"
              >
                {line.label}
              </td>
              <td 
                className="value editable-value"
                onDoubleClick={() => handleEditClick(line.id, 'autres', true)}
                title="Double-cliquez pour modifier la valeur"
              >
                {formatValue(line.value)}
              </td>
            </tr>
          ))}
          <tr>
            <td className="label"><strong>VIII</strong></td>
            <td className="value"></td>
          </tr>

          {/* TOTAL DES PRODUITS */}
          <tr className="total-row">
            <td className="label"><strong>TOTAL DES PRODUITS (I + III + V)</strong></td>
            <td className="value"><strong>{formatValueWithZero(totalProduits.toString())}</strong></td>
          </tr>

          {/* TOTAL DES CHARGES */}
          <tr className="total-row">
            <td className="label"><strong>TOTAL DES CHARGES (II + IV + VI + VII + VIII)</strong></td>
            <td className="value"><strong>{formatValueWithZero(totalCharges.toString())}</strong></td>
          </tr>

          {/* EXCÉDENT OU DÉFICIT */}
          <tr className="result-row">
            <td className="label"><strong>EXCÉDENT OU DÉFICIT (Total des produits - Total des charges)</strong></td>
            <td className={`value ${excedent < 0 ? 'negative' : excedent > 0 ? 'positive' : ''}`}>
              <strong>{formatValueWithZero(excedent.toString())}</strong>
            </td>
          </tr>

          {/* DONT EXCÉDENT OU DÉFICIT */}
          <tr>
            <td className="label">- dont excédent ou déficit des activités sociales et médico-sociales sous gestion contrôlée</td>
            <td className="value"></td>
          </tr>
        </tbody>
      </table>

      {/* Boutons d'action en bas */}
      <div className="action-buttons-bottom">
        <button className="back-button" onClick={onBack}>
          ⬅️ Retour
        </button>
        <button className="clear-button" onClick={handleClear}>
          🗑️ Clear
        </button>
        <button className="save-button" onClick={handleSaveOnly}>
          💾 Enregistrer
        </button>
        <button className="save-pdf-button" onClick={handleSave}>
          📄 Enregistrer et PDF
        </button>
      </div>
    </div>
  )
}

export default PageSuivante
