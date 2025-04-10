export default function getParameterCaseInsensitive(param) {

    const lowerCase = str => str[0].toLowerCase() + str.slice(1);
    
    if(Array.isArray(param)){
        const res = param.map(
            obj => Object.fromEntries(Object.entries(obj).map(
                ([k, v]) => [lowerCase(k), v])
            )
        );
        return res;
    }else if(typeof param === 'object'){
        const res = Object.fromEntries(Object.entries(param).map(
            ([k, v]) => [lowerCase(k), v])
        )
        return res;
    }
}