import { SetURLSearchParams } from 'react-router-dom'
import ToastMessage from '../components/util/ToastMessage'

// // Get a new searchParams string by merging the current
// // searchParams with a provided key/value pair
// const createQueryString = (
//     searchParams:
//         | string
//         | string[][]
//         | Record<string, string>
//         | URLSearchParams
//         | undefined
//         | null,
//     name: string,
//     value: number | string | null,
//     append?: boolean,
//     valueToDelete?: number | string | null
// ) => {
//     const params = new URLSearchParams(searchParams ?? undefined)
//     if (!value) {
//         if (append) {
//             const values = params
//                 .getAll(name)
//                 .filter((val) => val != valueToDelete)
//             params.delete(name)
//             values.forEach((val) => {
//                 params.append(name, val)
//             })
//         } else {
//             params.delete(name)
//         }
//     } else {
//         if (append) {
//             params.append(name, String(value))
//         } else {
//             params.set(name, String(value))
//         }
//     }

//     return params.toString()
// }

export function route(
    searchParams: URLSearchParams,
    setSearchParams: SetURLSearchParams,
    newParam: string | string[],
    paramValue: string | number | null | (string | number | null)[],
    append?: boolean,
    valueToDelete?: number | string | null
) {
    console.log(searchParams)

    const badParam1 = Array.isArray(newParam) && !Array.isArray(paramValue)
    const badParam2 = !Array.isArray(paramValue) && Array.isArray(newParam)
    const badParam3 =
        Array.isArray(paramValue) &&
        Array.isArray(newParam) &&
        newParam.length != paramValue.length

    if (badParam1 || badParam2 || badParam3) {
        ToastMessage('Error: routing failed')
        return
    }

    if (
        Array.isArray(newParam) &&
        Array.isArray(paramValue) &&
        newParam.length == paramValue.length
    ) {
        // const newQuery = newParam.reduce((prev, curr, index) => {
        //     const paramValue1 = paramValue[index]
        //     return createQueryString(
        //         prev,
        //         curr,
        //         paramValue1,
        //         append,
        //         valueToDelete
        //     )
        // }, searchParams)
        const newSearchParams = newParam.reduce((prev, param, idx) => {
            const paramValue1 = paramValue[idx]
            if (!paramValue1) {
                return prev
            }
            return { ...prev, [param]: paramValue[idx] }
        }, {})
        setSearchParams({ ...searchParams, ...newSearchParams })
        return
    }

    if (!Array.isArray(newParam) && !Array.isArray(paramValue)) {
        if (!paramValue) {
            searchParams.delete(newParam)
            setSearchParams(searchParams)
            return
        }

        setSearchParams({ ...searchParams, [newParam]: paramValue })
        return
    }

    ToastMessage('Error: routing failed catastrophically')
}
