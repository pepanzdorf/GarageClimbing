import React from 'react';
import { Text } from 'react-native';


const EmojiIcon = ({ emoji, size = 24, color = 'black' }) => (
    <Text style={{fontSize: size, color: color}}>
        {emoji}
    </Text>
);

export { EmojiIcon };
