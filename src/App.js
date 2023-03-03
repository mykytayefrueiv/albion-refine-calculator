import './App.css';
import * as React from "react";
import {QueryClient, QueryClientProvider} from "@tanstack/react-query";
import Main from "./main";

const queryClient = new QueryClient()

function App() {
	return (
		<QueryClientProvider client={queryClient}>
			<Main />
		</QueryClientProvider>
	);
}

export default App;
