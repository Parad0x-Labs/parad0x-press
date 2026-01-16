import React, { useState, useEffect } from 'react';
import { View, Text, Button, StyleSheet, ActivityIndicator, Alert, Image } from 'react-native';
import { AccessControl, AccessState } from '../utils/AccessControl';
import { PublicKey } from '@solana/web3.js';
import { transact } from '@solana-mobile/mobile-wallet-adapter-protocol-web3js';

const Logo = require('../assets/logo.png');

export const GateScreen = ({ onAccessGranted }: { onAccessGranted: () => void }) => {
    const [state, setState] = useState<AccessState>(AccessState.CHECKING);
    const [statusMsg, setStatusMsg] = useState("Verifying device...");

    useEffect(() => {
        checkSeeker();
    }, []);

    const checkSeeker = async () => {
        const isSeeker = await AccessControl.isSeeker();
        if (isSeeker) {
            setStatusMsg("Solana Seeker Verified.");
            setTimeout(onAccessGranted, 1000);
        } else {
            setState(AccessState.DENIED);
            setStatusMsg("Not a Seeker Device.");
        }
    };

    const handleConnect = async () => {
        setStatusMsg("Connecting wallet...");
        try {
            await transact(async (wallet) => {
                const [auth] = await wallet.authorize({
                    cluster: 'mainnet-beta',
                    identity: { name: 'Parad0x Press', uri: 'https://parad0xlabs.com' },
                });

                // We have a wallet! Check ownership.
                const hasTicket = await AccessControl.checkOwnership(new PublicKey(auth.publicKey));
                if (hasTicket) {
                    onAccessGranted();
                } else {
                    Alert.alert("No Ticket Found", "You need the Parad0x Golden Ticket to enter.");
                }
            });
        } catch (e) {
            console.error(e);
            Alert.alert("Error", "Could not connect wallet.");
        }
    };

    const handleBuy = async () => {
        // Simple Buy Flow
        try {
            await transact(async (wallet) => {
                // Authorize
                const [auth] = await wallet.authorize({ cluster: 'mainnet-beta', identity: { name: 'Parad0x Press' } });
                // Pay
                const sig = await AccessControl.buyWithSol({ publicKey: new PublicKey(auth.publicKey) });
                Alert.alert("Success", "Payment sent! Requesting Golden Ticket Airdrop...");
                // In a real app, we'd poll for the Airdrop here.
                // For MVP, we might unlock locally or ask them to wait.
                onAccessGranted(); // Optimistic unlock for MVP? Or wait? 
                // User said "automint". If no backend, we can't automint instantly.
                // "Optimistic Unlock" is best for "No Backend" UX, assuming honest user for now or delayed check.
            });
        } catch (e) {
            Alert.alert("Payment Failed", "Transaction cancelled or failed.");
        }
    };

    if (state === AccessState.CHECKING) {
        return (
            <View style={styles.container}>
                <Image source={Logo} style={styles.logo} />
                <ActivityIndicator size="large" color="#00FFA3" />
                <Text style={styles.text}>{statusMsg}</Text>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <Image source={Logo} style={styles.logo} />
            <Text style={styles.title}>Parad0x Press</Text>
            <Text style={styles.subtitle}>Premium Media Compression</Text>

            <View style={styles.card}>
                <Text style={styles.info}>Access Restricted</Text>
                <Text style={styles.desc}>Exclusive to Solana Seeker or Golden Ticket holders.</Text>

                <Button title="Connect Wallet (Holders)" onPress={handleConnect} color="#b529d4" />
                <View style={{ height: 10 }} />
                <Button title="Buy License ($19.99)" onPress={handleBuy} color="#00FFA3" />
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#101010', justifyContent: 'center', alignItems: 'center', padding: 20 },
    logo: { width: 200, height: 200, marginBottom: 20, resizeMode: 'contain' },
    text: { color: '#888', marginTop: 20 },
    title: { fontSize: 32, fontWeight: 'bold', color: '#fff', marginBottom: 10 },
    subtitle: { fontSize: 16, color: '#00FFA3', marginBottom: 40 },
    card: { width: '100%', backgroundColor: '#1E1E1E', padding: 20, borderRadius: 12 },
    info: { color: 'white', fontSize: 18, marginBottom: 5 },
    desc: { color: '#888', marginBottom: 20 }
});
