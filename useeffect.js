import { View, Text, Button } from 'react-native'
import React, { useEffect, useState } from 'react'

const UseEffectHookComp = () => {
    const [count, setCount] = useState(2);
    const [data, setData] = useState(0);
    // useEffect(()=>{ console.warn(count)} , [])  //componentDidMount
    //  useEffect(()=>{ console.warn(data)} , [data])  //componentDidUpdata

    // before component loads check if user is loggedin or not
    // write code when button is clicked dynamic data fectched from api
    // before component loads redirect user or call api or perform any action do it in here 
    return (
        <View>
            <Text>UseEffectHookComp</Text>
            <Text>count: {count}</Text>
            <Text>data: {data}</Text>
            <Button title='increase count' onPress={() => setCount(count + 1)} ></Button>
            <Button title='increase data' onPress={() => setData(data + 1)} ></Button>
            <User info={{ data, count }} />
        </View>
    )
}

const User = (props) => {
    useEffect(() => { console.warn('run this when data update') }, [props.info.data])
    return (
        <View>
            <Text>UseEffectHookComp</Text>
            <Text>count: {props.info.count}</Text>
            <Text>data: {props.info.data}</Text>
        </View>
    )
}

export default UseEffectHookComp