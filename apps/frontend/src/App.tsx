import { Route, Routes } from "react-router-dom"
import { ProtectedRoute } from "@/components/protected-route"
import { Toaster } from "@/components/ui/sonner"
import Chat from "@/pages/chat"
import Home from "@/pages/home"
import SignIn from "@/pages/sign-in"
import SignUp from "@/pages/sign-up"

function App() {
  return (
    <>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route
          path="/chat"
          element={
            <ProtectedRoute>
              <Chat />
            </ProtectedRoute>
          }
        />
        <Route path="/signin" element={<SignIn />} />
        <Route path="/signup" element={<SignUp />} />
        <Route path="*" element={<Home />} />
      </Routes>

      <Toaster position="top-center" />
    </>
  )
}

export default App