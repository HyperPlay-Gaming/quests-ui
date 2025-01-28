import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'

// the translations
// (tip move them in a JSON file and import them,
// or even better, manage them separated from your code: https://react.i18next.com/guides/multiple-translation-files)
const resources = {
  en: {
    translation: {
      wallet: {
        info: {
          title: 'What is a Gameplay Wallet?',
          description:
            'Your progress for each Quest is based on the Gameplay wallet you use to start the game.<br/><br/> This allows game studios to properly sync and issue Rewards, regardless if they are in-game or off-chain.<br/><br/>Switching wallets? No problem. Your progress will be saved to each Gameplay wallet address separately.'
        }
      }
    }
  }
}

i18n
  .use(initReactI18next) // passes i18n down to react-i18next
  .init({
    resources,
    lng: 'en', // language to use, more information here: https://www.i18next.com/overview/configuration-options#languages-namespaces-resources
    interpolation: {
      escapeValue: false // react already safes from xss
    }
  })

export default i18n
