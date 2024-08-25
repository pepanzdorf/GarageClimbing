import React from 'react';
import { Text } from 'react-native';
import { useFonts } from 'expo-font';


const EmojiIcon = ({ emoji, size = 24, color = 'black' }) => {
    const [loaded, error] = useFonts({
        'NCE': require('../assets/fonts/NotoColorEmoji.ttf'),
    });

    if (!loaded) {
        return null;
    }
    return (
        <Text style={{fontSize: size, color: color, fontFamily: 'NCE'}}>
            {emoji}
        </Text>
    );
}

export { EmojiIcon };
