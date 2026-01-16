import React, { useState } from 'react';
import { View, StatusBar } from 'react-native';
import { GateScreen } from './src/screens/GateScreen';
import { MainScreen } from './src/screens/MainScreen';

const App = () => {
  const [access, setAccess] = useState(false);

  return (
    <View style={{ flex: 1, backgroundColor: '#101010' }}>
      <StatusBar barStyle="light-content" />
      {access ? (
        <MainScreen />
      ) : (
        <GateScreen onAccessGranted={() => setAccess(true)} />
      )}
    </View>
  );
};

export default App;
