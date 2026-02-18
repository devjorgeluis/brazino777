import { createRoot } from 'react-dom/client'
import AppContextProvider from './AppContext.jsx'

import './css/app.css'
import './css/main.css'
import './css/categoryBlock.css'
import './css/vueLocaleBlock.css'
import './css/vueSliderBlock.css'
import './css/gamesBlock.css'
import './css/footerGameCategoriesBlock.css'
import './css/gamesBlock.css'
import './css/vueSearchFormBlock.css'
import './css/vueProducerBlock.css'

import App from './App.jsx'

createRoot(document.getElementById('root')).render(
  // <StrictMode>
    <AppContextProvider>
      <App className="normal-mode app-mode"/>
    </AppContextProvider>
  // </StrictMode>
)