import { createContext, useContext, ReactNode } from 'react'
import { QuestWrapperContextValue } from '@/types/quests'

const QuestWrapperContext = createContext<QuestWrapperContextValue | undefined>(
  undefined
)

export const useQuestWrapper = () => {
  const context = useContext(QuestWrapperContext)
  if (!context) {
    throw new Error('useQuestWrapper must be used within QuestWrapperProvider')
  }
  return context
}

interface QuestWrapperProviderProps extends QuestWrapperContextValue {
  children: ReactNode
}

export const QuestWrapperProvider = ({
  children,
  ...props
}: QuestWrapperProviderProps) => {
  return (
    <QuestWrapperContext.Provider value={props}>
      {children}
    </QuestWrapperContext.Provider>
  )
}
