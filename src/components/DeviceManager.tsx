import React, { useCallback, useEffect, useState } from 'react';
import {
    FlatList,
    StyleSheet,
    Text,
    View,
    ActivityIndicator,
    Switch,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import axios from 'axios';
import Header from './Header';
import COMMON from '../comon/Common';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from '@react-navigation/native';

const DeviceManager = () => {
    const [devices, setDevices] = useState([]);
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(false);
    const [updatingId, setUpdatingId] = useState(null);

    const BASE_URL = COMMON.BaseUrl;
    const dataBase = COMMON.DbName;

    // 🔹 Fetch logged-in user
    const userData = async () => {
        try {
            const value = JSON.parse(
                (await AsyncStorage.getItem('loginDetails')) ?? '{}'
            );
            setUser(value);
        } catch (err) {
            console.log('User data error:', err);
        }
    };

    // 🔹 Fetch devices
    const fetchDevices = async () => {
        if (!user?.tenant_id) return;

        setLoading(true);
        try {
            const res = await axios.post(`${BASE_URL}/get-devices`, null, {
                params: {
                    db: dataBase,
                    tenant_id: user.tenant_id,
                },
            });

            setDevices(res.data || []);
        } catch (err) {
            console.log('Device fetch error:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        userData();
    }, []);

    useFocusEffect(
        useCallback(() => {
            fetchDevices();
        }, [user])
    );

    // 🔹 Toggle login status
    const toggleLoginStatus = async (item: any) => {
        try {
            setUpdatingId(item.device_id);

            const newIsActive = item.isActive === 'Yes' ? 'No' : 'Yes';

            await axios.post(`${BASE_URL}/update-device-login-status`, null, {
                params: {
                    db: dataBase,
                    tenant_id: user?.tenant_id,
                    device_primary_id: item.device_id,
                    user_id: user?.logged_user_id,
                    device_login_status: newIsActive === 'Yes' ? 1 : 0,
                },
            });

            // ✅ Instant UI update
            setDevices((prev: any) =>
                prev.map((d: any) =>
                    d.device_id === item.device_id
                        ? { ...d, isActive: newIsActive }
                        : d
                )
            );
        } catch (err) {
            console.log('Toggle error:', err);
        } finally {
            setUpdatingId(null);
        }
    };

    // 🔹 Device Card
    const deviceCard = ({ item }: {item: any}) => {
        const isActive = item.isActive === 'Yes';

        return (
            <View style={styles.card}>
                <View style={styles.row}>
                    <Text style={styles.note}>
                        {item.device_name || 'Unnamed Device'}
                    </Text>

                    <Text style={isActive ? styles.activeBadge : styles.inactiveBadge}>
                        {isActive ? 'Active' : 'In Active'}
                    </Text>
                </View>

                <Text style={styles.androidId}>
                    Android ID: {item.android_id}
                </Text>

                <View style={styles.toggleRow}>
                    {updatingId === item.device_id ? (
                        <ActivityIndicator size="small" color="#0EA5E9" />
                    ) : (
                        <Switch
                            value={isActive}
                            onValueChange={() => toggleLoginStatus(item)}
                            trackColor={{ false: '#EF4444', true: '#22C55E' }}
                            thumbColor="#ffffff"
                        />
                    )}
                </View>
            </View>
        );
    };

    return (
        <LinearGradient colors={['#061C3F', '#0A5E6A']} style={styles.gradient}>
            <Header title="Device Manager" showBack={true} />

            <Text style={styles.countText}>
                Total Devices: {devices.length}
            </Text>

            {loading ? (
                <ActivityIndicator size="large" color="#fff" style={{ marginTop: 40 }} />
            ) : (
                <FlatList
                    data={devices}
                    renderItem={deviceCard}
                    keyExtractor={item => item.device_id.toString()}
                    contentContainerStyle={{ paddingBottom: 40 }}
                />
            )}
        </LinearGradient>
    );
};

const styles = StyleSheet.create({
    gradient: {
        flex: 1,
        paddingHorizontal: 16,
        paddingTop: 30,
    },

    countText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '600',
        marginBottom: 12,
    },

    card: {
        backgroundColor: 'rgba(255,255,255,0.08)',
        borderRadius: 12,
        padding: 14,
        marginBottom: 12,
    },

    row: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },

    note: {
        color: '#fff',
        fontSize: 14,
        fontWeight: '600',
    },

    androidId: {
        color: '#ccc',
        fontSize: 12,
        marginTop: 6,
    },

    toggleRow: {
        marginTop: 12,
        alignItems: 'flex-end',
    },

    activeBadge: {
        backgroundColor: '#22C55E22',
        paddingVertical: 3,
        paddingHorizontal: 10,
        borderRadius: 50,
        color: '#16A34A',
        fontSize: 12,
        fontWeight: '600',
    },

    inactiveBadge: {
        backgroundColor: '#EF444422',
        paddingVertical: 3,
        paddingHorizontal: 10,
        borderRadius: 50,
        color: '#DC2626',
        fontSize: 12,
        fontWeight: '600',
    },
});

export default DeviceManager;
