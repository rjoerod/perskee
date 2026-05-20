import * as Dialog from '@radix-ui/react-dialog'
import { useLiveQuery } from 'dexie-react-hooks'
import { db } from '../../util/db'
import { Settings } from '../../util/types'
import styles from './ArchiveSettingsModal.module.scss'

const DEFAULT_SETTINGS: Settings = {
    auto_archive_enabled: 0,
    archive_after_value: 30,
    archive_after_unit: 'days',
}

const useArchiveSettings = () => {
    return useLiveQuery(async () => {
        const settings = await db.settings.get(1)
        return settings ?? DEFAULT_SETTINGS
    }, [])
}

const saveSettings = async (patch: Partial<Settings>) => {
    const existing = await db.settings.get(1)
    const merged = { ...DEFAULT_SETTINGS, ...existing, ...patch, id: 1 }
    await db.settings.put(merged)
}

interface ArchiveSettingsModalProps {
    open: boolean
    onClose: () => void
}

const ArchiveSettingsModal = ({ open, onClose }: ArchiveSettingsModalProps) => {
    const settings = useArchiveSettings()

    if (!settings) return null

    const { auto_archive_enabled, archive_after_value, archive_after_unit } =
        settings

    return (
        <Dialog.Root open={open} onOpenChange={(o) => !o && onClose()}>
            <Dialog.Portal>
                <Dialog.Overlay className={styles.overlay}>
                    <Dialog.Content
                        className={styles.panel}
                        aria-describedby={undefined}
                    >
                        <Dialog.Title className={styles.title}>
                            Archive Settings
                        </Dialog.Title>

                        <div className={styles.section}>
                            <div className={styles.sectionTitle}>
                                Automatic Card Archiving
                            </div>
                            <div className={styles.radioGroup}>
                                <label
                                    className={styles.radioLabel}
                                    data-active={String(
                                        auto_archive_enabled === 0
                                    )}
                                    onChange={() =>
                                        saveSettings({
                                            auto_archive_enabled: 0,
                                        })
                                    }
                                >
                                    <b>OFF</b>
                                    <input
                                        className={styles.radioInput}
                                        type="radio"
                                        name="auto_archive"
                                        checked={auto_archive_enabled === 0}
                                        readOnly
                                    />
                                </label>
                                <label
                                    className={styles.radioLabel}
                                    data-active={String(
                                        auto_archive_enabled === 1
                                    )}
                                    onChange={() =>
                                        saveSettings({
                                            auto_archive_enabled: 1,
                                        })
                                    }
                                >
                                    <b>ON</b>
                                    <input
                                        className={styles.radioInput}
                                        type="radio"
                                        name="auto_archive"
                                        checked={auto_archive_enabled === 1}
                                        readOnly
                                    />
                                </label>
                            </div>
                        </div>

                        <div className={styles.section}>
                            <div className={styles.sectionTitle}>
                                Archive cards inactive for
                            </div>
                            <div className={styles.timeframeRow}>
                                <input
                                    type="number"
                                    className={styles.numberInput}
                                    min={1}
                                    value={archive_after_value}
                                    onChange={(e) => {
                                        const val = Number(e.target.value)
                                        if (val > 0)
                                            saveSettings({
                                                archive_after_value: val,
                                            })
                                    }}
                                />
                                <select
                                    className={styles.unitSelect}
                                    value={archive_after_unit}
                                    onChange={(e) =>
                                        saveSettings({
                                            archive_after_unit: e.target
                                                .value as Settings['archive_after_unit'],
                                        })
                                    }
                                >
                                    <option value="days">Days</option>
                                    <option value="weeks">Weeks</option>
                                    <option value="months">Months</option>
                                    <option value="years">Years</option>
                                </select>
                            </div>
                            <div className={styles.hint}>
                                Epic cards are never auto-archived. They can
                                only be archived manually.
                            </div>
                        </div>
                    </Dialog.Content>
                </Dialog.Overlay>
            </Dialog.Portal>
        </Dialog.Root>
    )
}

export default ArchiveSettingsModal
