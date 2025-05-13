import { Pressable, StyleSheet, Text } from 'react-native';
import { EmojiIcon } from "@/components/EmojiIcon";
import Fonts from "@/constants/Fonts";
import React from "react";
import Colors from "@/constants/Colors";

type Props = {
    active: boolean;
    onPress?: () => void;
    id: number;
    name: string;
}


export default function Tag({ active, onPress=()=>{}, id, name }: Props){
    const tagIdToIconName = (tagId: number) => {
        switch(tagId){
            case 1:
                return "🔛";
            case 2:
                return "🙅‍♂️";
            case 3:
                return "⬇️";
            case 4:
                return "🦒";
            case 5:
                return "🙌";
            case 6:
                return "🧠";
            case 7:
                return "🤏";
            case 8:
                return "🍤";
            case 9:
                return "🐳";
            case 10:
                return "💪";
            case 11:
                return "🔄";
            case 12:
                return "↔️";
            case 13:
                return "🔞";
            case 14:
                return "🍼";
            case 15:
                return "🦶🚫";
            case 16:
                return "🆒";
            case 17:
                return "🔋";
            case 18:
                return "🚮";
            case 19:
                return "🎉";
            case 20:
                return "🏅";
            case 21:
                return "🏋️‍♂️";
            case 22:
                return "📊";
            case 23:
                return "❌️";
            case 24:
                return "💎";
            case 25:
                return "⚰️";
            case 26:
                return "Ⓜ️";
            case 27:
                return "🦵";
            case 28:
                return "🪝";
            case 29:
                return "🪵";
            case 30:
                return "🥤";
            case 31:
                return "🦿";
            case 32:
                return "👠";
            case 33:
                return "🦖";
            default:
                return "❓";
        }
    }

    return (
        <Pressable
            onPress={onPress}
            key={id}
            style={({ pressed }) => [
                styles.tag,
                {
                    opacity: pressed ? 0.5 : 1,
                    borderColor: active ? Colors.primary : Colors.borderDark,
                }
            ]}
        >

            <EmojiIcon emoji={tagIdToIconName(id)} size={30} color={active ? Colors.primary : Colors.borderDark}/>
            <Text style={[Fonts.h3, { color: active ? Colors.primary : Colors.borderDark }]}>{name}</Text>
        </Pressable>
    );
}


const styles = StyleSheet.create({
    tag: {
        alignItems: 'center',
        padding: 10,
        borderRadius: 10,
        borderWidth: 2,
    },
});