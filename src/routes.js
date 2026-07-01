import App from './App'
import CallbackPage from './components/CallbackPage'

export const routes = [
  {
    path: '/',
    element: <App />,
  },
  {
    path: '/callback',
    element: <CallbackPage />,
  },
]

export default routes
