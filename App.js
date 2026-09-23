import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, TextInput, TouchableOpacity, ScrollView, Alert, Linking } from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import QRCode from 'react-native-qrcode-svg';
import * as ScreenCapture from 'expo-screen-capture';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as FileSystem from 'expo-file-system';
import { shareAsync } from 'expo-sharing';

export default function App() {
  const [permission, requestPermission] = useCameraPermissions();
  const [scanned, setScanned] = useState(false);
  const [text, setText] = useState('');
  const [qrColor, setQrColor] = useState('#000000');
  const [logoOption, setLogoOption] = useState(null);
  const [history, setHistory] = useState([]);
  const [currentTab, setCurrentTab] = useState('scanner'); 
  const [selectedCategory, setSelectedCategory] = useState('Generale');
  const [filterCategory, setFilterCategory] = useState('Tutti');
  let svgRef = React.createRef();

  useEffect(() => {
    (async () => {
      if (!permission || !permission.granted) {
        await requestPermission();
      }
    })();
    loadHistory();
    ScreenCapture.preventScreenCaptureAsync(); 
  }, []);

  const loadHistory = async () => {
    try {
      const stored = await AsyncStorage.getItem('@qr_history');
      if (stored) setHistory(JSON.parse(stored));
    } catch (e) { console.log(e); }
  };

  const saveHistory = async (newHistory) => {
    try {
      setHistory(newHistory);
      await AsyncStorage.setItem('@qr_history', JSON.stringify(newHistory));
    } catch (e) { console.log(e); }
  };

  const handleBarCodeScanned = ({ data }) => {
    setScanned(true);
    const updatedHistory = [{ id: Date.now().toString(), data, type: 'Scansionato', category: 'Generale', date: new Date().toLocaleDateString() }, ...history];
    saveHistory(updatedHistory);
    
    Alert.alert(
      'QR Scansionato',
      data,
      [
        { text: 'Apri Link', onPress: () => {
          Linking.canOpenURL(data).then(supported => {
            if (supported) Linking.openURL(data);
            else Alert.alert("Contenuto QR", data);
          });
        }},
        { text: 'OK', onPress: () => setScanned(false) }
      ]
    );
  };

  const handleGenerate = () => {
    if (!text) return;
    const updatedHistory = [{ id: Date.now().toString(), data: text, type: 'Generato', category: selectedCategory, date: new Date().toLocaleDateString() }, ...history];
    saveHistory(updatedHistory);
    Alert.alert('Successo', 'Codice QR Generato e salvato in Archivio.');
  };

  const handleExport = () => {
    if (svgRef.current) {
      svgRef.current.toDataURL(async (dataURL) => {
        try {
          const filename = `${FileSystem.documentDirectory}qr_${Date.now()}.png`;
          await FileSystem.writeAsStringAsync(filename, dataURL, { encoding: FileSystem.EncodingType.Base64 });
          await shareAsync(filename);
        } catch (e) {
          Alert.alert("Errore", "Impossibile esportare l'immagine.");
        }
      });
    }
  };

  const filteredHistory = filterCategory === 'Tutti' ? history : history.filter(h => h.category === filterCategory);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>ADVANCED QR 👑</Text>
      <View style={styles.nav}>
        {['scanner', 'generator', 'history'].map(t => (
          <TouchableOpacity key={t} style={[styles.navB, currentTab === t && styles.navAct]} onPress={() => setCurrentTab(t)}>
            <Text style={styles.whiteTxt}>{t === 'scanner' ? 'Scansiona' : t === 'generator' ? 'Genera' : 'Archivio'}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {currentTab === 'generator' && (
        <ScrollView style={styles.pad}>
          <TextInput style={styles.input} placeholder="Inserisci il link o testo..." placeholderTextColor="#888" value={text} onChangeText={setText} />
          <View style={styles.row}>
            {['Generale', 'Lavoro', 'Social'].map(c => <TouchableOpacity key={c} style={[styles.badge, selectedCategory === c && styles.badgeAct]} onPress={() => setSelectedCategory(c)}><Text style={styles.whiteTxt}>{c}</Text></TouchableOpacity>)}
          </View>
          <TouchableOpacity style={styles.btn} onPress={handleGenerate}><Text style={styles.whiteTxt}>Crea Codice QR</Text></TouchableOpacity>
          {text !== '' && (
            <View style={styles.qrBox}>
              <View style={{ padding: 20, backgroundColor: '#FFF' }}>
                <QRCode value={text} size={150} color={qrColor} backgroundColor="#FFF" getRef={svgRef} />
              </View>
              <View style={styles.proBox}>
                <Text style={styles.darkLabel}>🎨 Colori:</Text>
                <View style={styles.row}>
                  {['#000000', '#FF5733', '#1A5F7A', '#57C5B6', '#8B5CF6'].map(col => <TouchableOpacity key={col} style={[styles.circle, { backgroundColor: col }, qrColor === col && styles.selCircle]} onPress={() => setQrColor(col)} />)}
                </View>
                <TouchableOpacity style={styles.btn} onPress={handleExport}><Text style={styles.whiteTxt}>💾 Esporta / Condividi PNG</Text></TouchableOpacity>
              </View>
            </View>
          )}
        </ScrollView>
      )}

      {currentTab === 'scanner' && (
        <View style={styles.scanBox}>
          {permission && permission.granted ? (
            <CameraView onBarcodeScanned={scanned ? undefined : handleBarCodeScanned} style={StyleSheet.absoluteFillObject} />
          ) : (
            <Text style={styles.whiteTxt}>Richiesta permessi fotocamera in corso...</Text>
          )}
          {scanned && <TouchableOpacity style={styles.btn} onPress={() => setScanned(false)}><Text style={styles.whiteTxt}>Scansiona ancora</Text></TouchableOpacity>}
        </View>
      )}

      {currentTab === 'history' && (
        <ScrollView style={styles.pad}>
          <View style={styles.row}>
            {['Tutti', 'Generale', 'Lavoro', 'Social'].map(c => <TouchableOpacity key={c} style={[styles.badge, filterCategory === c && styles.badgeAct]} onPress={() => setFilterCategory(c)}><Text style={styles.whiteTxt}>{c}</Text></TouchableOpacity>)}
          </View>
          {filteredHistory.length === 0 ? <Text style={styles.whiteTxt}>Nessun QR memorizzato in archivio.</Text> : null}
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
  navAct: { backgroundColor: '#00ADB5', borderRadius: 8 },
  whiteTxt: { color: '#FFF' },
  pad: { flex: 1, paddingHorizontal: 15 },
  input: { backgroundColor: '#1F1F1F', color: '#FFF', padding: 12, borderRadius: 8, marginBottom: 10 },
  row: { flexDirection: 'row', marginBottom: 10, flexWrap: 'wrap' },
  badge: { backgroundColor: '#222', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20, marginRight: 6, marginBottom: 5 },
  badgeAct: { backgroundColor: '#00ADB5' },
  btn: { backgroundColor: '#00ADB5', padding: 12, borderRadius: 8, alignItems: 'center', marginTop: 10 },
  qrBox: { alignItems: 'center', marginTop: 20, padding: 15, borderRadius: 8, backgroundColor: '#222' },
  proBox: { width: '100%', marginTop: 15 },
  darkLabel: { color: '#FFF', marginBottom: 5 },
  circle: { width: 30, height: 30, borderRadius: 15, marginRight: 10 },
  selCircle: { borderWidth: 2, borderColor: '#FFF' },
  scanBox: { flex: 1, justifyContent: 'flex-end', paddingBottom: 20 },
  card: { backgroundColor: '#1F1F1F', padding: 15, borderRadius: 8, marginBottom: 10 },
  cardHead: { color: '#00ADB5', fontSize: 12, marginBottom: 5 }
});
