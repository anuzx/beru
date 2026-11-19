import { Route, Routes } from "react-router-dom"
import Chat from "@/pages/chat"
import Home from "@/pages/home"
import SignIn from "@/pages/sign-in"
import SignUp from "@/pages/sign-up"

function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/chat" element={<Chat />} />
      <Route path="/signin" element={<SignIn />} />
      <Route path="/signup" element={<SignUp />} />
      <Route path="*" element={<Home />} />
    </Routes>
  )
}

export default App