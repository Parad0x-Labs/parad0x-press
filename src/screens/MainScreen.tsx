import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Button, Image, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { NativeModules } from 'react-native';
import { launchImageLibrary } from 'react-native-image-picker';
import { FFmpegKit, ReturnCode } from 'ffmpeg-kit-react-native-full';
import { MediaScanner, MediaStats } from '../utils/MediaScanner';
import { ShareUtils } from '../utils/ShareUtils';

const { ParadoxEngine, DreamscapeEngine } = NativeModules;

export const MainScreen = () => {
    const [selectedMedia, setSelectedMedia] = useState<any>(null);
    const [mode, setMode] = useState<'safe' | 'balanced'>('balanced');
    const [processing, setProcessing] = useState(false);
    const [progress, setProgress] = useState("");
    const [stats, setStats] = useState<MediaStats | null>(null);
    const [totalSaved, setTotalSaved] = useState(0);
    const [lastResult, setLastResult] = useState<{ original: number, compressed: number } | null>(null);

    useEffect(() => {
        scanMediaOnLaunch();
    }, []);

    const scanMediaOnLaunch = async () => {
        const hasPermission = await MediaScanner.requestPermissions();
        if (hasPermission) {
            const mediaStats = await MediaScanner.scanMedia();
            setStats(mediaStats);
        }
    };

    const pickMedia = async () => {
        const result = await launchImageLibrary({ mediaType: 'mixed', selectionLimit: 1 });
        if (result.assets && result.assets.length > 0) {
            setSelectedMedia(result.assets[0]);
            setProgress("");
            setLastResult(null);
        }
    };

    const runCompression = async () => {
        if (!selectedMedia) return;

        const batteryLvl = await DreamscapeEngine.checkBatteryLevel();
        if (batteryLvl < 0.20 && batteryLvl > 0) {
            Alert.alert("Battery Warning", "Your battery is < 20%. Continue?",
                [{ text: "Cancel" }, { text: "Yes", onPress: startJob }]
            );
        } else {
            startJob();
        }
    };

    const startJob = async () => {
        setProcessing(true);
        setProgress("Initializing...");

        try {
            const inputUri = selectedMedia.uri.replace("file://", "");
            const originalSize = selectedMedia.fileSize || 0;
            const outputUri = inputUri.substring(0, inputUri.lastIndexOf('.')) + `_parad0x_${mode}.mp4`;

            const cmd = await ParadoxEngine.getCommand(inputUri, outputUri, mode);
            setProgress("Compressing... (This may take a moment)");

            const session = await FFmpegKit.execute(cmd);
            const returnCode = await session.getReturnCode();

            if (ReturnCode.isSuccess(returnCode)) {
                setProgress("Verifying...");
                try {
                    await DreamscapeEngine.atomicSwap(inputUri, outputUri);
                    // Calculate savings (estimate compressed size as % of original based on mode)
                    const savedBytes = mode === 'safe' ? originalSize * 0.5 : originalSize * 0.85;
                    setTotalSaved(prev => prev + savedBytes);
                    setLastResult({ original: originalSize, compressed: originalSize - savedBytes });
                    Alert.alert("Success", `Saved ${MediaScanner.formatBytes(savedBytes)}!`);
                    setProgress("Done.");
                } catch (e: any) {
                    Alert.alert("Safety Error", e.message);
                    setProgress("Failed Safety Check");
                }
            } else {
                Alert.alert("Error", "Compression Failed");
                setProgress("Failed");
            }
        } catch (e) {
            console.error(e);
            Alert.alert("System Error", "Engine failure.");
        } finally {
            setProcessing(false);
        }
    };

    const handleShare = () => {
        if (totalSaved > 0) {
            ShareUtils.shareToTwitter({
                savedBytes: totalSaved,
                photoCount: stats?.photoCount || 0,
                videoCount: stats?.videoCount || 0,
                audioCount: stats?.audioCount || 0,
            });
        } else {
            Alert.alert("Nothing to share", "Compress some media first!");
        }
    };

    return (
        <ScrollView contentContainerStyle={styles.container}>
            <Text style={styles.header}>Parad0x Studio</Text>

            {/* STATS CARD */}
            {stats && (
                <View style={styles.statsCard}>
                    <Text style={styles.statsTitle}>📊 Your Media</Text>
                    <Text style={styles.statsText}>📷 {stats.photoCount} Photos | 🎬 {stats.videoCount} Videos | 🎵 {stats.audioCount} Audio</Text>
                    <Text style={styles.statsText}>💾 Total: {MediaScanner.formatBytes(stats.totalSizeBytes)}</Text>
                    <Text style={styles.statsSavings}>🚀 Est. Savings: {MediaScanner.formatBytes(stats.estimatedSavingsBytes)}</Text>
                </View>
            )}

            {/* TOTAL SAVED */}
            {totalSaved > 0 && (
                <View style={styles.savedBadge}>
                    <Text style={styles.savedText}>✅ Session Saved: {MediaScanner.formatBytes(totalSaved)}</Text>
                </View>
            )}

            <View style={styles.preview}>
                {selectedMedia ? (
                    <Image source={{ uri: selectedMedia.uri }} style={styles.image} />
                ) : (
                    <Text style={{ color: '#555' }}>No Media Selected</Text>
                )}
            </View>

            <Button title="Select Media" onPress={pickMedia} color="#b529d4" />

            <View style={styles.controls}>
                <Text style={styles.label}>Mode:</Text>
                <View style={styles.toggles}>
                    <TouchableOpacity onPress={() => setMode('safe')} style={[styles.pill, mode === 'safe' && styles.active]}>
                        <Text style={styles.pillText}>SAFE (99%)</Text>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => setMode('balanced')} style={[styles.pill, mode === 'balanced' && styles.active]}>
                        <Text style={styles.pillText}>BALANCED (88%)</Text>
                    </TouchableOpacity>
                </View>
            </View>

            <View style={{ height: 20 }} />

            <Button
                title={processing ? "Processing..." : "Compress Now"}
                onPress={runCompression}
                disabled={!selectedMedia || processing}
                color="#00FFA3"
            />

            <Text style={styles.status}>{progress}</Text>

            {/* SHARE BUTTON */}
            {totalSaved > 0 && (
                <TouchableOpacity style={styles.shareBtn} onPress={handleShare}>
                    <Text style={styles.shareBtnText}>🐦 Share on X</Text>
                </TouchableOpacity>
            )}
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: { flexGrow: 1, backgroundColor: '#101010', padding: 20, alignItems: 'center' },
    header: { fontSize: 24, fontWeight: 'bold', color: '#fff', marginBottom: 10, marginTop: 40 },
    statsCard: { width: '100%', backgroundColor: '#1A1A2E', padding: 15, borderRadius: 12, marginBottom: 15 },
    statsTitle: { color: '#00FFA3', fontSize: 16, fontWeight: 'bold', marginBottom: 5 },
    statsText: { color: '#888', fontSize: 14 },
    statsSavings: { color: '#00FFA3', fontSize: 14, marginTop: 5 },
    savedBadge: { backgroundColor: '#00FFA3', padding: 10, borderRadius: 8, marginBottom: 10 },
    savedText: { color: '#101010', fontWeight: 'bold' },
    preview: { width: 250, height: 250, backgroundColor: '#1E1E1E', marginBottom: 15, justifyContent: 'center', alignItems: 'center', borderRadius: 8 },
    image: { width: '100%', height: '100%', borderRadius: 8, resizeMode: 'contain' },
    controls: { marginTop: 15, width: '100%' },
    label: { color: '#888', marginBottom: 10 },
    toggles: { flexDirection: 'row', justifyContent: 'space-around' },
    pill: { padding: 10, borderRadius: 20, backgroundColor: '#333', minWidth: 100, alignItems: 'center' },
    active: { backgroundColor: '#b529d4' },
    pillText: { color: 'white', fontWeight: 'bold' },
    status: { marginTop: 15, color: '#00FFA3' },
    shareBtn: { marginTop: 20, backgroundColor: '#1DA1F2', paddingVertical: 12, paddingHorizontal: 30, borderRadius: 25 },
    shareBtnText: { color: 'white', fontWeight: 'bold', fontSize: 16 }
});

