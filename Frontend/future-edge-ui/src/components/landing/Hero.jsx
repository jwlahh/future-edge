import { useNavigate } from "react-router-dom";
function Hero(){
const navigate = useNavigate();
return(

<section id="home" className="hero">

<div className="hero-container">

<div className="hero-left">

<div className="badge">
✨ Latest | FutureEdge v1.0 is Live
</div>

<h1>
All-in-one<br/>
<span> career platform</span>
</h1>

<p>
AI-powered career intelligence for personalized resume
analysis, smart job matching, and strategic career guidance.
</p>

<div className="hero-buttons">

<button
className="primary-btn"
onClick={() => navigate("/signup")}
>
Start building for free
</button>



</div>

<div className="hero-stats">

<p>👥 1,200+ professionals</p>

<p>⭐ 4.8/5 average rating</p>

</div>

</div>

<div className="hero-right">

<img
src="\dashboard.png"
alt="dashboard preview"
/>

</div>

</div>

</section>

)

}

export default Hero