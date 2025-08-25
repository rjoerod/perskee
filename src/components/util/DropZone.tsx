import { useCallback } from 'react'
import { useDropzone } from 'react-dropzone'
import { db } from '../../util/db'

function DropZone() {
    const onDrop = useCallback(async (acceptedFiles: any[]) => {
        const file = acceptedFiles[0]
        await db.import(file)
        console.log('Import complete')
    }, [])
    const { getRootProps, getInputProps } = useDropzone({ onDrop })

    const DownloadJSON = (data: Blob) => {
        const dataUrl = window.URL.createObjectURL(data)
        const download = document.createElement('a')
        download.setAttribute('href', dataUrl)
        download.setAttribute('download', 'dexie-export' + '.json')
        document.body.appendChild(download)
        download.click()
        download.remove()
    }

    const exportPerskeeDB = async () => {
        try {
            const blob = await db.export({ prettyJson: true })
            DownloadJSON(blob)
        } catch (error) {
            console.error('' + error)
        }
    }

    return (
        <div className="flex gap-8 pl-12 pb-4">
            <div
                className="self-end underline cursor-pointer hover:text-sky-400"
                {...getRootProps()}
            >
                <input {...getInputProps()} />
                <p>Import</p>
            </div>
            <div
                className="self-end underline cursor-pointer hover:text-sky-400"
                onClick={exportPerskeeDB}
            >
                Export
            </div>
        </div>
    )
}

export default DropZone
