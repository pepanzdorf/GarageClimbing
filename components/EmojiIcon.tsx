import { Text } from 'react-native';
import { useFonts } from 'expo-font';

type Props = {
    emoji: string;
    size?: number;
    color?: string;
}


const EmojiIcon = ({ emoji, size = 24, color = 'black' }: Props) => {
    const [loaded] = useFonts({
        'NCE': require('@/assets/fonts/NotoColorEmoji.ttf'),
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
