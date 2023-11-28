import { SetURLSearchParams } from 'react-router-dom'
import ToastMessage from '../components/util/ToastMessage'

export function route(
    searchParams: URLSearchParams,
    setSearchParams: SetURLSearchParams,
    newParam: string | string[],
    paramValue: string | number | null | (string | number | null)[],
    append?: boolean,
    valueToDelete?: number | string | null
) {
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
        setSearchParams((params) => {
            for (const [idx, p] of newParam.entries()) {
                if (paramValue[idx]) params.set(p, String(paramValue[idx]))
            }

            return params
        })
        return
    }

    if (!Array.isArray(newParam) && !Array.isArray(paramValue)) {
        setSearchParams((params) => {
            if (!paramValue) {
                if (append) {
                    const values = params
                        .getAll(newParam)
                        .filter((val) => val != valueToDelete)
                    params.delete(newParam)
                    values.forEach((val) => {
                        params.append(newParam, val)
                    })
                } else {
                    params.delete(newParam)
                }
            } else {
                if (append) {
                    params.append(newParam, String(paramValue))
                } else {
                    params.set(newParam, String(paramValue))
                }
            }
            return params
        })
        return
    }

    ToastMessage('Error: routing failed catastrophically')
}
