import { PermissionsAndroid, Platform } from 'react-native';

export const requestLocationPermission = async () => {
    if (Platform.OS === 'android') {
        const granted = await PermissionsAndroid.request(
            PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
            {
                title: 'Location Permission',
                message: 'Location is required to mark attendance',
                buttonPositive: 'Allow',
                buttonNegative: 'Deny',
            },
        );

        return granted === PermissionsAndroid.RESULTS.GRANTED;
    }

    // iOS – permission is triggered automatically when accessing GPS
    return true;
};
