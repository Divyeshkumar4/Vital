import { useRef, useState } from 'react';
import { ActivityIndicator, Pressable, View } from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { Text } from '@/components/Text';
import { Button } from '@/components/Button';
import { lookupBarcode } from '@/lib/api/openFoodFacts';
import { cacheFood, offFoodToInsert } from '@/features/food/queries';
import { t } from '@/i18n/strings';

const BARCODE_TYPES = [
  'ean13',
  'ean8',
  'upc_a',
  'upc_e',
  'code128',
  'code39',
  'code93',
  'qr',
] as const;

export default function FoodScan() {
  const [permission, requestPermission] = useCameraPermissions();
  const [lookingUp, setLookingUp] = useState(false);
  const [error, setError] = useState<string | null>(null);
  // Persistent until the user explicitly dismisses the error or moves to a
  // genuinely different barcode. This stops the scanner from firing the same
  // failed barcode many times per second (camera frame rate).
  const lastScannedRef = useRef<string | null>(null);

  const onScanned = async ({ data }: { data: string }) => {
    if (lookingUp) return;
    // Same barcode as the last attempt - ignore.
    if (lastScannedRef.current === data) return;

    lastScannedRef.current = data;
    setError(null);
    setLookingUp(true);
    try {
      const off = await lookupBarcode(data);
      if (!off) {
        setError(t('foods.scanNotFound'));
        setLookingUp(false);
        return;
      }
      try {
        const saved = await cacheFood(offFoodToInsert(off));
        router.replace({ pathname: '/(app)/foods/[id]', params: { id: saved.id } });
      } catch {
        setError(t('foods.saveError'));
        setLookingUp(false);
      }
    } catch {
      setError(t('foods.scanError'));
      setLookingUp(false);
    }
  };

  const dismissError = () => {
    setError(null);
    lastScannedRef.current = null;
  };

  if (!permission) {
    return (
      <SafeAreaView className="flex-1 bg-bg items-center justify-center">
        <ActivityIndicator />
      </SafeAreaView>
    );
  }

  if (!permission.granted) {
    return (
      <SafeAreaView className="flex-1 bg-bg">
        <View className="p-6 gap-4 mt-8">
          <Text variant="h1">{t('foods.scanBarcode')}</Text>
          <Text variant="caption">{t('foods.scanPermission')}</Text>
          <Button title={t('foods.scanPermissionGrant')} onPress={requestPermission} />
          <Button title={t('foods.backToSearch')} variant="secondary" onPress={() => router.back()} />
        </View>
      </SafeAreaView>
    );
  }

  // The camera stops listening for scans whenever a lookup is in-flight OR an
  // error banner is showing. The user must tap the error to resume scanning.
  const scanGated = lookingUp || error !== null;

  return (
    <View className="flex-1 bg-black">
      <CameraView
        style={{ flex: 1 }}
        facing="back"
        barcodeScannerSettings={{ barcodeTypes: [...BARCODE_TYPES] }}
        onBarcodeScanned={scanGated ? undefined : onScanned}
      />

      <SafeAreaView style={{ position: 'absolute', top: 0, left: 0, right: 0 }}>
        <View className="px-6 pt-2 pb-3 flex-row items-center justify-between">
          <Pressable
            onPress={() => router.back()}
            className="px-3 py-2 rounded-md bg-black/60 border border-white/20"
          >
            <Text variant="caption">{t('common.cancel')}</Text>
          </Pressable>
          <View className="px-3 py-2 rounded-md bg-black/60 border border-white/20">
            <Text variant="caption">{t('foods.scanTitle')}</Text>
          </View>
        </View>
      </SafeAreaView>

      <View
        pointerEvents="none"
        style={{
          position: 'absolute',
          top: '30%',
          left: '10%',
          right: '10%',
          height: 180,
          borderWidth: 2,
          borderColor: '#5BE49B',
          borderRadius: 16,
          backgroundColor: 'transparent',
        }}
      />

      <SafeAreaView style={{ position: 'absolute', bottom: 0, left: 0, right: 0 }}>
        <View className="px-6 py-4 gap-2">
          {lookingUp ? (
            <View className="flex-row gap-2 items-center px-4 py-3 rounded-md bg-black/60 border border-white/20">
              <ActivityIndicator />
              <Text variant="caption">{t('foods.scanLooking')}</Text>
            </View>
          ) : null}
          {error ? (
            <Pressable
              onPress={dismissError}
              accessibilityRole="button"
              className="px-4 py-3 rounded-md bg-black/80 border border-danger gap-1"
            >
              <Text variant="caption" className="text-danger">
                {error}
              </Text>
              <Text variant="caption" className="text-fg-muted">
                {t('foods.scanDismiss')}
              </Text>
            </Pressable>
          ) : null}
          {!lookingUp && !error ? (
            <View className="px-4 py-3 rounded-md bg-black/60 border border-white/20">
              <Text variant="caption">{t('foods.scanHelp')}</Text>
            </View>
          ) : null}
        </View>
      </SafeAreaView>
    </View>
  );
}
