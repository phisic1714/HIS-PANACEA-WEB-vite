import { useCallback } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { addSound } from '../../appRedux/actions'

const useSound = () => {
    const { playList, addSoundCount } = useSelector(({ Sound }) => Sound)
    const dispatch = useDispatch()

    const addSoundQueue = useCallback((listQueue) => {
        console.log(listQueue)
        dispatch(addSound({
            playList: [
                ...playList,
                ...listQueue?.map((item) => {
                    const [number, workNumber] = item?.split("  ")
                    console.log(number);
                    console.log(workNumber);
                    return {
                        pattern: ['co', '150', ...(number.toLowerCase().trimEnd()), '150', 'te', ...workNumber, '150', 'ka'],
                        status: null
                    }
                })
            ],
            addSoundCount: addSoundCount + 1
        }))
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [playList])

    return {
        addSoundQueue
    }
}

export default useSound