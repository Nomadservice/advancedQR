import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, ScrollView, Alert, Linking } from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import * as ScreenCapture from 'expo-screen-capture';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Paywall } from './PremiumFeatures'; 
import QRGenerator from './QRGenerator'; // <- ADESSO È AGGANCIATO CORRETTAMENTE!

export default function App() {
  const [permission, requestPermission] = useCameraPermissions();
  const [scanned, setScanned] = useState(false);
  const [history, setHistory] = useState([]);
  const [isPremium, setIsPremium] = useState(false); 
  const [showPaywall, setShowPaywall] = useState(false); 
  const [currentTab, setCurrentTab] = useState('scanner'); 
  const [filterCategory, setFilterCategory] = useState('Tutti');

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
    
    if (data.includes('qr-pro-dynamic/free-') && !isPremium) {
      Alert.alert("Link Scaduto", "Questo codice QR dinamico temporaneo è scaduto. Il proprietario deve passare a Premium per riattivarlo.");
      setScanned(false);
      return;
    }
    
    if (!isPremium && history.filter(h => h.type === 'Scansionato').length >= 5) { 
      setShowPaywall(true); 
      return; 
    }

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

  const handleWatchAd = () => {
    Alert.alert(
      "Caricamento Video",
      "Riproduzione annuncio pubblicitario (15 secondi)...",
      [
        {
          text: "Completa",
          onPress: () => {
            setIsPremium(true); 
            setShowPaywall(false);
            Alert.alert("Premio Riscattato", "Funzioni Pro sbloccate per questa sessione!");
          }
        }
      ]
    );
  };

  if (showPaywall) {
    return <Paywall setIsPremium={setIsPremium} setShowPaywall={setShowPaywall} onWatchAd={handleWatchAd} />;
  }

  const filteredHistory = filterCategory === 'Tutti' ? history : history.filter(h => h.category === filterCategory);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>ADVANCED QR {isPremium ? '👑 PRO' : ''}</Text>
      
      <View style={styles.nav}>
        {['scanner', 'generator', 'history'].map(t => (
          <TouchableOpacity key={t} style={[styles.navB, currentTab === t && styles.navAct]} onPress={() => setCurrentTab(t)}>
            <Text style={[styles.whiteTxt, currentTab === t && styles.activeTxt]}>
              {t === 'scanner' ? 'Scansiona' : t === 'generator' ? 'Genera' : 'Archivio'}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {currentTab === 'generator' && (
        <QRGenerator 
          isPremium={isPremium} 
          setShowPaywall={setShowPaywall} 
          history={history} 
          saveHistory={saveHistory} 
        />
      )}

      {currentTab === 'scanner' && (
        <View style={styles.scanBox}>
          {permission && permission.granted ? (
            <CameraView onBarcodeScanned={scanned ? undefined : handleBarCodeScanned} style={StyleSheet.absoluteFillObject} />
          ) : (
            <Text style={styles.whiteTxt}>Richiesta permessi fotocamera...</Text>
          )}
          {scanned && <TouchableOpacity style={styles.btn} onPress={() => setScanned(false)}><Text style={styles.btnTxt}>Scansiona ancora</Text></TouchableOpacity>}
        </View>
      )}

      {currentTab === 'history' && (
        <ScrollView style={styles.pad}>
          <View style={styles.row}>
            {['Tutti', 'Generale', 'Lavoro', 'Social'].map(c => (
              <TouchableOpacity key={c} style={[styles.badge, filterCategory === c && styles.badgeAct]} onPress={() => setFilterCategory(c)}>
                <Text style={styles.whiteTxt}>{c}</Text>
              </TouchableOpacity>
            ))}
          </View>
          {filteredHistory.length === 0 ? <Text style={styles.whiteTxt}>Nessun QR memorizzato.</Text> : null}
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
  container: { flex: 1, backgroundColor: '#0B0F19', paddingTop: 50 }, 
  title: { color: '#00ADB5', fontSize: 22, fontWeight: '900', textAlign: 'center', marginBottom: 15, letterSpacing: 1 },
  nav: { flexDirection: 'row', backgroundColor: '#161B26', marginHorizontal: 15, marginBottom: 20, borderRadius: 16, padding: 4 },
  navB: { flex: 1, paddingVertical: 12, alignItems: 'center', borderRadius: 12 },
  navAct: { backgroundColor: '#00ADB5' },
  whiteTxt: { color: '#A0AEC0', fontWeight: '600' },
  activeTxt: { color: '#FFF' },
  pad: { flex: 1, paddingHorizontal: 15 },
  btn: { backgroundColor: '#00ADB5', padding: 16, borderRadius: 14, alignItems: 'center', marginTop: 10 },
  btnTxt: { color: '#FFF', fontWeight: '700', fontSize: 16 },
  scanBox: { flex: 1, justifyContent: 'flex-end', paddingBottom: 30 },
  row: { flexDirection: 'row', marginBottom: 15, flexWrap: 'wrap' },
  badge: { backgroundColor: '#161B26', paddingHorizontal: 16, paddingVertical: 10, borderRadius: 25, marginRight: 8, marginBottom: 8, borderWidth: 1, borderColor: '#2D3748' },
  badgeAct: { backgroundColor: '#00ADB5', borderColor: '#00ADB5' },
  card: { backgroundColor: '#161B26', padding: 18, borderRadius: 16, marginBottom: 12, borderWidth: 1, borderColor: '#2D3748' }, 
  cardHead: { color: '#00ADB5', fontSize: 13, fontWeight: '700', marginBottom: 6 }
});
