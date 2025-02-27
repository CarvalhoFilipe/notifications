import {
  getMessaging,
  AuthorizationStatus,
} from '@react-native-firebase/messaging';
import notifee, {AndroidImportance} from '@notifee/react-native';
import React, {useEffect} from 'react';
import {
  Platform,
  StatusBar,
  StyleSheet,
  Text,
  useColorScheme,
  View,
} from 'react-native';

import {Colors} from 'react-native/Libraries/NewAppScreen';

async function displayNotification(remoteMessage: any) {
  await notifee.requestPermission();
  // Crie um canal (necessário para Android)
  const channelId = await notifee.createChannel({
    id: 'test',
    name: 'notification',
    importance: AndroidImportance.HIGH,
  });

  await notifee.displayNotification({
    title: remoteMessage.notification.title,
    body: remoteMessage.notification.body,
    data: remoteMessage.data,
    android: {
      channelId,
      onlyAlertOnce: true,
    },
  });
}

function App(): React.JSX.Element {
  const isDarkMode = useColorScheme() === 'dark';

  const backgroundStyle = {
    backgroundColor: isDarkMode ? Colors.darker : Colors.lighter,
  };

  useEffect(() => {
    // Solicitar permissão para notificações (iOS)
    const requestUserPermission = async () => {
      if (Platform.OS === 'ios') {
        const authStatus = await getMessaging().requestPermission();
        const enabled =
          authStatus === AuthorizationStatus.AUTHORIZED ||
          authStatus === AuthorizationStatus.PROVISIONAL;

        if (enabled) {
          console.log('Permissão concedida para notificações.');
        }
      }
    };

    // Obter o token FCM
    const getToken = async () => {
      const token = await getMessaging().getToken();
      console.log('FCM Token:', token);
    };

    const subscribeToTopic = async () => {
      try {
        const subs = await getMessaging().subscribeToTopic('topic');
        console.log('Subscribed to topic!', subs);
      } catch (e) {
        console.log('Erro:', e);
      }
    };

    // getToken();
    // subscribeToTopic();

    getToken();
    subscribeToTopic();

    requestUserPermission();

    // Ouvir notificações em primeiro plano
    const unsubscribe = getMessaging().onMessage(async remoteMessage => {
      console.log('Notificação recebida em primeiro plano:', remoteMessage);
      displayNotification(remoteMessage); // Exibir notificação
    });

    // Ouvir notificações em segundo plano/terminado
    getMessaging().setBackgroundMessageHandler(async remoteMessage => {
      console.log('Notificação recebida em segundo plano:', remoteMessage);
      displayNotification(remoteMessage); // Exibir notificação
    });

    return unsubscribe;
  }, []);

  return (
    <View style={[backgroundStyle, styles.container]}>
      <StatusBar
        barStyle={isDarkMode ? 'light-content' : 'dark-content'}
        backgroundColor={backgroundStyle.backgroundColor}
      />
      <Text style={styles.text}>Push notification with FCM + Notifee</Text>
    </View>
  );
}

export default App;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  text: {
    color: 'white',
  },
});
