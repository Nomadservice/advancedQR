import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, TextInput, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { Camera } from 'expo-camera';
import QRCode from 'react-native-qrcode-svg';

export default function App() {
  const [hasPermission, setHasPermission] = useState(null);
  const [scanned, setScanned] = useState(false);
  const [text, setText] = useState('');
  const [qrColor, setQrColor] = useState('#000000');
  const [bgColor, setBgColor] = useState('#FFFFFF');
  const [history, setHistory] = useState([]);
  const [isPremium, setIsPremium] = useState(false);
  const [showPaywall, setShowPaywall] = useState(false);
  const [currentTab, setCurrentTab] = useState('generator');

  useEffect(() => {
    (async () => {
      const { status } = await Camera.requestCameraPermissionsAsync();
      setHasPermission(status === 'granted');
    })();
  }, []);

  const handleBarCodeScanned = ({ data }) => {
    setScanned(true);
    const newHistory = [{ id: Date.now().toString(), data, type: 'Scansionato', date: new Date().toLocaleDateString() }, ...history];
    
    if (!isPremium && history.filter(h => h.type === 'Scansionato').length >= 5) {
      setShowPaywall(true);
      return;
    }
    
    setHistory(newHistory);
    Alert.alert('QR Scansionato', data, [{ text: 'OK', onPress: () => setScanned(false) }]);
  };

  const handleGenerate = () => {
    if (!text) return;
    const newHistory = [{ id: Date.now().toString(), data: text, type: 'Generato', date: new Date().toLocaleDateString() }, ...history];
    setHistory(newHistory);
  };

  const handlePremiumFeature = (action) => {
    if (!isPremium) {
      setShowPaywall(true);
    } else {
      action();
    }
  };

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
          <TouchableOpacity style={styles.button} onPress={handleGenerate}>
            <Text style={styles.buttonText}>Crea Codice QR</Text>
          </TouchableOpacity>
          {text !== '' && (
            <View style={styles.qrDisplayZone}>
              <QRCode value={text} size={200} color={qrColor} backgroundColor={bgColor} />
              <View style={styles.proOptionsZone}>
                <TouchableOpacity style={styles.proButton} onPress={() => handlePremiumFeature(() => setQrColor('#FF5733'))}>
                  <Text style={styles.proButtonText}>🎨 Colore Rosso (Pro)</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.proButton} onPress={() => handlePremiumFeature(() => Alert.alert('Export', 'File SVG generato!'))}>
                  <Text style={styles.proButtonText}>💾 Esporta SVG (Pro)</Text>
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
          {hasPermission === true && <Camera onBarCodeScanned={scanned ? undefined : handleBarCodeScanned} style={StyleSheet.absoluteFillObject} />}
          {scanned && (
            <TouchableOpacity style={styles.button} onPress={() => setScanned(false)}>
              <Text style={styles.buttonText}>Tappa per scansionare ancora</Text>
            </TouchableOpacity>
          )}
        </View>
      )}

      {currentTab === 'history' && (
        <ScrollView style={styles.content}>
          <Text style={styles.sectionTitle}>I tuoi Codici ({history.length})</Text>
          {history.map((item) => (
            <View key={item.id} style={styles.historyCard}>
              <Text style={styles.historyType}>{item.type} - {item.date}</Text>
              <Text style={styles.historyData} numberOfLines={1}>{item.data}</Text>
            </View>
          ))}
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#121212', paddingTop: 50 },
  paywallContainer: { flex: 1, backgroundColor: '#1A1A2E', padding: 30, justifyContent: 'center' },
  paywallTitle: { fontSize: 28, fontWeight: 'bold', color: '#FFD700', textAlign: 'center', marginBottom: 15 },
  paywallSubtitle: { fontSize: 16, color: '#E0E0E0', textAlign: 'center', marginBottom: 30 },
  featuresList: { marginBottom: 30 },
  featureItem: { fontSize: 16, color: '#FFF', marginBottom: 15 },
  premiumButton: { backgroundColor: '#FFD700', padding: 15, borderRadius: 10, marginBottom: 15, alignItems: 'center' },
  buttonTextPro: { fontSize: 16, fontWeight: 'bold', color: '#000' },
  closePaywall: { marginTop: 15, alignItems: 'center' },
  closePaywallText: { color: '#AAA', fontSize: 14, textDecorationLine: 'underline' },
  headerTitle: { color: '#FFF', fontSize: 20, fontWeight: 'bold', textAlign: 'center', marginBottom: 15 },
  navBar: { flexDirection: 'row', backgroundColor: '#1F1F1F', marginHorizontal: 15, borderRadius: 8, marginBottom: 20 },
  navButton: { flex: 1, paddingVertical: 12, alignItems: 'center' },
  activeNav: { backgroundColor: '#333', borderRadius: 8 },
  navText: { color: '#FFF', fontWeight: '600' },
  content: { flex: 1, paddingHorizontal: 15 },
  input: { backgroundColor: '#1F1F1F', color: '#FFF', padding: 15, borderRadius: 8, fontSize: 16, marginBottom: 15 },
  button: { backgroundColor: '#00ADB5', padding: 15, borderRadius: 8, alignItems: 'center', marginBottom: 20 },
  buttonText: { color: '#FFF', fontWeight: 'bold', fontSize: 16 },
  qrDisplayZone: { alignItems: 'center', marginTop: 20, backgroundColor: '#FFF', padding: 20, borderRadius: 12 },
  proOptionsZone: { width: '100%', marginTop: 20 },
  proButton: { backgroundColor: '#333', padding: 10, borderRadius: 6, marginBottom: 10, alignItems: 'center' },
  proButtonText: { color: '#FFD700', fontWeight: '600' },
  scannerZone: { flex: 1, backgroundColor: '#000', justifyContent: 'center', alignItems: 'center', marginBottom: 20 },
  textWhite: { color: '#FFF' },
  sectionTitle: { color: '#FFF', fontSize: 18, fontWeight: 'bold', marginBottom: 15 },
  historyCard: { backgroundColor: '#1F1F1F', padding: 15, borderRadius: 8, marginBottom: 10 },
  historyType: { color: '#00ADB5', fontSize: 12, fontWeight: 'bold', marginBottom: 5 },
  historyData: { color: '#FFF', fontSize: 14 }
});
