import { HashRouter, Link, Route, Routes } from 'react-router-dom'
import Board from './components/Board'

function App() {
    return (
        <HashRouter basename="/">
            <Routes>
                <Route path="/" Component={Board} />
            </Routes>
        </HashRouter>
    )
}

export default App
