//Place a search bar in the app’s header or a prominent location.
import React, { useState } from 'react';
import { TextInput, Button, FlatList, Text } from 'react-native';

const SearchScreen = () => {
    const [query, setQuery] = useState('');
    const [results, setResults] = useState([]);

    const searchContent = async () => {
        const response = await fetch(`https://yourapi.com/search?query=${query}`);
        const data = await response.json();
        setResults(data);
    };

    return (
        <>
            <TextInput
                placeholder="Search..."
                value={query}
                onChangeText={setQuery}
                style={{ borderBottomWidth: 1, margin: 10 }}
            />
            <Button title="Search" onPress={searchContent} />
            <FlatList
                data={results}
                keyExtractor={(item) => item._id}
                renderItem={({ item }) => <Text>{item.title}</Text>}
            />
        </>
    );
};

export default SearchScreen;
