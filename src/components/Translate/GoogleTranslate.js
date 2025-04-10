import Axios from 'axios';

export const googleTranslate = async (sentences, from_lang = 'th', to_lang = 'en') => {

    sentences = sentences.replace(/\n/g, '<br>');
    let endPoint = await Axios.get(`https://translate.googleapis.com/translate_a/single?client=gtx&sl=${from_lang}&tl=${to_lang}&dt=t&ie=UTF-8&oe=UTF-8&q=${encodeURIComponent(sentences)}`);

    let obj = {
        th: endPoint.data[0][0][1],
        eng: endPoint.data[0][0][0],
    }
    console.log(obj.eng);
    return obj;
}
