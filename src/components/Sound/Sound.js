import React, { useEffect, useState, } from "react";
import { useSelector, useDispatch } from 'react-redux'
import { addSound } from '../../appRedux/actions'
import T_shong from "./audio/T_shong.mp3"
import ka from "./audio/ka.mp3";
import ko_chern_my_lag from "./audio/ko_chern_my_lag.mp3";
import one from "./audio/num/1.mp3";
import two from "./audio/num/2.mp3";
import three from "./audio/num/3.mp3";
import four from "./audio/num/4.mp3";
import five from "./audio/num/5.mp3";
import six from "./audio/num/6.mp3";
import seven from "./audio/num/7.mp3";
import eight from "./audio/num/8.mp3";
import nine from "./audio/num/9.mp3";
import soon from "./audio/num/0.mp3";
import A from "./audio/eng/A.mp3";
import B from "./audio/eng/B.mp3";
import C from "./audio/eng/C.mp3";
import D from "./audio/eng/D.mp3";
import E from "./audio/eng/E.mp3";
import F from "./audio/eng/F.mp3";
import G from "./audio/eng/G.mp3";
import H from "./audio/eng/H.mp3";
import I from "./audio/eng/I.mp3";
import J from "./audio/eng/J.mp3";
import K from "./audio/eng/K.mp3";
import L from "./audio/eng/L.mp3";
import M from "./audio/eng/M.mp3";
import N from "./audio/eng/N.mp3";
import O from "./audio/eng/O.mp3";
import P from "./audio/eng/P.mp3";
import Q from "./audio/eng/Q.mp3";
import R from "./audio/eng/R.mp3";
import S from "./audio/eng/S.mp3";
import T from "./audio/eng/T.mp3";
import U from "./audio/eng/U.mp3";
import V from "./audio/eng/V.mp3";
import W from "./audio/eng/W.mp3";
import X from "./audio/eng/X.mp3";
import Y from "./audio/eng/Y.mp3";
import Z from "./audio/eng/Z.mp3";


export default function Sound() {
    const [queueIndex, setQueueIndex] = useState(-1)

    const { playList, addSoundCount } = useSelector(({ Sound }) => Sound)
    const dispatch = useDispatch()

    const soundMap = {
        te: T_shong,
        ka: ka,
        co: ko_chern_my_lag,
        a: A,
        b: B,
        c: C,
        d: D,
        e: E,
        f: F,
        g: G,
        h: H,
        i: I,
        j: J,
        k: K,
        l: L,
        m: M,
        n: N,
        o: O,
        p: P,
        q: Q,
        r: R,
        s: S,
        t: T,
        u: U,
        v: V,
        w: W,
        x: X,
        y: Y,
        z: Z,
        "1": one,
        "2": two,
        "3": three,
        "4": four,
        "5": five,
        "6": six,
        "7": seven,
        "8": eight,
        "9": nine,
        "0": soon
    };

    const playSound = async (sound, delay = 0) =>
        new Promise((resolve) =>
            setTimeout(() => {
                if (sound) {
                    const audio = new Audio(sound);
                    audio.play();
                    audio.onended = resolve;
                }
                else {
                    resolve()
                }
            }, delay)
        );

    const playInputSounds = async (input) => {
        const soundFile = soundMap[input];
        if (!soundFile) await playSound(null, 100 + Number(input));
        if (soundFile) await playSound(soundFile, 50);
    }

    // eslint-disable-next-line no-unused-vars
    const addQueue = () => {
        dispatch(addSound({
            playList: [
                ...playList,
                {
                    pattern: ['co', 'ka', 'te', playList?.length % 4 + ""],
                    status: null
                },
            ],
            addSoundCount: addSoundCount + 1
        }))
    }

    const playSoundPattern = async (pattern, index) => {
        for (const soundKey of pattern) {
            await playInputSounds(soundKey)
        }
        setQueueIndex(index)
        dispatch(addSound({
            addSoundCount: 1
        }))
    }

    // useEffect(() => {

    // }, [addSoundCount])

    useEffect(() => {
        console.log(playList?.length, queueIndex + 1, addSoundCount)
        if (playList?.length > queueIndex + 1 && addSoundCount === 1) {
            playSoundPattern(playList[queueIndex + 1].pattern, queueIndex + 1)
        }
        if (playList?.length === queueIndex + 1 && addSoundCount >= 1) {
            dispatch(addSound({
                playList: [],
                addSoundCount: 0
            }))
            setQueueIndex(-1)
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [playList, queueIndex, addSoundCount])

    return (
        <></>
    )
}