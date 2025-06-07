
import { Routes, Route } from 'react-router-dom';
import { Home } from './pages/Home';
import { Builder } from './pages/Builder';

import Hero from './landing/hero';
import { BentoGridDemo } from './landing/feature';
import { PricingSectionDemo } from './landing/pricing';
import { Cta } from './landing/cta';
import { StackedCircularFooterDemo } from './landing/footer';

import LoginForm from './auth/auth';

function App() {
  return (
    
      <Routes>
        <Route path='/' element={<div>
          
          <Hero/>
          <BentoGridDemo/>
          <PricingSectionDemo/>
          <Cta/>
          <StackedCircularFooterDemo/>
        </div>}/>
        
        <Route path='/auth' element={
          <LoginForm/>
        }/>
        <Route path="/home" element={<Home />} />
        <Route path="/builder" element={<Builder />} />
      </Routes>
    
  );
}

export default App;