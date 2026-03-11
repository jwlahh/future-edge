import Navbar from "../components/landing/NavbarComponent"
import Hero from "../components/landing/Hero"
import About from "../components/landing/About"
import Features from "../components/landing/Features"
import Signup from "../components/landing/Signup"
import Footer from "../components/landing/Footer"

import "../styles/landing.css"

function Landing() {
  return (
    <div className="landing-page">
      <Navbar />
      <Hero />
      <About />
      <Features />
      <Signup />
      <Footer />
    </div>
  )
}

export default Landing