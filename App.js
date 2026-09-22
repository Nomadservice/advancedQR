import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, TextInput, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { Camera, CameraView } from 'expo-camera';
import QRCode from 'react-native-qrcode-svg';

export default function App() {
  const [hasPermission, setHasPermission] = useState(null);
  const [scanned, setScanned] = useState(false);
  const [text, setText] = useState('');
  const [qrColor, setQrColor] = useState('#000000');
  const [logoOption, setLogoOption] = useState(null);
  const [history, setHistory] = useState([]);
  const [isPremium, setIsPremium] = useState(false);
  const [showPaywall, setShowPaywall] = useState(false);
  const [currentTab, setCurrentTab] = useState('generator');
  
  // Gestione Categorie e QR Dinamici (Pro)
  const [selectedCategory, setSelectedCategory] = useState('Generale');
  const [filterCategory, setFilterCategory] = useState('Tutti');
  const [isDynamic, setIsDynamic] = useState(false);

  useEffect(() => {
    (async () => {
      const { status } = await Camera.requestCameraPermissionsAsync();
      setHasPermission(status === 'granted');
    })();
  }, []);

  const handleBarCodeScanned = ({ data }) => {
    setScanned(true);
    let decodedData = data;
    
    // Logica QR Dinamico: se è un nostro codice simulato, reindirizza
    if (data.includes('qr-pro-dynamic/')) {
      decodedData = "👉 Link Reindirizzato a Distanza: https://tuositupro.com";
    }

    const newHistory = { 
      id: Date.now().toString(), 
      data: decodedData, 
      type: 'Scansionato', 
      category: 'Generale',
      date: new Date().toLocaleDateString() 
    };
    
    if (!isPremium && history.filter(h => h.type === 'Scansionato').length >= 5) {
      setShowPaywall(true);
      return;
    }
    
    setHistory([newHistory, ...history]);
    Alert.alert('QR Scansionato', decodedData, [{ text: 'OK', onPress: () => setScanned(false) }]);
  };

  const handleGenerate = () => {
    if (!text) return;
    
    let finalData = text;
    if (isDynamic) {
      finalData = `https://api.qr-pro-dynamic{Date.now()}`;
    }

    const newHistory = { 
      id: Date.now().toString(), 
      data: finalData, 
      type: isDynamic ? 'Dinamico' : 'Generato', 
      category: selectedCategory,
      date: new Date().toLocaleDateString() 
    };
    
    setHistory([newHistory, ...history]);
    Alert.alert('Successo', isDynamic ? 'QR Dinamico Creato! Potrai cambiare il link dal pannello Pro.' : 'QR Codice generato e salvato.');
  };

  const handlePremiumFeature = (action) => {
    if (!isPremium) {
      setShowPaywall(true);
    } else {
      action();
    }
  };

  const filteredHistory = filterCategory === 'Tutti' 
    ? history 
    : history.filter(h => h.category === filterCategory);

  if (showPaywall) {
    return (
      <View style={styles.paywallContainer}>
        <Text style={styles.paywallTitle}>⚡ Passa a QR Pro ⚡</Text>
        <Text style={styles.paywallSubtitle}>Sblocca tutte le funzionalità avanzate e rimuovi ogni limite</Text>
        <View style={styles.featuresList}>
          <Text style={styles.featureItem}>🎨 Cambia colori e aggiungi Loghi ai tuoi QR</Text>
          <Text style={styles.featureItem}>🔗 Crea QR Dinamici modificabili a distanza</Text>
          <Text style={styles.featureItem}>📁 Archivio e Cronologia illimitata con Categorie</Text>
          <Text style={styles.featureItem}>💾 Esportazione in Alta Risoluzione (PNG/SVG)</Text>
        </View>
        <TouchableOpacity style={styles.premiumButton} onPress={() => { setIsPremium(true); setShowPaywall(false); }}>
          <Text style={styles.buttonTextPro}>Abbonamento Mensile - 1,99 € / mese</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.premiumButton} onPress={() => { setIsPremium(true); setShowPaywall(false); }}>
          <Text style={styles.buttonTextPro}>Abbonamento Annuale - 14,99 € / anno</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.premiumButton} onPress={() => { setIsPremium(true); setShowPaywall(false); }}>
          <Text style={styles.buttonTextPro}>Sblocco a Vita - 24,99 €</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.closePaywall} onPress={() => setShowPaywall(false)}>
          <Text style={styles.closePaywallText}>Continua con la versione limitata</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.headerTitle}>QR PREMIUM STUDIO {isPremium ? '👑 PRO' : ''}</Text>
      <View style={styles.navBar}>
        <TouchableOpacity style={[styles.navButton, currentTab === 'generator' && styles.activeNav]} onPress={() => setCurrentTab('generator')}>
          <Text style={styles.navText}>Genera</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.navButton, currentTab === 'scanner' && styles.activeNav]} onPress={() => setCurrentTab('scanner')}>
          <Text style={styles.navText}>Scansiona</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.navButton, currentTab === 'history' && styles.activeNav]} onPress={() => setCurrentTab('history')}>
          <Text style={styles.navText}>Archivio</Text>
        </TouchableOpacity>
      </View>

      {currentTab === 'generator' && (
        <ScrollView style={styles.content}>
          <TextInput style={styles.input} placeholder="Inserisci il link o il testo qui..." placeholderTextColor="#888" value={text} onChangeText={setText} />
          
          {/* Opzione Tipo QR */}
          <View style={styles.rowOptions}>
            <TouchableOpacity style={[styles.optionBadge, !isDynamic && styles.activeBadge]} onPress={() => setIsDynamic(false)}>
              <Text style={styles.badgeText}>QR Statico</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.optionBadge, isDynamic && styles.activeBadgePro]} onPress={() => handlePremiumFeature(() => setIsDynamic(true))}>
              <Text style={styles.badgeText}>🔗 Dinamico (Pro)</Text>
            </TouchableOpacity>
          </View>

          {/* Scelta Categoria */}
          <Text style={styles.subLabel}>Seleziona Categoria Archivio:</Text>
          <View style={styles.rowOptions}>
            {['Generale', 'Lavoro', 'Social'].map(cat => (
              <TouchableOpacity key={cat} style={[styles.optionBadge, selectedCategory === cat && styles.activeBadge]} onPress={() => handlePremiumFeature(() => setSelectedCategory(cat))}>
                <Text style={styles.badgeText}>{cat}</Text>
              </TouchableOpacity>
            ))}
          </View>

          <TouchableOpacity style={styles.button} onPress={handleGenerate}>
            <Text style={styles.buttonText}>Crea Codice QR</Text>
          </TouchableOpacity>

          {text !== '' && (
            <View style={styles.qrDisplayZone}>
              <QRCode 
                value={text} 
                size={180} 
                color={qrColor} 
                backgroundColor={bgColor}
                logo={logoOption ? { uri: 'https://reactnative.dev' } : null}
                logoSize={40}
                logoBackgroundColor='transparent'
              />
              
              {/* Opzioni di personalizzazione avanzata */}
              <View style={styles.proOptionsZone}>
                <Text style={styles.proSectionTitle}>🎨 Tavolozza Colori (Premium):</Text>
                <View style={styles.colorPaletteRow}>
                  {['#000000', '#FF5733', '#1A5F7A', '#57C5B6', '#8B5CF6'].map(color => (
                    <TouchableOpacity 
                      key={color} 
                      style={[styles.colorCircle, { backgroundColor: color }, qrColor === color && styles.selectedCircle]} 
                      onPress={() => handlePremiumFeature(() => setQrColor(color))}
                    />
                  ))}
                </View>

                <Text style={styles.proSectionTitle}>🏢 Logo Centrale (Premium):</Text>
                <TouchableOpacity style={[styles.proButton, logoOption && styles.activeProBtn]} onPress={() => handlePremiumFeature(() => setLogoOption(!logoOption))}>
                  <Text style={styles.proButtonText}>{logoOption ? '❌ Rimuovi Logo' : '🖼️ Inserisci Logo Aziendale'}</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.proButton} onPress={() => handlePremiumFeature(() => Alert.alert('Esportazione', 'File vettoriale SVG scaricato in alta risoluzione!'))}>
                  <Text style={styles.proButtonText}>💾 Esporta in Alta Risoluzione SVG</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
        </ScrollView>
      )}

      {currentTab === 'scanner' && (
        <View style={styles.scannerZone}>
          {hasPermission === null && <Text style={styles.textWhite}>Richiesta permesso fotocamera...</Text>}
          {hasPermission === false && <Text style={styles.textWhite}>Nessun accesso alla fotocamera.</Text>}
          {hasPermission === true && <CameraView onBarcodeScanned={scanned ? undefined : handleBarCodeScanned} style={StyleSheet.absoluteFillObject} />}
          {scanned && (
            <TouchableOpacity style={styles.button} onPress={() => setScanned(false)}>
              <Text style={styles.buttonText}>Tappa per scansionare ancora</Text>
            </TouchableOpacity>
          )}
        </View>
      )}

      {currentTab === 'history' && (
        <ScrollView style={styles.content}>
          <Text style={styles.sectionTitle}>Filtra per Categoria:</Text>
          <View style={styles.rowOptions}>
            {['Tutti', 'Generale', 'Lavoro', 'Social'].map(cat => (
              <TouchableOpacity key={cat} style={[styles.optionBadge, filterCategory === cat && styles.activeBadge]} onPress={() => handlePremiumFeature(() => setFilterCategory(cat))}>}
