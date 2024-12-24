import React, { StrictMode, useContext } from 'react';
import { Route, BrowserRouter as Router, Routes } from 'react-router-dom';
import CategoriesPanel from './components/CategoriesPanel/CategoriesPanel.jsx';
import LoginForm from "./components/LoginForm/LoginForm";
import Root from './components/Root/Root.jsx';

import { Context } from "./index";

import {
  QueryClient,
  QueryClientProvider,
} from 'react-query';

const queryClient = new QueryClient();

function App() {
  const { store } = useContext(Context);
  return (
    <StrictMode>
      <QueryClientProvider client={queryClient}>
        <Router>
          <Routes>
            {/* <Route path="/" element={<Root />} /> */}
            <Route path={'/'} element={store.isAuthenticated() ? <Root /> : <LoginForm />} />
            {<Route path='/login' element={<LoginForm />} />}
            {<Route path='/root' element={<Root />} />}
            {<Route path='/categories-panel' element={<CategoriesPanel />} />}
          </Routes>
        </Router>
      </QueryClientProvider>
    </StrictMode>
  );
}

export default App;
