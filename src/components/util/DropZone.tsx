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

    return (
        <div {...getRootProps()}>
            <input {...getInputProps()} />
            <p>Drag 'n' drop some files here, or click to select files</p>
        </div>
    )
}

export default DropZone
