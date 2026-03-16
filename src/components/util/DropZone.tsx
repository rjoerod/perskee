import { useCallback, useState } from 'react'
import { useDropzone } from 'react-dropzone'
import { db } from '../../util/db'
import ConfirmationModal from './ConfirmationModal'
import ToastMessage from './ToastMessage'
import styles from './DropZone.module.scss'

function DropZone() {
    const [showConfirmation, setShowConfirmation] = useState(false)
    const [pendingFile, setPendingFile] = useState<File | null>(null)

    const onDrop = useCallback(async (acceptedFiles: any[]) => {
        const file = acceptedFiles[0]
        if (file) {
            setPendingFile(file)
            setShowConfirmation(true)
        }
    }, [])

    const handleConfirmImport = async () => {
        if (!pendingFile) return

        try {
            // Clear all existing data
            await db.boards.clear()
            await db.lists.clear()
            await db.tasks.clear()

            // Import the new data
            await db.import(pendingFile, { overwriteValues: true })
            
            ToastMessage('Import successful')
            console.log('Import complete')
        } catch (error) {
            console.error('Import failed:', error)
            ToastMessage('Import failed - please check the file format')
        } finally {
            setShowConfirmation(false)
            setPendingFile(null)
        }
    }

    const handleCancelImport = () => {
        setShowConfirmation(false)
        setPendingFile(null)
    }
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
                <span>Import</span>
            </div>
            <div
                className={styles.link}
                onClick={exportPerskeeDB}
            >
                Export
            </div>

            <ConfirmationModal
                label="Confirm Import"
                open={showConfirmation}
                onConfirm={handleConfirmImport}
                onCancel={handleCancelImport}
            >
                <p>This will replace all existing data. Are you sure you want to continue?</p>
            </ConfirmationModal>
        </div>
    )
}

export default DropZone
