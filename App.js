import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, TextInput, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { Camera, CameraView } from 'expo-camera';
import QRCode from 'react-native-qrcode-svg';
import * as ScreenCapture from 'expo-screen-capture';
import { Paywall } from './PremiumFeatures';

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
  const [selectedCategory, setSelectedCategory] = useState('Generale');
  const [filterCategory, setFilterCategory] = useState('Tutti');
  const [isDynamic, setIsDynamic] = useState(false);

  // Attivazione protezione screenshot e permessi fotocamera
  useEffect(() => {
    (async () => {
      const { status } = await Camera.requestCameraPermissionsAsync();
      setHasPermission(status === 'granted');
    })();
    
    // Attiva il blocco screenshot sicuro su Android e iOS
    ScreenCapture.preventScreenCaptureAsync();
  }, []);

  const handleBarCodeScanned = ({ data }) => {
    setScanned(true);
    let out = data.includes('qr-pro-dynamic/') ? "👉 Link Reindirizzato: https://tuositupro.com" : data;
    if (!isPremium && history.filter(h => h.type === 'Scansionato').length >= 5) { setShowPaywall(true); return; }
    setHistory([{ id: Date.now().toString(), data: out, type: 'Scansionato', category: 'Generale', date: new Date().toLocaleDateString() }, ...history]);
    Alert.alert('QR Scansionato', out, [{ text: 'OK', onPress: () => setScanned(false) }]);
  };

  const handleGenerate = () => {
    if (!text) return;
    let val = isDynamic ? `https://api.qr-pro-dynamic{Date.now()}` : text;
    setHistory([{ id: Date.now().toString(), data: val, type: isDynamic ? 'Dinamico' : 'Generato', category: selectedCategory, date: new Date().toLocaleDateString() }, ...history]);
    Alert.alert('Successo', isDynamic ? 'QR Dinamico Creato!' : 'QR Generato.');
  };

  const handlePremiumFeature = (action) => { isPremium ? action() : setShowPaywall(true); };
  const filteredHistory = filterCategory === 'Tutti' ? history : history.filter(h => h.category === filterCategory);

  if (showPaywall) {
    return <Paywall setIsPremium={setIsPremium} setShowPaywall={setShowPaywall} />;
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>QR PREMIUM STUDIO {isPremium ? '👑 PRO' : ''}</Text>
      <View style={styles.nav}>
        {['generator', 'scanner', 'history'].map(t => (
          <TouchableOpacity key={t} style={[styles.navB, currentTab === t && styles.navAct]} onPress={() => setCurrentTab(t)}>
            <Text style={styles.whiteTxt}>{t === 'generator' ? 'Genera' : t === 'scanner' ? 'Scansiona' : 'Archivio'}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {currentTab === 'generator' && (
        <ScrollView style={styles.pad}>
          <TextInput style={styles.input} placeholder="Inserisci il link..." placeholderTextColor="#888" value={text} onChangeText={setText} />
          <View style={styles.row}>
            <TouchableOpacity style={[styles.badge, !isDynamic && styles.badgeAct]} onPress={() => setIsDynamic(false)}><Text style={styles.whiteTxt}>Statico</Text></TouchableOpacity>
            <TouchableOpacity style={[styles.badge, isDynamic && styles.badgePro]} onPress={() => handlePremiumFeature(() => setIsDynamic(true))}><Text style={styles.whiteTxt}>🔗 Dinamico</Text></TouchableOpacity>
          </View>
          <View style={styles.row}>
            {['Generale', 'Lavoro', 'Social'].map(c => <TouchableOpacity key={c} style={[styles.badge, selectedCategory === c && styles.badgeAct]} onPress={() => handlePremiumFeature(() => setSelectedCategory(c))}><Text style={styles.whiteTxt}>{c}</Text></TouchableOpacity>)}
          </View>
          <TouchableOpacity style={styles.btn} onPress={handleGenerate}><Text style={styles.whiteTxt}>Crea Codice QR</Text></TouchableOpacity>
          {text !== '' && (
            <View style={styles.qrBox}>
              <QRCode value={text} size={150} color={qrColor} backgroundColor="#FFF" logo={logoOption ? { uri: 'https://reactnative.dev' } : null} logoSize={35} />
              <View style={styles.proBox}>
                <Text style={styles.darkLabel}>🎨 Colori (Premium):</Text>
                <View style={styles.row}>
                  {['#000000', '#FF5733', '#1A5F7A', '#57C5B6', '#8B5CF6'].map(col => <TouchableOpacity key={col} style={[styles.circle, { backgroundColor: col }, qrColor === col && styles.selCircle]} onPress={() => handlePremiumFeature(() => setQrColor(col))} />)}
                </View>
                <TouchableOpacity style={styles.proBtn} onPress={() => handlePremiumFeature(() => setLogoOption(!logoOption))}><Text style={styles.darkTxt}>{logoOption ? '❌ Rimuovi Logo' : '🖼️ Inserisci Logo (Pro)'}</Text></TouchableOpacity>
                <TouchableOpacity style={styles.proBtn} onPress={() => handlePremiumFeature(() => Alert.alert('Export', 'SVG Scaricato!'))}><Text style={styles.darkTxt}>💾 Esporta SVG (Pro)</Text></TouchableOpacity>
              </View>
            </View>
          )}
        </ScrollView>
      )}

      {currentTab === 'scanner' && (
        <View style={styles.scanBox}>
          {hasPermission === true ? <CameraView onBarcodeScanned={scanned ? undefined : handleBarCodeScanned} style={StyleSheet.absoluteFillObject} /> : <Text style={styles.whiteTxt}>Nessun accesso alla fotocamera.</Text>}
          {scanned && <TouchableOpacity style={styles.btn} onPress={() => setScanned(false)}><Text style={styles.whiteTxt}>Scansiona ancora</Text></TouchableOpacity>}
        </View>
      )}

      {currentTab === 'history' && (
        <ScrollView style={styles.pad}>
          <View style={styles.row}>
            {['Tutti', 'Generale', 'Lavoro', 'Social'].map(c => <TouchableOpacity key={c} style={[styles.badge, filterCategory === c && styles.badgeAct]} onPress={() => handlePremiumFeature(() => setFilterCategory(c))}><Text style={styles.whiteTxt}>{c}</Text></TouchableOpacity>)}
          </View>
          {filteredHistory.map(h => (
            <View key={h.id} style={styles.card}>
              <Text style={styles.cardHead}>{h.type} [{h.category}] - {h.date}</Text>
              <Text style={styles.whiteTxt} numberOfLines={1}>{h.data}</Text>
            </View>
          ))}
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#121212', paddingTop: 40 },
  title: { color: '#FFF', fontSize: 18, fontWeight: 'bold', textAlign: 'center', margin: 10 },
  nav: { flexDirection: 'row', backgroundColor: '#1F1F1F', margin: 10, borderRadius: 8 },
  navB: { flex: 1, padding: 12, alignItems: 'center' },
  navAct: { backgroundColor: '#333', borderRadius: 8 },
  pad: { flex: 1, paddingHorizontal: 15 },
  input: { backgroundColor: '#1F1F1F', color: '#FFF', padding: 12, borderRadius: 8, marginBottom: 10 },
  row: { flexDirection: 'row', marginBottom: 10, flexWrap: 'wrap' },
  badge: { backgroundColor: '#222', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20, marginRight: 6, marginBottom: 5 },
  badgeAct: { backgroundColor: '#00ADB5' },
  badgePro: { backgroundColor: '#FFD700' },
  btn: { backgroundColor: '#00ADB5', padding: 12, borderRadius: 8, alignItems: 'center', marginTop: 5 },
  qrBox: { alignItems: 'center', backgroundColor: '#FFF', padding: 15, borderRadius: 12, marginTop: 10 },
  proBox: { width: '100%', marginTop: 15, borderTopWidth: 1, borderTopColor: '#EEE', paddingTop: 10 },
  darkLabel: { color: '#333', fontSize: 12, fontWeight: 'bold', marginBottom: 5 },
  circle: { width: 26, height: 26, borderRadius: 13, marginRight: 10, borderWidth: 1, borderColor: '#DDD' },
  selCircle: { borderWidth: 3, borderColor: '#00ADB5' },
  proBtn: { backgroundColor: '#F0F0F0', padding: 10, borderRadius: 6, marginTop: 8, alignItems: 'center' },
  scanBox: { flex: 1, backgroundColor: '#000', justifyContent: 'center', alignItems: 'center' },
  card: { backgroundColor: '#1F1F1F', padding: 12, borderRadius: 8, marginBottom: 8 },
  cardHead: { color: '#00ADB5', fontSize: 11, fontWeight: 'bold', marginBottom: 3 },
  whiteTxt: { color: '#FFF', fontSize: 13 },
  darkTxt: { color: '#111', fontWeight: 'bold', fontSize: 12 }
});
