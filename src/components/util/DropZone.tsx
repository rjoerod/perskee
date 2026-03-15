import { useCallback } from 'react'
import { useDropzone } from 'react-dropzone'
import { db } from '../../util/db'
import styles from './DropZone.module.scss'

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
        <div className={styles.container}>
            <div
                className={styles.link}
                {...getRootProps()}
            >
                <input {...getInputProps()} />
                <p>Import</p>
            </div>
            <div
                className={styles.link}
                onClick={exportPerskeeDB}
            >
                Export
            </div>
        </div>
    )
}

export default DropZone
