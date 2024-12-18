import ToastMessage from '../util/ToastMessage'
import ModalButton from './ModalButton'
import { db } from '../../util/db'
import { List } from '../../util/types'

interface AddListButtonProps {
    boardId: number
    nextSortedOrder: number
}

const AddListButton = ({ boardId, nextSortedOrder }: AddListButtonProps) => {
    const handleSubmit = async (name: string) => {
        try {
            const newList = new List(boardId, nextSortedOrder, name)
            await db.lists.add(newList)
        } catch (e) {
            ToastMessage('Failed to add list')
        }
    }

    return (
        <ModalButton
            initialLabel="+ Add another list"
            confirmLabel="Add list"
            placeholder="Enter list title..."
            handleSubmit={handleSubmit}
        />
    )
}

export default AddListButton
