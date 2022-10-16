import 'bootstrap/dist/css/bootstrap.css';
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { LoginPage } from './components/login and register/LoginPage';
import { RegisterPage } from "./components/login and register/RegisterPage";
import { UserHomePage } from "./components/UserHomePage/UserHomePage";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LoginPage />}></Route>
        <Route path="/register" element={<RegisterPage />}></Route>
        <Route path="/userhome" element={<UserHomePage />}></Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
