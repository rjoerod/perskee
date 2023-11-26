import './App.css'
import { HashRouter, Link, Route, Routes } from "react-router-dom";

function App() {
	return (
		<HashRouter basename="/">
			<ul>
				<li>
					<Link to="/">Home</Link>
				</li>
				<li>
					<Link to="/about">About</Link>
				</li>
			</ul>
			<hr />
			<Routes>
				<Route path="/" Component={Home} />
				<Route path="/about" Component={About} />
			</Routes>
		</HashRouter>
	);
}

const Home = () => (
	<div>
		<h2>Home</h2>
	</div>
);
const About = () => (
	<div>
		<h2>About</h2>
	</div>
);

export default App
