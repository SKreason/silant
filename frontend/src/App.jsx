import {BrowserRouter as Router, Routes, Route} from "react-router";
import './styles/App.scss'
import Header from "./components/Header.jsx";
import Footer from "./components/Footer.jsx";
import MainPage from "./components/MainPage.jsx";

const Layout = ({ children }) => {
    return (
        <div className="layout">
            <Header/>
            <main className="main-content">
                {children}
            </main>
            <Footer/>
        </div>
    );
};


function App() {
    return (
        <Router>
            <Layout>
                <Routes>
                    <Route path="/" element={<MainPage />} />
                </Routes>
            </Layout>
        </Router>
    )
}

export default App