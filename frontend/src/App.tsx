import { 
  createBrowserRouter, 
  createRoutesFromElements, 
  Route, 
  RouterProvider 
} from 'react-router-dom'
import RootLayout from './layouts/RootLayout'
import Profile from './pages/Profile'
import Chat from './pages/Chat'
import Game from './pages/Game'

const router = createBrowserRouter(
  createRoutesFromElements(
    <Route path="/" element={<RootLayout />}>
      <Route path="profile" element={<Profile />} />
      <Route path="chat" element={<Chat />} />
      <Route path="game" element={<Game />} />
    </Route>
  )
)

function App() {
  return (
    <RouterProvider router={router} />
  )
}

export default App
