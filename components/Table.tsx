import { View, Text, StyleSheet } from 'react-native';

const Table = ({ data }: { data: string[][] }) => {
    return (
        <View style={styles.table}>
            {data.map((row, rowIndex) => (
                <View key={rowIndex} style={styles.row}>
                    {row.map((cell, colIndex) => (
                        <View key={colIndex} style={styles.cell}>
                            <Text>{cell}</Text>
                        </View>
                    ))}
                </View>
            ))}
        </View>
    );
};

const styles = StyleSheet.create({
    table: {
        borderWidth: 1,
        borderColor: '#ccc',
    },
    row: {
        flexDirection: 'row',
    },
    cell: {
        flex: 1,
        borderWidth: 1,
        borderColor: '#ccc',
        paddingHorizontal: 8,
        paddingVertical: 2,
    },
});

export default Table;
