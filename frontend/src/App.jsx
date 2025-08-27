import React from 'react';
import ReportForm from './components/ReportForm';
import ReportList from './components/ReportList';

const App = () => {
  return (
    <div>
      <h1>Felanmälningar</h1>
      <ReportForm />
      <ReportList />
    </div>
  );
};

export default App;

